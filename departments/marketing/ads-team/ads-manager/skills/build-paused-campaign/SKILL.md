---
name: build-paused-campaign
description: "Build the owner's test campaign in Meta Ads Manager, always PAUSED, from the approved test plan and ad batch, or walk them through it click by click. Also drafts any later change (pause, cut, budget) for their yes. The owner turns everything on. Use when the owner says \"build my campaign\", \"set up my ads\", \"pause this ad\", or /build-paused-campaign."
---

# Build a Paused Campaign

This turns the approved plan into a real campaign that sits paused until the owner turns it on. It also handles every change after launch as a draft the owner approves, because nothing in the ad account moves on its own.

## Read first
- The newest `departments/marketing/ads-team/growth-lead/output/test-plan-<date>.md`. No plan, or no "Owner Said Yes" in it: stop and run plan-a-test.
- The batch the plan names, and `departments/marketing/ads-team/ads-manager/output/tracking.md` (the event the campaign optimizes for).

## The guards (these never bend)
- You never turn an ad, an ad set or a campaign on. Everything is built paused, and the owner turns it on in Ads Manager themselves.
- You never touch billing: no payment methods, no spending limits, no budget raises.
- Before every create or change in the ad account, say exactly what you're about to do in one line and wait for the owner's yes.
- The browser is for looking only, at human speed. Never script clicks in Ads Manager, because scripted clicking has gotten ad accounts restricted.
- You never pick a dollar amount. Wherever a budget or a spend number goes, write `[CHECK BUDGET]` and ask the owner, then use the number they give you.
- Keys and tokens go in only through the Keys Agent's add-a-key, into `.env`. Never in a file, a skill or a chat message.

## The job
1. **Pick the way in.** If the owner has the official Meta Ads connection set up for their AI, use it, and every create still waits for their yes (keep "turn on" blocked in their settings). If not, walk them through Ads Manager click by click while they do the clicking. Never script the browser.
2. **Build it paused:** one campaign, the objective that matches the tracked event, broad targeting, the plan's budget and end date exactly, and each ad pointing at its own page. Say each create in one line before it happens.
3. **Check it with the owner** in Ads Manager: the budget, the end date, every ad going to the right page, and the status says paused.
4. **They turn it on.** You confirm in one line that it's live and write down the date.
5. **Changes after launch** (a pause, a cut, a budget change): write the change and the reason, in one line each, and only act after the owner says yes. A budget raise is always the owner's own click.

## Where it goes
`departments/marketing/ads-team/ads-manager/output/campaign-<YYYY-MM-DD>.md`: `## Campaign` (name, objective, budget, dates, targeting), `## Ads` (each ad and its page), `## Status` (paused / live, with dates), and `## Changes` (newest on top: date, the change, why, the owner's yes).

## The self-learning rule
- Every correction gets noted. The same correction twice becomes a permanent rule in `departments/marketing/ads-team/ads-manager/ads-manager.md`'s Memory section. A correction about how the owner sounds gets offered to `brand/voice.md`, added only once they confirm, marked (owner confirmed).

## The ending, always
1. Read back what you filed, one line each, naming the file.
2. Run the sync command (`python3 tools/sync.py`, or `py tools/sync.py` on Windows).
3. Save the work with the GitHub Agent's save-work skill (`departments/it-systems/dev-team/github-agent/skills/save-work/SKILL.md`), and tell the owner in one line what changed.

## Done when
The campaign exists exactly as the plan says, it was built paused, the owner turned it on, and every later change in the file has their yes next to it.
