"""Tests for the payments side of the Command Center. Run: python3 -m unittest discover tests

Nothing here talks to a payment provider (nothing in the repo does). payments.json is what the Payments
Agent fills; these check that sync reads it carefully, that it never gets saved to GitHub, that the
key field refuses a key that can move money, and that the Dashboard draws from it, or says how to
connect it when it isn't there. The drawing test opens the real page in headless Chrome and is skipped
when Chrome isn't installed.
"""
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
import serve  # noqa: E402

SAMPLE = {
    "provider": "stripe", "currency": "USD", "capturedAt": "2026-11-07T09:00:00Z", "mrr": 180, "activeSubscriptions": 12,
    "payments": [
        {"id": "pay_1", "date": "{today}", "amount": 1234.5, "customer": "Sample Customer One", "description": "Wholesale order", "status": "paid"},
        {"id": "pay_2", "date": "{today}", "amount": 40.0, "customer": "Sample Customer Two", "status": "refunded"},
        {"id": "pay_3", "date": "2026-13-40", "amount": 10, "status": "paid"},
        {"id": "pay_4", "date": "{today}", "amount": "ten", "status": "paid"},
    ],
    "invoices": [
        {"id": "inv_1", "customer": "Sample Customer Two", "amount": 300.0, "dueDate": "2000-01-01", "status": "open"},
        {"id": "inv_2", "amount": 99.0, "status": "sent"},
    ],
}
CHROME = next((p for p in ("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", shutil.which("google-chrome") or "",
                           shutil.which("chromium") or "", shutil.which("chrome") or "") if p and os.path.exists(p)), None)


