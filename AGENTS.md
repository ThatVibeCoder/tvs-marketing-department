# How to work in this repo

The rules for every AI in this repo. Codex, Cursor and Grok Build load this file on their own; Claude Code loads it through `CLAUDE.md` and Gemini CLI through `GEMINI.md`, two pointers `tools/sync.py` writes. The rules are written only here.

This is the owner's company, built as files. It starts as a skeleton: `departments/` holds one team, the Dev Team (`departments/it-systems/dev-team/`), the plumbing every other team needs (saving to GitHub, keys, connecting tools, shipping pages). Every other team comes from a classroom lesson, whose skill doc builds it in `departments/` from the owner's own answers.

## Read only what the job needs

Read the files the skill you're running names, and nothing else up front. A skill names the `brand/` files and the parts of `business.md` it needs; a skill that names none needs none. Installing a skill (saving its `SKILL.md` and running sync) reads nothing from `business.md` or `brand/`. If a skill writes words, plans or pages for the business and names no files, read `business.md` and the one `brand/` file the job is about (`voice.md` for words, `offer.md` for what you sell, `icp.md` for who it's for), never the whole folder.

**A file or section that still says `_Not filled in yet._` counts as missing**, when the job reads it. So does a file that's only the template's own explanation with nothing filled in. Stop, name what's missing and the lesson that fills it (by the lesson's title, never a day number), and ask. Generic work written around a missing file is worse than a question. **The one exception:** when the skill you're running says what to do with a missing or empty file (set-up-your-company-strategist and the brain-dump skills do, and so does any skill with its own "If ... still says `_Not filled in yet._`" line), follow the skill for that file instead of stopping. It was written knowing the file might be empty.

## The front door: your Company Strategist

