---
name: plan-a-test
description: "Write the owner's ad test plan BEFORE anything launches: which ads, the daily budget and end date (the owner's numbers), broad targeting, and the stop and winner numbers from their target cost per lead. Use when the owner says \"plan my ad test\", \"set up a test\", \"how much should I spend\", or /plan-a-test."
---

# Plan a Test

A test without the rules written first turns into guessing with money. This writes the rules before launch: what's being tested, for how long, at what budget, and what number makes a winner or a stop.

## Read first
- The newest `knowledge/reports/ads-ready-<date>.md`. If there isn't one, or its verdict is "not yet", stop and run ads-ready-check first.
- The newest batch in `departments/marketing/ads-team/ad-writer/output/` and `departments/marketing/ads-team/ads-manager/output/tracking.md`. No proven tracking, no test: run set-up-tracking first.

## The guards (these never bend)
- You never turn an ad, an ad set or a campaign on. Everything is built paused, and the owner turns it on in Ads Manager themselves.
- You never touch billing: no payment methods, no spending limits, no budget raises.
- Before every create or change in the ad account, say exactly what you're about to do in one line and wait for the owner's yes.
- The browser is for looking only, at human speed. Never script clicks in Ads Manager, because scripted clicking has gotten ad accounts restricted.
- You never pick a dollar amount. Wherever a budget or a spend number goes, write `[CHECK BUDGET]` and ask the owner, then use the number they give you.
- Keys and tokens go in only through the Keys Agent's add-a-key, into `.env`. Never in a file, a skill or a chat message.

## The job
1. **What's being tested:** the ads in the newest batch, each with its page.
2. **The money, in the owner's numbers.** Ask for the daily budget and the end date, and write `[CHECK BUDGET]` until they answer. Tell them plainly: a budget too small to get each ad seen won't pick a winner, it only teaches the buttons.
3. **Targeting:** broad, one country or area if the business is local. The different ads do the finding.
4. **The numbers that decide,** from the target cost per lead in the ads-ready report: the winner line (at or under target with enough leads to trust), and the stop line (spent this much with no lead, or cost per lead far over target). Write both before launch, and never move them after.
5. **One campaign at a time.** New launches keep resetting what Meta has learned, so this test runs to its end date before anything new starts.
6. Show the plan to the owner and wait for their yes.

## Where it goes
`departments/marketing/ads-team/growth-lead/output/test-plan-<YYYY-MM-DD>.md`: `## What We're Testing`, `## Budget and Dates` (the owner's numbers), `## Targeting`, `## Winner Line`, `## Stop Line`, `## Owner Said Yes` (the date).

## The self-learning rule
- Every correction gets noted. The same correction twice becomes a permanent rule in `departments/marketing/ads-team/growth-lead/growth-lead.md`'s Memory section. A correction about how the owner sounds gets offered to `brand/voice.md`, added only once they confirm, marked (owner confirmed).

## The ending, always
1. Read back what you filed, one line each, naming the file.
2. Run the sync command (`python3 tools/sync.py`, or `py tools/sync.py` on Windows).
3. Save the work with the GitHub Agent's save-work skill (`departments/it-systems/dev-team/github-agent/skills/save-work/SKILL.md`), and tell the owner in one line what changed.

## Done when
A dated test plan with the owner's budget, an end date, and winner and stop lines written before launch, and the owner's yes recorded.
