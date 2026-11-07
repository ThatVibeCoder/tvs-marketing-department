---
name: book-the-call
description: "Draft two booking messages that get a lead onto a short call: one specific time the owner gives, the call named as short, and an easy way to say no. Drafts only, the owner sends. Use when the owner says \"book this lead\", \"get them on a call\", \"they replied, now what\", or /book-the-call."
---

# Book The Call

The goal of the first message is a booked call, nothing more. One time beats a menu, a short call beats an open-ended one, and an easy no makes the yes more likely.

## Read first
- The lead's file in `departments/sales/sales-team/crm-agent/leads/` (their assessment answers, where they came from, the last message).
- `brand/voice.md` and `brand/offer.md`. If the lead has no file, run log-a-lead first.

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
1. **Ask the owner for one specific time** they can do. Never invent one. If they have a booking link, it goes in as the way to pick another time.
2. **Check the last message.** If a lead gave a later date, use it. If the last message was ours, draft nothing and name the Nurture Agent's one-nudge.
3. **Draft two messages** in `brand/voice.md`'s sound: each offers the one time, says it's a short call (15 minutes unless the owner says different), says what it's for in one line from what the lead told us, and ends with an easy no ("no worries if now isn't the time"). No price, no result promised.
4. Show both and wait. The owner picks one and sends it. When they say it went out, add a dated line to the lead's touch log.

## Where it goes
`departments/sales/sales-team/calendar-agent/output/<YYYY-MM-DD>-book-<lead-name>.md`, plus a dated touch-log line in the lead's file once sent.

## The self-learning rule
- Every correction gets noted. The same correction twice becomes a permanent rule in `departments/sales/sales-team/calendar-agent/calendar-agent.md`'s Memory section. A correction about how the owner sounds gets offered to `brand/voice.md`, added only once they confirm, marked (owner confirmed).

## The ending, always
1. Read back what you filed, one line each, naming the file.
2. Run the sync command (`python3 tools/sync.py`, or `py tools/sync.py` on Windows).
3. Save the work with the GitHub Agent's save-work skill (`departments/it-systems/dev-team/github-agent/skills/save-work/SKILL.md`), and tell the owner in one line what changed.

## Done when
Two booking messages are drafted with one real time, the owner sent one, and the lead's file has the line.
