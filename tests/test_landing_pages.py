"""Tests for Web & Analytics → Landing Pages and its list, knowledge/landing-pages.json.
Run: python3 -m unittest discover tests

sync reads the list carefully (a bad entry is named in a NOTE, never dropped silently), the Website Team's
skills keep it up to date, it stays out of site/ so it never goes live, and the page draws it grouped by offer
with each page's sub-pages behind a toggle. The drawing test uses headless Chrome and is skipped without it.
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = next((p for p in ("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", shutil.which("google-chrome") or "",
                           shutil.which("chromium") or "") if p and os.path.exists(p)), None)
SAMPLE = {"pages": [
    {"id": "main", "title": "Sample Main Page", "kind": "landing", "parent": None, "route": "/", "offer": "brand/offer.md", "status": "live"},
    {"id": "main-form", "title": "Sample Order Form", "kind": "form", "parent": "main", "route": "/order", "offer": "brand/offer.md"},
    {"id": "main-thanks", "title": "Sample Thanks", "kind": "thank-you", "parent": "main-form", "route": "/order/thanks"},
    {"id": "other-site", "title": "Sample Product Site", "kind": "product", "parent": None, "domain": "shop.example", "route": "/", "offer": "brand/offers/kit.md"},
    {"id": "main", "title": "A duplicate"},
    {"id": "lost", "title": "Sample Orphan", "parent": "nobody"},
    {"id": "odd", "title": "Sample Odd Kind", "kind": "popup"},
    {"title": "No id"},
]}


class Registry(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.repo = os.path.join(self.tmp, "repo")
        shutil.copytree(ROOT, self.repo, ignore=shutil.ignore_patterns(".git", "__pycache__", ".env", "settings.json"))
        self.file = os.path.join(self.repo, "knowledge", "landing-pages.json")

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def sync(self):
        r = subprocess.run([sys.executable, "tools/sync.py"], cwd=self.repo, capture_output=True, text=True)
        with open(os.path.join(self.repo, "command-center", "data", "data.js"), encoding="utf-8") as f:
            blob = json.loads(f.read().split("window.CC_DATA = ", 1)[1].rstrip(";\n"))
        return r.stdout, blob["landingPages"]

    def test_ships_empty_and_out_of_the_live_site(self):
        with open(os.path.join(ROOT, "knowledge", "landing-pages.json"), encoding="utf-8") as f:
            self.assertEqual(json.load(f), {"pages": []})
        self.assertFalse(os.path.exists(os.path.join(ROOT, "site", "pages.json")))

    def test_bad_entries_are_named_not_dropped_silently(self):
        with open(self.file, "w", encoding="utf-8") as f:
            json.dump(SAMPLE, f)
        out, lp = self.sync()
        ids = [p["id"] for p in lp["pages"]]
        self.assertEqual(ids, ["main", "main-form", "main-thanks", "other-site", "lost", "odd"])
        self.assertIn("two pages with the id main", out)
        self.assertIn("page lost: its parent nobody isn't in the list", out)
        self.assertIn("kind 'popup' isn't one of", out)
        self.assertIn("page 8 has no id", out)
        by = {p["id"]: p for p in lp["pages"]}
        self.assertIsNone(by["lost"]["parent"])
        self.assertEqual(by["odd"]["kind"], "other")
        self.assertEqual(by["main-thanks"]["parent"], "main-form")   # a sub-page can have its own sub-pages
        self.assertEqual(by["main-form"]["status"], "draft")          # anything not marked live is a draft

    def test_broken_json_shows_nothing_and_says_why(self):
        with open(self.file, "w", encoding="utf-8") as f:
            f.write("{ not json")
        out, lp = self.sync()
        self.assertEqual(lp["pages"], [])
        self.assertIn("isn't valid JSON", out)

    def test_the_website_team_keeps_it(self):
        for rel in ("library/teams/marketing/website-team/page-builder/skills/build-a-page/SKILL.md",
                    "library/teams/it-systems/dev-team/vercel-agent/skills/ship-a-page/SKILL.md"):
            with open(os.path.join(ROOT, rel), encoding="utf-8") as f:
                self.assertIn("knowledge/landing-pages.json", f.read(), rel)

    @unittest.skipUnless(CHROME, "Google Chrome isn't installed (only this test needs it)")
    def test_page_draws_groups_and_toggles(self):
        def dom():
            url = "file://" + os.path.join(self.repo, "command-center", "index.html") + "#/web/landing"
            return subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--no-first-run", f"--user-data-dir={self.tmp}/chrome",
                                   "--virtual-time-budget=4000", "--dump-dom", url], capture_output=True, text=True, timeout=60).stdout
        self.sync()
        self.longMessage = False
        self.assertIn("No landing pages yet", dom(), "the empty state didn't show")
        with open(self.file, "w", encoding="utf-8") as f:
            json.dump({"pages": SAMPLE["pages"][:4]}, f)
        self.sync()
        html = dom()
        self.assertIn("Sample Main Page", html, "the landing page isn't listed")
        self.assertIn("1 sub-page", html, "the sub-page toggle isn't there")
        self.assertNotIn("Sample Order Form", html, "sub-pages should stay folded until the toggle opens them")
        self.assertIn("Sample Product Site", html)


if __name__ == "__main__":
    unittest.main()
