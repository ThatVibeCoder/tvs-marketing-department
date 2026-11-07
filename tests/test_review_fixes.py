"""Fixes from the code review of PR #18 (handoffs/TVS-CODE-REVIEW-2026-11-07.md), one class per item.
Run: python3 -m unittest discover tests

Each class failed before its fix. They run on throwaway copies of the files, never the repo itself.
"""
import datetime
import os
import sys
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
import business as b  # noqa: E402

DAY = datetime.date(2026, 11, 7)


class F1GuidesWithoutATemplate(unittest.TestCase):
    """contrarian-take.md and friction-points.md have no template: the first save kept deleting each guide."""

    def test_contrarian_first_save_keeps_the_guide(self):
        t = b.read("brand/contrarian-take.md")
        n = b.apply(t, {"sections": {"The Lead Take": "Most ads are wasted.", "The Enemy": "Boosted posts."}}, None, DAY)
        self.assertIn("## The Lead Take\nOne or two sentences, in your words, sharp enough to disagree with.\n\nMost ads are wasted.", n)
        self.assertIn("The common way of doing things that you're against. A practice, never a person.\n\nBoosted posts.", n)
        d = b.parse(n)
        self.assertEqual(b.section(d, "The Lead Take")["body"], "Most ads are wasted.")
        self.assertTrue(b.section(d, "The Lead Take")["guide"].startswith("One or two sentences"))
        # and a second edit replaces only the answer
        n2 = b.apply(n, {"sections": {"The Lead Take": "Most ads are guesses."}}, None, DAY)
        self.assertEqual(n2.count("One or two sentences, in your words"), 1)
        self.assertEqual(b.section(b.parse(n2), "The Lead Take")["body"], "Most ads are guesses.")

    def test_a_lightly_reworded_guide_is_still_a_guide(self):
        t = b.read("brand/icp.md").replace("What they want to be true instead, in the words they'd use to tell a friend.",
                                            "What they want instead, in words they'd tell a friend.")
        n = b.apply(t, {"sections": {"Dream State": "An easy yes."}}, b.guides_for("icp"), DAY)
        self.assertIn("What they want instead, in words they'd tell a friend.\n\nAn easy yes.", n)

    def test_filling_every_section_keeps_every_other_line(self):
        for rel in ("brand/contrarian-take.md", "brand/friction-points.md"):
            t = b.read(rel)
            d = b.parse(t)
            changes = {"sections": {s["title"]: "Filled." for s in d["sections"] if not s["fields"] and s["title"] != "Updates"}}
            n = b.apply(t, changes, None, DAY)
            kept = n.splitlines()
            for ln in t.splitlines():
                if ln.strip() and b.MARKER not in ln and not ln.startswith("_None yet._"):
                    self.assertIn(ln, kept, f"{rel}: lost the line {ln[:60]!r}")


if __name__ == "__main__":
    unittest.main()
