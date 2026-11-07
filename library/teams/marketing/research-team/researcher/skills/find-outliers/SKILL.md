---
name: find-outliers
description: "Find the posts in your space doing far better than their own channel's size, and write down the shape that made them work, so the content team copies the shape, never the post. Saves the top three to knowledge/outliers.md. Free tools only. Use monthly, in the marketing checkup, or when the owner says find outliers, what's working in my space, what's going viral in my niche, or what should I post."
---

# find-outliers

A big account getting a lot of views tells you nothing: it gets a lot of views on everything. A small account getting ten times its usual views tells you something real, because the idea beat the audience. Those posts are outliers, and the shape behind them is the most useful thing a content team can be handed.

This is a look, not a data pull: open public profiles the way a visitor would and read the numbers the platform shows to everyone. No paid scraping tools, no databases, no logins, no analytics trackers. Any AI that can open a web page can run it. If yours can't open pages, ask the owner to paste the profile links and screenshots of the post grids, and work from those.

## Read first
1. `brand/channels.md`: **Where You Show Up** says which one or two platforms to look at. Outliers from a platform the owner never posts on don't help them.
2. `knowledge/topics.md`: the owner's topics. They tell you what "your space" means, and every outlier ends with a line tying its shape to one of these topics.
3. `brand/icp.md`: the one person. An account in your space is one that person already follows or would.
4. `knowledge/competitors/`: every competitor file's **Where They Post**. Those accounts are the first ones to check, and their links are already there.
5. `knowledge/outliers.md`: the blocks from earlier runs. A post that's already listed doesn't get listed again.
6. The opener bank and the five structures in the Copywriter's write-hooks skill (`departments/marketing/content-team/copywriter/skills/write-hooks/SKILL.md`), if the Content Team is added. Name each shape in the same words the content team already uses. If it isn't added yet, describe the shape in plain words instead.

**If Where You Show Up says `_Not filled in yet._` and there are no competitor files:** stop. Ask in one line: "Which one or two platforms do you post on, and who are two or three accounts in your space you'd want to look like?" Don't pick platforms for the owner.

## Say this first
"I'll look at about [5 to 10] accounts in your space on [their platforms], work out what a normal post gets for each one, and find the posts doing at least ten times that in the last 60 days. Then I'll save the top three to `knowledge/outliers.md` with the shape that made each one work. I'm starting from [the competitor accounts, or the accounts they named]. Anyone to add or skip?"

Wait for the answer. The owner often knows the account everyone in their space is quietly copying.

## Steps
1. **Pick the accounts.** Five to ten, on the owner's platforms only:
   - the competitor accounts from `knowledge/competitors/` first;
   - then accounts the owner's buyer follows: search the platform for the owner's topics and the words their buyer would type, and note who keeps showing up;
   - small and mid-size accounts beat famous ones. An account with 2,000 followers is a better place to find an outlier than one with 2 million.
2. **Work out each account's normal.** Open the public profile and read the number the platform shows on the last 20 posts: views for videos (TikTok, Reels, YouTube, Shorts), likes or comments where there are no views (carousels, text posts). Use the same number for every post on that account. Line the 20 numbers up from low to high; the middle one is that account's normal (its median). Write it down.
   - If a platform hides the numbers unless you log in, don't log in. Use what it shows publicly, or skip that account and say so.
   - Fewer than 10 posts to read means there's no honest normal yet. Skip the account.
3. **Find the outliers.** Any post from the last 60 days with at least 10 times that account's normal. Note the link, the date, its number and the account's normal, like "41,000 views on a normal of 3,200 (13x)".
   - Never lower the bar to fill three slots. If only one post clears 10x this month, the block has one post, and the ending says so. A quiet month is a finding.
   - Pinned posts and paid ads don't count: they got pushed, they didn't win.
4. **Name the shape, not the topic.** For each outlier, write down what someone could reuse on a completely different subject:
   - the opener: which shape from the write-hooks opener bank it uses (for example "result first", "their question, read out loud");
   - the structure: which of the five structures carries it (for example "list, best one last");
   - the format: a 30-second talking video, a 7-slide carousel, a one-line text post.

   Test it: could the owner use this shape on one of their own topics without touching the original's subject? If the honest answer is "it worked because of the topic", say that instead. That's a topic finding, and it goes in the block as one.
5. **Pick the top three** by the size of the gap (13x beats 11x), at most one per account, so one lucky account doesn't fill the whole block.
6. **Write the block.** Add a dated block to `knowledge/outliers.md`, just under the intro and above any older blocks, so the newest month is always on top. If the file still says `_None yet._`, replace that marker with the block. The shape:
   ```
   ## 2026-11-07
   1. [link] · @account · 41,000 views on a normal of 3,200 (13x)
      Shape: result first + list, best one last · 30-second talking video
      For us: [one line: which topic from knowledge/topics.md this shape could carry, and how]
   ```
   Then run the sync command (`python3 tools/sync.py`, or `py tools/sync.py` on Windows), so the Command Center's Content → Research → Outliers shows it.

## Worked example (a made-up candle shop)
Hannah sells hand-poured candles and posts on Instagram and TikTok. Her competitor files list three accounts, and a search for "candle tips" adds three small makers. One of them, @slowburnstudio.example, has 1,900 followers and a normal of 2,400 views on its last 20 reels. Its reel from three weeks ago has 38,000 (16x).

What the reel is about doesn't matter here (wick trimming). What made it work does: it opens on two candles side by side, one tunneled and one burned even, and the first words are "One of these cost me $30 for nothing." That's **visual first** into **before, after, the bridge**, as a 20-second video.

Her block in `knowledge/outliers.md`:
```
## 2026-11-07
1. tiktok.com/@slowburnstudio.example/video/... · @slowburnstudio.example · 38,000 views on a normal of 2,400 (16x)
   Shape: visual first + before, after, the bridge · 20-second video, no talking for the first 2 seconds
   For us: "the first burn" topic. Open on a tunneled candle next to an even one, then the two-hour rule.
2. instagram.com/p/... · @northsidecandle.example · 610 likes on a normal of 48 (13x)
   Shape: their question, read out loud + question, flat answer, because · 6-slide carousel
   For us: "why candles smell weaker at home" topic. Slide one is the question exactly as customers ask it.
```
Only two posts cleared 10x this month, so the block has two, and the ending says so.

## The ending
Tell the owner, in a few lines:
- how many accounts were checked, on which platforms, and how many posts cleared 10x;
- the one shape showing up more than once, if there is one (two outliers with the same opener is a pattern, one is a post);
- anything surprising: a tiny account beating everyone, or a competitor whose outlier is the opposite of what they usually post.

Then offer exactly one next step. If the Content Team is added, it's this: "Want the Social Manager to give one of next week's posts this shape?" (plan-the-week gives a winning shape a slot). If it isn't, offer to add the top shape's topic line to `knowledge/topics.md` once the owner says yes. One offer, never a menu.

The block stays in `knowledge/outliers.md`, where the content team and the monthly marketing checkup read it.

## Rules
- Every outlier carries its link, its number and the account's normal. A post with no link doesn't go in.
- Public pages only. Never log in, never use a paid scraper, never install anything to do this.
- Never copy an outlier's words, video or images into the owner's work. The shape transfers; the post doesn't.
- The numbers are what the platform showed on the day you looked. Say "about" when you rounded, and keep the date on the block.
- Ten times the account's own normal, in the last 60 days. Not ten times someone else's, and not an old post that's still collecting views.
