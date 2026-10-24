# Changelog

What is new in this template, and what to do about it.

Your repo does not update on its own. Nothing here changes your files until you ask for it, one piece at a time. This file exists so you can see what you do not have yet and decide, on your own terms, whether you want it.

Newest first. Each entry says what changed, who it is actually for, and the exact line to say to your AI if you want to take it.

The `VERSION` file at the root holds one number: the generation your repo was cloned or last checked in at. Any entry below with a higher number than your `VERSION` is something you do not have yet.

---

## Version 3, 2026-10-23

**What's new.** Every piece of your department now has a spot waiting for it, every team can be summoned with one command, and you can see your whole company in the Command Center.

- **Everything has one home.** `AGENTS.md` now has a "Where everything goes" table: your audit, your ICP, your personas, your friction points, your offer, your voice, competitors, reports, the strategist's briefs. Every classroom skill fills its spot instead of making new files.
- **Brand files come laid out.** `business.md` and every file in `brand/` now have every section a skill fills, a short At a Glance block at the top, a `_Not filled in yet._` line in each empty section (so your AI knows to ask instead of guess), and an Updates log at the bottom that keeps them current. New: `brand/friction-points.md` and `brand/personas/` (with a template).
- **A knowledge base.** `knowledge/business-audit.md`, `knowledge/competitors/`, `knowledge/swipes/`, `knowledge/outliers.md` and `knowledge/reports/`, each with its shape ready.
- **An Operations department.** `departments/operations/strategy-team/`: the Company Strategist (with a `briefs/` folder for what comes next), the ICP & Offer Owner, and the Moat Analyst, all waiting for the classroom to set them up. The brain-dump skills now live with the Company Strategist.
- **Every team is a command.** Each `team.md` now has a header and its workflows written as phases and steps. Type `/content-team`, `/website-team` and so on to summon a team, say a workflow ("build my landing page") to run it, or type any single skill (`/draft-post`).
- **Skills live with the team member who owns them.** `tools/sync.py` builds the shortcuts in `.claude/skills/` and `.agents/skills/` from the real skills inside `departments/`, so Claude Code and Codex always match. save-work runs it before every save.
- **The Command Center.** `command-center/index.html` shows every team, its workflow, its team members and skills, and every routine. It opens straight from the folder and refreshes from your repo. It replaces the old org chart (`org-chart.html` now forwards there).
- **Cleaned up.** Duplicate skills merged (one add-a-key, one way to connect a tool, one report-to-PDF skill). Headlines are written in one place only: the Page Builder's new write-headlines skill. The Editor has an edit-a-draft skill. Team members are `seeded` (waiting) or `live`, nothing else. No day numbers anywhere.

**Who it's for.** Everyone. It's the shape every lesson from now on fills in.

**Added 2026-10-24 (the content chapter, part 3).**
- New skill: the Social Manager's `stand-up-a-specialist`. It sets up one platform specialist on the Content Team for each platform you picked, from a starting playbook per platform (Instagram, YouTube, LinkedIn and Facebook, Threads and X, TikTok) rewritten for your business, and plans today's first post there.
- New skill: the Designer's `make-a-carousel` (5 to 8 slides at 1080 x 1350 in your colors and fonts: a hook slide, one idea per slide, a last slide that asks for the save or the send). You approve the words before the design.
To take it, say to your AI: "Add the content chapter part 3 from the template changelog." It fetches both skills (with the playbooks folder) and the two skills README lines, then runs the sync command and save-work.

**Added 2026-10-24 (the content chapter, part 2).**
- The Content Team has two new workflows: "plan my week of content" (read last week, plan 3 to 5 posts from your topics with one going out today, draft, hooks, edit, post) and "make a short video script" (script options, edit, you record a one-take, cover, post).
- `plan-the-week` now plans the week BEFORE anything is written (how many posts from your honest hours, picked from `knowledge/topics.md`, the mix weighed, one sent today), and still locks the calendar after.
- `draft-post` now puts something useful inside every post, builds from the opener bank and the five structures, and shapes the same message for Facebook, LinkedIn, Instagram, Threads/X, email and Google Business Profile.
The video workflow names two skills that arrive in later parts (write-a-script, make-a-cover); until then the sync check lists them as a NOTE, not an error.
To take it, say to your AI: "Add the content chapter part 2 from the template changelog." It fetches the Content Team's `team.md` workflows, `plan-the-week` and `draft-post`, keeping your own Memory lines, then runs the sync command and save-work.

**Added 2026-10-24 (the content chapter, part 1).**
- New skill: the Social Manager's `content-brain` (what your content is for, your 1 or 2 platforms, 20 topics). It fills Where You Show Up in `brand/channels.md` and the new `knowledge/topics.md`.
- `write-hooks` now carries an opener bank (10 shapes, each worked for three example businesses) and the five structures a post hangs on. Winners get logged in the new `knowledge/hooks.md`.
- A new `recordings/` home for raw takes. Video and audio files stay on your computer (its own `.gitignore` keeps them out of saves); only the notes get saved.
To take it, say to your AI: "Add the content chapter part 1 from the template changelog." It fetches the content-brain skill, the new write-hooks, `knowledge/topics.md`, `knowledge/hooks.md` and `recordings/`, adds the three rows to `AGENTS.md` and two to `knowledge/README.md`, keeping everything you already wrote, then runs the sync command and save-work.

