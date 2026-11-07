---
name: iterate-a-winner
description: "Take an ad the weekly read called a winner and make 2-3 new versions that change the idea or the look (a new hook, a new face, photo to video), not just the words, so it keeps working as it wears out. Use when the owner says \"make more like the winner\", \"new versions of this ad\", \"my ad is fading\", or /iterate-a-winner."
---

# Iterate a Winner

A winning ad wears out as the same people keep seeing it. This makes new versions that keep what won and change what people see, so the next round starts from proof instead of from scratch.

## Read first
- The newest `knowledge/reports/ads-<date>.md`. If it doesn't name a winner, stop: there's nothing to iterate yet.
- The winning ad in its batch file, its page, and the same brand files write-ad-batch reads.

## The guards (these never bend)
- You never turn an ad, an ad set or a campaign on. Everything is built paused, and the owner turns it on in Ads Manager themselves.
- You never touch billing: no payment methods, no spending limits, no budget raises.
- Before every create or change in the ad account, say exactly what you're about to do in one line and wait for the owner's yes.
- The browser is for looking only, at human speed. Never script clicks in Ads Manager, because scripted clicking has gotten ad accounts restricted.
- You never pick a dollar amount. Wherever a budget or a spend number goes, write `[CHECK BUDGET]` and ask the owner, then use the number they give you.
- Keys and tokens go in only through the Keys Agent's add-a-key, into `.env`. Never in a file, a skill or a chat message.

## The job
1. **Name what won,** in one line: the idea, the hook, or the format. That's what the new versions keep.
2. **Change what people see:** a new hook on the same idea, a new face or setting, a photo turned into a short video (or the other way). Swapping one word in the headline isn't a new version.
3. **Two or three versions,** each still traced to brand files, each still pointing at the same page (or a new page if the promise changed, made by the Page Builder).
4. Show them to the owner and wait for a yes. They go into the NEXT test plan, never added to a live test mid-run.

## Where it goes
`departments/marketing/ads-team/ad-writer/output/batch-<YYYY-MM-DD>.md` (a new dated batch), with a `## Iterates On` line naming the winner and the report that picked it.

## The self-learning rule
- Every correction gets noted. The same correction twice becomes a permanent rule in `departments/marketing/ads-team/ad-writer/ad-writer.md`'s Memory section. A correction about how the owner sounds gets offered to `brand/voice.md`, added only once they confirm, marked (owner confirmed).

## The ending, always
1. Read back what you filed, one line each, naming the file.
2. Run the sync command (`python3 tools/sync.py`, or `py tools/sync.py` on Windows).
3. Save the work with the GitHub Agent's save-work skill (`departments/it-systems/dev-team/github-agent/skills/save-work/SKILL.md`), and tell the owner in one line what changed.

## Done when
A new dated batch with 2-3 versions of the winner that change the idea or the look, traced to brand files, with the owner's yes.
