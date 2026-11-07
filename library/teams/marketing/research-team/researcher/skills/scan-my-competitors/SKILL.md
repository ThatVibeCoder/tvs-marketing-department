---
name: scan-my-competitors
description: "First look at every competitor: what their website looks like and pushes, and which platforms they post on most and how often. One file each in knowledge/competitors/, shown in the Command Center under My Business, Competitors. Free tools only. Use when the owner says scan my competitors, who are my competitors, what are my competitors posting, or where do my competitors post."
---

# scan-my-competitors

A first look at who else your buyers could pick: what each competitor's website says and asks for, and where they show up online. It's the groundwork for everything after it. The landing page, your content plan and the deeper competitor-check all start from these files.

This is a look, not a data pull: read their public pages the way a customer would. No paid scraping tools, no databases, no logins, no follower-count trackers.

## Read first
1. `business.md`: **Who Else They Could Pick** is the starting list. Also read **What You Sell** and **Who buys it**, so you know what "the same thing" means here.
2. `brand/icp.md`: the one person. A competitor is someone that person could pick instead of you.
3. `knowledge/competitors/README.md` and every file already in `knowledge/competitors/`. Never make a second file for a competitor that already has one; add to it.
4. `knowledge/competitors/_template.md`: the shape every file follows.

**If Who Else They Could Pick says `_Not filled in yet._` and the owner names nobody:** stop. Say in one line that the Brain-Dump Your Business lesson fills it, and ask: "Who would your customers pick if you didn't exist? Name two or three, even rough ones." Don't guess a list from a web search and present it as theirs.

## Say this first
"I'll look at each competitor's website and find where they post most and how often, then save one file each in `knowledge/competitors/`. I'm starting from [the names in business.md]. Anyone to add or skip before I start?"

Wait for the answer. The owner knows who they actually lose sales to.

## Steps, for each competitor
1. **Find the website.** Search the name plus what they sell. Confirm it's the right business (same product, same kind of buyer, same area if it's local). If you can't confirm it, write `Website: not found` and say so. Never guess a URL.
2. **Read the home page like a customer.** Capture, word for word:
   - the main headline;
   - the first button or ask ("Shop now", "Book a call", "Get a quote");
   - what the menu offers;
   - the price, if it's shown;
   - the look in a few words: clean or busy, photo-led or video-led, bright or dark.

   This goes in **Their Website**. The headline also goes in **What they lead with**.
3. **Find where they post.** Look at the links in the site's header and footer first, then search the name on each platform: Instagram, TikTok, YouTube, Facebook, LinkedIn, X, Threads, Pinterest, plus their email list sign-up if there is one. For each account that exists, open its public page and note:
   - the link;
   - roughly how often they post, from the dates of the last 10 or so posts ("4 a week", "daily", "twice a month", "nothing since March");
   - the kind of post (reels, carousels, long videos, text threads, promos).

   One line per platform, busiest first, in **Where They Post**. In the At a Glance block:
   - **Main platforms** = the top two or three, comma separated;
   - **How often they post** = one short line, like "Instagram 4x a week; TikTok daily".
4. **Tier it.** Use the labels from competitor-check:
   - **direct**: same thing, same buyer;
   - **indirect**: a different thing that solves the same problem;
   - **aspirational**: a big name to study for shape.

   If you're unsure, ask the owner rather than pick.
5. **Write the file.** Copy `knowledge/competitors/_template.md` to `knowledge/competitors/<competitor-name>.md` (lowercase, dashes, like `northside-candle-co.md`).
   - Fill At a Glance and the sections you have evidence for.
   - Leave a section empty rather than guess.
   - Add one dated line under **What Changed**, like `- 2026-11-07: first scan (website + platforms)`.
   - **Our angle against them** stays `_Not filled in yet._` unless the owner says it. That line is their call, not yours.
6. **List it.** Add one line to the Summary in `knowledge/competitors/README.md`: name, tier, what they lead with, main platforms. If the Summary still says `_None yet._`, replace that marker.

## Worked example (a made-up candle shop)
`knowledge/competitors/northside-candle-co.md`, At a Glance:
```
Website: northside-candle.example
Tier: direct
What they lead with: "Luxury candles for every room"
Price: $24-$38, shown on every product
Main platforms: Instagram, Pinterest, Facebook
How often they post: Instagram 4x a week; Pinterest daily; Facebook weekly promos
Our angle against them: _Not filled in yet._
```
Where They Post:
```
- Instagram (instagram.com/northsidecandle.example): about 4 posts a week, mostly reels of lit candles in styled rooms
- Pinterest: a pin a day, room photos linking to product pages
- Facebook: one promo post a week, discount codes
```

## The ending
Tell the owner, in a few lines:
- how many competitors were scanned and where the files are;
- the platform most of them lean on, and the one nobody is using (that gap is often the opening);
- anything surprising, like a competitor that stopped posting or one whose headline sounds like the owner's.

Then offer exactly one next step. Either the deeper competitor-check (reviews, complaints and pricing), or, if the owner has the Website Team, a look at their own headline next to the competitors' headlines. One offer, never a menu.

The files stay in `knowledge/competitors/`, where every team that needs them reads them.

## Rules
- Every claim carries where you saw it. A platform count with no link doesn't go in.
- Public pages only. Never log in, never use a paid scraper, and never install anything to do this.
- Never copy a competitor's sentences into the owner's copy. Headlines get quoted in the competitor's file, as research, and nowhere else.
- How often they post is an estimate from recent dates. Say "about".
- A competitor with no website and no accounts still gets a file that says so. That's a finding.
