---
name: log-a-lead
description: "Turn an assessment, a DM, an email or a form fill into one file for that lead, with where they came from, what they said in their own words, and a dated touch log. One file per lead, call notes go inside it. Use when the owner says \"log this lead\", \"someone took my assessment\", \"save this lead\", or /log-a-lead."
---

# Log A Lead

A lead you can't find again is a lead you lost. One file per person, kept in one place, so every other team member reads the same facts and call notes never get copied anywhere else.

## Read first
- What the owner pasted or pointed at: the assessment answers, the DM, the email. Nothing else.
- `brand/icp.md` (Who They Are Not), so the file can note a fit tell without scoring anyone.
- `departments/sales/sales-team/crm-agent/leads/`, to find out whether this person already has a file. Never make a second one.

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
1. **Check for an existing file** for this person. If there is one, add to it. If not, make `<lead-name>.md` (lowercase, dashes).
2. **Fill the file** with these headings: `## Who` (name, how to reach them), `## Where They Came From` (assessment, DM, email, form, and the date), `## In Their Words` (what they said, quoted, only what was really said), `## Fit Notes` (one line from `brand/icp.md`, or "not enough to say"), `## Touch Log` (dated lines: who sent what, last message first), `## Call Notes` (empty until a call happens; notes go here and nowhere else).
3. **A transcript is a claim, not a decision.** Write "said she'd send it", never "sent". Missing details get "not given", never a guess.
4. If the repo isn't private on GitHub, say so before saving. Real people's details go in these files.

## Where it goes
`departments/sales/sales-team/crm-agent/leads/<lead-name>.md`, one file per lead.

## The self-learning rule
- Every correction gets noted. The same correction twice becomes a permanent rule in `departments/sales/sales-team/crm-agent/crm-agent.md`'s Memory section. A correction about how the owner sounds gets offered to `brand/voice.md`, added only once they confirm, marked (owner confirmed).

## The ending, always
1. Read back what you filed, one line each, naming the file.
2. Run the sync command (`python3 tools/sync.py`, or `py tools/sync.py` on Windows).
3. Save the work with the GitHub Agent's save-work skill (`departments/it-systems/dev-team/github-agent/skills/save-work/SKILL.md`), and tell the owner in one line what changed.

## Done when
The lead has one file with the headings filled from what was really given, and no duplicate exists.
