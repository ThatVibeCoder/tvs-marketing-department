# Routines

Scheduled work the engine does without you. One folder per routine, each with a `README.md` that starts with this header:

```
---
name: Weekly Traffic Report
team: Web
status: planned
schedule: every Monday 6am
purpose: one sentence on what it does
---
```

`status:` is `planned` or `live`. `team:` is a short label for who runs it (it groups the card on the Automations page). Under the header, a `## Steps` section with numbered steps. Each run can add one line to `dashboard/data/executions.json`. After adding or changing a routine, run the sync command (`python3 tools/sync.py`, or `py tools/sync.py` on Windows) and it shows up on the dashboard's Automations page.