class PaymentsCopy(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.repo = os.path.join(self.tmp, "repo")
        shutil.copytree(ROOT, self.repo, ignore=shutil.ignore_patterns(".git", "__pycache__", ".env", "settings.json"))
        self.data = os.path.join(self.repo, "dashboard", "data")
        for name in ("payments.json", "payments.js", "web.json", "web.js"):  # this computer's own numbers stay out of the test
            if os.path.exists(os.path.join(self.data, name)):
                os.remove(os.path.join(self.data, name))

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def sync(self):
        r = subprocess.run([sys.executable, "tools/sync.py"], cwd=self.repo, capture_output=True, text=True, encoding="utf-8")
        return r.returncode, r.stdout + r.stderr

    def write_sample(self, today):
        text = json.dumps(SAMPLE).replace("{today}", today)
        with open(os.path.join(self.data, "payments.json"), "w", encoding="utf-8") as f:
            f.write(text)


class SyncReadsPayments(PaymentsCopy):
    def test_no_file_means_no_payments_js(self):
        code, out = self.sync()
        self.assertEqual(code, 0, out)
        self.assertFalse(os.path.exists(os.path.join(self.data, "payments.js")))

    def test_bad_rows_are_skipped_and_named(self):
        self.write_sample("2026-11-07")
        code, out = self.sync()
        self.assertEqual(code, 0, out)
        self.assertIn("payments[2] skipped", out)
        self.assertIn("payments[3] skipped", out)
        self.assertIn("invoices[1] skipped", out)
        with open(os.path.join(self.data, "payments.js"), encoding="utf-8") as f:
            js = f.read()
        data = json.loads(js.split("window.CC_PAYMENTS = ", 1)[1].rstrip(";\n"))
        self.assertEqual([p["id"] for p in data["payments"]], ["pay_1", "pay_2"])
        self.assertEqual([i["id"] for i in data["invoices"]], ["inv_1"])
        self.assertEqual(data["mrr"], 180)

    def test_removing_the_file_removes_the_old_numbers(self):
        self.write_sample("2026-11-07")
        self.sync()
        os.remove(os.path.join(self.data, "payments.json"))
        self.sync()
        self.assertFalse(os.path.exists(os.path.join(self.data, "payments.js")))

    def test_check_stays_green_with_payments(self):
        self.write_sample("2026-11-07")
        self.sync()
        r = subprocess.run([sys.executable, "tools/sync.py", "--check"], cwd=self.repo, capture_output=True, text=True)
        self.assertEqual(r.returncode, 0, r.stdout)


class KeysAndPrivacy(unittest.TestCase):
    def test_payments_never_get_saved_to_github(self):
        with open(os.path.join(ROOT, ".gitignore"), encoding="utf-8") as f:
            text = f.read()
        self.assertIn("dashboard/data/payments.json", text)
        self.assertIn("dashboard/data/payments.js", text)

    def test_stripe_secret_key_is_refused(self):
        with self.assertRaisesRegex(ValueError, "restricted key"):
            serve.clean_key("STRIPE_RESTRICTED_KEY", "sk_live_" + "x" * 20)
        self.assertEqual(serve.clean_key("STRIPE_RESTRICTED_KEY", "rk_live_abc"), "rk_live_abc")

    def test_shopify_store_address(self):
        with self.assertRaises(ValueError):
            serve.clean_key("SHOPIFY_STORE_DOMAIN", "https://your-store.myshopify.com")
        self.assertEqual(serve.clean_key("SHOPIFY_STORE_DOMAIN", "your-store.myshopify.com"), "your-store.myshopify.com")

    def test_every_provider_key_saves_to_env_only(self):
        for k in ("STRIPE_RESTRICTED_KEY", "SQUARE_ACCESS_TOKEN", "PAYPAL_CLIENT_SECRET", "LEMONSQUEEZY_API_KEY", "SHOPIFY_CLIENT_SECRET", "PAYMENTS_API_KEY"):
            self.assertIn(k, serve.ALL_KEYS)

    def test_nothing_calls_a_provider(self):
        for d in ("tools", os.path.join("dashboard", "assets")):
            for name in os.listdir(os.path.join(ROOT, d)):
                if not os.path.isfile(os.path.join(ROOT, d, name)):
                    continue
                with open(os.path.join(ROOT, d, name), encoding="utf-8", errors="replace") as f:
                    text = f.read()
                for host in ("api.stripe.com", "connect.squareup.com", "api-m.paypal.com", "api.lemonsqueezy.com", "/admin/api/"):
                    self.assertNotIn(host, text, f"{d}/{name} calls {host}")


@unittest.skipUnless(CHROME, "Google Chrome isn't installed (only this test needs it)")
class DashboardDraws(PaymentsCopy):
    def dom(self):
        url = "file://" + os.path.join(self.repo, "dashboard", "index.html") + "#/dashboard"
        r = subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--no-first-run", f"--user-data-dir={self.tmp}/chrome",
                            "--virtual-time-budget=4000", "--dump-dom", url], capture_output=True, text=True, timeout=60)
        return r.stdout

    def test_empty_state_without_payments(self):
        self.sync()
        html = self.dom()
        self.longMessage = False
        self.assertIn("Total Revenue :", html, "the Dashboard didn't draw")
        self.assertGreaterEqual(html.count("Connect your payments in Settings → Payments"), 3)  # chart, customers, payments
        self.assertGreaterEqual(html.count("Connect in Settings → Payments"), 3)               # Revenue, MRR, Open Invoices
        self.assertNotIn("Sample Customer", html)

    def test_draws_from_payments_json(self):
        import datetime
        self.write_sample(datetime.date.today().isoformat())
        self.sync()
        html = self.dom()
        self.longMessage = False
        self.assertIn("Sample Customer One", html, "no customer on the Dashboard")       # Revenue by Customer and Recent Payments
        self.assertIn("$1,235", html)                    # 30-day revenue: the paid payment only, not the refund
        self.assertIn("$180", html)                      # MRR
        self.assertIn("$300 unpaid", html)               # the one open invoice
        self.assertIn("1 past due", html)
        self.assertNotIn("kpi-spark", html)                # no mini bar charts next to the KPI numbers
        self.assertEqual(html.count('class="glass kpi-card"'), 4)
        self.assertNotIn("Connect your payments in Settings → Payments", html)
        self.assertNotIn("Connect in Settings → Payments", html)


    def axis(self, html):
        return re.findall(r'text-anchor="end"[^>]*>(\$[0-9.]+k?)</text>', html)

    def test_revenue_target_sets_the_scale(self):
        import datetime
        self.write_sample(datetime.date.today().isoformat())
        self.sync()
        html = self.dom()
        self.assertEqual(self.axis(html), ["$0", "$5k", "$10k", "$15k", "$20k", "$25k"])  # $25,000 by default, in fifths
        self.assertIn("Target $25k", html)

    def test_revenue_above_the_target_stretches_it_and_the_target_is_a_setting(self):
        import datetime
        text = json.dumps(SAMPLE).replace("{today}", datetime.date.today().isoformat()).replace("1234.5", "31000")
        with open(os.path.join(self.data, "payments.json"), "w", encoding="utf-8") as f:
            f.write(text)
        self.sync()
        self.assertEqual(self.axis(self.dom())[-1], "$40k")                 # past the target, the scale grows
        with open(os.path.join(self.repo, "dashboard", "settings.json"), "w", encoding="utf-8") as f:
            json.dump({"workspace": {"revenueTarget": 50000}}, f)
        self.sync()
        html = self.dom()
        self.assertEqual(self.axis(html)[-1], "$50k")
        self.assertIn("Target $50k", html)


if __name__ == "__main__":
    unittest.main()
