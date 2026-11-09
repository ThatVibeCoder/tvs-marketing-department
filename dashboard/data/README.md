# dashboard/data

What the Command Center reads. Most of it is rebuilt by `python3 tools/sync.py`, so don't edit those files by hand.

| File | Made by | Saved to GitHub? |
|---|---|---|
| `automations.json`, `content.json`, `data.js` | `tools/sync.py`, from `routines/`, `posts/`, `dashboard/settings.json` and `dashboard/landing-pages.json` | yes |
| `executions.json` | your routines, one line per run | yes |
| `web.json`, `web.js` | `tools/pull_web.py` (Google Analytics + Search Console) | **no**, never leaves this computer |
| `payments.json` | whatever you connect to your payment provider (your AI or a routine) | **no**, never leaves this computer |
| `payments.js` | `tools/sync.py`, a copy of `payments.json` so the page opens straight from the folder | **no** |

## payments.json

The Dashboard's Revenue, MRR and Open Invoices tiles, the Total Revenue chart, Revenue by Customer and Recent Payments all come from this one file. Without it, each one says "Connect your payments in Settings → Payments". Nothing in this repo calls a payment provider. Whatever you connect (your AI or a routine) reads the key saved in Settings → Payments (it lives in `.env`), pulls the payments, writes this file and runs `python3 tools/sync.py`.

```json
{
  "provider": "stripe",
  "currency": "USD",
  "capturedAt": "2026-11-07T09:00:00Z",
  "mrr": 1200,
  "activeSubscriptions": 24,
  "payments": [
    { "id": "pay_001", "date": "2026-11-06", "amount": 49.0, "customer": "Customer name", "description": "Monthly plan", "status": "paid" }
  ],
  "invoices": [
    { "id": "inv_001", "customer": "Customer name", "amount": 300.0, "dueDate": "2026-11-15", "status": "open" }
  ]
}
```

- **Amounts are in whole currency units** (49.0 means $49.00), never cents. `currency` is a three-letter code (USD, EUR, GBP).
- `provider`: stripe, square, paypal, lemonsqueezy, shopify or other. It labels the tiles.
- `capturedAt`: when the file was last filled (ISO time). The tiles show it.
- `mrr` and `activeSubscriptions`: leave them out (or `null`) if the business has no subscriptions. MRR then says so instead of showing 0.
- `payments`: one row per payment. Needs `date` (YYYY-MM-DD, in your workspace timezone), `amount` and `status`: `paid`, `refunded` or `failed`. Only `paid` counts as revenue. A refunded payment keeps its original amount and changes its status.
- `invoices`: one row per invoice. Needs `amount` and `status`: `open`, `paid` or `void`. `dueDate` is optional; an open invoice past it counts as past due.
- `customer`, `description` and `id` are optional. Customer names are what Revenue by Customer groups by.

`tools/sync.py` checks the file every time it runs. A row missing a field is skipped and named in a NOTE line, so it can be fixed; nothing is guessed. A broken file shows the empty state rather than old numbers.

## landing-pages.json (in `dashboard/`, one folder up)

The list the **Web & Analytics → Landing Pages** page draws. It lives in `dashboard/`, not in `site/`, so the list of drafts never goes live with the pages (Vercel publishes `site/` only). One entry per page:

```json
{
  "pages": [
    { "id": "gift-box", "title": "The Gift Box", "kind": "landing", "parent": null,
      "domain": "www.yoursite.com", "route": "/gift-box", "url": "https://www.yoursite.com/gift-box",
      "file": "site/gift-box/index.html", "offer": "Gift Box", "purpose": "Sell the Gift Box to gift buyers",
      "status": "live", "built": "2026-11-07", "shipped": "2026-11-08" },
    { "id": "gift-box-thanks", "title": "Thanks for your order", "kind": "thank-you", "parent": "gift-box",
      "route": "/gift-box/thanks", "file": "site/gift-box/thanks.html", "offer": "Gift Box", "status": "draft" }
  ]
}
```

- `id`: short, lowercase, dashes, never reused. `parent` is the `id` of the page this one sits under, or `null` for a main landing page.
- `kind`: `landing`, `product`, `form`, `thank-you`, `upsell` or `other`.
- `offer`: the name of what the page sells. The Landing Pages page groups pages by it.
- `domain`, `route`, `url`: where it lives. `url` stays empty until it ships.
- `status`: `draft` until it's live, then `live`. `built` and `shipped` are dates (YYYY-MM-DD).
- Visits come from your Google Analytics pull, matched by `route`.
