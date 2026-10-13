---
name: brain-dump-your-business
description: Interview the owner about their business, one question at a time, then write business.md from their answers. This is the founding conversation every other hire and skill builds on. Use when they want to get set up, talk through their business from scratch, don't know where to start, or say "brain dump my business."
---

# Brain-Dump Your Business

Interview the owner about their business, out loud, one question at a time, then turn what they said into the shared brain. This is the single most important conversation in the whole program: every hire they ever staff reads what gets written today.

## How to run the interview
- ONE question at a time. Ask, then wait. Never dump the list.
- They answer out loud with Wispr. If an answer opens an interesting door, follow it before moving on: the detours are where the good material lives.
- Messy is good. Never rush them to be concise. Long rambling answers beat tidy short ones.
- No business yet? Have them answer for the one they're building, and mark everything written today as a starting guess to sharpen when the first real customer shows up.

## The questions, in order
1. What do you sell, and who actually buys it?
2. What does a customer pay you the first time? Do they come back, and how many times? And how many more customers could you actually take on this month before you'd be underwater?
3. Walk me through your last three customers, one at a time: how did each one actually first hear of you?
4. What does your week actually look like? Where do the hours really go?
5. What do you hate doing?
6. What marketing have you already tried that didn't work, and what would you flat-out refuse to do, no matter how well it works for other people?
7. What's already written down somewhere, and where does it live?
8. Who else could your customers go to instead of you? Name names.
9. What do most people in your industry get completely wrong?

## Rewrite business.md
Replace the whole stub with their answers under nine headings, mapped to the questions above:
- **What You Sell** (Q1): what they sell, and who actually buys it.
- **The Economics** (Q2): first-sale price, whether customers come back and how many times, and monthly capacity before they're underwater.
- **How Customers Find You** (Q3): how the last three customers actually heard of them, in their own words, one at a time.
- **The Week** (Q4): where the hours really go.
- **What You Hate Doing** (Q5): the work they'd hand off first.
- **Won't Do / Already Tried** (Q6): marketing that failed, and what they'd flat-out refuse to do. Every planning skill reads this section before proposing a channel; a plan the owner silently abandons is worse than no plan.
- **What's Already Written Down** (Q7): what exists and where it lives.
- **Who Else They Could Pick** (Q8): the competitor names, plain. The research team's target list starts here.
- **Still to answer**: thin or skipped answers, filed here, not asked in the moment (see below).
Their own words, cleaned but never corporate. Kill every trace of the stub text.

Question 9 doesn't go in business.md. It gets saved word for word into `brand/contrarian-take.md` under "## Raw Material From the Brain Dump": the find-your-contrarian-take skill builds the contrarian take from this exact quote, so keep their exact phrasing.

Anything about clients or customer details follows the same privacy rules as everywhere else: facts about their business yes, other people's private information no.

## If a question gets skipped or the answer is thin
Don't push in the moment, note it. At the end of the interview, add to business.md's "Still to answer" heading:

    - (date) What's a customer worth? Skipped, come back to this.

Then, in ANY later session that touches the business file, ask ONE open question from that list, just one, woven in naturally, and file the answer where it belongs, removing it from the list. The list shrinking to nothing is part of the program working. Never ambush them with the whole list.

## The ending, always
1. Read back the three most important things you heard, in one line each. Let them correct you.
2. Set their business name in `org-chart.html`'s OWNER line (the one line marked yours to edit, never touch the generated data block below it), then open the chart and tell them: that's your company now, teams waiting to be staffed. Have them take a screenshot for the before-and-after later.
3. Save the work to GitHub: run the github agent's save-work skill at `departments/it-systems/dev-team/github-agent/skills/save-work/`. Their business is now somewhere safer than one laptop.

## Done when
`business.md` reads like a real business talked in by a real person, no stub text survives, the contrarian raw material is filed, the Still to answer heading exists (even if empty), the org chart shows their name, and the work is saved.
