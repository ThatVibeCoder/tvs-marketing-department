# Knowledge

Your marketing brain on disk: everything your department has learned, filed so any team member can find it. `business.md` and `brand/` say who you are; this folder holds what you've found out.

| What | Where | Filled by |
|---|---|---|
| Your business audit: tools, hours, what to cut, what to hand off first | `business-audit.md` | the Cut What You Don't Need lesson |
| Your goals: what you're going after next, crossed off as they land | `goals.md` | the Future Achievements lesson |
| Your content topics and the 4 questions every post answers | `topics.md` | the Pick Your Platforms lesson |
| Your openers, the winners and the ones to try | `hooks.md` | the Content Team lesson |
| One file per competitor, plus the summary | `competitors/` | the Research Team lesson |
| Marketing that works, one file per swipe | `swipes/` | the Research Team lesson |
| Posts beating their own channel size | `outliers.md` | the Research Team lesson |
| Every report: site audits, marketing checkups, traffic reads | `reports/` | the team workflows that make them |
| Packs from the community, one folder per team they feed | `packs/` | you, when a pack arrives |
| Every landing page you have and the pages under it (forms, thank-you pages, upsells, product pages, on any domain) | `landing-pages.json` (shape below) | the Website Team lesson's Page Builder registers each page; the Dev Team's Vercel Agent (ship-a-page) marks it live |

Rules: file new findings in the folder above that fits; never loose files at the top of `knowledge/`. If nothing fits, ask before making a new folder. Team members read their team's packs and the files above before big builds, the same way they read `brand/` before writing.

## landing-pages.json

The list the Command Center's **Web & Analytics → Landing Pages** page draws. It's kept here, not in `site/`, so the list of drafts never goes live with the pages. One entry per page:

```json
{
  "pages": [
    { "id": "gift-box", "title": "The Gift Box", "kind": "landing", "parent": null,
      "domain": "www.yoursite.com", "route": "/gift-box", "url": "https://www.yoursite.com/gift-box",
      "file": "site/gift-box/index.html", "offer": "brand/offer.md", "purpose": "Sell the Gift Box to gift buyers",
      "status": "live", "built": "2026-11-07", "shipped": "2026-11-08" },
    { "id": "gift-box-thanks", "title": "Thanks for your order", "kind": "thank-you", "parent": "gift-box",
      "route": "/gift-box/thanks", "file": "site/gift-box/thanks.html", "offer": "brand/offer.md", "status": "draft" }
  ]
}
```

- `id`: short, lowercase, dashes, never reused. `parent` is the `id` of the page this one sits under (its form, its thank-you page, its upsell, a product-specific version), or `null` for a main landing page.
- `kind`: `landing`, `product` (a page for one product or offer, often on its own domain), `form`, `thank-you`, `upsell` or `other`.
- `offer`: which offer file the page sells (`brand/offer.md` or one in `brand/offers/`). The Landing Pages page groups pages by it.
- `domain`, `route`, `url`: where it lives. A page on another domain just names that domain. `url` stays empty until it ships.
- `status`: `draft` until ship-a-page puts it live, then `live`. `built` and `shipped` are dates (YYYY-MM-DD).
- Visits come from your Google Analytics pull, matched by `route`, so they show once Settings → Web connections is set up.

