"""The Follow-Up and Sales teams' guards must stay inside every one of their skills. Run: python3 -m unittest discover tests

These skills write to real people. The safety rail: drafts only (the owner sends), no price from
memory ([CHECK PRICE]), never quote a lead's fear back, one touch for one lead, stop when the input is thin.
If someone edits a skill and drops one, this fails.
"""
import glob
import os
import re
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIRS = [
    os.path.join(ROOT, "departments", "marketing", "follow-up-team"),
    os.path.join(ROOT, "departments", "sales", "sales-team", "calendar-agent"),
    os.path.join(ROOT, "departments", "sales", "sales-team", "crm-agent"),
]
MUST = [
    "Drafts only, and the owner sends every message to a lead. No agent ever sends.",
    "otherwise write `[CHECK PRICE]`",
    "Never promise a result, a refund or a ranking.",
    "Never quote a lead's fear or criticism back to them in writing.",
    "If the last message was ours, draft nothing",
    "One touch, for one lead, at a time.",
    "A lead who gave a later date doesn't get chased before that date.",
    "there's no third nudge",
    "name the gap and stop",
    "the department repo must stay private on GitHub",
]
NAMES = {"draft-a-reply", "who-went-quiet", "one-nudge", "book-the-call", "log-a-lead"}


class SalesFollowUpGuardsTest(unittest.TestCase):
    def skills(self):
        found = []
        for d in DIRS:
            found += glob.glob(os.path.join(d, "**", "skills", "*", "SKILL.md"), recursive=True)
        return sorted(found)

    def test_all_five_skills_exist(self):
        have = {os.path.basename(os.path.dirname(p)) for p in self.skills()}
        self.assertTrue(NAMES <= have, f"missing: {NAMES - have}")

    def test_every_skill_carries_the_guards(self):
        for path in self.skills():
            with open(path, encoding="utf-8") as f:
                text = f.read()
            if os.path.basename(os.path.dirname(path)) not in NAMES:
                continue
            for line in MUST:
                self.assertIn(line, text, f"{os.path.relpath(path, ROOT)} lost the guard: {line}")

    def test_no_dollar_amounts(self):
        for path in self.skills():
            with open(path, encoding="utf-8") as f:
                text = f.read()
            self.assertIsNone(re.search(r"\$\s?\d", text),
                              f"{os.path.relpath(path, ROOT)} names a dollar amount; use [CHECK PRICE]")


if __name__ == "__main__":
    unittest.main()
