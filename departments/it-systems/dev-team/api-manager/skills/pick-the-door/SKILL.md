---
name: pick-the-door
description: "Choose the right kind of connection for one new tool before anything is wired. Use as wire-a-tool's first step, or when the owner asks how should my AI talk to X. Not for doing the wiring (wire-a-tool)."
---

# pick-the-door

Three kinds of door, in order of preference.

## The order
1. **Connector first.** One-click, no key to hold, nothing to leak. If the tool offers your AI a connector, take it and stop.
2. **CLI second.** A command-line tool you log into once (the Vercel deploy tool works this way) beats raw keys: auth handled once, commands do the rest.
3. **API key last.** The most flexible and the most to hold. Through wire-a-tool and add-a-key, key in the env file, never anywhere else.

## Rules
- The fanciest door is not the best door. The best door is the one with the least to go wrong for what this department actually needs.
- Say the choice and the one-line why before wiring. The owner should never wonder how your AI talks to their tools.
