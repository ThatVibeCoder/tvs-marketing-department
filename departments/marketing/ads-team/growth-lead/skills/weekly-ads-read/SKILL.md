---
name: weekly-ads-read
description: "Read the owner's live ads once a week against the test plan: cost per lead and booked calls (never clicks), a page problem vs an ad problem, and ONE recommendation (keep, cut, or make new versions of the winner). Use when the owner says \"read my ads\", \"how are my ads doing\", \"weekly ads report\", or /weekly-ads-read."
---

# Weekly Ads Read

Once a week, this reads the test the way the plan said it would be read, and gives the owner one call instead of five dashboards.

## Read first
- The newest `departments/marketing/ads-team/growth-lead/output/test-plan-<date>.md` (the winner and stop lines) and the campaign file in `departments/marketing/ads-team/ads-manager/output/`.
- The numbers: from the Meta Ads connection if it's set up (read only), or a screenshot or export the owner pastes. Never guess a number you can't see.

## The guards (these never bend)
- You never turn an ad, an ad set or a campaign on. Everything is built paused, and the owner turns it on in Ads Manager themselves.
- You never touch billing: no payment methods, no spending limits, no budget raises.
- Before every create or change in the ad account, say exactly what you're about to do in one line and wait for the owner's yes.
- The browser is for looking only, at human speed. Never script clicks in Ads Manager, because scripted clicking has gotten ad accounts restricted.
- You never pick a dollar amount. Wherever a budget or a spend number goes, write `[CHECK BUDGET]` and ask the owner, then use the number they give you.
- Keys and tokens go in only through the Keys Agent's add-a-key, into `.env`. Never in a file, a skill or a chat message.

## The job
1. **Read only what decides:** spend so far, leads (or booked calls), and cost per lead, per ad. Clicks and likes don't decide anything, so leave them out of the verdict.
2. **Page problem or ad problem?** Clicks with no leads means the page isn't keeping the promise. No clicks means the ad isn't landing. Say which one, and who fixes it (the Page Builder or the Ad Writer).
3. **Check each ad against the lines** in the plan: a winner, a stop, or still learning (not enough spend to tell yet).
4. **One recommendation,** never five: keep it running, cut the ads past the stop line (the Ads Manager drafts the pause for the owner's yes), or have the Ad Writer make new versions of a winner.
5. Say it plainly when the honest answer is "not enough data yet, wait until the end date".

## Where it goes
`knowledge/reports/ads-<YYYY-MM-DD>.md`: `## The Numbers` (per ad: spend, leads, cost per lead), `## Page or Ad`, `## Against the Plan` (winner / stop / learning per ad), `## One Recommendation`.

## The self-learning rule
- Every correction gets noted. The same correction twice becomes a permanent rule in `departments/marketing/ads-team/growth-lead/growth-lead.md`'s Memory section. A correction about how the owner sounds gets offered to `brand/voice.md`, added only once they confirm, marked (owner confirmed).

## The ending, always
1. Read back what you filed, one line each, naming the file.
2. Run the sync command (`python3 tools/sync.py`, or `py tools/sync.py` on Windows).
3. Save the work with the GitHub Agent's save-work skill (`departments/it-systems/dev-team/github-agent/skills/save-work/SKILL.md`), and tell the owner in one line what changed.

## Done when
A dated ads report with the numbers per ad, a page-or-ad call, each ad checked against the plan, and exactly one recommendation.
