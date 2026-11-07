---
name: set-up-your-company-strategist
description: "Set up the owner's Company Strategist, the front door that talks to every other team: add the Strategy Team from the library if it isn't there, fill the strategist's file from business.md and brand/, run the sync command, and show them how to talk to it on their AI. Use for the Set Up Your Company Strategist lesson, or when the owner says \"set up my company strategist\"."
---

# Set Up Your Company Strategist

The Company Strategist is the one team member the owner can bring anything to. It knows which teams are in their company, sends each ask to the team that owns it, and picks the next move. This skill puts it in their repo, wakes it up, and shows them how to talk to it.

Before any job, read `business.md` and everything in `brand/`.

## Say this first
Tell the owner what's about to happen, something like: "I'm going to set up your company strategist. It's the one you talk to from now on: you tell it what you want, and it hands the job to the right team. It takes about ten minutes, and nothing in your business files changes."

## 1. Make sure the Strategy Team is in your company
Look for `departments/operations/strategy-team/team.md`.

**If it's not there,** add it from the library:
1. Run `python3 tools/add_team.py strategy-team` (Windows: `py tools/add_team.py strategy-team`).
2. It will stop and say the team is marked not ready, because two of its team members (the ICP & Offer Owner and the Moat Analyst) get their skills in later lessons. Read that line to the owner as it is, then say what does work today: the strategist, its two brain dumps, and the "what comes next" workflow. Ask if they want it added now.
3. On their yes, run it again with `--anyway` on the end: `python3 tools/add_team.py strategy-team --anyway`. That's the right call here: the Strategy Team has no team member marked not ready on its own, so `--anyway` brings in all three team members and nothing else, and the two waiting ones stay `seeded` until their lessons. It never touches `business.md` or `brand/`.
4. If Python isn't installed and they can't install it right now, copy the folder by hand: `library/teams/operations/strategy-team/` to `departments/operations/strategy-team/`, every file except `NOT-READY.md`. Then do the sync by hand the way AGENTS.md says.

**If it's already there,** don't add it again (add_team stops anyway, and their copy may hold their own edits). Check that `departments/operations/strategy-team/company-strategist/skills/company-strategist/SKILL.md` is there. If it isn't (a copy made before the front door existed), copy just that one skill folder, and this one, from `library/teams/operations/strategy-team/company-strategist/skills/` into the same place in their copy, never over a file that's already there. No library copy either? Fetch them with the GitHub Agent's add-from-template.

## 2. Check the business files it reads
The strategist reads `business.md` first, every time. Open it.
- **If the At a Glance block and What You Sell still say `_Not filled in yet._`,** stop here. Say the strategist has nothing to work from yet, and that the Brain-Dump Your Business lesson fills it. Offer to run the brain-dump-your-business skill now, then come back to this one.
- **If `business.md` is filled but files in `brand/` are still empty, or only partly filled,** keep going. That's normal this early, and the strategist's job is to say what's thin. Note each one for step 3.

## 3. Fill in the strategist's file
Open `departments/operations/strategy-team/company-strategist/company-strategist.md`. Never copy facts from `business.md` or `brand/` into it: every fact has one home, and copies drift. Fill in only what's the strategist's own:
1. Change `**Status:** seeded` to `**Status:** live`.
2. In the first paragraph, put the business's name where it says "Runs the room", from Business name in `business.md`'s At a Glance: "Runs the room for <Business name>."
3. If the owner wants to call it something ("call it Sam"), add a `**Name:** Sam` line under the Team line. Its role name keeps working too.
4. Add a `## Watching` section above `## Output`, dated, with what it found today, one line each with the file: every brand file still empty, every brand file only partly filled (one line naming its sections that still say `_Not filled in yet._`, like `brand/offer.md: Friction It Answers, Left For Content and Headlines We Tried are still empty`), every `Still to Answer` line in `business.md`, and any two files that disagree (show the owner both lines and ask which is true; don't pick). Name the lesson that fills each one from that file's own **Filled by:** line, for example: `- 2026-11-07: brand/voice.md is still empty (the Round Up Your Own Words lesson fills it).` Skip `_template.md` and `README.md` files: they're shapes and notes, not things to fill. It clears a line once the file is filled.

Don't write a list of teams into it. The strategist reads `departments/` fresh on every ask, so a team added next week is found without touching this file.

## 4. Run the sync command
Run `python3 tools/sync.py` (Windows: `py tools/sync.py`). If it prints a line starting with FIX, fix that first. Then check that `.claude/skills/company-strategist/` and `.agents/skills/company-strategist/` are there. That's what makes it a command on every AI.

## 5. Show them how to talk to it
Ask which AI they use, then show only that one:
- **Claude Code, Gemini CLI or Cursor:** type `/company-strategist`, then what you want.
- **Codex:** type `$company-strategist`, or pick it from the `/skills` menu.
- **Grok Build:** type `/company-strategist`. The first time, say yes when it asks to trust this folder, or it won't load the skills.
- **Any of them, or any other AI:** just say "talk to my company strategist" and what you want. `AGENTS.md` sends it there.

Then have them try it once, live. Build three example asks from the teams actually in their `departments/` right now (one per team, in their words, like "write my post for Thursday" if the Content Team is there), plus "what should I do next". Have them pick one, run it through the strategist, and point out the one line where it says which team it handed the job to.

## The ending, always
1. Read back what changed, one line each: the team that got added (if it did), the strategist's file now `live`, and what it's watching.
2. Tell them what it changes: "From now on you don't need to remember which team does what. Tell the strategist, and it finds the team."
3. Save the work to GitHub: run the GitHub Agent's save-work skill at `departments/it-systems/dev-team/github-agent/skills/save-work/`. No Dev Team yet? Run `python3 tools/sync.py --check`, then commit and push by hand, the way AGENTS.md says under Saving.

## Done when
`departments/operations/strategy-team/` is there with the company-strategist skill inside, the strategist's file is `live` with today's Watching list and no copied facts, sync ran clean, the owner has talked to it once on their own AI and seen it hand a job to a team, and the work is saved.
