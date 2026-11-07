---
name: post-content
description: Stage approved content onto its platform for the owner's final send. Use when the calendar says something goes out.
---

# post-content

## Where the posts are
Every post is a file in `departments/marketing/content-team/social-manager/posts/` (the README there shows the header). Approved ones (`status: approved`) with today's `date` are the ones due. Read the file again right before posting: the owner may have edited it in the Command Center.

## How it goes out
Read `poster` in `command-center/settings.json` (Settings → Connected Accounts in the Command Center):
- `manual` (the default): stage it as far as the platform allows and hand the owner the final send.
- `blotato`, `metricool` or `ayrshare`: if that tool's key is in `.env` (`BLOTATO_API_KEY`; `METRICOOL_USER_TOKEN`, `METRICOOL_USER_ID`, `METRICOOL_BLOG_ID`; `AYRSHARE_API_KEY`), you may hand this one approved post to it, from the computer, never from a page. Say which post, which account and which time in one line first and wait for the owner's yes.
- `api`: the platform's own keys in `.env`, the same way and the same yes.
If the key isn't there, say so in one line, point at Settings → Connected Accounts, and stage it for a manual send instead. Never read a key out loud, never put one in a file other than `.env`.

## Steps
1. Confirm the piece was approved, and that either the calendar names today or the owner asked to post it now.
2. Shape it for the platform it's going to: lengths and formats differ, the message doesn't.
3. Stage it as far as the platform allows and hand the owner the final send. The owner publishes, always.
4. Add a line to `departments/marketing/content-team/social-manager/output/post-log.md` with the FINAL published wording and the exact timestamp, not the approved draft. Platform edits and send-time drift are what silently break next week's stats read. If the owner sends it themselves after this session, log it as STAGED, and at the next session ask for the time it went out and its link, then update the line.
5. Mark the post file: `status: posted`, `posted_at` (the real time it went out, like `2026-11-07T09:34`), `link` (where it lives now), and the final wording as its body. That's what the Command Center counts as "Posts out". Then run the sync command.
