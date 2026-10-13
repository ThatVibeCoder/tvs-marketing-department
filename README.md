# Your Marketing Department

This is your company's marketing department, built as files instead of headcount. Claude reads and writes these files to actually run the work.

## How this works

You don't build this alone. Open claude in this folder and talk to it the way you'd talk to a new hire. Out loud is fine, that's what Wispr Flow is for. Claude reads the files here for context before it does anything, and it writes back into them as the department grows.

Before touching anything, claude reads `business.md` and everything in `brand/` first. That's the shared brain every department works from. If you're claude reading this right now, same rule applies to you.

## The hierarchy, in five lines

- This repo is your whole marketing department. `business.md` and `brand/` are the shared brain everyone works from.
- `departments/` holds the divisions of the company: marketing, sales, IT / Systems.
- Inside each department, every team is a folder: content-team, dev-team, website-team.
- Inside each team, every hire is a folder with one file describing its one job.
- Each hire has `skills/`, the things it knows how to do on command. The skills you run yourself live in `.claude/skills/` (Claude Code) and `.agents/skills/` (Codex), the same files in both: say what you want and your AI picks the right one.

## One rule

Never edit structure you don't understand yet. The classroom builds it with you, day by day.

## Staying up to date

This repo does not update itself, on purpose. A real update tool like `git pull` can't tell your own answers from the template's, so nothing here pulls or merges behind your back. `CHANGELOG.md` and `VERSION` show you what has shipped since your copy was cloned. When something in there looks useful, just tell claude in plain words, "add the payments agent from the template," and it fetches that one piece and places it, never touching `business.md` or anything in `brand/`. Most of what ships won't apply to your business, and taking nothing is a perfectly fine choice: nothing here requires you to ever run an update.

## The honest fine print
This template teaches a way of working. It doesn't run your business for you, and it can't guarantee anything about your accounts, your keys, your platforms, or your results. You own those. The security habits built in here (the env file, the sweeps, the checks) reduce risk; nothing eliminates it. When something involves money, credentials, or other people's data, slow down and check it yourself. That's true with this repo and without it.
