---
name: write-ad-batch
description: "Write 3-5 Meta ads that are genuinely different from each other (idea, hook and format), each matched to its own landing page, with every claim traced to a brand file. Diversity, not volume. Use when the owner says \"write my ads\", \"make an ad batch\", \"new ad creatives\", or /write-ad-batch."
---

# Write an Ad Batch

Meta's ad system looks at the ad itself when it picks who sees it, so a few ads with really different ideas give it more to work with than fifty copies of one idea. The owner walks out with three to five ads, each pointing at its own page.

## Read first
- `brand/icp.md`, `brand/personas/`, `brand/friction-points.md`, `brand/offer.md`, `brand/contrarian-take.md` and `brand/voice.md`. If `brand/icp.md` or The Offer still says `_Not filled in yet._`, stop and name the lesson that fills it.
- The pages the ads will point at (`site/`, one page per promise) and the competitor files in `knowledge/competitors/` (their ads and the gap nobody is filling).

## The guards (these never bend)
- You never turn an ad, an ad set or a campaign on. Everything is built paused, and the owner turns it on in Ads Manager themselves.
- You never touch billing: no payment methods, no spending limits, no budget raises.
- Before every create or change in the ad account, say exactly what you're about to do in one line and wait for the owner's yes.
- The browser is for looking only, at human speed. Never script clicks in Ads Manager, because scripted clicking has gotten ad accounts restricted.
- You never pick a dollar amount. Wherever a budget or a spend number goes, write `[CHECK BUDGET]` and ask the owner, then use the number they give you.
- Keys and tokens go in only through the Keys Agent's add-a-key, into `.env`. Never in a file, a skill or a chat message.

## The job
1. **One ad per page,** and each one with a different idea: a different buyer worry, persona or promise. If two ads would work for the same page with the same hook, they're the same ad, so cut one.
2. **Mix the formats:** a photo, a short phone video of the owner talking, a before and after, a customer's own words (only real ones, with the source). Don't claim one format beats another; the test decides.
3. **Every line traces to a file.** Next to each claim, note the brand file it came from. A line with no file gets cut. Nothing promised that isn't true today, no prices unless they're in `brand/offer.md`.
4. **Read them out loud with the owner** and cut any that feel like a copy of another. Three really different ads beat five near-twins.
5. If the owner mentions "50 to 100 ads a week": that's what huge accounts do. At a small budget it splits the money so thin that no ad gets seen enough to judge, so the answer is a few different ads now and new ones when a winner fades.

## Where it goes
`departments/marketing/ads-team/ad-writer/output/batch-<YYYY-MM-DD>.md`: one section per ad with `Page` (the link it points to), `Idea`, `Format`, `Hook` (first line or first three seconds), `Body`, `Call to action`, and `Sources` (the brand files behind each claim).

## The self-learning rule
- Every correction gets noted. The same correction twice becomes a permanent rule in `departments/marketing/ads-team/ad-writer/ad-writer.md`'s Memory section. A correction about how the owner sounds gets offered to `brand/voice.md`, added only once they confirm, marked (owner confirmed).

## The ending, always
1. Read back what you filed, one line each, naming the file.
2. Run the sync command (`python3 tools/sync.py`, or `py tools/sync.py` on Windows).
3. Save the work with the GitHub Agent's save-work skill (`departments/it-systems/dev-team/github-agent/skills/save-work/SKILL.md`), and tell the owner in one line what changed.

## Done when
A dated batch file holds 3-5 really different ads, each with its page and its sources, and the owner said yes to them.
