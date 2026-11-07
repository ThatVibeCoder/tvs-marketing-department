---
name: weekly-traffic-read
description: Read the week's traffic and say it plainly. Use weekly, this is what the Your Weekly Traffic Read lesson turns into a routine.
---

# weekly-traffic-read

## Where the numbers come from
The Command Center's Web pages (Web in its sidebar) read `command-center/data/web.json`, which `tools/pull_web.py` fills from the owner's Google Analytics 4 and Search Console, read-only. Run `python3 tools/pull_web.py` (Windows: `py tools/pull_web.py`) first so the numbers are fresh, then read that file: `ranges.7d` for the week against the week before, `sources` for where people came from, `topPages`, and `search` for what they searched. If it says nothing is connected, say so in one line and point the owner at Web → Settings in the Command Center, which walks through connecting it (about 15 minutes, once). Form fills aren't in that file: read them from wherever the page's form sends them. Never guess a number.

## Steps
1. Pull the week's numbers: visitors, where they came from, what they did (form fills count most).
2. Three lines, plain words: how many came, the biggest source, the one thing worth doing about it.
3. Compare to last week in one line: better, worse, or flat, and the honest guess why.
4. Save it as `knowledge/reports/traffic-<YYYY-MM-DD>.md`, and show the owner the three lines. When the Your Weekly Traffic Read lesson arrives, this exact skill becomes the scheduled routine.

## What to offer next
If a page is getting traffic but no form fills, offer the funnel walk: page-copy + speed-check on that page. One offer, when the numbers point at it.

## Rules
- Small numbers are fine to report plainly. "Eleven visitors, four from the newsletter" is a real read; dressing it up isn't.
- One recommended action, not five. The read exists to cause one decision.
