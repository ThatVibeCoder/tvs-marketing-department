---
name: one-nudge
description: "Draft ONE follow-up message for ONE quiet lead or past client, timed from their touch log. If it is too soon, it drafts nothing and says the date it is due. Drafts only, the owner sends. Use when the owner says \"nudge them\", \"follow up with this person\", \"write the check-in\", or /one-nudge."
---

# One Nudge

A good nudge reads like a person remembered them, not like a sequence fired. One lead, one message, one easy way to answer.

## Read first
- The one lead's file in `departments/sales/sales-team/crm-agent/leads/` and the newest message in it.
- `brand/voice.md`, `brand/offer.md` (What It Costs), `brand/friction-points.md`. If any still says `_Not filled in yet._`, stop and name the lesson that fills it (Lock In Your ICP, Build Your Offer).

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
1. **Ask which lead** if the owner didn't say. Never write for a list.
2. **Check the touch log.** Last message ours and sent recently: too soon, draft nothing, give the date it's due. They gave a later date: say the date and stop. Two price questions and no yes with a nudge already out: no third nudge, say why.
3. **Draft one message,** short, in `brand/voice.md`'s sound, that points at something specific from their file (what they asked, what they were working on) and asks one easy question. Any price is from `brand/offer.md` What It Costs or `[CHECK PRICE]`. Never name their fear or hesitation.
4. Show it and wait. When the owner says it went out, add one dated line to the lead's touch log.

## Where it goes
`departments/marketing/follow-up-team/nurture-agent/output/<YYYY-MM-DD>-<lead-name>.md`, plus one dated line in the lead's file once the owner says it was sent.

## The self-learning rule
- Every correction gets noted. The same correction twice becomes a permanent rule in `departments/marketing/follow-up-team/nurture-agent/nurture-agent.md`'s Memory section. A correction about how the owner sounds gets offered to `brand/voice.md`, added only once they confirm, marked (owner confirmed).

## The ending, always
1. Read back what you filed, one line each, naming the file.
2. Run the sync command (`python3 tools/sync.py`, or `py tools/sync.py` on Windows).
3. Save the work with the GitHub Agent's save-work skill (`departments/it-systems/dev-team/github-agent/skills/save-work/SKILL.md`), and tell the owner in one line what changed.

## Done when
One nudge is drafted for one lead and the owner sent it, or it said the date the touch is due and drafted nothing.
