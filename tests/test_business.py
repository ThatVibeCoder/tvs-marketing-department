"""Tests for the My Business pages: tools/business.py reads and writes the business files, serve.py saves them,
and the page draws them. Run: python3 -m unittest discover tests

The promise being checked: an edit changes only the value it names. Every other character of the file stays put
(the At a Glance lines, the guides, the `_Not filled in yet._` markers), so every skill that reads these files
keeps working. The drawing test opens the real page in headless Chrome and is skipped without Chrome.
"""
import datetime
import difflib
import http.client
import json
import os
import shutil
import socket
import subprocess
import sys
import tempfile
import time
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
import business as b  # noqa: E402
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from shipped import AS_SHIPPED, WHY  # noqa: E402  (template-only tests skip in a member's repo)

DAY = datetime.date(2026, 11, 7)
FILES = ["business.md", "brand/icp.md", "brand/offer.md", "brand/friction-points.md", "brand/contrarian-take.md",
         "brand/personas/_template.md", "brand/icps/_template.md", "brand/offers/_template.md", "knowledge/competitors/_template.md"]
CHROME = next((p for p in ("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", shutil.which("google-chrome") or "",
                           shutil.which("chromium") or "") if p and os.path.exists(p)), None)


def changed_lines(a, c):
    return [ln for ln in difflib.ndiff(a.splitlines(), c.splitlines()) if ln[:1] in "+-"]


@unittest.skipUnless(AS_SHIPPED, WHY)
class Shapes(unittest.TestCase):
    def test_nothing_changes_without_a_change(self):
        for f in FILES:
            t = b.read(f)
            self.assertEqual(b.apply(t, {}), t, f)

    def test_icp_reads_glance_guides_and_fields(self):
        d = b.parse(b.read("brand/icp.md"), b.guides_for("icp"))
        self.assertEqual([g["label"] for g in d["glance"]][:2], ["One liner", "The one person"])
        self.assertTrue(all(g["value"] == "" for g in d["glance"]))            # the marker reads as empty
        one = b.section(d, "The One Person")
        self.assertTrue(one["guide"].startswith("The actual person"))         # the guide is never the answer
        self.assertEqual(one["body"], "")
        prof = b.section(d, "Profile Data (optional)")
        self.assertIn("Age range", [f["key"] for f in prof["fields"]])
        self.assertEqual(d["lessons"], ["Lock In Your ICP"])

    def test_friction_fields_and_italic_guide(self):
        d = b.parse(b.read("brand/friction-points.md"))
        f1 = b.section(d, "Friction 1")
        self.assertTrue(f1["guide"].startswith("_How to fill this"))
        self.assertEqual([f["key"] for f in f1["fields"]], ["What they say", "Our answer", "Where it gets answered"])

    def test_an_edit_moves_only_its_own_lines(self):
        t = b.read("brand/icp.md")
        n = b.apply(t, {"glance": {"The one person": "Mia, 34"},
                        "sections": {"Dream State": "She wants an easy yes.\n\nAnd a second paragraph."},
                        "fields": {"Profile Data (optional)": {"Age range": "30-45"}}, "update": "owner edit"}, b.guides_for("icp"), DAY)
        diff = changed_lines(t, n)
        self.assertEqual(sorted(x for x in diff if x.startswith("-")),
                         sorted(["- The one person: _Not filled in yet._", "- _Not filled in yet._", "- **Age range:**"]))
        self.assertIn("+ - 2026-11-07: owner edit", diff)
        d = b.parse(n, b.guides_for("icp"))
        self.assertEqual(b.glance(d, "The one person"), "Mia, 34")
        self.assertEqual(b.section(d, "Dream State")["body"], "She wants an easy yes.\n\nAnd a second paragraph.")
        self.assertTrue(b.section(d, "Dream State")["guide"].startswith("What they want to be true"))  # guide kept
        # and the next edit of the same section replaces it cleanly, guide still on top
        n2 = b.apply(n, {"sections": {"Dream State": "Shorter."}}, b.guides_for("icp"), DAY)
        self.assertEqual(b.section(b.parse(n2, b.guides_for("icp")), "Dream State")["body"], "Shorter.")
        self.assertEqual(n2.count("What they want to be true instead"), 1)

    def test_clearing_a_value_puts_the_marker_back(self):
        t = b.read("brand/offer.md")
        n = b.apply(t, {"glance": {"Price": "$58"}, "sections": {"The Promise": "On time."}}, b.guides_for("offer"), DAY)
        back = b.apply(n, {"glance": {"Price": ""}, "sections": {"The Promise": ""}}, b.guides_for("offer"), DAY)
        self.assertEqual(back, t)

    def test_long_glance_key_with_brackets(self):
        t = b.read("brand/icp.md")
        n = b.apply(t, {"glance": {"One liner": "I help X go from A to B so they can C"}}, b.guides_for("icp"))
        self.assertIn("One liner (I help [person] go from [now] to [after] so they can [outcome]): I help X go from A to B so they can C", n)

    def test_an_older_file_gets_the_missing_pieces(self):
        """A member's icp.md from before Profile Data, and an offer without a Name line, still take the edit."""
        t = b.read("brand/icp.md")
        old = t[:t.index("## Profile Data")] + t[t.index("## Updates"):]
        n = b.apply(old, {"fields": {"Profile Data (optional)": {"Income": "$60k"}}}, b.guides_for("icp"), DAY)
        self.assertLess(n.index("## Profile Data (optional)"), n.index("## Updates"))
        self.assertIn("**Income:** $60k", n)
        self.assertEqual(b.apply(old, {}), old)
        o = b.apply(b.read("brand/offer.md"), {"glance": {"Name": "The Gift Box"}})
        block = o[o.index("## At a Glance"):o.index("## The Offer")]
        self.assertIn("Name: The Gift Box\n```", block)

    def test_competitor_names_from_business_md(self):
        d = b.parse("# B\n\n## Who Else They Could Pick\n" + b.BUSINESS_GUIDES["Who Else They Could Pick"] + "\n\n- Northside Candle Co. (cheaper)\n- Ember Lane: big on TikTok\n- Bath & Body Works, Yankee\n", b.BUSINESS_GUIDES)
        self.assertEqual(b.competitor_names(d), ["Northside Candle Co", "Ember Lane", "Bath & Body Works", "Yankee"])

    def test_only_business_files_can_be_saved(self):
        for ok in ("brand/icp.md", "brand/icps/agency-owners.md", "brand/offer.md", "brand/offers/starter.md", "brand/personas/mia-the-buyer.md",
                   "brand/friction-points.md", "brand/contrarian-take.md", "knowledge/competitors/northside.md"):
            self.assertTrue(b.allowed(ok), ok)
        for bad in ("business.md", "brand/voice.md", "brand/personas/_template.md", "brand/personas/README.md", "brand/icps/../voice.md",
                    "../brand/icp.md", "brand/icps/Bad Name.md", ".env", "tools/sync.py"):
            self.assertFalse(b.allowed(bad), bad)


