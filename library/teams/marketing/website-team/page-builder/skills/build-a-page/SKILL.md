---
name: build-a-page
description: Build one page that does one job, start to finish. Use for the landing page in Build Your Landing Page and every page after it.
---

# build-a-page

One page, one job, one reader, one action. Everything else is decoration.

## Read these first, every time
- `brand/offer.md`: what this page sells, in one sentence, and the headline
- `brand/icp.md`: who it's for
- `brand/colors.md` + `brand/typography.md`: how it looks
- `brand/voice.md`: how it sounds

If `brand/offer.md`, `brand/colors.md` or `brand/typography.md` still says `_Not filled in yet._` where this page needs it (The Offer, The Headline, The Palette, The Fonts), STOP and name the lesson that fills it: Build Your Offer, Test It On Something Real, or the colors and fonts step in the Build Your Landing Page lesson. A page built before the offer is a redesign waiting to happen.

## The shape of a page that works
1. **The top screen earns everything.** Headline from offer.md, one line saying who this is for (the right stranger should think "that's me" in five seconds), and the one action button. Most visitors never scroll. The top screen has to work alone.
2. **One proof, big.** Your single most impressive true thing: a result, a number, a real quote. One boulder beats a wall of pebbles. And if the one proof isn't specific, credible, and impossible to wave away, ship with NONE and say so, never stack three weak ones.
3. **What they get,** in plain words, three to five items, no jargon surviving.
4. **The action again** at the bottom for the ones who scrolled.
5. **The form asks for as little as possible.** Every extra field costs real people. Name and email is usually enough. Answers route to your inbox (that's your CRM until you outgrow it).

## Rules
- One action per page. Two buttons doing different jobs is two pages pretending to be one.
- Everything claimed on the page must be true today, not true soon.
- Build mobile-first: check the phone-width view before calling anything done. That's where most strangers meet you.
- The page is files in this repo like everything else: saved with history, shippable by the Dev Team's "ship my landing page" workflow, and any edit can be stepped back to an earlier save.

## Register the page
Every page goes on the list in `knowledge/landing-pages.json` (the shape is in `knowledge/README.md`), the moment its files exist. That list is how the owner sees every landing page they have, and the pages under each one, in the Command Center.
- **A new main landing page:** add an entry with `kind: "landing"`, `parent: null`, its `route`, the `file` under `site/`, the `offer` file it sells, a one-line `purpose`, `status: "draft"` and today's date as `built`.
- **A page that belongs to another page** (its form, thank-you page, upsell, or a product-specific version, on the same domain or a different one): `parent` is that page's `id`, and `kind` says which it is (`form`, `thank-you`, `upsell`, `product`). A product page for a different offer names that offer's file (`brand/offers/<name>.md`). If it lives on another domain, set `domain`.
- **Rebuilding a page that's already listed:** update its entry. Never add a second one. Check the `id` and the `route` first.
- Keep the file valid JSON, then run `python3 tools/sync.py` so the Landing Pages page picks it up. If sync prints a NOTE about the list, fix the entry it names.

## Deliver
The built page plus one plain-words paragraph: what each section is doing and why it's in that order. Then hand to traffic-agent BEFORE shipping.
