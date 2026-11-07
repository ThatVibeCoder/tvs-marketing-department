---
name: pre-ship-check
description: "Use the thing that's about to ship the way a stranger would (click the links, send the form, run the routine once) and report WORKS or what broke. Use right before a page goes live, a form gets shared or a routine gets a schedule, and at the Check step of set up my code base. Not for leaks or secrets (security-sweep), the security baseline (harden-the-basics) or reading the code (review-changes)."
---

# pre-ship-check

The stranger test. Report what broke, plainly, before it ships.

## Steps
1. Name what's being checked and what "working" means for it, in one line each.
2. Use it like a stranger: click the links, submit the form with a real-shaped answer, load it fresh. For a key: make its simplest real call. For a routine: run it once by hand.
3. Check the quiet failures too: does the page load on a phone-sized window, does the form actually deliver its answer somewhere. (Secrets and leaks are security-sweep's job.)
4. Report: WORKS, or a short list of what broke, each with where it lives. No jargon, no maybes.

## Rules
- Never sign off on something you didn't actually run. "It should work" is not a result.
- Finding nothing wrong is a fine report. Manufacturing concerns to look thorough wastes the owner's trust.