class BusinessCopy(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.repo = os.path.join(self.tmp, "repo")
        shutil.copytree(ROOT, self.repo, ignore=shutil.ignore_patterns(".git", "__pycache__", ".env", "settings.json"))

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def run_py(self, code):
        r = subprocess.run([sys.executable, "-c", "import sys; sys.path.insert(0, 'tools'); import business as b, datetime\n" + code],
                           cwd=self.repo, capture_output=True, text=True)
        self.assertEqual(r.returncode, 0, r.stderr)
        return r.stdout

    def read(self, rel):
        with open(os.path.join(self.repo, rel), encoding="utf-8") as f:
            return f.read()


@unittest.skipUnless(AS_SHIPPED, WHY)
class Creating(BusinessCopy):
    def test_new_persona_is_named_and_listed(self):
        self.run_py("print(b.create('persona', 'Mia, the busy gift buyer', datetime.date(2026, 11, 7)))")
        t = self.read("brand/personas/mia-the-busy-gift-buyer.md")
        self.assertTrue(t.startswith("# Mia, the busy gift buyer\n"))
        self.assertIn("- 2026-11-07: made in the Command Center", t)
        readme = self.read("brand/personas/README.md")
        self.assertIn("- `mia-the-busy-gift-buyer.md`: Mia, the busy gift buyer", readme)
        self.assertNotIn("_None yet._", readme)

    def test_new_competitor_logs_under_what_changed(self):
        self.run_py("b.create('competitor', 'Northside Candle Co.')")
        t = self.read("knowledge/competitors/northside-candle-co.md")
        self.assertIn("## What Changed", t)
        self.assertNotIn("## Updates", t)
        self.assertRegex(t.split("## What Changed", 1)[1], r"- \d{4}-\d{2}-\d{2}: made in the Command Center")

    def test_extra_icp_and_offer_keep_the_main_shape(self):
        self.run_py("b.create('icp', 'Agency owners'); b.create('offer', 'Wholesale Starter')")
        icp = b.parse(self.read("brand/icps/agency-owners.md"), b.guides_for("icp"))
        main = b.parse(b.read("brand/icp.md"), b.guides_for("icp"))
        self.assertEqual(icp["title"], "ICP: Agency owners")
        self.assertEqual([s["title"] for s in icp["sections"]], [s["title"] for s in main["sections"]])
        self.assertTrue(self.read("brand/offers/wholesale-starter.md").startswith("# Offer: Wholesale Starter\n"))

    def test_never_overwrites(self):
        self.run_py("b.create('icp', 'Agency owners')")
        r = subprocess.run([sys.executable, "-c", "import sys; sys.path.insert(0,'tools'); import business as b; b.create('icp', 'Agency Owners')"],
                           cwd=self.repo, capture_output=True, text=True)
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("already there", r.stderr)

    def test_sync_shows_it_in_the_dashboard(self):
        self.run_py("b.create('persona', 'Dana, the regular')")
        subprocess.run([sys.executable, "tools/sync.py"], cwd=self.repo, capture_output=True, check=True)
        data = self.read("command-center/data/data.js")
        blob = json.loads(data.split("window.CC_DATA = ", 1)[1].rstrip(";\n"))
        self.assertIn("Dana, the regular", [p["title"] for p in blob["business"]["personas"]])
        self.assertEqual([i["slug"] for i in blob["business"]["icps"]], ["main"])


def free_port():
    s = socket.socket()
    s.bind(("127.0.0.1", 0))
    p = s.getsockname()[1]
    s.close()
    return p


class Saving(BusinessCopy):
    def setUp(self):
        super().setUp()
        self.port = free_port()
        self.proc = subprocess.Popen([sys.executable, "tools/serve.py", "--port", str(self.port)], cwd=self.repo,
                                     stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        for _ in range(50):
            try:
                self.call("GET", "/api/health")
                break
            except OSError:
                time.sleep(0.1)

    def tearDown(self):
        self.proc.terminate()
        self.proc.wait(5)
        super().tearDown()

    def call(self, method, path, body=None):
        c = http.client.HTTPConnection("127.0.0.1", self.port, timeout=10)
        headers = {"Host": "localhost"}
        data = None
        if body is not None:
            data = json.dumps(body).encode()
            headers["Content-Type"] = "application/json"
        c.request(method, path, body=data, headers=headers)
        r = c.getresponse()
        raw = r.read()
        return r.status, (json.loads(raw) if raw[:1] in (b"{", b"[") else raw)

    def test_friction_save_through_the_server(self):
        code, res = self.call("POST", "/api/business/save", {"path": "brand/friction-points.md", "changes": {
            "glance": {"Friction 2": "Too pricey"}, "fields": {"Friction 2": {"What they say": "Too pricey", "Our answer": "UNSOLVED"}}}})
        self.assertEqual(code, 200, res)
        t = self.read("brand/friction-points.md")
        self.assertIn("Friction 2: Too pricey", t)
        self.assertIn("**What they say:** Too pricey", t)
        self.assertIn("**Our answer:** UNSOLVED", t)
        self.assertIn("edited in the Command Center: Friction 2, What they say, Our answer", t)
        f2 = [s for s in res["state"]["business"]["friction"]["sections"] if s["title"] == "Friction 2"][0]
        self.assertEqual(f2["fields"][1]["value"], "UNSOLVED")

    def test_refuses_other_files(self):
        for path in ("brand/voice.md", "../outside.md", "business.md", "brand/personas/README.md"):
            code, res = self.call("POST", "/api/business/save", {"path": path, "changes": {"sections": {"X": "y"}}})
            self.assertEqual(code, 400, path)

    def test_new_then_edit(self):
        code, res = self.call("POST", "/api/business/new", {"kind": "offer", "name": "Starter kit"})
        self.assertEqual(code, 200, res)
        self.assertEqual(res["path"], "brand/offers/starter-kit.md")
        code, res = self.call("POST", "/api/business/save", {"path": "brand/offers/starter-kit.md", "changes": {
            "glance": {"Price": "$97"}, "sections": {"What They Get": "- One\n- Two"}}})
        self.assertEqual(code, 200, res)
        offer = [o for o in res["state"]["business"]["offers"] if o["slug"] == "starter-kit"][0]
        self.assertEqual(b.glance(offer, "Price"), "$97")


@unittest.skipUnless(CHROME, "Google Chrome isn't installed (only this test needs it)")
@unittest.skipUnless(AS_SHIPPED, WHY)
class PageDraws(BusinessCopy):
    def dom(self, route):
        subprocess.run([sys.executable, "tools/sync.py"], cwd=self.repo, capture_output=True, check=True)
        url = "file://" + os.path.join(self.repo, "command-center", "index.html") + "#" + route
        r = subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--no-first-run", f"--user-data-dir={self.tmp}/chrome",
                            "--virtual-time-budget=4000", "--dump-dom", url], capture_output=True, text=True, timeout=60)
        return r.stdout

    def test_empty_overview_names_the_lessons(self):
        html = self.dom("/business")
        self.longMessage = False
        self.assertIn("Who you serve", html, "the bento didn't draw")
        self.assertIn("Lock In Your ICP", html)
        self.assertIn("Build Your Offer", html)
        self.assertNotIn("voice.md</", html)

    def test_filled_overview_and_offer_builder(self):
        self.run_py("""
b.save('brand/icp.md', {'glance': {'One liner': 'I help Sample Buyers go from A to B so they can C'}})
b.save('brand/offer.md', {'glance': {'Name': 'Sample Box', 'Price': '$58'}, 'sections': {'What They Get': '- Thing one\\n- Thing two'}})
""")
        html = self.dom("/business")
        self.longMessage = False
        self.assertIn("I help Sample Buyers go from A to B so they can C", html, "the ICP one-liner isn't on the bento")
        self.assertIn("Sample Box", html, "the offer isn't on the bento")
        html = self.dom("/business/offers")
        self.assertIn("Thing two", html, "the offer builder preview didn't draw")


if __name__ == "__main__":
    unittest.main()
