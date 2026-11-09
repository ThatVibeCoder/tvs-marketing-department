"""Tests for tools/sync.py. Run: python3 -m unittest discover tests  (Windows: py -m unittest discover tests)

Each test copies the repo into a temp folder, makes one change, runs the sync there and checks the result.
Your own repo is never touched.
"""
import json
import os
import shutil
import stat
import subprocess
import sys
import tempfile
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROUTINE = """---
name: Weekly Traffic Report
team: Web
status: live
schedule: every Monday 6am
purpose: "Pulls the week's numbers and saves a report."
---
# Weekly Traffic Report

## Steps
1. Pull the website numbers.
2. Write the report.
"""


class SyncTest(unittest.TestCase):
    def setUp(self):
        self.tmp = os.path.realpath(tempfile.mkdtemp())
        self.repo = os.path.join(self.tmp, "repo")
        shutil.copytree(ROOT, self.repo, ignore=shutil.ignore_patterns(".git", "__pycache__", ".env", "settings.json"))

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def write(self, rel_path, text):
        p = os.path.join(self.repo, rel_path)
        os.makedirs(os.path.dirname(p), exist_ok=True)
        with open(p, "w", encoding="utf-8", newline="") as f:
            f.write(text)

    def sync(self, *args):
        r = subprocess.run([sys.executable, "tools/sync.py", *args], cwd=self.repo,
                           capture_output=True, text=True, encoding="utf-8")
        return r.returncode, r.stdout + r.stderr

    def data(self, name):
        with open(os.path.join(self.repo, "dashboard", "data", name), encoding="utf-8") as f:
            return json.load(f)

    def assert_clean(self):
        code, out = self.sync()
        self.assertEqual(code, 0, out)
        self.assertNotIn("FIX:", out)
        code, out = self.sync("--check")
        self.assertEqual(code, 0, out)

    def test_clean_repo_is_in_sync(self):
        code, out = self.sync("--check")
        self.assertEqual(code, 0, out)
        self.assertIn("Everything is in sync.", out)

    def test_writes_only_the_dashboard_data(self):
        before = {os.path.join(d, f) for d, _, fs in os.walk(self.repo) for f in fs}
        self.write("routines/weekly-traffic/README.md", ROUTINE)
        self.assert_clean()
        after = {os.path.join(d, f) for d, _, fs in os.walk(self.repo) for f in fs}
        new = sorted(os.path.relpath(p, self.repo) for p in after - before)
        self.assertEqual(new, [os.path.join("routines", "weekly-traffic", "README.md")])
        for gone in ("teams.json",):
            self.assertFalse(os.path.exists(os.path.join(self.repo, "dashboard", "data", gone)))
        for vault in (".claude", ".agents", ".gemini", ".cursor", "CLAUDE.md", "GEMINI.md", "departments"):
            self.assertFalse(os.path.exists(os.path.join(self.repo, vault)), vault)

    def test_a_routine_becomes_an_automation(self):
        self.write("routines/weekly-traffic/README.md", ROUTINE)
        self.assert_clean()
        autos = self.data("automations.json")
        self.assertEqual(len(autos), 1)
        a = autos[0]
        self.assertEqual((a["id"], a["name"], a["area"], a["active"]), ("weekly-traffic", "Weekly Traffic Report", "Web", True))
        self.assertEqual(a["trigger"], {"type": "cron", "schedule": "every Monday 6am"})
        self.assertEqual([n["stat"] for n in a["flow"]["nodes"] if n["id"].startswith("s")],
                         ["Pull the website numbers.", "Write the report."])

    def test_a_bad_routine_status_is_a_fix_and_nothing_is_written(self):
        self.write("routines/weekly-traffic/README.md", ROUTINE.replace("status: live", "status: maybe"))
        code, out = self.sync()
        self.assertEqual(code, 1, out)
        self.assertIn("FIX:", out)
        self.assertEqual(self.data("automations.json"), [])

    def test_a_broken_executions_file_is_a_fix(self):
        self.write("dashboard/data/executions.json", "[ not json")
        code, out = self.sync()
        self.assertEqual(code, 1, out)
        self.assertIn("executions.json", out)

    def test_check_catches_a_stale_file(self):
        self.write("routines/weekly-traffic/README.md", ROUTINE)
        code, out = self.sync("--check")
        self.assertEqual(code, 1, out)
        self.assertIn("OUT OF DATE:", out)

    # A file pasted from a Google Doc with blank lines (or a BOM) above the first ---.
    def test_leading_blank_lines(self):
        self.write("routines/weekly-traffic/README.md", "\n\n  \n" + ROUTINE)
        self.assert_clean()
        self.assertEqual(self.data("automations.json")[0]["name"], "Weekly Traffic Report")

    def test_leading_bom_and_crlf(self):
        self.write("routines/weekly-traffic/README.md", "﻿\r\n" + ROUTINE.replace("\n", "\r\n"))
        self.assert_clean()
        self.assertEqual(self.data("automations.json")[0]["name"], "Weekly Traffic Report")

    def test_never_reads_outside_the_repo(self):
        with open(os.path.join(ROOT, "tools", "sync.py"), encoding="utf-8") as f:
            src = f.read()
        self.assertNotIn("..", "".join(l for l in src.splitlines() if "os.path.join(" in l))
        # the company vault's folders, spelled in pieces so this guard never counts as a reference itself
        for word in ('"depart" "ments"', "depart" "ments/", "bra" "nd/", "busi" "ness.md", '"know" "ledge"', "know" "ledge/", "VAULT"):
            self.assertFalse(word.replace('" "', "") in src, word)

    @unittest.skipIf(os.name == "nt" or (hasattr(os, "geteuid") and os.geteuid() == 0), "needs a POSIX user who can be denied a write")
    def test_permission_error_prints_blocked_and_exits(self):
        self.write("routines/weekly-traffic/README.md", ROUTINE)
        data = os.path.join(self.repo, "dashboard", "data")
        os.chmod(data, stat.S_IRUSR | stat.S_IXUSR)
        try:
            r = subprocess.run([sys.executable, "tools/sync.py"], cwd=self.repo, capture_output=True, text=True)
        finally:
            os.chmod(data, stat.S_IRWXU)
        self.assertEqual(r.returncode, 1)
        self.assertIn("BLOCKED:", r.stdout)
        self.assertNotIn("Traceback", r.stderr)


if __name__ == "__main__":
    unittest.main()
