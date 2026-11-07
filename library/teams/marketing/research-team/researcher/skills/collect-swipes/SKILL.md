---
name: collect-swipes
description: "Save a piece of marketing that works (a post, an ad, an email, a landing page) and write down why it works and which job it does, so a writer can find it later by the problem they're solving. One file each in knowledge/swipes/. Free tools only. Use whenever the owner sends something that caught their eye, or says save this, swipe this, add this to my swipe file, or I like how they did this."
---

# collect-swipes

A swipe file is marketing that worked, saved with the reason it worked. The reason is the whole point. A folder of screenshots is a scrapbook; a folder where every piece says "this is a proof section, and here's the shape" is something a writer actually opens when they're stuck.

This is a look, not a data pull: read the piece the owner sent, or its public page. No paid tools, no databases, no logins. Any AI can run it. If the owner sends a screenshot, work from the screenshot.

## Read first
1. What the owner sent: the link, the screenshot or the pasted words. If it's a link, open the public page. If it's behind a login, ask the owner for a screenshot instead of logging in.
2. `knowledge/swipes/README.md` and the files already in `knowledge/swipes/`. If the same piece is already saved, add to that file instead of making a second one. If it's a second piece with the same shape, say so: two swipes with the same shape is a pattern worth naming.
3. `knowledge/swipes/_template.md`: the shape every swipe follows.
4. `brand/icp.md` and `brand/offer.md`, so the "how we'd use it" line is about this owner's buyer and this owner's offer. If they still say `_Not filled in yet._`, save the swipe anyway and leave that line `_Not filled in yet._`; the swipe is still worth keeping.
5. The opener bank and the five structures in the Copywriter's write-hooks skill (`departments/marketing/content-team/copywriter/skills/write-hooks/SKILL.md`), if the Content Team is added, so the shape is named in the words the writers already use.

## Say this first
"I'll save this to your swipe file with the one thing that makes it work and which job it does (hook, offer, proof or structure), so it turns up the next time someone's writing that part. What caught your eye about it?"

Wait for the answer. What the owner noticed is often the real reason, and it goes in the file in their words.

## Steps
1. **Name the one thing.** What makes this piece work: the first line, the offer, the proof, or the way it's laid out. One thing. If you find three, pick the strongest and put the others under Notes.
2. **Tag its job.** Exactly one:
   - **hook**: the first line, the first frame or the subject line is what works;
   - **offer**: how the thing is packaged, priced or framed (a guarantee, a bonus, a "first one free");
   - **proof**: how it makes you believe it (a number, a before and after, a named result);
   - **structure**: the order of the parts is what works (problem, then the cost, then the fix).

   The job is how a writer finds it later by the problem they're solving: "I need a proof section" means opening the proof swipes.
3. **Write down the shape worth stealing.** The part that works on a different subject, in a sentence a writer could fill in, like "[the number] [customers] in [time], and [the surprising thing they didn't do]". Never the original sentence with the nouns swapped.
4. **Write the file.** Copy `knowledge/swipes/_template.md` to `knowledge/swipes/<YYYY-MM-DD>-<short-name>.md` (today's date, lowercase, dashes, like `2026-11-07-roofer-photo-proof.md`).
   - Fill At a Glance: what it is, where it came from (the link, or "screenshot from the owner"), its job, why it works, the shape.
   - Quote the piece word for word under **The Piece**, short: the part that does the job, not the whole page.
   - **How we'd use it** gets one line tying the shape to this owner's offer or a topic in `knowledge/topics.md`.
   - Add one dated line under **Updates**.
5. **Sync it.** Run the sync command (`python3 tools/sync.py`, or `py tools/sync.py` on Windows), so the Command Center's Content → Research → Swipes shows it.

## Worked example (a made-up roofing company)
Marcus runs a roofing company. He sends a screenshot of another roofer's Facebook ad from a different state, and says: "I like that it's just photos." The ad opens on a photo of a cracked flashing, and the text says "We took 40 photos before we quoted. Here are the 3 that mattered."

His file, `knowledge/swipes/2026-11-07-roofer-photo-proof.md`, At a Glance:
```
What it is: a roofer's Facebook ad, one photo and two lines of text
From: screenshot from the owner, 2026-11-07
Job: proof
Why it works: the photos ARE the proof; you see the damage before you're asked to believe anything
The shape: "We [did the careful thing] before we [the usual step]. Here are the [few] that mattered."
How we'd use it: Marcus's 40-photo roof check (brand/offer.md) as a three-photo ad
```
The owner's "it's just photos" goes under Notes, word for word.

## The ending
Tell the owner, in a few lines:
- what got saved, its job and where the file is;
- the shape in one line;
- if it matches a swipe already saved, say so, because two of the same shape is a pattern.

Then offer exactly one next step: if something is being written right now that needs this job (a landing page's proof section, this week's posts), offer to hand the swipe to that team. If nothing is, the file is the finish: say it's there for the next time a writer needs a [job]. One offer, never a menu.

The file stays in `knowledge/swipes/`, where every writer reads it before writing that part.

## Rules
- Every swipe says where it came from: a link, or "screenshot from the owner" and the date.
- Never copy a swipe's words into the owner's copy. The shape transfers; the sentences don't. The piece is quoted in its own file, as research, and nowhere else.
- One job per swipe. A swipe tagged with all four jobs can't be found by any of them.
- Public pages and what the owner sends only. Never log in, never use a paid tool, never install anything to do this.
- A swipe of a competitor still goes here. Facts about the competitor themselves go in their file in `knowledge/competitors/`.
