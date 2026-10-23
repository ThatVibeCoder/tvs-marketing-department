---
name: add-from-template
description: Fetch one named piece of the public template (a file or a folder) and place it in this repo, without touching business.md or anything in brand/. Use when the owner says "add X from the template," "get me the latest version of Y," "grab whatever's new for Z," or points at a CHANGELOG.md entry and wants it.
---

# add-from-template

One piece, fetched from the public template, placed in this repo. Never a pull, never a merge: those can't tell your answers from the template's, so this only ever adds what you ask for, one exact path at a time.

## Steps
1. Resolve what they asked for to one exact repo-relative path. "the payments agent," "the ICP skill," "whatever's new for the newsletter team": read `CHANGELOG.md` if that helps place it, then land on ONE path. If you can't resolve it confidently to a single path, ask instead of guessing.
2. Refuse identity files before fetching anything. If the path is `business.md` or anything under `brand/`, stop and say why: those are the owner's own answers, and a drop never touches them. No override, even asked twice.
3. Fetch, never clone. A single file comes from `https://raw.githubusercontent.com/ThatVibeCoder/tvs-marketing-department/main/<path>`. A folder lists its children first from `https://api.github.com/repos/ThatVibeCoder/tvs-marketing-department/contents/<path>`, then fetches each child the same way. These are plain reads: nothing touches this repo's git state or history.
4. Check for a local collision before writing anything. Nothing there yet: write it. Something there already: don't overwrite, describe in plain words how theirs differs from the new one, and ask keep mine, take the new one, or show me both side by side. Only write after they answer.
5. Report back in one short paragraph: what got fetched, where it landed, whether it was new or replaced something, and that `business.md` and `brand/` were never in scope.

## Updating to a new version of the template
When the owner says "update my department to the newest version", read the template's `CHANGELOG.md` from GitHub, compare it to this repo's `VERSION`, and walk each version's "How to update" list in order, one step at a time with the owner's yes. Structure can be added (new folders, new team members, new empty sections in a brand file). The owner's own words in `business.md` and `brand/` are never changed or deleted; adding an empty section heading to those files is allowed, and only with the owner's yes. Run the sync command (`python3 tools/sync.py`, or `py tools/sync.py` on Windows) at the end, then save-work.

## Rules
- Never fetch or write an identity file, whatever the owner asks. Say why and stop, no override.
- Never silently overwrite something that already exists. A collision always gets a question first, and nothing is written until they answer it.
- Informative, not promissory: say what a drop does and does not touch. Never claim an update can't break anything, only what it does and does not reach.
- Offer, don't chain. Fetching one thing doesn't mean fetching whatever sits near it. If there's a natural next piece, name it and let the owner ask for that separately.
