---
name: review-changes
description: Read the session's changes before they're saved to GitHub. Use before save-work on any session that built or changed pages, skills, or wiring.
---

# review-changes

The read-before-save. Catches the cheap-to-fix-now, expensive-to-fix-later.

## Steps
1. List what changed, in plain words, one line per file. If a file changed that the session's work didn't need to touch, ask why before anything else.
2. **Secrets scan**: nothing key-shaped outside the env file. A key inside page code is visible to every visitor of that page. That's the one finding that stops everything.
3. **Server-side check**: any call that uses a key happens on the server, never in the page the browser gets. "It's in the env file" isn't enough if the page itself makes the call.
4. **Deletion check**: nothing removed that something else still depends on.
5. **Claims check** on anything member-facing: what the page or copy now says is true today.
6. Verdict in one line: SAVE, or the short list of what to fix first.

## Rules
- Review the change, not the style. If it works, is safe, and is honest, ship it: taste corrections go to guidelines.md, not review blocks.
- Never approve a change you didn't actually read. Skimming and approving is worse than not reviewing, because it fakes the safety.
