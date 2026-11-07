"""Installing a skill stays cheap. Run: python3 -m unittest discover tests

A member on Codex burned a whole weekly limit installing one skill: the rules told the AI to read business.md and all
of brand/ before every task, invited fix-and-rerun loops on sync, and AGENTS.md itself was 22.8 KB on every turn.
These tests keep each of those from coming back.
"""
import glob
import os
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
import sync  # noqa: E402

BLANKET = "everything in `brand/`"


def read(p):
    with open(p, encoding="utf-8") as f:
        return f.read()


def generated_and_member_files():
    files = glob.glob(os.path.join(ROOT, "departments", "*", "*", "*", "*.md"))
    for d in (".claude/skills", ".agents/skills"):
        files += glob.glob(os.path.join(ROOT, d, "*", "SKILL.md"))
    files += glob.glob(os.path.join(ROOT, ".gemini", "commands", "*.toml"))
    files += glob.glob(os.path.join(ROOT, ".cursor", "commands", "*.md"))
    files += [os.path.join(ROOT, p) for p in ("CLAUDE.md", "GEMINI.md", ".cursor/rules/agents.mdc")]
    return files


class TaskBasedReadsTest(unittest.TestCase):
    def test_no_member_file_or_shortcut_says_read_all_of_brand(self):
        files = generated_and_member_files()
        self.assertGreater(len(files), 30)
        for p in files:
            self.assertNotIn(BLANKET, read(p), os.path.relpath(p, ROOT))
        self.assertNotIn(BLANKET, sync.READ_LINE)

    def test_agents_md_reads_by_task_and_an_install_reads_no_brand(self):
        section = read(os.path.join(ROOT, "AGENTS.md")).split("## Read only what the job needs")[1].split("\n## ")[0]
        self.assertIn("the skill you're running names", section)
        self.assertIn("Installing a skill", section)
        self.assertIn("reads nothing from `business.md` or `brand/`", section)
        self.assertNotIn(BLANKET, read(os.path.join(ROOT, "AGENTS.md")))


class OneJobPerSkillTest(unittest.TestCase):
    """Overlapping descriptions made the AI load three security skills for one ask. Each Dev Team skill has one job,
    one trigger and a Not for line that names the skill that owns the neighbouring job."""

    def test_every_dev_team_skill_says_what_its_not_for(self):
        paths = glob.glob(os.path.join(ROOT, "departments", "it-systems", "dev-team", "*", "skills", "*", "SKILL.md"))
        self.assertGreater(len(paths), 10)
        for p in paths:
            meta, _ = sync.frontmatter(read(p))
            self.assertIn("Not for", meta["description"], meta["name"])
            self.assertLess(len(meta["description"]), sync.MAX_DESC, meta["name"])

    def test_the_three_check_skills_point_at_each_other(self):
        def desc(member, name):
            p = os.path.join(ROOT, "departments/it-systems/dev-team", member, "skills", name, "SKILL.md")
            return sync.frontmatter(read(p))[0]["description"].split("Not for")[1]
        self.assertIn("security-sweep", desc("test-agent", "pre-ship-check"))
        self.assertIn("harden-the-basics", desc("test-agent", "pre-ship-check"))
        self.assertIn("harden-the-basics", desc("security-checker", "security-sweep"))
        self.assertIn("pre-ship-check", desc("security-checker", "security-sweep"))
        self.assertIn("security-sweep", desc("security-checker", "harden-the-basics"))
        self.assertIn("pre-ship-check", desc("security-checker", "harden-the-basics"))


class OldReadLineTest(unittest.TestCase):
    """A lesson doc written before this change still writes the old line; sync swaps it instead of failing."""

    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.repo = os.path.join(self.tmp, "repo")
        shutil.copytree(ROOT, self.repo, ignore=shutil.ignore_patterns(".git", "__pycache__", ".env"))

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def run_sync(self, *args):
        r = subprocess.run([sys.executable, "tools/sync.py", *args], cwd=self.repo, capture_output=True, text=True,
                           encoding="utf-8")
        return r.returncode, r.stdout + r.stderr

    def test_the_drive_docs_line_passes_with_no_fix(self):
        # the classroom's Drive skill docs ship this exact sentence in every team member file they write
        self.assertEqual(sync.READ_LINE, "Each skill names the files it reads. Read those, then this file, and stay "
                                         "inside this file's edges.")
        member = os.path.join(self.repo, "departments/it-systems/dev-team/drive-test/drive-test.md")
        os.makedirs(os.path.dirname(member))
        with open(member, "w", encoding="utf-8") as f:
            f.write(f"# Drive Test\n\n**Status:** live\n**Team:** Dev Team\n\n{sync.READ_LINE}\n\nA member a Drive doc wrote.\n")
        team = os.path.join(self.repo, "departments/it-systems/dev-team/team.md")
        text = read(team).replace("## Members\n", "## Members\n- **Drive Test** (`drive-test/`): a member a Drive doc wrote.\n", 1)
        with open(team, "w", encoding="utf-8") as f:
            f.write(text)
        code, out = self.run_sync()
        self.assertEqual(code, 0, out)
        self.assertNotIn("FIX:", out)
        code, out = self.run_sync("--check")
        self.assertEqual(code, 0, out)

    def test_an_old_read_line_is_rewritten_not_a_fix(self):
        p = os.path.join(self.repo, "departments/it-systems/dev-team/planner/planner.md")
        text = read(p).replace(sync.READ_LINE, sync.OLD_READ_LINES[0])
        with open(p, "w", encoding="utf-8") as f:
            f.write(text)
        code, out = self.run_sync("--check")
        self.assertEqual(code, 1, out)
        self.assertIn("old read-first line", out)
        self.assertNotIn("FIX:", out)
        code, out = self.run_sync()
        self.assertEqual(code, 0, out)
        self.assertIn(sync.READ_LINE, read(p))
        self.assertNotIn(BLANKET, read(p))
        code, out = self.run_sync("--check")
        self.assertEqual(code, 0, out)


if __name__ == "__main__":
    unittest.main()
