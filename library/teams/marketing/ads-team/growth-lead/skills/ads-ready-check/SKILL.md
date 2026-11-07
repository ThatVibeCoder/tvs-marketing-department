---
name: ads-ready-check
description: "Check whether the owner is ready to spend on ads: offer and ICP filled, a live page whose form reaches the inbox, real customers without ads, and a target cost per lead. Gives a yes or a short fix list. Use when the owner says \"am I ready for ads\", \"should I run ads\", \"ads ready check\", or /ads-ready-check."
---

# Ads Ready Check

Ads don't fix a page that doesn't work. They send more people to it, so a broken page fails faster and costs money doing it. This check runs before any ad gets built, and the owner walks out with a yes or a short list of what to fix first, plus the most they'll pay for one lead.

## Read first
- `business.md` (The Economics, How Customers Find You, Won't Do / Already Tried), `brand/icp.md` and `brand/offer.md`. If `brand/icp.md` or The Offer in `brand/offer.md` still says `_Not filled in yet._`, stop and name the lesson that fills it (Lock In Your ICP, Build Your Offer).
- `site/` and the newest file in `knowledge/reports/`, to see whether a page is live.

## The guards (these never bend)
- You never turn an ad, an ad set or a campaign on. Everything is built paused, and the owner turns it on in Ads Manager themselves.
- You never touch billing: no payment methods, no spending limits, no budget raises.
- Before every create or change in the ad account, say exactly what you're about to do in one line and wait for the owner's yes.
- The browser is for looking only, at human speed. Never script clicks in Ads Manager, because scripted clicking has gotten ad accounts restricted.
- You never pick a dollar amount. Wherever a budget or a spend number goes, write `[CHECK BUDGET]` and ask the owner, then use the number they give you.
- Keys and tokens go in only through the Keys Agent's add-a-key, into `.env`. Never in a file, a skill or a chat message.

## The job
1. **Check the four things,** one line each, pass or fix:
   - The offer and the ICP are filled in.
   - A landing page is live, and its form lands in the owner's inbox (ask them to send a test if you can't see one).
   - They've had real customers without ads. If they haven't, say so plainly: ads multiply what already works, so the first job is one customer the slow way.
   - They've decided what one lead is worth paying for.
2. **Work out the target cost per lead with them.** Use what a customer is worth from The Economics. Show the math in plain words and let them pick the number. Never pick it for them; write `[CHECK BUDGET]` until they do.
3. **Give the verdict:** "ready" or "not yet, fix these first", with the fixes in order and the lesson or team member that handles each.
4. If `business.md` Won't Do / Already Tried says they won't run ads, stop and ask before going further.

## Where it goes
`knowledge/reports/ads-ready-<YYYY-MM-DD>.md`, with these headings: `## Verdict` (ready or not yet), `## The Four Checks` (one line each), `## Target Cost Per Lead` (the number they picked and the math), `## Fix First` (in order, or "nothing"). A rerun makes a new dated file, so the history stays.

## The self-learning rule
- Every correction gets noted. The same correction twice becomes a permanent rule in `departments/marketing/ads-team/growth-lead/growth-lead.md`'s Memory section. A correction about how the owner sounds gets offered to `brand/voice.md`, added only once they confirm, marked (owner confirmed).

## The ending, always
1. Read back what you filed, one line each, naming the file.
2. Run the sync command (`python3 tools/sync.py`, or `py tools/sync.py` on Windows).
3. Save the work with the GitHub Agent's save-work skill (`departments/it-systems/dev-team/github-agent/skills/save-work/SKILL.md`), and tell the owner in one line what changed.

## Done when
A dated ads-ready report exists with a verdict, the four checks, and a target cost per lead the owner picked, or a fix list.
