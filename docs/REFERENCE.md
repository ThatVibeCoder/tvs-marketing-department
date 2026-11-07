# Reference

The long-form reference behind `AGENTS.md`. Nothing here is read up front: `AGENTS.md` names the one section a job needs, and you read that section only. The rules themselves stay in `AGENTS.md`; if this file and `AGENTS.md` ever disagree, `AGENTS.md` wins.

## Where everything goes

Every piece of information has exactly one home. Find it in this table and add to it. Never make a second copy somewhere else, because copies drift. "Kept by" names the team member who keeps it once its team's lesson builds that team; until then, the owner and their AI keep it, in the same home. A home inside a team's folder (like the posts folder) only exists once that team's lesson builds it: never make a team folder by hand to hold a file.

| What it is | Its one home | Kept by |
|---|---|---|
| What the business is: what you sell, the money (what a customer is worth, whether they come back, how many more you could take; the price itself lives in `brand/offer.md`, and `business.md` points there), the week, the tools | `business.md` | Company Strategist |
| Who you serve | `brand/icp.md` (your main ICP, read first); another kind of buyer gets `brand/icps/<name>.md` in the same shape, used only when a job names it | ICP & Offer Owner |
| Buyer personas, one file each | `brand/personas/<name>.md` | ICP & Offer Owner |
| The five things that stop a buyer | `brand/friction-points.md` | ICP & Offer Owner |
| What you believe that your industry gets wrong | `brand/contrarian-take.md` | ICP & Offer Owner |
| What you sell, the price (`brand/offer.md` What It Costs is the price's one home), and the headline | `brand/offer.md` (your main offer, the one the landing page reads); anything else you sell gets `brand/offers/<name>.md` in the same shape | ICP & Offer Owner (headline by the Page Builder) |
| How you sound | `brand/voice.md` | Editor |
| Your content mix and where you post | `brand/channels.md` | Social Manager |
| Your content topics, and the 4 questions every post answers | `knowledge/topics.md` | Social Manager |
| Every post: one file each, with its platform, status (draft, approved, rejected, posted), day and time | `departments/marketing/content-team/social-manager/posts/<date>-<platform>-<words>.md` (the Content Team lesson adds this folder and its README, which shows the header) | Copywriter writes it, Social Manager dates and posts it; the owner approves and edits it in the Command Center |
| Your website's numbers from Google Analytics and Search Console (stays on your computer, skipped by every save) | `command-center/data/web.json`, written by `tools/pull_web.py` | Traffic Agent |
| Your payments: revenue, MRR, invoices, from your payment provider (stays on your computer, skipped by every save) | `command-center/data/payments.json` (its shape is in `command-center/data/README.md`); the provider and its read-only key are set in Settings → Payments | Payments Agent (Dev Team) |
| Command Center settings: brands, handles, how posts go out, posting cadence, payment provider (never a key) | `command-center/settings.json` | the owner, in the Command Center's Settings |
| Your openers: the ones that won, and the ones to try next | `knowledge/hooks.md` | Copywriter (read-the-stats marks the winners) |
| Banned words, formatting, never-do calls | `brand/guidelines.md` | whoever was corrected |
| Colors, fonts, logos | `brand/colors.md`, `brand/typography.md`, `brand/assets/` | Designer |
| Your business audit: tools, hours, what to cut and hand off | `knowledge/business-audit.md` | Company Strategist |
| Your goals: the wins, numbers and things you want running next, crossed off as they land | `knowledge/goals.md` | Company Strategist |
| Competitors (one file each: website, where they post and how often, what they lead with), swipes, outliers | `knowledge/competitors/<name>.md`, `knowledge/swipes/`, `knowledge/outliers.md` | Researcher (scan-my-competitors for the first look, competitor-check for the deeper read, collect-swipes for swipes, find-outliers for outliers) |
| Reports (site audits, checkups, traffic) | `knowledge/reports/` | the workflow that made it |
| Your ads: the ready check and the weekly read | `knowledge/reports/ads-ready-<YYYY-MM-DD>.md`, `knowledge/reports/ads-<YYYY-MM-DD>.md` | Growth Lead |
| Your ad tests: the plan, the campaign (built paused, you turn it on), the tracking setup, each ad batch | `output/` next to the Growth Lead (`test-plan-<date>.md`), the Ads Manager (`campaign-<date>.md`, `tracking.md`) and the Ad Writer (`batch-<date>.md`) | the Ads Team |
| The strategist's brief for the next team member | `departments/operations/strategy-team/company-strategist/briefs/<YYYY-MM-DD>-<team-member>.md` | Company Strategist |
| Moat scores | `departments/operations/strategy-team/moat-analyst/scores.md` | Moat Analyst |
| Your website's source: the files that go live (the test page first, then your landing page) | `site/` (what `vercel.json` puts online) | Page Builder; the Vercel Agent ships it |
| Every landing page and the pages under it (forms, thank-you pages, upsells, product pages, on any domain), grouped by the offer each one sells | `knowledge/landing-pages.json` (its shape is in `knowledge/README.md`; kept out of `site/` so it never goes live) | Page Builder (build-a-page registers each page); the Vercel Agent marks it live |
| Raw recordings: your phone takes and voice memos before they're edited (the video files stay on your computer; their notes and transcripts get saved) | `recordings/` | Social Manager |
| Finished work (drafts, pages, documents) | `output/` next to the team member that made it | that team member |
| Your leads: one file per person, with where they came from, what they said, the touch log and call notes | `departments/sales/sales-team/crm-agent/leads/<lead-name>.md` | CRM Agent |
| Booking messages | `output/` next to the Calendar Agent (`<date>-book-<lead>.md`) | Calendar Agent |
| Reply drafts and follow-up nudges | `output/` next to the Reply Agent (`<date>-<lead>.md`) and the Nurture Agent (`<date>-<lead>.md`, `<date>-quiet-list.md`) | Reply Agent, Nurture Agent |
| Scheduled work | `routines/<name>/README.md` | the team that owns it |

If something truly has no home in this table, ask the owner before making one, then add the new home to this table in the same change.

## The shape: departments, teams, team members, skills

```
departments/<department>/                 a department (marketing, sales, it-systems, operations), with a README.md
  <team>/team.md                          an agent team: its header, members, workflows and memory
  <team>/<member>/<member>.md             a team member: Status, Team, its job, Output, Memory
  <team>/<member>/skills/<skill>/SKILL.md a skill: one job that team member knows how to do
  <team>/<member>/output/                 that team member's finished work
```

- **A team** = a workflow and the skills of its members. Its `team.md` starts with a header (`name`, `command: /<team-folder>`, `department`, `status: seeded|live`, `purpose`), lists its members, and writes each workflow like this:
  ```
  ## Workflow: build my landing page
  Say: "build my landing page"
  Also say: build my website, make my landing page
  When: one line on when to run it.
  ### Plan
  1. **Page Builder** · build-a-page · what happens in this step.
  2. **You** read it and say yes or what to fix. [you approve]
  ### Ship
  3. **Vercel Agent** · ship-a-page · what happens.
  4. **Page Builder** hands it to the next team, with no skill named.
  ```
  Phases are `###` headings. A step is numbered `1. **Team member** · skill-name · what happens` when it runs a skill, or `1. **Team member** what happens` when that member does it without a skill. `[you approve]` marks a stop where the owner has to say yes. `Also say:` lists other ways the owner might ask for it.
- **A team member's file** starts with `**Status:** seeded` (its folder is waiting; a lesson sets it up) or `**Status:** live` (set up and working), then `**Team:**`, then this exact line: "Each skill names the files it reads. Read those, then this file, and stay inside this file's edges." When asked to act as a team member, read its file first and stay inside its edges.
- **A skill** is a folder inside the team member that owns it, with one `SKILL.md` that starts with `name:` (the same as its folder) and `description:` (what it does and the words that should trigger it). Skill names are unique across the whole repo.

## Commands: every team and every skill can be summoned

`.claude/skills/` (Claude Code) and `.agents/skills/` (Codex) hold shortcuts, `.gemini/commands/` (Gemini CLI) and `.cursor/commands/` (Cursor) hold the same ones as commands, and `tools/sync.py` builds every one of them from the folders above. Never write a skill straight into those folders and never edit a shortcut. Put the real skill inside its team member, then run sync. Grok Build reads the same shortcuts from `.agents/skills/` and `.claude/skills/`, so it needs no folder of its own.

After sync, the owner can call:
- a whole team (for example `dev-team`): it shows that team's workflows and skills and runs the one they pick;
- a workflow, by saying its words (for example "ship my landing page") or by its shortcut (`ship-my-landing-page`), to run it start to finish;
- one skill on its own (for example `save-work`).

In Claude Code, Gemini CLI, Cursor and Grok Build, type them with a slash: `/dev-team` (Grok Build loads them only once you've said yes to trusting this folder). In Codex, type them with a dollar sign, `$dev-team`, or pick them from the `/skills` menu. In any other agent, say it: "run my dev team". Saying what you want in plain words works everywhere. The Command Center's Settings → AI Agents page shows each one.

## The Command Center

`command-center/index.html` is the picture of this whole company. Its sidebar starts with **Dashboard** (the business at a glance: revenue, MRR, website visitors and open invoices, the Total Revenue chart, revenue by customer and recent payments, all from `command-center/data/payments.json`; until the Payments Agent fills it, each says to connect payments in Settings → Payments) and **Agent** (a chat with your AI in the Claude desktop style: design only, Coming soon; until it's on, use your AI in this folder), then the Workspace sections, each opening into its pages: **Content**, **Web & Analytics** and **Automations**. **Automations**: every team, its workflow drawn in phases, its team members and skills, and every routine. **Content**: an Overview of what went out and what's waiting, a Calendar, Research (from `knowledge/`), and one page per platform (TikTok, Instagram, X, Threads, YouTube, Skool, LinkedIn) with its review queue and an editor that shows exactly how the post looks on that platform. **Web & Analytics**: every landing page you have, grouped by offer, with a toggle that opens the pages under each one (from `knowledge/landing-pages.json`), then your website's visitors, traffic sources, pages, searches and a visitor map, from Google Analytics and Search Console (connect them once in Settings → Web connections, which also holds Microsoft Clarity, Bing Webmaster Tools and one other tool, set up but not pulled yet; then `python3 tools/pull_web.py` or its Pull now button brings the numbers in, read-only). **Settings** sits at the bottom left: account, workspace, brands, connected accounts, payments (pick the provider, save a read-only key; nothing here calls the provider, the Payments Agent does), web connections, posting cadence, AI agents (how to run your teams on each one) and developer info.

**Never open `command-center/data/` or `command-center/assets/` for an install or a skill run.** They're big generated files sync writes. For dashboard work, search them for the one thing you need instead of reading them whole.

Open it straight from the folder, no server needed: everything shows, read-only. It's rebuilt from the folders by `tools/sync.py`, so never edit `command-center/data/` by hand. If the owner asks to "see my team", "see my company" or "update the Command Center", run sync and open that file. (`org-chart.html` just forwards there.)

To make its buttons work (Save changes, Approve, Reject, Settings), run `python3 tools/serve.py` (Windows: `py tools/serve.py`) and open the link it prints. It runs on the owner's computer only, writes every change to the files above, keeps API keys in `.env` only, and runs sync after each change. It never posts anything: posting stays with the Content Team's post-content skill, once its lesson builds that team.

## Adding something new

- **A team from a classroom lesson:** the lesson's skill doc (the Google Drive doc at the bottom of the lesson) says which department and team it builds. Follow it exactly: make `departments/<department>/<team>/team.md` and its team members in the shape above, fill them from the owner's answers, write what it gathers into the homes in the table above, then run sync. If the team's folder is already in `departments/`, build onto it: never replace a team member file or skill that's there without showing the owner what would change and getting a yes. Never touch `business.md` or `brand/` except where the doc says to fill them.
- **A skill from a classroom lesson:** the lesson's doc says which team member it belongs to. Save it to that member's `skills/<skill-name>/SKILL.md`, write the information it gathers into the home from the table above, then run sync.
- **Setting up a seeded team member:** fill in its job in its own file, change `**Status:** seeded` to `**Status:** live`, then run sync.
- **A new team:** teams come from their classroom lesson, whose skill builds the folder, its `team.md` and its team members, then runs sync. Never make a team folder by hand to hold a stray file; move the file to its home in the table above instead.
- **A new team member:** a folder inside its team with `<member>.md` in the shape above and an empty `skills/` folder. Add it to the team's Members list, then run sync.

Before adding anything, check it doesn't already exist under another name. Two team members doing one job, or two skills doing one job, is a bug: build onto the one that's there.

## Memory: where corrections live

Three places hold memory. Each team member file and team file says so too.

- **Business-wide** (how you sound, who you sell to, brand facts): fix the right file from the table above, and add a dated line to that file's `## Updates` section.
- **One team member's own habits** (how THIS member should work): its own `## Memory` section.
- **A whole team's habits** (once more than one member should do something the same way): that team's `## Memory` in `team.md`.

When to write it down: the moment the owner says "always" or "remember", write it right then. If the same correction happens twice, write it the second time. Don't wait for a third. A correction about how the owner sounds gets offered to `brand/voice.md`, and only added once the owner confirms, marked (owner confirmed).

Skills don't hold memory. A skill stays a clean set of steps so it still works if it's shared. What's learned about how the owner wants a job done goes with the team member who runs it.
