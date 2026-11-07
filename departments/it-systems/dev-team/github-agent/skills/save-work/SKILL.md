---
name: save-work
description: Save the session's work to GitHub with history you can undo to. Use when the owner says "save my work", at the end of every session, and after anything worth keeping.
---

# save-work

The end-of-session habit. One line from the owner, everything safe.

## Steps
0. Run the sync check: `python3 tools/sync.py --check` on a Mac or Linux, `py tools/sync.py --check` on Windows. If Python isn't installed, follow "If none of those work" in AGENTS.md (install it, or sync the new skill by hand) and say so. If it says something is out of date, run `python3 tools/sync.py` and include what it rebuilt. If it prints a FIX line, fix that first (or tell the owner what's wrong) before saving.
1. Look at what changed since the last save. Say it back in one plain line ("your voice file and two drafts changed").
2. Save it as one checkpoint with a message that says what happened in normal words, not code words.
3. Send it up to GitHub so it exists somewhere besides this one machine.
4. Confirm with the one line that matters: "Saved. github.com has it."

## Rules
- Never save the env file or anything that looks like a key. The repo is set up to skip these; if one ever shows up as changed, STOP and say so before doing anything.
- If the save fails, say what happened in plain words and what you're trying next. Never leave the owner unsure whether their work is safe.
- History is sacred: never rewrite or delete old checkpoints.
