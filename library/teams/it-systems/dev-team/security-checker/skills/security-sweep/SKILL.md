---
name: security-sweep
description: Sweep the repo and anything about to go public for leaks. Use before sharing any live URL, after adding any key, and any time something feels off.
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
