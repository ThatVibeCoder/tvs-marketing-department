# Your website

This folder is your website's source: the files that go live on the internet. `vercel.json` at the top of the repo tells Vercel to put this folder online and nothing else, so the dashboard, your posts, your settings and your `.env` never become public pages.

- **The test page:** `index.html` is a one-section page that already works. Ask your AI to make it say hello from your business, then ship it.
- **Your real pages** get built here, in this folder, the same way. Add each one to `dashboard/landing-pages.json` when it ships so the dashboard's Landing Pages page lists it (the shape is in `dashboard/data/README.md`).
- Plain HTML works with no setup. If your AI picks a framework later (Next.js, Astro), it builds it inside this folder and updates `vercel.json` in the same change.
- A form needs somewhere to send its answers. A page with no form is fine until you wire one up. Any key a form needs is used server-side only, never in a page a browser downloads.
