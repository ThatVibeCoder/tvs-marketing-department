---
name: tour-the-department
description: "Show the owner what's in their department now and which full teams are waiting in the team library, then add the one they pick. Use when the owner says \"show me around\", \"what teams can I add\", \"what's in my department\", or /tour-the-department."
---

# tour-the-department

A short tour: what's here, what's waiting, and how a team gets added.

## Steps
1. Run `python3 tools/add_team.py` (Windows: `py tools/add_team.py`). It lists every team already in `departments/` and every team in the library, marked ready or not ready, with what each one does and which teams it works best next to.
2. Tell the owner, in plain words and one line per team: what's in their department now, then what's in the library. Name the not-ready ones as not ready, with the one line on what's missing.
3. Ask which team to add, or whether to wait. The classroom lesson they're on usually names it.
4. On their yes, run `python3 tools/add_team.py <team-folder>` (for example `website-team`). It copies the whole team (every member, skill and workflow) into its department and runs the sync command. If a folder with that name is already there, it stops and changes nothing: say what's already there and ask before doing anything else.
5. Say what got added and that it now shows in the Command Center under Agent Teams. If it printed "works best with" other teams, mention them in one line; don't add them unasked.

## Rules
- Never touch `business.md` or anything in `brand/`. Adding a team only ever adds folders under `departments/`.
- Never replace a team that's already in `departments/`. The owner's copy may hold their own edits.
- A team marked not ready gets added only if the owner says so after hearing what's missing (`--anyway`).
