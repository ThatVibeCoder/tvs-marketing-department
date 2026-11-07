"""AGENTS.md's front door, saving, and the Filled by lines, made true for the skeleton. Run: python3 -m unittest discover tests

The template ships with the Dev Team only. The Company Strategist is the front door once the Strategy Team's
lesson builds it; before that, AGENTS.md routes by the teams that are actually in departments/. Saving works
from Day 1 through the Dev Team's GitHub Agent. Every file waiting to be filled names the lesson that fills it.
"""
import glob
import os
import re
import sys
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
import sync  # noqa: E402

STRATEGIST = "departments/operations/strategy-team/company-strategist/skills/company-strategist/SKILL.md"
SAVE_WORK = "departments/it-systems/dev-team/github-agent/skills/save-work/SKILL.md"
PLAIN_WORDS = {"long-form", "thank-you", "read-only", "follow-up", "one-time"}  # hyphenated words, not skill names
FIX_MY_FORM = "departments/it-systems/dev-team/api-manager/skills/fix-my-form/SKILL.md"


def read(p):
    with open(p, encoding="utf-8") as f:
        return f.read()


def agents_md():
    return read(os.path.join(ROOT, "AGENTS.md"))


def shipped_skills():
    return {os.path.basename(os.path.dirname(p)) for p in
            glob.glob(os.path.join(ROOT, "departments", "*", "*", "*", "skills", "*", "SKILL.md"))}


class FrontDoorTest(unittest.TestCase):
    def test_the_strategist_is_the_front_door_only_once_its_lesson_builds_it(self):
        text = agents_md()
        section = text.split("## The front door")[1].split("\n## ")[0]
        self.assertIn("Until then there's no front door", section)
        for skill in ("set-up-your-company-strategist", "company-strategist (the front door)"):
            self.assertIn(skill, section)
        self.assertIn("routes every ask to the team that owns it", section)
        self.assertIn("on its own, with nothing to register", section)  # finds teams added later
        self.assertIn(STRATEGIST, section)
        self.assertIn("talk to my company strategist", section)
        self.assertIn('says "set up my company strategist"', section)
        self.assertIn("Set Up Your Company Strategist lesson", section)
        self.assertIn("which teams are in `departments/` right now", section)  # routes by what's there before it

    def test_no_library_and_no_add_team_anywhere_in_the_rules(self):
        for name in ("AGENTS.md", "README.md"):
            text = read(os.path.join(ROOT, name))
            self.assertNotIn("library/", text, name)
            self.assertNotIn("add_team", text, name)
            self.assertNotIn("Example Team", text, name)

    def test_a_skill_that_handles_a_missing_file_outranks_the_stop_rule(self):
        # cold test A1: a strict AI stopped at "stop if anything's missing" and never ran the setup skill
        rule = [l for l in agents_md().splitlines() if l.startswith("**A file or section that still says")][0]
        self.assertIn("The one exception", rule)
        self.assertIn("never a day number", rule)

    def test_the_price_has_one_home(self):
        # cold test B8: AGENTS.md gave the price two homes (business.md "the money" and offer.md "the price")
        rows = [l for l in read(os.path.join(ROOT, "docs", "REFERENCE.md")).splitlines() if l.startswith("| What ")]
        biz = [r for r in rows if "`business.md` |" in r][0]
        offer = [r for r in rows if r.startswith("| What you sell, the price")][0]
        self.assertIn("the price itself lives in `brand/offer.md`", biz)
        self.assertIn("one home", offer)
        self.assertIn("brand/offer.md", read(os.path.join(ROOT, "business.md")).split("## The Economics")[1].split("##")[0])

    def test_member_facing_notes_name_every_ai_not_two(self):
        notes = glob.glob(os.path.join(ROOT, "departments", "*", "*", "*", "skills", "README.md")) + [os.path.join(ROOT, "business.md")]
        for p in notes:
            text = read(p)
            self.assertNotIn("Claude Code and Codex", text, os.path.relpath(p, ROOT))
            self.assertNotIn("Claude Code or Codex", text, os.path.relpath(p, ROOT))

    def test_agents_md_fits_codex(self):
        # Codex stops reading project instructions at project_doc_max_bytes, 32 KiB by default
        self.assertLess(os.path.getsize(os.path.join(ROOT, "AGENTS.md")), 32 * 1024)

    def test_agents_md_stays_under_12_kb(self):
        # every agent loads AGENTS.md on every turn; at 22.8 KB it burned a member's whole weekly Codex limit.
        # Long reference material goes in docs/REFERENCE.md, pointed to with one line.
        self.assertLess(os.path.getsize(os.path.join(ROOT, "AGENTS.md")), 12 * 1024)
        self.assertIn("docs/REFERENCE.md", agents_md())
        self.assertTrue(os.path.isfile(os.path.join(ROOT, "docs", "REFERENCE.md")))

    def test_grok_reads_the_codex_shortcuts(self):
        # Grok Build loads skills from .agents/skills/ and .claude/skills/, deduplicated by name; a name is lowercase
        # letters, digits and hyphens, up to 64 characters (xai-org/grok-build docs/user-guide/08-skills.md)
        names = os.listdir(os.path.join(ROOT, ".agents", "skills"))
        self.assertTrue(names)
        for n in names:
            self.assertRegex(n, r"^[a-z0-9-]{1,64}$")
            meta, _ = sync.frontmatter(read(os.path.join(ROOT, ".agents", "skills", n, "SKILL.md")))
            self.assertEqual(meta.get("name"), n)
            self.assertTrue(meta.get("description"), n)
        self.assertFalse(os.path.exists(os.path.join(ROOT, ".grok")), "Grok needs no folder of its own")


