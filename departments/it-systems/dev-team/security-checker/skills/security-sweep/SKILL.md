---
name: security-sweep
description: "Look for leaked keys and anything exposed in the files that changed, or in the page or connection the owner names, and report CLEAN or exactly where. Use before a live link gets shared. A whole-repo sweep only when the owner asks for a security audit. Not for the standing baseline (harden-the-basics) or whether it works (pre-ship-check)."
---

# security-sweep

Cheap to run, expensive to skip.

## Steps
1. Sweep the repo for anything key-shaped outside the env file: long random strings, anything named like a secret. The env file itself gets checked for being properly skipped by saves.
2. Look at what's public: does the live page expose anything it shouldn't (test data, personal email in weird places, endpoints that answer strangers)?
3. Check the form path if one exists: where do submissions actually go, and who could read them?
4. Report in three lines max: CLEAN, or what leaked and exactly where. A leak that already reached GitHub gets flagged as urgent. History keeps copies, so the KEY gets replaced at its source, not just deleted from the file.

## Rules
- Never print a found secret back in full. Name where it is, show its first few characters only.
- The fix for a leaked key is always: new key from the tool, old one turned off. Deleting the file alone fixes nothing and the report says so.
