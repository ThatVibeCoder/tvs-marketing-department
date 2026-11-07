---
name: harden-the-basics
description: The standing security baseline for everything this department ships. Use once when the first page goes live, and again whenever something new starts talking to the internet.
---

# harden-the-basics

Not paranoia, and not a guarantee: a baseline that reduces risk for a small business shipping with AI. Security is never finished; this is the floor, not the ceiling.

## The baseline
1. **Keys live in the env file, and the calls that use them happen server-side.** An env var that a page still references client-side is exposed anyway. The key stays on the server and so does the call.
2. **Nothing secret in page code, ever.** Everything a browser downloads, a stranger can read. That includes "hidden" admin links and test pages. If it's live, it's public.
3. **Forms validate what they accept and deliver somewhere private.** Your inbox is private. A public spreadsheet is not.
4. **The live platform gives you https for free. Keep it.** No custom setup that downgrades what the host already secures.
5. **Warnings are not breaches.** A dashboard flagging "this looks secret" is an advisory to check, not a fire. An actual leaked key IS a fire: new key from the tool's site, old one turned off. Deleting the file alone fixes nothing, history keeps copies.
6. **Fewer doors, less to leak.** Tools nobody uses anymore get unwired. The api-manager's connection-check keeps this honest.

## Rules
- Run this as a checklist, report each line as fine or fixed. No vague "looks secure."
- When something's beyond this list (payments, member logins, real user data), say plainly that it's beyond the baseline and needs its own pass before shipping.
