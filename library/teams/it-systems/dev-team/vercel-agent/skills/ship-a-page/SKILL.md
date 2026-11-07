---
name: ship-a-page
description: Put a page from this repo onto the live internet and hand back the URL. Use when the owner says "ship it", "put it live", or the landing page from Build Your Landing Page is ready.
---

# ship-a-page

From files in the repo to a URL you can send someone.

## Steps
1. Confirm the page work is SAVED first (save-work). Never ship unsaved work.
2. Connect the repo to Vercel if this is the first time. It watches GitHub and rebuilds on every save after that. Shipping runs through the Vercel CLI, so it is one command rather than a website safari. If the CLI is not logged in yet, run `vercel login` first and follow the prompt. That needs a Vercel account, free to make, linked to the same GitHub account holding this repo.
3. Ship it, wait for the build, and open the live URL yourself before handing it over.
4. Give the owner the URL and one line: what's live, and that every future save updates it automatically.

## Rules
- Free plan until the owner says otherwise. If anything would cost money, that goes through a one-plan first.
- If the build fails, translate the error into plain words and fix it, don't paste raw logs at the owner.
- A custom domain is its own small job for another day, the free URL works today. Say that instead of stalling the ship.
