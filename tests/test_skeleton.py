"""The template ships as a skeleton plus the Dev Team. Run: python3 -m unittest discover tests

Every other team is built by its classroom lesson's skill doc, so a fresh copy has the Dev Team in departments/,
no team library, no add_team.py, no shortcut or Command Center entry for any team that isn't there, and a
dashboard that opens from the folder showing the Dev Team and nothing else.
"""
import glob
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import unittest
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from shipped import AS_SHIPPED, WHY  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = next((p for p in ("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", shutil.which("google-chrome") or "",
                           shutil.which("chromium") or "") if p and os.path.exists(p)), None)
# the teams the template used to ship; each now comes from its lesson
REMOVED = ("example-team", "content-team", "editing-team", "website-team", "follow-up-team", "ads-team",
           "research-team", "newsletter-team", "sales-team", "strategy-team")
MIRRORS = (".claude/skills", ".agents/skills", ".gemini/commands", ".cursor/commands", ".cursor/rules", "CLAUDE.md", "GEMINI.md")


def read(p):
    with open(p, encoding="utf-8") as f:
        return f.read()


def mirror_files():
    for m in MIRRORS:
        p = os.path.join(ROOT, m)
        if os.path.isfile(p):
            yield p
        for dirpath, _, files in os.walk(p):
            for f in files:
                yield os.path.join(dirpath, f)


@unittest.skipUnless(AS_SHIPPED, WHY)
class SkeletonTest(unittest.TestCase):
    def test_departments_hold_exactly_the_dev_team(self):
        teams = sorted(os.path.relpath(os.path.dirname(p), ROOT).replace(os.sep, "/")
                       for p in glob.glob(os.path.join(ROOT, "departments", "*", "*", "team.md")))
        self.assertEqual(teams, ["departments/it-systems/dev-team"])
        self.assertEqual(sorted(d for d in os.listdir(os.path.join(ROOT, "departments"))
                                if os.path.isdir(os.path.join(ROOT, "departments", d))),
                         ["it-systems", "marketing", "operations", "sales"])
        for d in ("marketing", "operations", "sales"):
            readme = read(os.path.join(ROOT, "departments", d, "README.md"))
            self.assertIn("classroom lessons", readme, d)
            self.assertEqual([n for n in os.listdir(os.path.join(ROOT, "departments", d)) if n != "README.md"], [], d)

    def test_the_payments_agent_stays_honest(self):
        pa = os.path.join(ROOT, "departments/it-systems/dev-team/payments-agent")
        self.assertIn("**Status:** seeded", read(os.path.join(pa, "payments-agent.md")))
        self.assertTrue(os.path.isfile(os.path.join(pa, "NOT-READY.md")))
        self.assertFalse(glob.glob(os.path.join(pa, "skills", "*", "SKILL.md")))
        self.assertNotIn("--anyway", read(os.path.join(pa, "NOT-READY.md")))

    def test_no_library_and_no_add_team(self):
        self.assertFalse(os.path.exists(os.path.join(ROOT, "library")))
        self.assertFalse(os.path.exists(os.path.join(ROOT, "tools", "add_team.py")))
        self.assertFalse(os.path.exists(os.path.join(ROOT, "departments", "example")))
        for p in glob.glob(os.path.join(ROOT, "tools", "*.py")) + glob.glob(os.path.join(ROOT, "command-center", "assets", "*.js")):
            text = read(p)
            self.assertNotIn("add_team", text, p)
            self.assertNotIn("library/teams", text, p)

    def test_no_mirror_names_a_removed_team(self):
        files = list(mirror_files())
        self.assertTrue(files)
        for p in files:
            text = read(p).lower()
            for team in REMOVED:
                self.assertNotIn(team, text, f"{os.path.relpath(p, ROOT)} names {team}")
        # and every shortcut is one the Dev Team really has
        data = json.loads(read(os.path.join(ROOT, "command-center/data/teams.json")))
        commands = {s["name"] for t in data for s in t["skills"]} | {t["id"] for t in data}
        for d in (".claude/skills", ".agents/skills"):
            self.assertEqual(set(os.listdir(os.path.join(ROOT, d))), commands, d)

    def test_command_center_data_has_only_the_dev_team(self):
        teams = json.loads(read(os.path.join(ROOT, "command-center/data/teams.json")))
        self.assertEqual([t["id"] for t in teams], ["dev-team"])
        js = read(os.path.join(ROOT, "command-center/data/data.js"))
        data = json.loads(re.search(r"window\.CC_DATA = (.*);\s*$", js, re.S).group(1))
        self.assertEqual([t["id"] for t in data["teams"]], ["dev-team"])
        self.assertNotIn("library", data)

    def test_sync_check_passes(self):
        r = subprocess.run([sys.executable, "tools/sync.py", "--check"], cwd=ROOT, capture_output=True, text=True, encoding="utf-8")
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
        self.assertIn("1 team ·", r.stdout)


@unittest.skipUnless(AS_SHIPPED, WHY)
@unittest.skipUnless(CHROME, "Google Chrome isn't installed (only this test needs it)")
class DashboardTest(unittest.TestCase):
    """The dashboard opened straight from the folder (file://), the way a member opens it on Day 1."""

    def setUp(self):
        self.tmp = tempfile.mkdtemp()

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def open(self, route):
        url = "file://" + os.path.join(ROOT, "command-center", "index.html") + route
        r = subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--no-first-run", f"--user-data-dir={self.tmp}/chrome",
                            "--enable-logging=stderr", "--v=0", "--virtual-time-budget=4000", "--dump-dom", url],
                           capture_output=True, text=True, timeout=60)
        errors = [l for l in r.stderr.splitlines() if ":CONSOLE" in l]  # the page logs nothing when it's healthy
        return r.stdout, errors

    def test_agent_teams_shows_the_dev_team_and_nothing_else(self):
        html, errors = self.open("#/agent-teams")
        self.assertEqual(errors, [])
        self.assertIn("Dev Team", html)
        self.assertIn("Your teams come from the classroom lessons", html)
        for name in ("Content Team", "Website Team", "Strategy Team", "Sales Team", "Example Team", "add_team", "team library"):
            self.assertNotIn(name, html, name)

    def test_every_page_opens_without_a_console_error(self):
        for route in ("#/dashboard", "#/agent", "#/agent-teams", "#/agent-teams/dev-team", "#/automations",
                      "#/content", "#/content/calendar", "#/content/research", "#/web", "#/web/landing",
                      "#/settings/account", "#/settings/payments", "#/settings/agents"):
            html, errors = self.open(route)
            self.assertEqual(errors, [], route)
            self.assertNotIn("add the website team", html.lower(), route)
            self.assertNotIn("add_team", html, route)
            self.assertNotIn("example-team", html, route)
        payments, _ = self.open("#/settings/payments")
        self.assertIn("On the Dev Team, not ready yet", payments)
        agents, _ = self.open("#/settings/agents")
        self.assertIn("/dev-team", agents)


if __name__ == "__main__":
    unittest.main()
