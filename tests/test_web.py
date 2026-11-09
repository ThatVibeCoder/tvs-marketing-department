"""Tests for tools/pull_web.py, the Web pages' Google pull. Run: python3 -m unittest discover tests

No test ever talks to Google. The signing test makes a throwaway key with openssl (skipped if openssl
isn't there) and checks the signature verifies; the pull test answers every Google call with canned
replies and checks the snapshot and the queries that were asked for.
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
import pull_web  # noqa: E402


class SigningTest(unittest.TestCase):
    def setUp(self):
        if not shutil.which("openssl"):
            self.skipTest("openssl isn't installed (only the test needs it, never the pull)")
        self.tmp = tempfile.mkdtemp()

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def check(self, genkey_args):
        key = os.path.join(self.tmp, "k.pem")
        subprocess.run(["openssl", *genkey_args, "-out", key], check=True, capture_output=True)
        pub = os.path.join(self.tmp, "p.pem")
        subprocess.run(["openssl", "rsa", "-in", key, "-pubout", "-out", pub], check=True, capture_output=True)
        with open(key) as f:
            pem = f.read()
        msg = b"header.claims"
        sig = os.path.join(self.tmp, "s.bin")
        with open(sig, "wb") as f:
            f.write(pull_web.rs256(msg, pem))
        data = os.path.join(self.tmp, "m.txt")
        with open(data, "wb") as f:
            f.write(msg)
        r = subprocess.run(["openssl", "dgst", "-sha256", "-verify", pub, "-signature", sig, data], capture_output=True, text=True)
        self.assertIn("Verified OK", r.stdout + r.stderr)

    def test_pkcs8_key_like_google_gives(self):
        self.check(["genpkey", "-algorithm", "RSA", "-pkeyopt", "rsa_keygen_bits:2048"])

    def test_assertion_claims(self):
        key = os.path.join(self.tmp, "k.pem")
        subprocess.run(["openssl", "genpkey", "-algorithm", "RSA", "-pkeyopt", "rsa_keygen_bits:2048", "-out", key], check=True, capture_output=True)
        with open(key) as f:
            sa = {"client_email": "reader@example.iam.gserviceaccount.com", "private_key": f.read().replace("\n", "\\n")}
        jwt = pull_web.build_assertion(sa, 1_700_000_000)
        head, claims, sig = jwt.split(".")
        pad = lambda s: s + "=" * (-len(s) % 4)  # noqa: E731
        c = json.loads(__import__("base64").urlsafe_b64decode(pad(claims)))
        self.assertEqual(c["aud"], pull_web.TOKEN_URL)
        self.assertEqual(c["exp"] - c["iat"], 3600)
        self.assertIn("analytics.readonly", c["scope"])
        self.assertIn("webmasters.readonly", c["scope"])
        self.assertNotIn("edit", c["scope"])
        self.assertTrue(sig)


class ShapingTest(unittest.TestCase):
    def test_totals_pair_reads_both_windows(self):
        cur, prev = pull_web.totals_pair({"rows": [
            {"dimensionValues": [{"value": "date_range_0"}], "metricValues": [{"value": "10"}, {"value": "12"}, {"value": "7"}, {"value": "30"}]},
            {"dimensionValues": [{"value": "date_range_1"}], "metricValues": [{"value": "5"}, {"value": "6"}, {"value": "3"}, {"value": "11"}]}]})
        self.assertEqual(cur, {"activeUsers": 10, "sessions": 12, "newUsers": 7, "pageViews": 30})
        self.assertEqual(prev["activeUsers"], 5)

    def test_trend_fills_quiet_days_with_zero(self):
        t = pull_web.trend({"rows": [{"dimensionValues": [{"value": "20261102"}], "metricValues": [{"value": "4"}, {"value": "5"}]}]},
                           pull_web.day_span("2026-11-01", "2026-11-03"))
        self.assertEqual([p["users"] for p in t], [0, 4, 0])

    def test_regions_drop_not_set_and_zero(self):
        r = pull_web.regions({"rows": [{"dimensionValues": [{"value": "Ohio"}], "metricValues": [{"value": "3"}]},
                                       {"dimensionValues": [{"value": "(not set)"}], "metricValues": [{"value": "9"}]},
                                       {"dimensionValues": [{"value": "Iowa"}], "metricValues": [{"value": "0"}]}]})
        self.assertEqual(r, [{"region": "Ohio", "activeUsers": 3}])

    def test_property_id_is_masked(self):
        self.assertEqual(pull_web.mask("properties/123456789"), "properties/…789")


class PullTest(unittest.TestCase):
    def test_pull_with_canned_google(self):
        calls = []

        def fake_post(url, body, token=None, form=False):
            calls.append((url, body))
            if url == pull_web.TOKEN_URL:
                return {"access_token": "t"}
            if "searchconsole" in url:
                if body.get("dimensions"):
                    return {"rows": [{"keys": ["candles"], "clicks": 2, "impressions": 50, "ctr": 0.04, "position": 8.5}]}
                return {"rows": [{"clicks": 2, "impressions": 50, "ctr": 0.04, "position": 8.5}]}
            dims = [d["name"] for d in body.get("dimensions", [])]
            if dims == ["region"]:
                return {"rows": [{"dimensionValues": [{"value": "Ohio"}], "metricValues": [{"value": "3"}]}]}
            if dims == ["country", "countryId"]:
                return {"rows": [{"dimensionValues": [{"value": "Canada"}, {"value": "CA"}], "metricValues": [{"value": "2"}]}]}
            return {"rows": []}

        old_post, old_build = pull_web._post, pull_web.build_assertion
        pull_web._post, pull_web.build_assertion = fake_post, lambda sa, now: "jwt"
        try:
            snap = pull_web.pull({"sa": {"client_email": "x", "private_key": "y"}, "keyPresent": True,
                                  "propertyId": "properties/123456789", "gscSite": "sc-domain:example.com"})
        finally:
            pull_web._post, pull_web.build_assertion = old_post, old_build
        self.assertEqual(set(snap["ranges"]), {"7d", "30d", "90d"})
        self.assertEqual(len(snap["ranges"]["30d"]["trend"]), 30)
        self.assertEqual(snap["propertyId"], "properties/…789")
        self.assertEqual(snap["usRegions"], [{"region": "Ohio", "activeUsers": 3}])
        self.assertEqual(snap["search"]["queries"][0]["query"], "candles")
        ga = [b for u, b in calls if "analyticsdata" in u]
        self.assertTrue(all(r["endDate"] == "yesterday" for b in ga for r in b["dateRanges"][:1]))
        region_q = next(b for b in ga if [d["name"] for d in b.get("dimensions", [])] == ["region"])
        self.assertIn("Ashburn", json.dumps(region_q["dimensionFilter"]))

    def test_missing_pieces_say_which(self):
        self.assertIn("No service-account key", pull_web.missing({"keyPresent": False, "sa": None, "propertyId": "", "gscSite": ""}))
        self.assertIn("GA4 property id", pull_web.missing({"keyPresent": True, "sa": {"client_email": "a", "private_key": "b"}, "propertyId": "", "gscSite": ""}))

    def test_web_numbers_never_get_saved_to_github(self):
        with open(os.path.join(ROOT, ".gitignore"), encoding="utf-8") as f:
            text = f.read()
        self.assertIn("dashboard/data/web.json", text)
        self.assertIn("dashboard/data/web.js", text)


class WebConnections(unittest.TestCase):
    """Settings → Web connections: every tool's keys go to .env only; only Google pulls today."""
    def setUp(self):
        import serve
        self.serve = serve

    def test_every_tool_has_its_keys(self):
        for k in ("GA_SERVICE_ACCOUNT_KEY", "GA_PROPERTY_ID", "GSC_SITE", "CLARITY_PROJECT_ID", "CLARITY_API_TOKEN",
                  "BING_SITE_URL", "BING_WEBMASTER_API_KEY", "OTHER_ANALYTICS_API_KEY"):
            self.assertIn(k, self.serve.ALL_KEYS)

    def test_bing_and_clarity_values_are_checked(self):
        with self.assertRaises(ValueError):
            self.serve.clean_key("BING_SITE_URL", "www.yoursite.com")
        self.assertEqual(self.serve.clean_key("BING_SITE_URL", "https://www.yoursite.com/"), "https://www.yoursite.com/")
        with self.assertRaises(ValueError):
            self.serve.clean_key("CLARITY_PROJECT_ID", "not an id!")

    def test_one_place_to_connect(self):
        with open(os.path.join(ROOT, "dashboard", "assets", "web.js"), encoding="utf-8") as f:
            web = f.read()
        with open(os.path.join(ROOT, "dashboard", "assets", "settings.js"), encoding="utf-8") as f:
            st = f.read()
        self.assertIn('href: "#/settings/web"', web)          # Web → Settings points at Settings → Web connections
        self.assertIn('slug: "web", label: "Web connections"', st)
        self.assertIn("webGoogleSetup()", st)                # the Google steps live on the settings page
        for host in ("clarity.ms/export", "ssl.bing.com/webmaster/api"):  # nothing pulls from Clarity or Bing yet
            self.assertNotIn(host, web + st)


if __name__ == "__main__":
    unittest.main()
