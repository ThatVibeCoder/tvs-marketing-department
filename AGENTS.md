# How to work in this repo

These are the rules for any AI working in this repo. Codex reads this file directly, and Claude Code reads it through `CLAUDE.md`, so both follow the same rules.

This is the owner's company, built as files. Every department, team, team member and skill has a folder waiting for it, so nothing ever gets made up in a random place. The classroom fills these folders in, one lesson at a time.

## Read first, every session

Before any writing, planning or building, read `business.md` and everything in `brand/`. That's the shared brain, and everything you make has to match it.

**A file or section that still says `_Not filled in yet._` counts as missing.** So does a file that's only the template's own explanation with nothing filled in. Stop, name what's missing and the lesson that fills it (by the lesson's title, never a day number), and ask. Generic work written around a missing file is worse than a question.

## Where everything goes

Every piece of information has exactly one home. Find it in this table and add to it. Never make a second copy somewhere else, because copies drift.

| What it is | Its one home | Kept by |
|---|---|---|
| What the business is: what you sell, the money, the week, the tools | `business.md` | Company Strategist |
| Who you serve | `brand/icp.md` | ICP & Offer Owner |
| Buyer personas, one file each | `brand/personas/<name>.md` | ICP & Offer Owner |
| The five things that stop a buyer | `brand/friction-points.md` | ICP & Offer Owner |
| What you believe that your industry gets wrong | `brand/contrarian-take.md` | ICP & Offer Owner |
| What you sell, the price, and the headline | `brand/offer.md` | ICP & Offer Owner (headline by the Page Builder) |
| How you sound | `brand/voice.md` | Editor |
| Your content mix and where you post | `brand/channels.md` | Social Manager |
| Banned words, formatting, never-do calls | `brand/guidelines.md` | whoever was corrected |
| Colors, fonts, logos | `brand/colors.md`, `brand/typography.md`, `brand/assets/` | Designer |
| Your business audit: tools, hours, what to cut and hand off | `knowledge/business-audit.md` | Company Strategist |
| Competitors, swipes, outliers | `knowledge/competitors/`, `knowledge/swipes/`, `knowledge/outliers.md` | Researcher |
| Reports (site audits, checkups, traffic) | `knowledge/reports/` | the workflow that made it |
| The strategist's brief for the next team member | `departments/operations/strategy-team/company-strategist/briefs/<YYYY-MM-DD>-<team-member>.md` | Company Strategist |
| Moat scores | `departments/operations/strategy-team/moat-analyst/scores.md` | Moat Analyst |
| Finished work (drafts, pages, documents) | `output/` next to the team member that made it | that team member |
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
- **A team member's file** starts with `**Status:** seeded` (its folder is waiting; a lesson sets it up) or `**Status:** live` (set up and working), then `**Team:**`, then this exact line: "Before any job, read `business.md` and everything in `brand/`, then this file. Stay inside this file's edges." When asked to act as a team member, read its file first and stay inside its edges.
- **A skill** is a folder inside the team member that owns it, with one `SKILL.md` that starts with `name:` (the same as its folder) and `description:` (what it does and the words that should trigger it). Skill names are unique across the whole repo.

## Commands: every team and every skill can be summoned

`.claude/skills/` (Claude Code) and `.agents/skills/` (Codex) hold shortcuts, and `tools/sync.py` builds every one of them from the folders above. Never write a skill straight into those two folders and never edit a shortcut. Put the real skill inside its team member, then run sync.

After sync, the owner can call:
- a whole team (for example `content-team`): it shows that team's workflows and skills and runs the one they pick;
- a workflow, by saying its words (for example "build my landing page") or by its shortcut (`build-my-landing-page`), to run it start to finish;
- one skill on its own (for example `draft-post`).

In Claude Code, type them with a slash: `/content-team`. In Codex, type them with a dollar sign, `$content-team`, or pick them from the `/skills` menu. In both, saying what you want in plain words works too.