**Added 2026-10-24 (fixes from the classroom test runs).**
- Naming a team member ("Copywriter (Paige)", or just "Paige" in its title) no longer breaks the sync check; the workflows keep finding it by its role.
- A skill doc pasted with blank lines above its first `---` no longer fails the sync check.
- Two new homes in the "Where everything goes" table: `knowledge/goals.md` (the Future Achievements goals file) and `site/` (your website's source). `site/` comes with a working test page, and `vercel.json` puts only that folder online, so your notes and brand files never become public pages.
- `tests/test_sync.py` checks the sync (`python3 -m unittest discover tests`).
To take it, say to your AI: "Add the 2026-10-24 version 3 fixes from the template changelog." It fetches `tools/sync.py`, `tests/`, `knowledge/goals.md`, `site/` and `vercel.json`, adds the two rows to `AGENTS.md` and the goals row to `knowledge/README.md`, keeping everything you already wrote, then runs the sync command and save-work. If your repo already has a `vercel.json` or a site somewhere else, it asks you first.

**To take it.** Say to your AI: "Update my department to version 3 from the template changelog." The GitHub Agent's add-from-template skill walks it with you one step at a time:
1. Fetch `tools/`, `command-center/`, `departments/operations/`, every `departments/*/README.md`, `brand/friction-points.md`, `brand/personas/`, the new `knowledge/` folders and `routines/`.
2. Add the new empty sections, At a Glance blocks and Updates logs to `business.md` and the files in `brand/`, keeping every word you already wrote.
3. Fetch the new `AGENTS.md`, every `team.md`, and the new skills (write-headlines, edit-a-draft). Update every team member file's header: `**Status:**` becomes `seeded` or `live` (a `staffed` member is `live`), then a `**Team:**` line, then the read-first line from AGENTS.md. Add an `output/` folder next to each.
4. Delete the old version-2 copies in BOTH `.claude/skills/` and `.agents/skills/`: add-a-key, audit-my-site, brain-dump-your-business, company-brain-dump, connect-a-tool, make-this-a-pdf, run-my-marketing-checkup, set-up-my-code-base, ship-my-landing-page. They all live inside `departments/` now. Any skill a lesson saved straight into those folders (for example staff-your-writer or web-copywriter) moves into its owner: the classroom's version-3 docs say where, and two skills doing one job become one.
5. Run the sync command (`python3 tools/sync.py`, or `py tools/sync.py` on Windows), open the Command Center, then save-work.

---

## Version 2, 2026-10-13

**What's new.** Your department now works in Codex as well as Claude Code.

- `AGENTS.md` at the root holds the rules for this repo. Codex reads it directly. `CLAUDE.md` now just points Claude Code at it, so both tools follow the same rules and there is only one file to keep up to date.
- `.agents/skills/` holds the same skills as `.claude/skills/`, file for file. Claude Code looks in the first folder and Codex looks in the second. The rules now say: when a skill is added or changed, write it to both.
- The heading in `brand/contrarian-take.md` that the brain dump writes into is now called "Raw Material From the Brain Dump" (it used to carry a day number).

**Who it's for.** Anyone who uses Codex, or might switch between Codex and Claude Code. If you only ever use Claude Code, nothing changes for you day to day, but taking it keeps your repo ready if you ever switch.

**To take it.** Say to your AI: "Take version 2 from the template changelog: move my CLAUDE.md rules into AGENTS.md and make CLAUDE.md point at it, copy every skill in .claude/skills into .agents/skills, and rename the 'Raw Material From Day 1' heading in brand/contrarian-take.md to 'Raw Material From the Brain Dump'. Keep everything I've already written."

---

## Version 1, 2026-08-15

**What's new.** This is the starting department, not a drop, there is nothing to compare it to yet. It is what a fresh clone of this template holds as of today:

- The shared brain: `business.md` and `brand/` (voice.md, icp.md, contrarian-take.md, channels.md, colors.md, typography.md, offer.md), every one of them an empty shape waiting on your own answers.
- Three departments (Marketing, Sales, IT / Systems) under `departments/`, 8 teams, 27 hires, each hire a folder with a job description and its own `skills/`.
- The skills you run yourself, in `.claude/skills/`: brain-dump-your-business (start here, it fills `business.md` and everything else builds on it), company-brain-dump, run-my-marketing-checkup, audit-my-site, ship-my-landing-page, set-up-my-code-base, make-this-a-pdf. You never memorize their names, you say what you want and claude picks.
- The lessons themselves live in the classroom, not in here. The classroom teaches the why on video, and points you at the skill that does the work.
- The update system itself: this file and `VERSION` to see what has shipped since your clone, and the github agent's add-from-template skill (`departments/it-systems/dev-team/github-agent/skills/add-from-template/SKILL.md`) to fetch one piece when you want it.
- `knowledge/` and `routines/`, empty and correct for now, they fill in as your department grows.
- `org-chart.html` at the root, the live visual of your team, generated from the real `departments/` tree.
- The security rules in `CLAUDE.md`: keys live in `.env` only, nothing secret in a page or a skill file, a code review before any save that touches pages or wiring, a security check before anything public ships.

**Who it's for.** Everyone. This is what you start with, there is nothing to fetch, you already have all of it.

**To take it.** Nothing to say. If this file is sitting in your own repo, it is already yours.

---

Future entries above this one will describe one drop at a time: small enough to read in ten seconds and decide.
