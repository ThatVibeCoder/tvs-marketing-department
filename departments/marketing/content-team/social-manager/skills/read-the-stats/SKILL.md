---
name: read-the-stats
description: Read how the week's content performed and say it plainly, score every opener and topic against the owner's own usual numbers (a winner after beating them 3 times, retired after losing 3 times), and bring back one thing to make more of. Use weekly, when the owner says "how did my posts do", "read my numbers", "what's working", or after enough has gone out to mean something.
---

# read-the-stats

The numbers only help if they change what gets made next week. This reads the week, keeps a running score on every opener and topic against the owner's OWN usual numbers (never someone else's), and hands back one thing to make more of.

## Read first
- `departments/marketing/content-team/social-manager/output/post-log.md`: what actually went out, with the final wording and the time. Score the published version, not the draft.
- `knowledge/hooks.md` (which openers are being tested) and `knowledge/topics.md` (which topics were used).
- The last few `knowledge/reports/content-stats-*.md`, so this week is compared to the owner's own run, not to a guess.
- `brand/channels.md` for which platforms count.

## Say this first
Tell the owner, in your own plain words: "I'm reading last week's posts against your own usual numbers, not anyone else's. You'll get the best one, the worst one, what's winning so far, and one thing to make more of next week."

## Steps
1. Pull the numbers for what went out this week, per platform, and judge each piece against its OWN stage's metric: reach pieces on saves, shares, new follows; proof pieces on profile visits and replies; invitation pieces on clicks and opt-ins. Never rank a reach post and an invite post on the same number.
2. Name the best and worst performer, and one honest guess why for each.
3. One recommendation: what to make more of next week. One, not five.
4. Save it as `knowledge/reports/content-stats-<YYYY-MM-DD>.md`, and tell the copywriter it's there. Feed the writer, never shame the writer.

## The scoreboard rule
After the steps above, score every opener and topic that went out:
- **Count what people DO above what they see.** Replies, DMs and sends first, then saves, then comments, then views last. A post with 300 views and 4 DMs beat a post with 3,000 views and none.
- **Compare to the owner's own median,** per platform and per job (give / prove / invite), from their earlier reports. In the first weeks there's no median yet: say so and just record the numbers.
- **A winner** is an opener or topic that beat the owner's median 3 times. Move it in `knowledge/hooks.md` from To Try to **Openers That Won**, with the number that made it win, and give it a slot in next week's plan.
- **Retired** is one that lost to the median 3 times in a row. Move it to **Retired** with one line on why. It leaves the rotation.
- **Keep testing:** about one post in four should use an opener or topic that hasn't been tried yet, so the list keeps learning.
- **Too little data is an answer.** Fewer than 5 posts on a platform this week means "too early to call a winner". Say that instead of crowning one.

Three examples (made-up businesses from the other lessons; never copy them):
- **Marcus, the roofer:** the question opener ("Does a stain mean a new roof?") beat his median on Facebook for the third week in a row: 9 comments and 3 messages against his usual 3 and 0. It's moved to Openers That Won, and next week gets two posts that open with a homeowner's question.
- **Priya, who coaches therapists:** only 4 LinkedIn posts so far, so it's too early to call a winner. The numbers are recorded, and her contrarian-belief opener has 2 wins out of 3.
- **Hannah, the candle maker:** the warning-list opener lost three times in a row on Instagram (saves under half her usual), so it's retired with "her buyers want how-to, not warnings".

## Where it goes
- The report: `knowledge/reports/content-stats-<YYYY-MM-DD>.md`, with the best and worst, the scoreboard (each opener and topic: tries, wins, losses, status) and the one recommendation.
- `knowledge/hooks.md`: openers moved between To Try, Openers That Won and Retired, plus one dated line in its Updates.
- `knowledge/topics.md`: a topic that won gets "won <date>" on its Used line.

## The ending, always
1. Say the one recommendation first, then the best and the worst, in one line each.
2. Hand the recommendation to plan-the-week for next week's plan.
3. Save the work with the GitHub Agent's save-work skill (`departments/it-systems/dev-team/github-agent/skills/save-work/SKILL.md`), and tell the owner in one line what changed.
