---
name: draft-a-reply
description: "Draft the owner's next reply when a lead or client SAID something: a question, pushback, a price question, or \"let me think about it\". The owner pastes the thread; this writes 2 or 3 drafts that differ in angle, plus a draft for their likeliest answer. Drafts only, the owner sends. Use when the owner says \"how do I reply to this\", \"they said it's too expensive\", \"draft a reply\", or /draft-a-reply."
---

# Draft A Reply

A message from a lead that says something is the most valuable moment in a sale, and the one most often fumbled. This reads what they really said, works out where they are, and gives the owner a few ways to answer in their own voice. The owner picks one and sends it.

## Read first
- The thread the owner pasted (a screenshot or text), and nothing else about the conversation unless the owner adds it.
- `brand/voice.md`, `brand/offer.md` (What It Costs), `brand/friction-points.md`. If any still says `_Not filled in yet._`, stop and name the lesson that fills it (Lock In Your ICP, Build Your Offer).
- The lead's file in `departments/sales/sales-team/crm-agent/leads/` if there is one.

## The guards (these never bend)
- Drafts only, and the owner sends every message to a lead. No agent ever sends.
- No price from memory. The price comes only from `brand/offer.md` What It Costs; otherwise write `[CHECK PRICE]`.
- Never promise a result, a refund or a ranking.
- Never quote a lead's fear or criticism back to them in writing.
- If the last message was ours, draft nothing (or hand it to the Nurture Agent if the gap is long enough).
- One touch, for one lead, at a time. Never draft for a whole list in one go.
- A lead who gave a later date doesn't get chased before that date.
- If they've asked about the price twice with no yes, there's no third nudge.
- If the input isn't enough, name the gap and stop. Never reach into a live system the owner didn't point at.
- Lead files hold real people's details, so the department repo must stay private on GitHub (save-work checks this, or the lesson tells them to).

## The job
1. **Write down only what was really said,** in their words, one line each. A guess about what they meant is labeled a guess.
2. **Check the last message.** If it was ours, draft nothing. Say so, and name the Nurture Agent's who-went-quiet if the gap is long. If they gave a later date, say the date and stop.
3. **Work out where they are:** asking a question, pushing back, comparing, or stalling. One line.
4. **Draft 2 or 3 options that differ in angle** (a direct answer, a question back, a reframe), each in `brand/voice.md`'s sound and short enough to read on a phone. Any price comes from `brand/offer.md` What It Costs or is `[CHECK PRICE]`. Describe the situation, never the person.
5. **Draft their likeliest next message back** and one line for how to answer it, so the owner isn't surprised.
6. Show them to the owner and wait. They pick, edit, and send it themselves.

## Where it goes
`departments/marketing/follow-up-team/reply-agent/output/<YYYY-MM-DD>-<lead-name>.md`, with the headings `## What They Said`, `## Where They Are`, `## Options` and `## If They Say This Next`. A rerun makes a new dated file.

## The self-learning rule
- Every correction gets noted. The same correction twice becomes a permanent rule in `departments/marketing/follow-up-team/reply-agent/reply-agent.md`'s Memory section. A correction about how the owner sounds gets offered to `brand/voice.md`, added only once they confirm, marked (owner confirmed).

## The ending, always
1. Read back what you filed, one line each, naming the file.
2. Run the sync command (`python3 tools/sync.py`, or `py tools/sync.py` on Windows).
3. Save the work with the GitHub Agent's save-work skill (`departments/it-systems/dev-team/github-agent/skills/save-work/SKILL.md`), and tell the owner in one line what changed.

## Done when
The owner has 2 or 3 drafts for one real message, saved in a dated file, and nothing was sent.
