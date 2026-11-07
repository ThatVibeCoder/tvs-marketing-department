---
name: connection-check
description: "Walk every tool that's already wired and confirm each one still answers. Use when a tool that worked stops working, or the owner says check my connections. Not for connecting a new tool (wire-a-tool) or a form that isn't sending (fix-my-form)."
---

# connection-check

Doors rust quietly. This catches it before a build fails at the worst moment.

## Steps
1. List every door: each key in the env file, each connector, each CLI login. That list IS the department's tool roster.
2. For each, make its smallest real call. Works, or doesn't. No maybes.
3. For any door that failed: say which team member depends on it and what's blocked until it's fixed. Fixing usually means a fresh key from the tool's own site, through add-a-key.
4. Report the roster in one screen: door, owning team member, status, what it costs per month ("free" or the real number), last checked. The roster IS the tool-spend tracker. A member who wants a prettier view can mirror it into a Notion tracker, but this list alone is complete.

## Rules
- Never test a door with an expensive call. Smallest thing the tool can do, always.
- A door nobody uses anymore gets flagged for removal: fewer doors, less to leak.
