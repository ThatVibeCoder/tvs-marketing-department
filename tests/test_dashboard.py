"""The dashboard opened straight from the folder (file://), the way an owner opens it on day one.
Run: python3 -m unittest discover tests

Every page opens without a console error, and nothing on it reads or links to vault parts this repo doesn't
have (agent teams, research from a knowledge folder, AI agent shortcuts). Needs headless Chrome; skipped without it.
"""
import os
import shutil
import subprocess
import tempfile
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = next((p for p in ("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", shutil.which("google-chrome") or "",
                           shutil.which("chromium") or "") if p and os.path.exists(p)), None)
ROUTES = ("#/dashboard", "#/agent", "#/automations", "#/executions", "#/content", "#/content/calendar",
          "#/content/threads", "#/content/threads/review", "#/web", "#/web/landing", "#/web/traffic",
          "#/settings/account", "#/settings/workspace", "#/settings/accounts", "#/settings/payments",
          "#/settings/web", "#/settings/cadence", "#/settings/developer")


@unittest.skipUnless(CHROME, "Google Chrome isn't installed (only this test needs it)")
class DashboardTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def open(self, route):
        url = "file://" + os.path.join(ROOT, "dashboard", "index.html") + route
        r = subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--no-first-run", f"--user-data-dir={self.tmp}/chrome",
                            "--enable-logging=stderr", "--v=0", "--virtual-time-budget=4000", "--dump-dom", url],
                           capture_output=True, text=True, timeout=60)
        errors = [l for l in r.stderr.splitlines() if ":CONSOLE" in l]  # the page logs nothing when it's healthy
        return r.stdout, errors

    def test_every_page_opens_without_a_console_error(self):
        for route in ROUTES:
            html, errors = self.open(route)
            self.assertEqual(errors, [], route)
            self.assertIn('id="app"', html, route)
            # vault words, spelled in pieces so this guard never counts as a reference itself
            for word in ("Agent Teams", "agent-teams", "know" "ledge/", "depart" "ments/", "Research", "AI Agents"):
                self.assertNotIn(word, html, f"{route}: {word}")

    def test_old_team_links_land_somewhere(self):
        html, errors = self.open("#/agent-teams")
        self.assertEqual(errors, [])
        self.assertIn("Automations", html)


if __name__ == "__main__":
    unittest.main()
