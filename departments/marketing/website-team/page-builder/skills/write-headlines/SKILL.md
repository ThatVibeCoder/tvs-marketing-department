---
name: write-headlines
description: Write five landing page headlines from the owner's offer, grade each against the craft rules, and save the winner as the headline in brand/offer.md. Use when the owner says "write my headlines", "hero headline", "landing page headline", or inside build-a-page before the words get written.
---

# write-headlines

The headline is the one line every page lives or dies on. This is the only place headlines get written, so the page builder's page-copy always reads the winner from `brand/offer.md`.

## Read first
`business.md`, `brand/voice.md`, `brand/icp.md`, `brand/friction-points.md` and `brand/offer.md`. If `brand/icp.md` or The Offer in `brand/offer.md` still says `_Not filled in yet._`, stop and name the lesson that fills it (Lock In Your ICP, Build Your Offer). If only `brand/friction-points.md` or `brand/voice.md` is missing, say so and continue, because they sharpen the headlines but don't make them.

## Say this first
Before writing anything, tell the owner what this is in plain words, something like: "This writes the one line at the top of your website: the headline. It's the line a stranger reads first, and it decides if they stay or leave. I'll write five really different ones from your offer, grade each one against six simple rules, and you pick the winner. It takes about 10 minutes."

Keep it moving. If none of the five land, ask what they liked about the closest one and write one more set of five, not round after round.

## Show what you're building from first
After you've read the files, show the owner the raw pieces you'll build headlines from, labeled as your read of their files, and let them fix anything before you write:
- **The result** the buyer wants, from The Promise in `brand/offer.md`.
- **The speed,** from Timeline in `brand/offer.md`.
- **The feeling** when it lands, from Dream State in `brand/icp.md`.
- **The buyer's own words,** from Their Words in `brand/icp.md`.
- **The biggest worry:** ask the owner which of the five in `brand/friction-points.md` stops the most buyers, because the file doesn't rank them. Skip any marked UNSOLVED.

Say it like: "Here's what I'm building from. My read of your files is the result is a dry house, the speed is two days, the feeling is not worrying every time it rains. Anything wrong?" A wrong ingredient makes five wrong headlines, so this one check saves a whole round. If an ingredient's section is still `_Not filled in yet._`, say it's blank and ask; never fill it in yourself. A headline never promises a speed, number or guarantee that isn't written in `brand/offer.md`.

## The craft (grade every headline against all six)
- **The five second test.** A stranger reads it and knows in five seconds what they get and why they should care. If they have to think, it failed.
- **Never who you are or what you do.** "Exterior cleaning services" is a category, not a reason to stay. The company name and the service go further down the page.
- **Result, speed, feeling.** The strongest headlines carry the end result the buyer wants, how fast they get it, and how they'll feel when it lands. "Calm your horse, enjoy safer happier rides in just 2 weeks" carries all three.
- **A 12 year old gets it.** Jargon kills trust. A security page that led with "cyber security posture" converted under one percent, because nobody knew what it meant.
- **Drill with "so that."** "We clean solar panels" becomes "your panels make more energy, so that your bill drops, so that you finally know your solar is paying for itself." That rewrite lifted conversions 64 percent.
- **Sell the feeling.** "Feel like yourself again with smoother brighter skin that looks natural" beats any list of services.

## Five headline shapes to start from
Use a different shape for each of the five, so they're really different from each other:
1. **Result in time, without the pain:** "<Result> in <time>, without <the thing they dread>."
2. **The so-that chain, cut to the last link:** write "we do X, so that Y, so that Z", then lead with Z.
3. **Name who it's for:** "For <who> who <their situation>: <result>."
4. **Their own words:** a line lifted from Their Words, turned into a promise.
5. **The feeling:** lead with how they'll feel once it's done.

Three worked examples, with a weak headline first so the owner sees the difference:
- **Local service (Marcus, a two-truck roofing company).** Weak: "Marcus Roofing: Quality Roofing Services Since 2010" (who they are, fails the craft). Strong: "Know in 48 hours if your roof needs a repair or a new one, with 40 photos to prove it." Also good: "Stop putting a bucket under the leak."
- **Coach or consultant (Priya, who coaches therapists opening a private practice).** Weak: "Holistic Practice Development Coaching" (jargon, fails the 12 year old test). Strong: "Leave your agency job with a full private practice in 90 days." Also good: "For therapists who are great with clients and lost with marketing: your first 10 clients, without ads."
- **Product (Hannah, who sells hand-poured candles online).** Weak: "Luxury Artisan Candles" (a category, not a reason to stay). Strong: "A candle that burns even to the last inch, or we'll replace it." Also good: "Your living room, smelling like a cabin fire in October."

These are made-up examples to show the level of detail. Never write them into brand/offer.md.

## Steps
1. Write five headlines from the offer and the friction points. Make them really different from each other, not five versions of one idea.
2. Grade each one against the six rules and show the grade next to it. Never show one that leads with who the business is.
3. The owner picks, judging on the promise: the right person knows in one second it's for them. Do a second pass on their reaction if they want one.
4. Save the winner under `## The Headline` in `brand/offer.md` and on the `The headline:` line of its At a Glance block, and the other four under `## Headlines We Tried` in the same file with one line on why each lost.

## Corrections
Every time the owner corrects a headline, note what the correction was. The same correction twice becomes a permanent rule in the Page Builder's own Memory section (`departments/marketing/website-team/page-builder/page-builder.md`). A correction about how the owner sounds gets offered to `brand/voice.md`, added only once they confirm, marked (owner confirmed).

## The ending, always
1. Read back the winning headline and where it's saved.
2. Add one dated line to `## Updates` in `brand/offer.md`.
3. Run `python3 tools/sync.py`.
4. Save the work with the GitHub Agent's save-work skill and tell the owner in one line what changed.

## Done when
`brand/offer.md` has one headline under The Headline, the tried ones are logged, and the owner said yes.
