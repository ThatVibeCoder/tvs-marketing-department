---
name: add-a-key
description: Put a new API key somewhere safe and prove the save skips it, the only way a key gets stored in this department. Use when a tool just handed the owner a key, they're wondering where an API key goes, whether their key is safe, or they say "here's the key" or ask how to save credentials.
---

# add-a-key

A key is a password to a tool's door. This is the only way one gets stored.

## Steps
1. The owner pastes the key in chat with your AI, once. It goes straight into the `.env` file at the top of the repo (that exact name, dot-env, never keys.env or prod.env or anything creative). Saving skips that file, so it doesn't ride along to GitHub.
2. Prove the skip: check that the env file does not show up as something about to be saved. Show the owner that check in one line.
3. Use the key for one small real thing immediately (its tool's simplest call) so "it works" is seen, not assumed.
4. Tell the owner which team member now has this door open and what it'll be used for.

## Rules
- Keys go in the env file. Not in any other file, not in a team member's notes, not in a skill, not in chat history beyond the paste.
- If a key ever appears anywhere else in the repo, stop everything and say so. That's a fire, not a chore.
- Free tiers first, always. A key that can spend money gets said out loud before it's ever used.
