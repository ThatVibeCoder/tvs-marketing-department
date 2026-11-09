# How to work in this repo

The rules for every AI in this repo (Claude Code, Codex, Gemini CLI, Cursor, Grok Build or any other agent). They're written only here.

This repo is the engine: the dashboard (`dashboard/`), the automations (`routines/`, `.github/workflows/`), the website files (`site/`, put online by `vercel.json`), raw takes (`recordings/`), the tools that run it (`tools/`) and the tests (`tests/`). Keys live in a local `.env` file.

Your departments, agent teams, skills, brand and company knowledge live in your company vault (a separate repo made from tvs-company-vault-template). This repo never reads it.

## Where things go

Every piece of information has exactly one home; add to it, never copy it somewhere else.

| What | Home |
|---|---|
| A post (one file each) | `posts/<id>.md` (shape in `posts/README.md`) |
| A posting calendar | `posts/calendars/calendar-<date>.md` |
| A routine (scheduled work) | `routines/<name>/README.md` (shape in `routines/README.md`) |
| One line per routine run | `dashboard/data/executions.json` |
| A GitHub Action | `.github/workflows/` (its keys as GitHub secrets, never in a file) |
| Settings (nothing secret) | `dashboard/settings.json` |
| Every landing page you ship | `dashboard/landing-pages.json` (shape in `dashboard/data/README.md`); never in `site/`, so drafts never go live |
| Revenue numbers | `dashboard/data/payments.json` (stays on this computer; shape in `dashboard/data/README.md`) |
| Website numbers | `dashboard/data/web.json`, written by `tools/pull_web.py` (stays on this computer) |
| The live website | `site/` |
| Raw video and audio | `recordings/` (the media stays on this computer; one note per take is saved) |
| API keys | `.env` at the top of the repo, and nowhere else |

If something truly has no home, ask the owner before making one and add it to this table in the same change.

## Running it

- **Open the dashboard:** `dashboard/index.html` opens straight from the folder, read-only.
- **Turn editing on:** `python3 tools/serve.py` serves it on http://localhost:8765 (your computer only). Its buttons save posts, settings and keys into the files above, then run sync.
- **Pull website numbers:** `python3 tools/pull_web.py` (`--test` only checks the connection).
- **Run the tests:** `python3 -m unittest discover tests`. Each test works on a temporary copy, never the owner's files. A few open the page in headless Chrome and skip without it.

## Keep it in sync: run the sync command

Run it after a routine, a post, a setting, the landing pages list or the payments file changes, and before every save. It reads only files inside this repo and rebuilds `dashboard/data/` so the dashboard opens straight from the folder. **Run it once.** If it prints a line starting with FIX, show the owner that exact line and stop. If it prints BLOCKED, your AI's safety settings stopped the write: ask the owner to approve the command once, or to run it in their own terminal, then run it once more. Never fix-and-rerun on your own, and never run it again on an error nothing has changed. `--check` changes nothing and fails if anything is out of date.

**Which command, by computer** (check which one the owner is on first):
- **Mac or Linux:** `python3 tools/sync.py`
- **Windows:** `py tools/sync.py` (if that isn't found, try `python tools/sync.py`)

**If none of those work, Python isn't installed.** Stop, give the owner the one install command for their computer, and wait for them to say it's done:
- **Windows:** `winget install Python.Python.3.12`, then close and reopen the terminal.
- **Mac:** `xcode-select --install`, then accept.
- **Linux:** `sudo apt install python3` (or their system's package manager).

Never run a system install yourself, and never hand-edit `dashboard/data/` files that sync writes (`automations.json`, `content.json`, `data.js`, `payments.js`).

## The dashboard

**Never read `dashboard/data/` or `dashboard/assets/` whole.** They're big files. For dashboard work, search them for the one thing you need. The dashboard is plain HTML, CSS and JavaScript with no build step and no framework; keep it that way. It reads only `dashboard/data/` (and, through `tools/serve.py`, the files in the table above). Nothing in it calls an AI, posts anywhere or calls a payment provider.

## Standing security rules (every session, every build)

- Keys live in the `.env` file only (that exact name), and any call that uses a key happens server-side, never in code a browser downloads.
- Nothing secret ever goes in a page, a post, a settings file, a routine, a skill file, a brand file or a chat message. The owner pastes a key once, into the dashboard's Settings (it saves to `.env`), and never again.
- Before any save that changed pages or wiring, review the changes. Before anything public ships, run a security check.
- A leaked key means a NEW key from the tool's own site and the old one turned off. Deleting the file is not the fix.
- `tools/serve.py` answers localhost only and writes only inside this repo, never through a link. Keep it that way.

## Saving

When the owner says "save my work", run `python3 tools/sync.py --check`, then save one checkpoint and send it to GitHub. When a session changed files, offer once, in one short line, to save them. Never save on your own.
