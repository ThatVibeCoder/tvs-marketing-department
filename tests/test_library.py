"""The department ships nearly empty, and full teams wait in library/teams/. Run: python3 -m unittest discover tests

Each test copies the repo into a temp folder and adds teams the way a member does (tools/add_team.py), then
checks what landed. Nothing here touches your own repo.
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def read(p):
    with open(p, encoding="utf-8") as f:
        return f.read()


class ShippedTest(unittest.TestCase):
    def test_department_ships_only_the_example_team(self):
        teams = json.loads(read(os.path.join(ROOT, "command-center/data/teams.json")))
        self.assertEqual([t["id"] for t in teams], ["example-team"])
        self.assertIn("demo", read(os.path.join(ROOT, "departments/example/example-team/team.md")).lower())
        shortcuts = sorted(os.listdir(os.path.join(ROOT, ".claude/skills")))
        self.assertEqual(shortcuts, ["example-team", "show-me-around", "tour-the-department"])

    def test_library_holds_every_team_and_marks_what_isnt_ready(self):
        lib = os.path.join(ROOT, "library/teams")
        teams = {t for d in os.listdir(lib) if os.path.isdir(os.path.join(lib, d)) for t in os.listdir(os.path.join(lib, d))}
        self.assertEqual(len(teams), 10)
        for nr in ("marketing/newsletter-team", "marketing/research-team", "operations/strategy-team", "it-systems/dev-team/payments-agent"):
            self.assertTrue(os.path.isfile(os.path.join(lib, nr, "NOT-READY.md")), nr)


class AddTeamTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.repo = os.path.join(self.tmp, "repo")
        shutil.copytree(ROOT, self.repo, ignore=shutil.ignore_patterns(".git", "__pycache__", ".env"))

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def run_tool(self, *args):
        r = subprocess.run([sys.executable, *args], cwd=self.repo, capture_output=True, text=True, encoding="utf-8")
        return r.returncode, r.stdout + r.stderr

    def test_adding_a_team_brings_the_whole_team_and_syncs(self):
        before = {p: read(os.path.join(self.repo, p)) for p in ("business.md", "brand/voice.md")}
        code, out = self.run_tool("tools/add_team.py", "website-team")
        self.assertEqual(code, 0, out)
        team = os.path.join(self.repo, "departments/marketing/website-team")
        self.assertTrue(os.path.isfile(os.path.join(team, "page-builder/skills/build-a-page/SKILL.md")))
        self.assertTrue(os.path.isfile(os.path.join(team, "traffic-agent/skills/weekly-traffic-read/SKILL.md")))
        for agent_dir in (".claude/skills/website-team", ".agents/skills/build-a-page"):
            self.assertTrue(os.path.isdir(os.path.join(self.repo, agent_dir)), agent_dir)
        self.assertTrue(os.path.isfile(os.path.join(self.repo, ".gemini/commands/website-team.toml")))
        teams = [t["id"] for t in json.loads(read(os.path.join(self.repo, "command-center/data/teams.json")))]
        self.assertIn("website-team", teams)
        self.assertEqual(before, {p: read(os.path.join(self.repo, p)) for p in before})  # identity files untouched
        code, out = self.run_tool("tools/sync.py", "--check")
        self.assertEqual(code, 0, out)

    def test_never_replaces_a_team_already_there(self):
        self.run_tool("tools/add_team.py", "sales-team")
        mine = os.path.join(self.repo, "departments/sales/sales-team/team.md")
        with open(mine, "a", encoding="utf-8") as f:
            f.write("\nmy own note\n")
        code, out = self.run_tool("tools/add_team.py", "sales-team")
        self.assertNotEqual(code, 0)
        self.assertIn("already there", out)
        self.assertIn("my own note", read(mine))

    def test_not_ready_needs_anyway_and_not_ready_members_stay_out(self):
        code, out = self.run_tool("tools/add_team.py", "newsletter-team")
        self.assertNotEqual(code, 0)
        self.assertFalse(os.path.exists(os.path.join(self.repo, "departments/marketing/newsletter-team")))
        code, out = self.run_tool("tools/add_team.py", "dev-team")
        self.assertEqual(code, 0, out)
        self.assertFalse(os.path.exists(os.path.join(self.repo, "departments/it-systems/dev-team/payments-agent")))
        self.assertFalse(os.path.exists(os.path.join(self.repo, "departments/it-systems/dev-team/NOT-READY.md")))

    def test_every_ready_team_adds_cleanly_alone(self):
        for team in ("content-team", "editing-team", "ads-team", "follow-up-team", "sales-team"):
            code, out = self.run_tool("tools/add_team.py", team)
            self.assertEqual(code, 0, out)
        code, out = self.run_tool("tools/sync.py", "--check")
        self.assertEqual(code, 0, out)


if __name__ == "__main__":
    unittest.main()
