"""The Company Strategist is the front door on every AI. Run: python3 -m unittest discover tests

Its company-strategist skill routes every ask to a team in departments/, read fresh each time, and
set-up-your-company-strategist adds the Strategy Team and wakes it. These tests check the skills are real skills,
that adding the team brings them to every agent, that a team added later is found with no change to the skill,
and that AGENTS.md sends every agent to it.
"""
import glob
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
sys.path.insert(0, os.path.join(ROOT, "tools"))
import sync  # noqa: E402

LIB_MEMBER = "library/teams/operations/strategy-team/company-strategist"
DEPT_MEMBER = "departments/operations/strategy-team/company-strategist"
SKILLS = ("company-strategist", "set-up-your-company-strategist")
AGENT_PATHS = (".claude/skills/{}/SKILL.md", ".agents/skills/{}/SKILL.md", ".gemini/commands/{}.toml", ".cursor/commands/{}.md")


def read(p):
    with open(p, encoding="utf-8") as f:
        return f.read()


def routing_index(repo, where="departments"):
    """What the strategist's step 1 reads, done the way the skill says: every team.md under departments/ (or the
    library) with its workflows' words, and the name and description of every skill inside it."""
    out = {}
    pattern = os.path.join(repo, where, "*", "*", "team.md") if where == "departments" else os.path.join(repo, "library", "teams", "*", "*", "team.md")
    for tpath in glob.glob(pattern):
        tdir = os.path.dirname(tpath)
        meta, body = sync.frontmatter(read(tpath))
        says = re.findall(r'^Say:\s*"(.+?)"', body, re.M) + [a for line in re.findall(r"^Also say:\s*(.+)$", body, re.M)
                                                            for a in (x.strip() for x in line.split(","))]
        skills = {}
        for sp in glob.glob(os.path.join(tdir, "*", "skills", "*", "SKILL.md")):
            m, _ = sync.frontmatter(read(sp))
            skills[m.get("name")] = m.get("description", "")
        out[os.path.basename(tdir)] = {"purpose": meta.get("purpose", ""), "says": says, "skills": skills}
    return out


class StrategistSkillsTest(unittest.TestCase):
    def test_both_skills_are_real_skills_in_the_library(self):
        for s in SKILLS:
            p = os.path.join(ROOT, LIB_MEMBER, "skills", s, "SKILL.md")
            self.assertTrue(os.path.isfile(p), p)
            meta, body = sync.frontmatter(read(p))
            self.assertEqual(meta.get("name"), s)
            self.assertTrue(meta.get("description"))
            self.assertLess(len(meta["description"]), sync.MAX_DESC, s)
            self.assertTrue(sync.yaml_safe(meta["__raw__"]["description"]), s)
            self.assertIn("business.md", body)
            self.assertIn("brand/", body)

    def test_the_front_door_never_relies_on_a_fixed_list_of_teams(self):
        body = read(os.path.join(ROOT, LIB_MEMBER, "skills/company-strategist/SKILL.md"))
        self.assertIn("departments/<department>/<team>/team.md", body)
        self.assertIn("library/teams/<department>/<team>/team.md", body)
        self.assertIn("tools/add_team.py", body)
        teams = {t for t in routing_index(ROOT, "library")} - {"strategy-team"}
        for t in teams:
            self.assertNotIn(t, body, f"the front door names {t} by its folder; it must read departments/ instead")

    def test_what_comes_next_runs_a_real_skill(self):
        body = read(os.path.join(ROOT, "library/teams/operations/strategy-team/team.md"))
        flows = sync.read_workflows(sync.frontmatter(body)[1], "team.md")
        sync.errors.clear()
        step1 = [w for w in flows if w["name"] == "what comes next"][0]["steps"][0]
        self.assertEqual(step1["skill"], "company-strategist")
        self.assertTrue(os.path.isfile(os.path.join(ROOT, LIB_MEMBER, "skills", step1["skill"], "SKILL.md")))

    def test_not_ready_says_what_is_still_missing_not_the_old_gap(self):
        nr = read(os.path.join(ROOT, "library/teams/operations/strategy-team/NOT-READY.md"))
        self.assertNotIn("doesn't exist", nr)
        self.assertIn("ICP & Offer Owner", nr)
        self.assertIn("Moat Analyst", nr)
        self.assertIn("--anyway", nr)


class AgentsFrontDoorTest(unittest.TestCase):
    def test_agents_md_names_the_strategist_and_both_paths_are_real(self):
        text = read(os.path.join(ROOT, "AGENTS.md"))
        self.assertIn("talk to my company strategist", text)
        for p in (f"{DEPT_MEMBER}/skills/company-strategist/SKILL.md",
                  f"{LIB_MEMBER}/skills/company-strategist/SKILL.md",
                  f"{LIB_MEMBER}/skills/set-up-your-company-strategist/SKILL.md"):
            self.assertIn(p, text)
        for p in (f"{LIB_MEMBER}/skills/company-strategist/SKILL.md", f"{LIB_MEMBER}/skills/set-up-your-company-strategist/SKILL.md"):
            self.assertTrue(os.path.isfile(os.path.join(ROOT, p)), p)

    def test_a_skill_that_handles_a_missing_file_outranks_the_stop_rule(self):
        # cold test A1: a strict AI stopped at "stop if anything's missing" and never ran the setup skill
        text = read(os.path.join(ROOT, "AGENTS.md"))
        rule = [l for l in text.splitlines() if l.startswith("**A file or section that still says")][0]
        self.assertIn("The one exception", rule)
        self.assertIn("set-up-your-company-strategist", rule)
        setup = read(os.path.join(ROOT, LIB_MEMBER, "skills/set-up-your-company-strategist/SKILL.md"))
        self.assertIn("keep going", setup)

    def test_agents_md_fits_codex(self):
        # Codex stops reading project instructions at project_doc_max_bytes, 32 KiB by default
        self.assertLess(os.path.getsize(os.path.join(ROOT, "AGENTS.md")), 32 * 1024)

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
        self.assertNotIn("no command folder we could confirm", read(os.path.join(ROOT, "AGENTS.md")))