## Running a workflow

1. Read the team's `team.md` and find the workflow.
2. Run the steps in order. For each step, read that team member's file. If the step names a skill, run that skill once. If it doesn't, the team member does what the step says.
3. At every `[you approve]` step, stop, show the owner the work, and wait for a yes.
4. `seeded` means a team member hasn't been set up by its lesson yet. Its skills still run. If a step needs something that isn't there yet (a connection, a filled brand file, a skill a lesson installs), say so in one plain line, name the lesson that sets it up, and skip that step. Don't fake it.
5. At the end, say what got made and where it was saved.

## Keep it in sync: run `python3 tools/sync.py`

Run it any time a team, team member, skill, workflow or routine is added, renamed or removed, and before every save. It checks the structure, rebuilds the shortcuts in both skill folders, and refreshes the Command Center. If it prints a line starting with FIX, fix that first. `python3 tools/sync.py --check` changes nothing and fails if anything is out of date, and the GitHub Agent's save-work runs it before every save.

## The Command Center

`command-center/index.html` is the picture of this whole company: every team, its workflow drawn in phases, its team members and skills, and every routine. Open it straight from the folder, no server needed. It's rebuilt from the folders by `tools/sync.py`, so never edit `command-center/data/` by hand. If the owner asks to "see my team", "see my company" or "update the Command Center", run sync and open that file. (`org-chart.html` just forwards there.)

## Adding something new

- **A skill from a classroom lesson:** the lesson's doc says which team member it belongs to. Save it to that member's `skills/<skill-name>/SKILL.md`, write the information it gathers into the home from the table above, then run sync.
- **Setting up a seeded team member:** fill in its job in its own file, change `**Status:** seeded` to `**Status:** live`, then run sync.
- **A new team:** make `departments/<department>/<team>/team.md` in the shape above (copy another team's file), one folder per team member with its file, then run sync.
- **A new team member:** a folder inside its team with `<member>.md` in the shape above and an empty `skills/` folder. Add it to the team's Members list, then run sync.

Before adding anything, check it doesn't already exist under another name. Two team members doing one job, or two skills doing one job, is a bug: build onto the one that's there.

## Memory: where corrections live

Three places hold memory. Each team member file and team file says so too.

- **Business-wide** (how you sound, who you sell to, brand facts): fix the right file from the table above, and add a dated line to that file's `## Updates` section.
- **One team member's own habits** (how THIS member should work): its own `## Memory` section.
- **A whole team's habits** (once more than one member should do something the same way): that team's `## Memory` in `team.md`.

When to write it down: the moment the owner says "always" or "remember", write it right then. If the same correction happens twice, write it the second time. Don't wait for a third. A correction about how the owner sounds gets offered to `brand/voice.md`, and only added once the owner confirms, marked (owner confirmed).

Skills don't hold memory. A skill stays a clean set of steps so it still works if it's shared. What's learned about how the owner wants a job done goes with the team member who runs it.

## Notion is optional

If the owner tracks their team in Notion, mirror new team members there too. If they don't, skip it and say nothing. The repo is always the record; Notion is only a view.

## Standing security rules (every session, every build)

- Keys live in the `.env` file only (that exact name), and any call that uses a key happens server-side, never in code a browser downloads.
- Nothing secret ever goes in a page, a skill file, a brand file or a chat message. The owner pastes a key once, into add-a-key, and never again.
- Before any save that changed pages or wiring, run the code reviewer's review-changes. Before anything public ships, run the security checker.
- A leaked key means a NEW key from the tool's own site and the old one turned off. Deleting the file is not the fix.

## Saving

Save with the GitHub Agent's save-work skill: it runs `python3 tools/sync.py --check`, then saves one checkpoint and sends it to GitHub. Tell the owner in one line what changed.

## The classroom

The Skool classroom teaches the lessons, on video. This repo holds the work. When the owner names a lesson or describes a goal, match it to the right skill or workflow by what it means, not by a number.
