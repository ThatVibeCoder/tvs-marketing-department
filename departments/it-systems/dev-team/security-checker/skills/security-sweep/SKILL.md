---
name: security-sweep
description: "Look for leaked keys and anything exposed in the files that changed, or in the page or connection the owner names, and report CLEAN or exactly where. Use before a live link gets shared. A whole-repo sweep only when the owner asks for a security audit. Not for the standing baseline (harden-the-basics) or whether it works (pre-ship-check)."
---

# security-sweep

Cheap to run, expensive to skip.

## Scope first
A routine sweep covers only what this job touched: the files changed since the last save (`git status` and `git diff` list them), or the one page or connection the owner named. A whole-repo sweep runs only when the owner asks for a security audit. Never open `command-center/data/` or `command-center/assets/` for it.

## Steps
1. Sweep the files in scope for anything key-shaped: long random strings, anything named like a secret. If `.env` is in scope, check that saves still skip it (`git check-ignore .env`).
2. If the scope includes a live page, look at what it exposes: test data, a personal email in a weird place, an endpoint that answers strangers.
3. If the scope includes a form, check where its submissions actually go and who could read them.
4. Report in three lines max: CLEAN, or what leaked and exactly where, and say what was in scope. A leak that already reached GitHub gets flagged as urgent. History keeps copies, so the KEY gets replaced at its source, not just deleted from the file.

## Rules
- Never print a found secret back in full. Name where it is, show its first few characters only.
- The fix for a leaked key is always: new key from the tool, old one turned off. Deleting the file alone fixes nothing and the report says so.