class FilledByTest(unittest.TestCase):
    def test_every_brand_file_waiting_to_be_filled_names_what_fills_it(self):
        # set-up-your-company-strategist's Watching list names the lesson from each empty file's Filled by line
        for p in glob.glob(os.path.join(ROOT, "brand", "**", "*.md"), recursive=True):
            text = read(p)
            if "_Not filled in yet._" not in text:
                continue
            line = [l for l in text.splitlines()[:5] if l.startswith("**Filled by:**")]
            self.assertTrue(line, os.path.relpath(p, ROOT))
            self.assertRegex(line[0], r"(skill|lesson)", os.path.relpath(p, ROOT))


class FormOwnerTest(unittest.TestCase):
    """"My contact form isn't sending" failed the cold test: no skill owned it. fix-my-form owns it now."""
    SKILL = "library/teams/it-systems/dev-team/api-manager/skills/fix-my-form/SKILL.md"

    def test_fix_my_form_is_a_full_skill_on_free_tools(self):
        text = read(os.path.join(ROOT, self.SKILL))
        meta, body = sync.frontmatter(text)
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

    def test_exactly_one_library_skill_owns_a_form_that_isnt_sending(self):
        owners = [s for t in routing_index(ROOT, "library").values() for s, d in t["skills"].items()
                  if "form isn't sending" in d]
        self.assertEqual(owners, ["fix-my-form"])

    def test_the_strategist_tie_break_points_at_it(self):
        body = read(os.path.join(ROOT, LIB_MEMBER, "skills/company-strategist/SKILL.md"))
        rule2 = [l for l in body.splitlines() if l.startswith("2. **One symptom")][0]
        self.assertIn("fix-my-form", rule2)
        self.assertIn("fix-my-form", read(os.path.join(ROOT, "library/teams/it-systems/dev-team/team.md")) +
                      read(os.path.join(ROOT, "library/teams/it-systems/dev-team/api-manager/api-manager.md")))


@unittest.skipUnless(AS_SHIPPED, WHY)
class AddTheStrategistTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.repo = os.path.join(self.tmp, "repo")
        shutil.copytree(ROOT, self.repo, ignore=shutil.ignore_patterns(".git", "__pycache__", ".env"))

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def run_tool(self, *args):
        r = subprocess.run([sys.executable, *args], cwd=self.repo, capture_output=True, text=True, encoding="utf-8")
        return r.returncode, r.stdout + r.stderr

    def test_not_ready_stops_then_anyway_brings_every_member_and_both_skills_to_every_agent(self):
        before = {p: read(os.path.join(self.repo, p)) for p in ("business.md", "brand/voice.md", "brand/offer.md")}
        code, out = self.run_tool("tools/add_team.py", "strategy-team")
        self.assertNotEqual(code, 0)
        self.assertIn("ICP & Offer Owner", out)  # the owner hears what's missing
        self.assertFalse(os.path.exists(os.path.join(self.repo, "departments/operations/strategy-team")))
        code, out = self.run_tool("tools/add_team.py", "strategy-team", "--anyway")
        self.assertEqual(code, 0, out)
        team = os.path.join(self.repo, "departments/operations/strategy-team")
        for m in ("company-strategist", "icp-offer-owner", "moat-analyst"):
            self.assertTrue(os.path.isfile(os.path.join(team, m, m + ".md")), m)
        self.assertFalse(os.path.exists(os.path.join(team, "NOT-READY.md")))
        for s in SKILLS:
            for p in AGENT_PATHS:
                self.assertTrue(os.path.isfile(os.path.join(self.repo, p.format(s))), p.format(s))
        self.assertNotIn("company-strategist`, which isn't installed", out)
        self.assertEqual(before, {p: read(os.path.join(self.repo, p)) for p in before})
        code, out = self.run_tool("tools/sync.py", "--check")
        self.assertEqual(code, 0, out)

    def test_a_team_added_later_is_found_without_touching_the_strategist(self):
        self.run_tool("tools/add_team.py", "strategy-team", "--anyway")
        skill = os.path.join(self.repo, DEPT_MEMBER, "skills/company-strategist/SKILL.md")
        frozen = read(skill)
        self.assertNotIn("website-team", routing_index(self.repo))
        code, out = self.run_tool("tools/add_team.py", "website-team")
        self.assertEqual(code, 0, out)
        idx = routing_index(self.repo)
        self.assertIn("build my landing page", idx["website-team"]["says"])
        self.assertIn("speed-check", idx["website-team"]["skills"])
        self.assertEqual(read(skill), frozen)
        self.assertIn("website-team", routing_index(self.repo, "library"))


if __name__ == "__main__":
    unittest.main()