The Company Strategist is on the Strategy Team (`departments/operations/strategy-team/company-strategist/`), set up in the Set Up Your Company Strategist lesson. Its two skills: set-up-your-company-strategist (that lesson's) and company-strategist (the front door). It keeps the facts the Chapter 2 lessons gather (`business.md`, `knowledge/business-audit.md` and the files in `brand/`), and every Chapter 2 interview skill is saved under it, in `company-strategist/skills/<skill>/SKILL.md`, so the owner can rerun it ("update my ICP"). Never save one under another team or a new team member.

- **Once `departments/operations/strategy-team/company-strategist/skills/company-strategist/SKILL.md` is there,** start there for any ask that names no team, workflow or skill (and whenever the owner says "talk to my company strategist"): read the strategist's file (`company-strategist.md`), then that skill, and follow it. It routes every ask to the team that owns it. It reads which teams are in `departments/` fresh every time, so it finds a team a lesson added yesterday on its own, with nothing to register. When none fits, it says which lesson builds that team. It never does a team's job itself.
- **Until then there's no front door:** check which teams are in `departments/` right now. If one owns the ask, run it by that team's own front door (its `team.md`). If none does, say in one line which lesson builds the team that would (by the lesson's title, never a day number; if you don't know the title, say "the <Team Name> lesson"), and help with what's here.
- **If the owner says "set up my company strategist"** (or names that lesson), run set-up-your-company-strategist if it's there. If it isn't, say in one line that the Set Up Your Company Strategist lesson's skill doc installs it, and point them at that doc.

When the owner names a team, a workflow or a skill, skip the front door and run what they named.

## Where things go

Every piece of information has exactly one home; add to it, never copy it somewhere else.
- `business.md`: what the business is, the money, the week, the tools. `brand/`: who you serve (`icp.md`), what you believe (`contrarian-take.md`), where you show up (`channels.md`), what stops the buyer (`friction-points.md`), what you sell and its price (`offer.md`), how you sound (`voice.md`: a map of where the owner's real voice lives; read what it points at), banned words (`guidelines.md`), colors and fonts.
- `knowledge/`: what's been learned (topics, hooks, goals, competitors, swipes, `reports/`, `landing-pages.json`). `site/`: the files that go live. `routines/<name>/README.md`: scheduled work. `recordings/`: raw takes.
- `departments/<department>/<team>/`: a team (`team.md`), its members (`<member>/<member>.md`) and their skills (`<member>/skills/<skill>/SKILL.md`). Finished work goes in `output/` next to the member that made it.
- A home inside a team's folder only exists once that team's lesson builds it; never make a team folder by hand.

Read `docs/REFERENCE.md` only when you need more: "Where everything goes" for the full table of homes (or a home that isn't listed above), "The shape" for the `team.md`, member and skill formats, "Commands" for how shortcuts are built, "The Command Center" for what each page shows, "Adding something new" when a lesson builds a team, "Memory" for where a correction goes. If something truly has no home, ask the owner before making one and add it to that table in the same change.

## Running skills, teams and workflows, on each AI

Every team, workflow and skill gets a shortcut that sync writes (`.claude/skills/`, `.agents/skills/`, `.gemini/commands/`, `.cursor/commands/`). Never write a skill into those folders or edit a shortcut: save the real skill inside its team member, then run sync.
- **Codex:** `$dev-team`, `$save-work`, or pick it from the `/skills` menu.
- **Claude Code, Gemini CLI, Cursor, Grok Build:** `/dev-team`, `/save-work` (Grok Build once you've trusted this folder).
- **Any other agent:** say it ("run my dev team"). Plain words work everywhere.

## Running a workflow

1. Read the team's `team.md` and find the workflow.
2. Run the steps in order. For each step, read that team member's file. If the step names a skill, run that skill once. If it doesn't, the team member does what the step says.
3. At every `[you approve]` step, stop, show the owner the work, and wait for a yes.
4. `seeded` means a team member hasn't been set up by its lesson yet. Its skills still run. If a step needs something that isn't there yet (a connection, a filled brand file, a skill a lesson installs), say so in one plain line, name the lesson that sets it up, and skip that step. Don't fake it.
5. At the end, say what got made and where it was saved.

## Keep it in sync: run the sync command

Run it when a team, team member, skill, workflow or routine is added, renamed or removed, and before every save. It checks the structure and rebuilds every shortcut, pointer and the Command Center. **Run it once.** If it prints a line starting with FIX, show the owner that exact line and stop. If it prints BLOCKED, your AI's safety settings stopped the write (Codex keeps `.agents/` read-only): ask the owner to approve the command once, or to run it in their own terminal, then run it once more. Never fix-and-rerun on your own, and never run it again on an error nothing has changed. `--check` changes nothing and fails if anything is out of date; save-work runs it.

**Which command, by computer** (check which one the owner is on first):
- **Mac or Linux:** `python3 tools/sync.py`
- **Windows:** `py tools/sync.py` (if that isn't found, try `python tools/sync.py`)

**If none of those work, Python isn't installed.** Stop, give the owner the one install command for their computer, and wait for them to say it's done:
- **Windows:** `winget install Python.Python.3.12`, then close and reopen the terminal.
- **Mac:** `xcode-select --install`, then accept.
- **Linux:** `sudo apt install python3` (or their system's package manager).

Never run a system install yourself, and never hand-build the shortcuts, commands, pointer files or Command Center data: only sync writes those.

## Building from a lesson

A lesson's skill doc says which team, team member or skill it builds. Follow it exactly, write what it gathers into its one home, then run sync once. If the folder is already there, build onto it: never replace a team member file or skill without showing the owner what would change and getting a yes. Never touch `business.md` or `brand/` except where the doc says to fill them. Two skills doing one job is a bug: check for one under another name first.

## Memory

When the owner says "always" or "remember", or makes the same correction twice, write it down right then: business-wide facts in their file from the table (with a dated `## Updates` line), one member's habits in its `## Memory`, a whole team's in `team.md`. A correction to how the owner sounds goes into `brand/voice.md` only after they confirm. Skills don't hold memory.

## The Command Center

`dashboard/index.html` is the picture of the company, rebuilt by sync; open it from the folder (or run `python3 tools/serve.py` for its buttons). **Never open `dashboard/data/` or `dashboard/assets/` for an install or a skill run.** They're big generated files sync writes. For dashboard work, search them for the one thing you need instead of reading them whole.

## Standing security rules (every session, every build)

- Keys live in the `.env` file only (that exact name), and any call that uses a key happens server-side, never in code a browser downloads.
- Nothing secret ever goes in a page, a skill file, a brand file or a chat message. The owner pastes a key once, into add-a-key, and never again.
- Before any save that changed pages or wiring, run the code reviewer's review-changes. Before anything public ships, run the security checker.
- A leaked key means a NEW key from the tool's own site and the old one turned off. Deleting the file is not the fix.

## Saving

The owner can save from Day 1 with the GitHub Agent's save-work. When the owner says "save my work" (or types `/save-work`, `$save-work` in Codex), run the save-work shortcut (in an agent without shortcuts, `departments/it-systems/dev-team/github-agent/skills/save-work/SKILL.md`): it runs `python3 tools/sync.py --check`, then saves one checkpoint and sends it to GitHub. If the folder isn't connected to GitHub yet, run the GitHub Agent's set-up-repo first (part of "set up my code base"). When a session changed files, offer once, in one short line, to save them. Never save on your own.

Notion is optional: if the owner tracks their team there, mirror new team members; if not, say nothing. When the owner names a lesson or a goal, match it to the right skill or workflow by what it means, not by a number.
