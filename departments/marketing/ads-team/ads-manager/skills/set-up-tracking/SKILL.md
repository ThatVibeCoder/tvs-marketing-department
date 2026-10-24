---
name: set-up-tracking
description: "Walk the owner through Meta tracking for their landing pages: one pixel and ONE conversion event (a lead, or a booked call), proven with a test lead. The owner does every billing and account click. Use when the owner says \"set up my pixel\", \"install tracking\", \"track my leads\", or /set-up-tracking."
---

# Set Up Tracking

Without tracking, Meta can't tell which ad brought a lead, so it can't go find more people like them. This sets up one pixel and one event, and proves it with a test lead before any ad exists.

## Read first
- `site/` (the live pages the ads will point at) and `brand/offer.md` (what the page asks for: a lead or a booked call).
- `departments/marketing/ads-team/ads-manager/output/tracking.md` if it exists, so you fix what's there instead of starting over.

## The guards (these never bend)
- You never turn an ad, an ad set or a campaign on. Everything is built paused, and the owner turns it on in Ads Manager themselves.
- You never touch billing: no payment methods, no spending limits, no budget raises.
- Before every create or change in the ad account, say exactly what you're about to do in one line and wait for the owner's yes.
- The browser is for looking only, at human speed. Never script clicks in Ads Manager, because scripted clicking has gotten ad accounts restricted.
- You never pick a dollar amount. Wherever a budget or a spend number goes, write `[CHECK BUDGET]` and ask the owner, then use the number they give you.
- Keys and tokens go in only through the Keys Agent's add-a-key, into `.env`. Never in a file, a skill or a chat message.

## The job
1. **Pick the one event.** A form sent (a lead) or a call booked, whichever the page asks for. One event only; more come later.
2. **The owner makes the account parts.** They open Meta Business Suite (business.facebook.com), check they have an ad account, and in Events Manager create a pixel and copy its ID. You talk them through it and never click for them.
3. **Add the pixel to the pages.** Put the pixel and the one event (fired when the form is sent, or the booking lands) into the page files in `site/`. The pixel ID isn't a secret. If any access token is ever needed, it goes in through add-a-key.
4. **Ship it** with the Dev Team's "ship my landing page" workflow, so review, save and deploy all happen.
5. **Prove it.** The owner fills out their own form once, then you both check Events Manager's test view for the event. No event, no done: find out why and fix it.

## Where it goes
`departments/marketing/ads-team/ads-manager/output/tracking.md`: `## Pixel` (the ID and which pages carry it), `## The Event` (what fires it), `## Proven` (the date and how the test lead showed up). The page changes live in `site/`.

## The self-learning rule
- Every correction gets noted. The same correction twice becomes a permanent rule in `departments/marketing/ads-team/ads-manager/ads-manager.md`'s Memory section. A correction about how the owner sounds gets offered to `brand/voice.md`, added only once they confirm, marked (owner confirmed).

## The ending, always
1. Read back what you filed, one line each, naming the file.
2. Run the sync command (`python3 tools/sync.py`, or `py tools/sync.py` on Windows).
3. Save the work with the GitHub Agent's save-work skill (`departments/it-systems/dev-team/github-agent/skills/save-work/SKILL.md`), and tell the owner in one line what changed.

## Done when
The pixel is on every ad page, one event fires on a real test, and tracking.md says so with the date.
