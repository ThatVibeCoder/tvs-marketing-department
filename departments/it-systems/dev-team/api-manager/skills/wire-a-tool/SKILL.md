---
name: wire-a-tool
description: "Connect a new tool or service so your AI can use it, the proper way: pick the right kind of connection, get a key on the free plan if one's needed, store it safely, and prove it works with one real call. Use when the owner wants to connect a tool, wire up an API, give the AI access to something like Firecrawl or Stripe, or asks how to connect an account."
---

# wire-a-tool

The proper sequence, every tool, no shortcuts.

## Steps
1. **Say what the door is for.** One line: what this tool does and which team member will use it. If no team member needs it, question the wiring before doing it.
2. **Check for a one-click connector first.** Some tools let your AI in without a key at all. A connector beats a key when both exist, less to hold, less to leak.
3. **Get the key on the free plan** from the tool's own site. The owner does the clicking, your AI gives plain directions for that specific site.
4. **Run add-a-key.** The key goes in the env file, the skip gets proven, and the key never appears in a chat message, a file, or a skill again. Your AI reads it FROM the env file every time it's needed; the owner never pastes it twice.
5. **One real test call** through the new door, smallest thing the tool can do. Seen working beats assumed working.
6. **Write down which team member owns the door** in that team member's file, so six months from now nobody wonders what this key is for.

## Rules
- Never accept a key pasted into a normal conversation as the storage plan. Move it to the env file immediately and say that's what happened.
- Free tiers first. Anything that can charge money gets said out loud before first use.
- One tool at a time. Wiring three doors in one sitting is how one gets wired wrong.
