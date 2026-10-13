---
name: company-brain-dump
description: Capture anything the owner just learned about their business and file it where it belongs. Use any time they want to talk something out, after a sales call, when they say they have something to add, or when they ask where something should go.
---

# Company Brain Dump

The owner knows things about their business that are written down nowhere. This gets those things out of their head and into the files every hire reads.

Run it any time. There is no wrong moment and there is no finishing it. The first run is the biggest. After that it is usually one thing at a time, and that is the point: a business that gets talked into its own files stays current instead of going stale the week after setup.

## Before you ask anything

Read `business.md` and every file in `brand/`. Never ask for something the files already know.

Open with what you already have so they correct you instead of repeating themselves. "Your file says you sell bookkeeping to local trades and a client is worth about three thousand a year. What is new since then?"

If those files are still stubs, say so plainly and offer the brain-dump-your-business skill instead: it runs the full founding interview in order. This skill is for topping up a brain that already exists. Brain-dump-your-business is for building one.

## How to run it

- One question at a time. Ask, then wait.
- They talk, you write. Messy is good. Long and rambling beats tidy and short.
- Follow the interesting thing. If an answer opens a door, go through it before moving on.
- Never make them be concise. Your job is to sort it afterwards, not theirs while talking.
- If they came with one specific thing, take that thing and stop. Do not turn a two minute drop off into an interview.

## Where everything goes

This is the routing map. Match what they said to the file, then write it in that file's shape.

| What they just told you | Where it goes | The shape it takes there |
|---|---|---|
| A customer story, who buys, who they wish bought | `brand/icp.md` | Under that file's existing headings. Word for word customer lines go in the In Their Words block. |
| A phrase they always use, something that sounded wrong, how they actually talk | `brand/voice.md` | A rule that changes how a sentence gets written. "Sounds friendly" is not a rule. "Never two commas in a sentence" is. |
| Something their industry gets wrong, a belief they hold quietly | `brand/contrarian-take.md` | Their exact phrasing, kept raw. Do not smooth it. The wording is the asset. |
| What they sell, what it costs, what is included | `brand/offer.md` | One sentence for what it is, then the parts. |
| A correction, a banned word, a never do that again | `brand/guidelines.md` | One line per rule, dated, in their words. |
| Where they post, where customers actually come from | `brand/channels.md` | The channel, and an honest share of their real hours. |
| A competitor name | `business.md` under Who Else They Could Pick | The name and one line on why that customer considered them. |
| Anything about the business itself: hours, capacity, what they hate doing | `business.md` | Under the heading it fits. Make a new one if none fits. |
| Something you cannot place | `business.md` under Still to answer | An open question, dated, so a later session can pick it up. |

## Writing it down

- Their words, cleaned up but never corporatized. If a sentence sounds like a brochure, you rewrote too hard.
- Add, do not overwrite. This skill gets run many times and the file is a record, not a draft.
- If something new contradicts what a file already says, do not quietly pick a side. Show them both lines and ask which is true now. Then write the winner and note what changed.
- Keep the specific numbers and names. "A few hundred a month" is worth less to every future hire than "three eighty a month."

## If they keep a Marketing HQ in Notion

Offer once, do not assume: "Want me to mirror this to your Notion as well?" Their yes starts the work. The repo stays the source every hire reads. Notion is where a human browses and shares.

## The ending, always

1. Read back what you filed. One line each, naming the file it went into.
2. Tell them what it changes. "Your writers now know you never say solutions" is worth more than "saved."
3. Save the work to GitHub by running the github agent's save-work skill at `departments/it-systems/dev-team/github-agent/skills/save-work/`.

## Done when

What they said is in the right files in those files' shapes, anything contradictory was settled by them rather than by you, anything unplaceable is an open question in Still to answer, they heard what changed, and the work is saved.