class SaveFromDayOneTest(unittest.TestCase):
    def test_agents_md_says_how_to_save_through_the_github_agent(self):
        section = agents_md().split("## Saving")[1].split("\n## ")[0]
        self.assertIn("Day 1", section)
        self.assertIn("save my work", section)
        self.assertIn(SAVE_WORK, section)
        self.assertIn("python3 tools/sync.py --check", section)
        self.assertNotIn("Before the Dev Team is added", section)

    def test_save_work_ships_and_reaches_every_agent(self):
        self.assertTrue(os.path.isfile(os.path.join(ROOT, SAVE_WORK)))
        self.assertIn("tools/sync.py --check", read(os.path.join(ROOT, SAVE_WORK)))
        for p in (".claude/skills/save-work/SKILL.md", ".agents/skills/save-work/SKILL.md",
                  ".gemini/commands/save-work.toml", ".cursor/commands/save-work.md"):
            self.assertTrue(os.path.isfile(os.path.join(ROOT, p)), p)


class FilledByTest(unittest.TestCase):
    def test_every_file_waiting_to_be_filled_names_the_lesson_that_fills_it(self):
        # a Filled by line names the lesson by its title (never a day number), and never a skill the repo doesn't ship
        have = shipped_skills()
        files = [os.path.join(ROOT, "business.md")] + glob.glob(os.path.join(ROOT, "brand", "**", "*.md"), recursive=True) \
            + glob.glob(os.path.join(ROOT, "knowledge", "**", "*.md"), recursive=True)
        checked = 0
        for p in files:
            line = [l for l in read(p).splitlines()[:5] if l.startswith("**Filled by:**")]
            if not line:
                continue
            checked += 1
            rel = os.path.relpath(p, ROOT)
            self.assertIn("lesson", line[0], rel)
            self.assertNotRegex(line[0], r"\b[Dd]ay \d", rel)
            for word in re.findall(r"\b[a-z]+(?:-[a-z]+){1,}\b", line[0]):
                if word in PLAIN_WORDS:
                    continue
                self.assertIn(word, have, f"{rel} names `{word}`, a skill this repo doesn't ship; name its lesson")
        self.assertGreater(checked, 15)

    def test_every_brand_file_waiting_to_be_filled_has_a_filled_by_line(self):
        for p in glob.glob(os.path.join(ROOT, "brand", "**", "*.md"), recursive=True):
            text = read(p)
            if "_Not filled in yet._" in text:
                self.assertTrue([l for l in text.splitlines()[:5] if l.startswith("**Filled by:**")], os.path.relpath(p, ROOT))


class FormOwnerTest(unittest.TestCase):
    """"My contact form isn't sending" failed the cold test: no skill owned it. The Dev Team's fix-my-form owns it."""

    def test_fix_my_form_is_a_full_skill_on_free_tools(self):
        meta, body = sync.frontmatter(read(os.path.join(ROOT, FIX_MY_FORM)))
        self.assertEqual(meta.get("name"), "fix-my-form")
        self.assertLess(len(meta["description"]), sync.MAX_DESC)
        self.assertTrue(sync.yaml_safe(meta["__raw__"]["description"]))
        for words in ("form isn't sending", "leads aren't coming in"):
            self.assertIn(words, meta["description"])
        for part in ("## Read first", "## Say this first", "## Steps", "## Worked example", "## The ending", "## Rules"):
            self.assertIn(part, body, part)
        self.assertIn("never a menu", body)
        self.assertIn("No paid tools", body)
        self.assertIn("Any AI", body)
        self.assertIn("add-a-key", body)  # a key never goes in the page

    def test_exactly_one_shipped_skill_owns_a_form_that_isnt_sending(self):
        owners = []
        for p in glob.glob(os.path.join(ROOT, "departments", "*", "*", "*", "skills", "*", "SKILL.md")):
            meta, _ = sync.frontmatter(read(p))
            if "form isn't sending" in meta.get("description", ""):
                owners.append(meta["name"])
        self.assertEqual(owners, ["fix-my-form"])
        dev = "departments/it-systems/dev-team"
        self.assertIn("fix-my-form", read(os.path.join(ROOT, dev, "team.md")) + read(os.path.join(ROOT, dev, "api-manager/api-manager.md")))


if __name__ == "__main__":
    unittest.main()
