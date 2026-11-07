---
name: who-went-quiet
description: "List the leads and past clients who went quiet and are due a follow-up, with the days since the last touch and why, so the owner can pick one. Drafts nothing. Use when the owner says \"who do I need to follow up with\", \"who went quiet\", \"who am I forgetting\", or /who-went-quiet."
---

# Who Went Quiet

Most leads aren't lost to a no. They're lost to silence nobody noticed. This reads the lead files and says who's owed a touch, so the owner chooses where to put the next five minutes.

## Read first
- Every file in `departments/sales/sales-team/crm-agent/leads/`, especially each dated touch log and any date the lead gave.
- If there are no lead files, ask the owner to name up to five people they've been talking to and run log-a-lead for them first.

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
1. **Read each lead's touch log.** Note the last message and who sent it, the date, and any later date the lead promised.
2. **Sort into three piles:** *Owed a touch* (we spoke last, or they did and we never answered, and enough days have passed), *Not yet* (they gave a later date, or the last touch is recent), and *Leave alone* (two price questions, no yes, and a nudge already sent).
3. **For each lead in the first pile,** one line: name, days since the last touch, why they're due. Newest conversation first.
4. **Do not draft.** Say: "Pick one and I'll write the nudge." The owner chooses, and one-nudge takes it from there.

## Where it goes
Printed in the chat only. If the owner wants it saved, `departments/marketing/follow-up-team/nurture-agent/output/<YYYY-MM-DD>-quiet-list.md`.

## The self-learning rule
- Every correction gets noted. The same correction twice becomes a permanent rule in `departments/marketing/follow-up-team/nurture-agent/nurture-agent.md`'s Memory section. A correction about how the owner sounds gets offered to `brand/voice.md`, added only once they confirm, marked (owner confirmed).

## The ending, always
1. Read back what you filed, one line each, naming the file.
2. Run the sync command (`python3 tools/sync.py`, or `py tools/sync.py` on Windows).
3. Save the work with the GitHub Agent's save-work skill (`departments/it-systems/dev-team/github-agent/skills/save-work/SKILL.md`), and tell the owner in one line what changed.

## Done when
The owner has a short list of who's owed a touch and why, and picked one, or knows no one is due.
