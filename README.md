# Your Marketing Engine

This repo is the engine: the part of your marketing department that runs. It holds the dashboard, the automations that run on their own, your website's files, and the tools that keep them in sync. Your API keys live in a local `.env` file that never leaves your computer.

Your departments, agent teams, skills, brand and company knowledge live in your company vault (a separate repo made from tvs-company-vault-template). This repo never reads it.

## Start here

1. Open the dashboard: double-click `dashboard/index.html`. It opens straight from the folder, read-only.
2. To approve and edit posts, save settings and keys, or pull your website numbers, run `python3 tools/serve.py` (Windows: `py tools/serve.py`) and open the link it prints (http://localhost:8765). It only answers your own computer.
3. After you change a routine, a post, a setting or the landing pages list by hand, run `python3 tools/sync.py` (Windows: `py tools/sync.py`). It rebuilds the dashboard's data. `python3 tools/sync.py --check` changes nothing and fails if anything is out of date.

Works on Mac, Windows and Linux with Python 3 and nothing else to install.

If you're an AI reading this, read `AGENTS.md` next.

## The folder map

```
dashboard/index.html       the dashboard: Dashboard, Content, Web & Analytics, Automations, Settings
dashboard/assets/          its code (plain HTML, CSS and JavaScript, no build step)
dashboard/data/            what it reads, rebuilt by tools/sync.py (web and payments numbers stay on your computer)
dashboard/settings.json    your settings, made the first time you save one (never a key)
dashboard/landing-pages.json   every landing page you ship, for the Landing Pages page
posts/                     one file per post; posts/calendars/ holds posting calendars
routines/                  work that runs on a schedule, one folder each
site/                      your website: the only folder Vercel puts online (vercel.json)
recordings/                raw takes; the video and audio stay on your computer
tools/                     sync.py, serve.py, pull_web.py, files.py
tests/                     python3 -m unittest discover tests
.github/workflows/         GitHub Actions, when you add one
.env                       your keys (you make it; every save skips it)
AGENTS.md                  the rules every AI follows in this repo
CHANGELOG.md, VERSION      what's new, and which version your copy is
```

## What the dashboard shows

- **Dashboard:** revenue from `dashboard/data/payments.json` and visitors from your last website pull.
- **Content:** every post in `posts/`, a calendar, and one page per platform with a review queue (Approve, Reject).
- **Web & Analytics:** Google Analytics 4 and Search Console numbers, pulled read-only by `tools/pull_web.py`, and your landing pages.
- **Automations:** every routine in `routines/` with its flow, and each run in `dashboard/data/executions.json`.
- **Settings:** account, brands, connected accounts, payments, web connections, posting cadence and developer facts. Keys typed here go to `.env` only.

## Staying up to date

This repo doesn't update itself, on purpose. `CHANGELOG.md` and `VERSION` show what's shipped since your copy was made. When something looks useful, ask your AI to fetch that piece and place it, never touching your posts, settings or `.env`.

## The honest fine print

This template teaches a way of working. It doesn't run your business for you, and it can't guarantee anything about your accounts, your keys, your platforms, or your results. You own those. The security habits built in here (the env file, the localhost-only server, the checks) lower risk; nothing removes it. When something involves money, passwords, or other people's data, slow down and check it yourself.
