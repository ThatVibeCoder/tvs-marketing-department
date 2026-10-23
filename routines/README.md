# Routines

Scheduled work your department does without you. One folder per routine, each with a `README.md` that starts with this header:

```
---
name: Weekly Traffic Report
team: Website Team
status: planned
schedule: every Monday 6am
purpose: one sentence on what it does
---
```

`status:` is `planned` or `live`. Under the header: the steps it runs. After adding or changing a routine, run the sync command (`python3 tools/sync.py`, or `py tools/sync.py` on Windows) and it shows up in the Command Center's Automations page.
