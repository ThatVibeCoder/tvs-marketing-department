---
name: content-brain
description: "Decide what the owner's content is for before anything gets written: the 4 questions every post answers, the 1 or 2 platforms they post on first, and 20 topics their buyer cares about. Fills Where You Show Up in brand/channels.md and knowledge/topics.md. Use when the owner says \"what should my content be about\", \"pick my platforms\", \"give me topics\", \"set up my content\", or /content-brain."
---

# Content Brain

Before the Content Team writes a single post, it needs to know what the posts are FOR, where they go, and what they're about. This sets all three in one sitting, so every post after it has a reason to exist. The owner walks out with their 1 or 2 platforms ranked and 20 topics saved.

## Read first
- `brand/icp.md`. If The One Person still says `_Not filled in yet._`, stop and tell the owner to do the Lock In Your ICP lesson first. A topic list for nobody in particular is a list for nobody.
- `business.md` (How Customers Find You, Won't Do / Already Tried, What You Hate Doing), `brand/offer.md`, `brand/friction-points.md`, `brand/contrarian-take.md` and `brand/voice.md`. Read whatever is filled in; a stub here is fine, say which ones are thin and keep going.
- `brand/channels.md`. The Funnel Split comes from the set-your-content-mix skill (The Everyone Trap lesson). If it's still empty, say so in one line and use 7 give / 2 prove / 1 invite as the starting mix.
- `knowledge/topics.md`, so you sharpen what's there instead of starting over.

## Say this first
Tell the owner, in your own plain words: "Before your team writes anything, we decide three things. What every post is for, the one or two places you post first, and 20 topics your buyer actually cares about. It takes about 20 minutes, and after it every post your team drafts has a reason to exist." Then go.

## Part 1: The 4 questions every post answers
These are written into the top of `knowledge/topics.md` once and read by every content skill from then on. Explain each in one line, then move on:
1. **Who is it for?** One person: the ICP, or a persona from `brand/personas/` by name.
2. **What job does it do?** Give (teach something useful), prove (show a result) or invite (ask for the next step), weighed against The Funnel Split.
3. **What do they walk away with, even if they never reply?** The step, the number, the before and after. A post whose only payoff is "DM me" fails this question.
4. **Where does it send them?** Nowhere, a reply, the owner's page or one next step. Never more than one.

## Part 2: Lock in one or two platforms
Say the rule out loud, word for word, because it's the whole point of this part:

> "Don't try to post everywhere if you can't lock in 1 to 2 platforms first. Really get the workflow down."

Before asking, read How Customers Find You in `business.md` and anything in `brand/icp.md` about where the buyer spends time, then offer 2 or 3 candidate picks, each labeled GUESS with the file it came from, for example: "GUESS, from business.md: Facebook, because two of your last three customers came from a neighborhood group." Ask which is right, push on any pick that isn't where the BUYER is (where the owner likes to scroll doesn't count), and stop at two. A third platform waits until the first two run every week without the owner thinking about it.

Then the honest hours: how many hours a week they'll really give content, and how that splits between the two. If the answer is under 2 hours, say plainly that one platform is the right number.

## Part 3: 20 topics
Build 20 topics from what's already in their files, so the owner reacts instead of inventing:
- 6 from `brand/friction-points.md` (one doubt answered per post)
- 4 from `brand/contrarian-take.md` (the lead take and the candidates)
- 4 from `brand/offer.md` (how it works, what they get, the guarantee, the catch)
- 3 from Their Words in `brand/icp.md` (a real customer line, answered)
- 3 behind the scenes from `business.md` (the week, what they won't do, a recent job)

Each topic is one line: the topic, its job (give / prove / invite) and who it's for. Label every one GUESS until the owner keeps it. Read them back in groups of five and let the owner cross off anything they'd never post. Replace what gets crossed off until 20 survive. Never invent a result, a number or a client story: if a topic needs a real example the files don't have, mark it NEEDS A REAL EXAMPLE.

## Three worked examples
Show only the one closest to their business, and never copy an example into their files:
- **Local service (Marcus, a two-truck roofing company).** Platforms: 1. Facebook (neighborhood groups, where his last referrals came from), 2. Google Business Profile posts. 2 hours a week. Topics: "Repair or replace? The 40-photo check" (give, homeowners) · "A 600 dollar repair the other guy quoted as a new roof" (prove) · "Book a free roof check this week" (invite).
- **Coach or consultant (Priya, who coaches therapists opening a private practice).** Platforms: 1. LinkedIn, 2. her email list. 3 hours a week. Topics: "Why marketing comes after knowing who you help" (give, her contrarian take) · "From agency job to 12 clients in 90 days" (prove) · "The free practice-readiness checklist" (invite).
- **Product (Hannah, who sells hand-poured candles online).** Platforms: 1. Instagram (where her buyers already found her), 2. her email list. 3 hours a week. Topics: "How to burn a candle so it lasts to the last inch" (give, her contrarian take) · "A customer's 9th order this year" (prove) · "The October scents are poured" (invite).

## Where it goes
- `brand/channels.md` → under **Where You Show Up**: the 1 or 2 platforms, ranked, one line each on why that's where the buyer is, the hours a week and how they split, and the rule above in quotes. Replace the `_Not filled in yet._` line and keep The Funnel Split, the top note and the Updates section as they are. Add one dated line to `## Updates`.
- `knowledge/topics.md` → the 20 topics under **Topics**, one line each (topic · give/prove/invite · who it's for). Fill the At a Glance block. Keep The Four Questions section as it is. Add one dated line to `## Updates`.

## The ending, always
1. Read back the platforms and the first 5 topics, naming both files.
2. Tell them in one line what happens next: the first week of posts gets planned from this list, and a used topic moves to Used so nothing gets posted twice by accident.
3. Run the sync command (`python3 tools/sync.py`, or `py tools/sync.py` on Windows).
4. Save the work with the GitHub Agent's save-work skill (`departments/it-systems/dev-team/github-agent/skills/save-work/SKILL.md`), and tell the owner in one line what changed.

## Done when
`brand/channels.md` names 1 or 2 platforms with the hours and the rule, `knowledge/topics.md` holds 20 topics the owner kept (none still marked GUESS), and the work is saved.
