"""Tests for tools/sync.py. Run: python3 -m unittest discover tests  (Windows: py -m unittest discover tests)

Each test copies the repo into a temp folder, makes one change a member really made in the
Chapter 2/3 test runs, runs the sync there and checks the result. Your own repo is never touched.
"""
import os
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COPYWRITER = "departments/marketing/content-team/copywriter/copywriter.md"
SKILL = "departments/marketing/content-team/copywriter/skills/draft-post/SKILL.md"


class SyncTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.repo = os.path.join(self.tmp, "repo")
        shutil.copytree(ROOT, self.repo, ignore=shutil.ignore_patterns(".git", "__pycache__"))

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def edit(self, rel_path, change):
        p = os.path.join(self.repo, rel_path)
        with open(p, encoding="utf-8") as f:
            text = f.read()
        with open(p, "w", encoding="utf-8") as f:
            f.write(change(text))

    def sync(self, *args):
        r = subprocess.run([sys.executable, "tools/sync.py", *args], cwd=self.repo,
                           capture_output=True, text=True, encoding="utf-8")
        return r.returncode, r.stdout + r.stderr

    def assert_clean(self):
        code, out = self.sync()
        self.assertEqual(code, 0, out)
        self.assertNotIn("FIX:", out)
        code, out = self.sync("--check")
        self.assertEqual(code, 0, out)

    def test_clean_repo_is_in_sync(self):
        self.assert_clean()

    # (1) A lesson says "name yours whatever you want". The owner puts the name in the title,
    # and the workflows that say **Copywriter** must still find it.
    def test_nickname_in_title(self):
        self.edit(COPYWRITER, lambda t: t.replace("# Copywriter\n", '# Copywriter ("Paige")\n', 1))
        self.assert_clean()

    def test_title_replaced_by_a_name(self):
        self.edit(COPYWRITER, lambda t: t.replace("# Copywriter\n", "# Paige\n", 1))
        self.assert_clean()

    def test_name_line(self):
        self.edit(COPYWRITER, lambda t: t.replace("**Team:**", "**Name:** Paige\n**Team:**", 1))
        self.assert_clean()

    def test_unknown_member_still_flagged(self):
        team = "departments/marketing/content-team/team.md"
        self.edit(team, lambda t: t.replace("**Copywriter** · draft-post", "**Ghostwriter** · draft-post", 1))
        code, out = self.sync("--check")
        self.assertEqual(code, 1, out)
        self.assertIn("Ghostwriter", out)

    # (2) A skill doc pasted from a Google Doc with blank lines (or a BOM) above the first ---.
    def test_leading_blank_lines(self):
        self.edit(SKILL, lambda t: "\n\n  \n" + t)
        self.assert_clean()

    def test_leading_bom_and_crlf(self):
        self.edit(SKILL, lambda t: "﻿\r\n" + t.replace("\n", "\r\n"))
        self.assert_clean()


if __name__ == "__main__":
    unittest.main()
