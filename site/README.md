# Your website

This folder is your website's source: the files that go live on the internet. `vercel.json` at the top of the repo tells Vercel to put this folder online and nothing else, so `business.md`, `brand/` and your notes never become public pages.

- **The test page** (the Put a Test Page Live lesson): `index.html` is a one-section page that already works. Ask your AI to make it say hello from your business, then say "ship my landing page".
- **Your real landing page** (Build Your Landing Page): the Page Builder builds it here, in this folder, the same way.
- Plain HTML works with no setup. If your AI picks a framework later (Next.js, Astro), it builds it inside this folder and updates `vercel.json` in the same change.
- A form needs somewhere to send its answers. That gets wired up in the lessons after the landing page, so a page with no form is fine for now.
