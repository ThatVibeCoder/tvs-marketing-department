# Changelog

What is new in this template, and what to do about it.

Your repo does not update on its own. Nothing here changes your files until you ask for it, one piece at a time. This file exists so you can see what you do not have yet and decide, on your own terms, whether you want it.

Newest first. Each entry says what changed, who it is actually for, and the exact line to say to your AI if you want to take it.

The `VERSION` file at the root holds one number: the generation your repo was cloned or last checked in at. Any entry below with a higher number than your `VERSION` is something you do not have yet.

---

## Version 4, 2026-11-07

**What's new.** The Command Center got a new look and a whole content system, and a new copy now starts as a skeleton plus the Dev Team: every other team comes from its classroom lesson.

- **A skeleton plus the Dev Team.** A new copy of the template ships with one team in `departments/`: the Dev Team (`departments/it-systems/dev-team/`), because it's the plumbing (saving your work to GitHub, keys, connecting tools, shipping pages). You can save from Day 1: say "save my work". Every other team comes from the classroom: at the bottom of each lesson is a skill doc you give your AI, and it builds that team in your folder from your own answers. The Example Team, the team library and `tools/add_team.py` are gone. The Dev Team's Payments Agent is on the team but stays not ready (no skills yet).

- **A new look.** Dark glass by default, a warm light mode (the sun and moon button in the top bar), and a sidebar on the left: **Dashboard** and **Agent** (a chat with your AI, coming soon) at the top, then **Content**, **Web & Analytics** and **Automations** (Agent Teams, Automations, Executions, the same pages as before), each opening into its pages, with **Settings** at the bottom. Collapse it to icons with the button at its top.
- **Show in the sidebar.** Settings → Connected Accounts has a switch per platform: turn off the ones you don't use and they leave the sidebar under Content.
- **Your business files.** ICPs can be more than one now (`brand/icp.md` stays the main one, extras go in `brand/icps/`, with optional profile fields like age, income and positioning), and so can offers (`brand/offer.md` plus extras in `brand/offers/`). They live in the repo, where your AI reads and edits them. Competitors (`knowledge/competitors/`), swipes and outliers have their homes and templates ready for the Research Team lesson to fill.
- **Content.** An Overview (posts out, what's waiting on you, every platform, when posts go out), a Calendar (month and list, your open posting times, drag a post to move it), Research (your outliers, topics, openers, competitors and swipes from `knowledge/`), and one page per platform: TikTok, Instagram, X, Threads, YouTube, Skool and LinkedIn. Each has an Overview, a Review queue (Approve, Reject, or the A and R keys) and its Calendar.
- **An editor that shows exactly what it looks like.** Open any post and edit it next to a live preview drawn the way that platform draws it, on a phone or a desktop, with its character counter, Threads and X chains, the Skool title and category, and the YouTube title.
- **Posts are files.** Each post is one file in `departments/marketing/content-team/social-manager/posts/`. The Content Team (built by the Content Team lesson) writes and reads them, and the Command Center edits them.
- **Settings.** Account, Workspace, Brands (and your Skool categories), Connected Accounts (connect Blotato, Metricool or Ayrshare, or your own platform keys, with the steps for each), Posting Cadence and Developer. Keys go into `.env` only.
- **Web & Analytics.** A Web section in the sidebar: Overview, Traffic, Pages, Search, Geography (a world map and a US map) and Settings, which walks you through connecting Google Analytics 4 and Search Console with a read-only service account, then tests it and pulls. `tools/pull_web.py` does the pull; your numbers stay on your computer. The Website Team's Traffic Agent reads from it once its lesson builds the team. Every web tool now connects in one place, Settings → Web connections: Google Analytics 4 and Search Console (pulling), plus Microsoft Clarity, Bing Webmaster Tools and one other tool of your choice, set up with their steps and keys but not pulled yet. A Landing Pages page lists every landing page you have, grouped by the offer it sells, with a toggle that opens the pages under each one (forms, thank-you pages, upsells, product pages on any domain) and their views. Its list, `knowledge/landing-pages.json`, is kept by the Website Team's build-a-page (once its lesson builds the team) and the Dev Team's ship-a-page.
- **Any AI.** Your teams now run on Claude Code, Codex, Gemini CLI, Cursor or Grok Build. `AGENTS.md` stays the one rules file; sync writes `GEMINI.md`, a Cursor rule, and every team, workflow and skill as a command for Gemini (`.gemini/commands/`) and Cursor (`.cursor/commands/`). Settings → AI Agents shows how to open your department and summon a team in each.
- **Your Company Strategist, the front door, once its lesson builds it.** When the Strategy Team's lesson builds it, talk to it (`/company-strategist`, or say "talk to my company strategist" on any AI): it reads which teams are in your `departments/` right now, hands each ask to the team that owns it, and tells you which lesson builds the team when none fits. Grok Build now types commands with a slash too: it reads the same skills Codex does. A form that isn't sending now has an owner: the Dev Team's API Manager runs a new fix-my-form skill, which finds the one broken thing, fixes it on a free form service, and proves it with a test answer in your inbox.
- **Editing turns on with one command:** `python3 tools/serve.py`. Opened straight from the folder, everything still shows, read-only.

**Who it's for.** Everyone. Say "update my department to version 4" to take it.

**How to update.**
1. Add `tools/serve.py`, `tools/pull_web.py`, `tools/files.py` and the new `tools/sync.py`, then the new `command-center/` files (everything except `command-center/data/` and your `settings.json`, if you have one).
2. Keep every team you already have exactly where it is. Nothing in this version removes or replaces a team in your `departments/`. A team you don't have yet comes from its classroom lesson's skill doc. If you have no Dev Team, take `departments/it-systems/dev-team/` whole (it's what saves your work).
3. If you already have the Content Team, add a `posts/` folder next to the Social Manager: that's where the Command Center reads posts from.
4. Add `knowledge/landing-pages.json` (an empty list) and the updated `knowledge/README.md`. If you have the Dev Team, take the new ship-a-page only if you haven't changed yours; if you have, add its "Register the page" step by hand. Add the new empty folders `brand/icps/` and `brand/offers/` (each a README and a `_template.md`) and the new `knowledge/competitors/_template.md`. If you have the Dev Team, add the API Manager's new fix-my-form skill. Add `knowledge/swipes/_template.md`. Your own `brand/icp.md` can take the optional Profile Data section: copy it from `brand/icps/_template.md` when you want it.
5. Run the sync command. It writes `GEMINI.md`, the Cursor rule and the Gemini and Cursor command folders for the teams you have.
None of this rewrites what's already in your `business.md` or your brand files.

**Added 2026-11-07 (the Chapter 2 files match the lessons).**
- The top notes in `business.md`, `knowledge/business-audit.md` and `brand/` say the Company Strategist keeps them, and name the lesson that fills each one by its title. Every Chapter 2 interview skill is saved under the Company Strategist.
- `brand/voice.md` is now a map of where your real voice lives: two new sections, Where My Voice Lives and Voice Samples, and a "Read the real thing first" line in At a Glance.
- Buyer personas are gone: `brand/personas/` and the Personas line in Profile Data. No lesson fills them.
To take it, say to your AI: "Add the 2026-11-07 Chapter 2 fixes from the template changelog." It updates the top notes, adds the two voice sections to your `brand/voice.md` if they aren't there, and fetches the new `AGENTS.md`, `docs/REFERENCE.md` and `tests/`, keeping every word you already wrote. If your `brand/personas/` has files you filled in, it asks you before removing anything.

---

_Version 3 and older describe teams the template shipped back then. From version 4 those teams come from their classroom lessons instead, so an older entry's "take it" line can no longer fetch a team from the template: do that team's lesson._

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

**Added 2026-10-24 (the Ads Team's skills).**
- The Ads Team has its first seven skills and two workflows ("launch my first ads", "read my ads"): the Growth Lead's `ads-ready-check`, `plan-a-test` and `weekly-ads-read`, the Ads Manager's `set-up-tracking` and `build-paused-campaign`, and the Ad Writer's `write-ad-batch` and `iterate-a-winner`. Meta (Facebook and Instagram) only.
- The guards are inside every one: everything is built paused and you turn it on, your AI never touches billing, it asks before every create or change, the browser only looks, and it writes `[CHECK BUDGET]` and asks you instead of picking any dollar amount.
- Two new homes in `AGENTS.md`: the ads reports in `knowledge/reports/`, and the test plan, campaign, tracking and ad batches in each Ads Team member's `output/`.
To take it, say to your AI: "Add the Ads Team skills from the template changelog." It fetches the seven skills, the Ads Team's `team.md` workflows, the three skills README lines, the two AGENTS.md rows and the reports README lines, then runs the sync command and save-work.

**Added 2026-10-24 (the Follow-Up Team and the Sales Team's first skills).**
- The Follow-Up Team has the Reply Agent's `draft-a-reply` and the Nurture Agent's `who-went-quiet` and `one-nudge`, plus the workflow "keep my clients warm". The Sales Team has the Calendar Agent's `book-the-call` and the CRM Agent's `log-a-lead`, plus the workflow "work my new lead". All four team members are now live.
- The guards are inside every one: drafts only and you send every message, no price from memory (it writes `[CHECK PRICE]`), no promised results, never quoting a lead's fear back to them, one touch for one lead at a time, no third price nudge, and it stops when it doesn't have enough to go on.
- New homes in `AGENTS.md`: one file per lead in `departments/sales/sales-team/crm-agent/leads/` (keep the repo private on GitHub, these hold real people's details), and the booking, reply and nudge drafts in each team member's `output/`.
To take it, say to your AI: "Add the Follow-Up and Sales skills from the template changelog." It fetches the five skills, both `team.md` workflows, the four team member files, the leads folder and the three AGENTS.md rows, then runs the sync command and save-work.

**Fixed 2026-10-24 (from a hands-on run of the content chapter's first three days).**
- content-brain fills only what's missing when Where You Show Up is already filled (older repos filled it earlier).
- plan-the-week dates today's post today, not next Monday.
- draft-post names the exact photo or video a post needs.
- post-content logs a post the owner sends later as STAGED, then asks for the time and link next session.
To take it, say to your AI: "Add the 2026-10-24 content fixes from the template changelog."

**Added 2026-10-24 (the content chapter, part 6).**
- `read-the-stats` now keeps a scoreboard: every opener and topic scored against YOUR own usual numbers, with replies, DMs and sends counted above views. A winner after beating your median 3 times (it moves to Openers That Won in `knowledge/hooks.md`), retired after losing 3 times in a row. "Too early to call" is an honest answer under 5 posts, and about one post in four keeps testing something new.
- `knowledge/reports/README.md` lists the weekly `content-stats-<date>.md` report.
To take it, say to your AI: "Add the content chapter part 6 from the template changelog." It fetches read-the-stats and the reports README line, then runs the sync command and save-work.

**Added 2026-10-24 (the content chapter, part 5).**
- A new team: the Editing Team (`departments/marketing/editing-team/`), with a Video Editor and an "edit my video" workflow (cut, cover, turn it into four, post). Say `/editing-team`.
- New skills: the Video Editor's `cut-a-recording` (trim, cut the long pauses, level the sound, captions, sized for the platform, never changes what you said), the Designer's `make-a-cover` (one locked cover style, set once in `brand/assets/cover-template.html`, then reused) and the Copywriter's `repurpose-it` (one video or winning post into four more pieces).
- The "make a short video script" workflow now has an Edit step (the Video Editor's cut) between recording and the cover.
- Edited video files stay on your computer: the Video Editor's `output/` has its own `.gitignore`, the same as `recordings/`.
To take it, say to your AI: "Add the content chapter part 5 from the template changelog." It fetches the Editing Team folder, the three skills, the Content Team's updated video workflow and the skills README lines, then runs the sync command and save-work.

**Added 2026-10-24 (the content chapter, part 4).**
- New skill: the Copywriter's `write-a-script`. Two or three options for one 30 to 45 second video, each on a different opener and structure from write-hooks, each opening a question in the first line and answering it at the end, with something useful in the middle and a label line saying how it's built. The "make a short video script" workflow now runs it.
To take it, say to your AI: "Add the content chapter part 4 from the template changelog." It fetches the write-a-script skill and the Copywriter's skills README line, then runs the sync command and save-work.

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
1. Fetch `tools/`, `command-center/`, `departments/operations/`, every `departments/*/README.md`, `brand/friction-points.md`, the new `knowledge/` folders and `routines/`.
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
