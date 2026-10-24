"""The Ads Team's guards must stay inside every ads skill. Run: python3 -m unittest discover tests

Ad accounts spend real money, so these lines are the safety rail: built paused, the owner
turns things on, no billing, a yes before every change, the browser only looks, and no dollar
amount picked by the AI ([CHECK BUDGET] instead). If someone edits a skill and drops one, this fails.
"""
import glob
import os
import re
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ADS = os.path.join(ROOT, "departments", "marketing", "ads-team")
MUST = [
    "Everything is built paused",
    "never touch billing",
    "wait for the owner's yes",
    "The browser is for looking only",
    "[CHECK BUDGET]",
]


class AdsGuardsTest(unittest.TestCase):
    def skills(self):
        found = sorted(glob.glob(os.path.join(ADS, "*", "skills", "*", "SKILL.md")))
        self.assertTrue(found, "no ads skills found")
        return found

    def test_every_ads_skill_carries_the_guards(self):
        for path in self.skills():
            with open(path, encoding="utf-8") as f:
                text = f.read()
            for line in MUST:
                self.assertIn(line, text, f"{os.path.relpath(path, ROOT)} lost the guard: {line}")

    def test_no_dollar_amounts_in_ads_skills(self):
        for path in self.skills():
            with open(path, encoding="utf-8") as f:
                text = f.read()
            self.assertIsNone(re.search(r"\$\s?\d", text),
                              f"{os.path.relpath(path, ROOT)} names a dollar amount; use [CHECK BUDGET]")


if __name__ == "__main__":
    unittest.main()
