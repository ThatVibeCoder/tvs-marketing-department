# Your Marketing Engine

This repo is the engine: the part of your marketing department that runs. It holds the dashboard, the automations that run on their own, your website's files, and the tools that keep them in sync. Your API keys live in a local `.env` file that is never uploaded.

If you're an AI reading this, read `AGENTS.md` next.

## What's in this repo

```
dashboard/                 the dashboard: open dashboard/index.html
  assets/                    its code (plain HTML, CSS and JavaScript, no build step)
  data/                      what it reads, rebuilt by tools/sync.py (web and payments numbers stay on your computer)
  settings.json              your settings, made the first time you save one (never a key)
  landing-pages.json         every landing page you ship, for the Landing Pages page
posts/                     one file per post; posts/calendars/ holds posting calendars
routines/                  work that runs on a schedule, one folder each
site/ + vercel.json        your website: site/ is the only folder Vercel puts online
recordings/                raw takes; the video and audio stay on your computer
tools/serve.py             turns editing on: serves the dashboard on your computer only
tools/pull_web.py          pulls your Google Analytics and Search Console numbers, read-only
tools/sync.py              rebuilds the dashboard's data from the files above
tests/                     python3 -m unittest discover tests
.github/workflows/         GitHub Actions, when you add one (keys as GitHub secrets)
.env                       your keys: you make it, and it's never uploaded
AGENTS.md                  the rules every AI follows in this repo
CHANGELOG.md, VERSION      what's new, and which version your copy is
```

## How the owner uses it

1. On GitHub, press **Use this template** to make your own copy, then download it to your computer.
2. In a terminal inside the folder, run `python3 tools/serve.py` (Windows: `py tools/serve.py`) and open the link it prints (http://localhost:8765). It only answers your own computer. Without it, `dashboard/index.html` still opens straight from the folder, read-only.
3. Add each key once, in the dashboard's Settings (Connected Accounts, Payments, Web connections). It saves to `.env` and never shows the key again.
4. Then use the dashboard:
   - **Content:** review every post in `posts/`, approve or reject it (or press A and R), edit it next to a live preview, and see it on the calendar.
   - **Automations:** every routine in `routines/` and its steps. **Executions:** each run, from `dashboard/data/executions.json`.
   - **Web & Analytics:** your traffic, pages, search and geography from Google, and your landing pages.
   - **Payments:** revenue on the Dashboard, from `dashboard/data/payments.json`.
   - **Settings:** account, brands, connected accounts, payments, web connections, posting cadence and developer facts.
5. After changing a routine, a post or a setting by hand, run `python3 tools/sync.py` once. `--check` changes nothing and fails if anything is out of date.

Works on Mac, Windows and Linux with Python 3 and nothing else to install.

## How an employee uses it

By default, they don't. This repo holds the keys and runs things, so only the owner and a tech lead get it. Employees work in the company vault.

## Who gets what

| Who | Gets | Access |
|---|---|---|
| Owner | the engine + the company vault | full |
| Tech lead | the engine + the company vault | full |
| Employee | the company vault only | read-only; changes go in as proposals |

## Never holds

This repo never holds teams, skills, brand or company knowledge.

## Not connected

Your departments, agent teams, skills, brand and company knowledge live in your company vault (a separate repo made from tvs-company-vault-template). This repo never reads it.

It never writes or runs it either, and that sentence is the only link between the two. Later, if a whole team needs one shared view, that's a database backend with logins (a company app), never one repo reaching into the other.

## Staying up to date

This repo doesn't update itself, on purpose. `CHANGELOG.md` and `VERSION` show what's shipped since your copy was made. When something looks useful, ask your AI to fetch that piece and place it, never touching your posts, settings or `.env`.

## The honest fine print

This template teaches a way of working. It doesn't run your business for you, and it can't guarantee anything about your accounts, your keys, your platforms, or your results. You own those. The security habits built in here (the env file, the localhost-only server, the checks) lower risk; nothing removes it. When something involves money, passwords, or other people's data, slow down and check it yourself.
