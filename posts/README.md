# posts/

One file per post, named `<id>.md` (lowercase letters, numbers and dashes). The dashboard's Content pages read every file here, and `python3 tools/serve.py` edits them when you press Save, Approve or Reject.

```markdown
---
platform: threads
status: draft
date: 2026-11-07
time: "09:30"
title: ""
---
The words of the post.
```

- `platform`: tiktok, instagram, twitter, threads, youtube, skool or linkedin.
- `status`: draft, approved, rejected or posted.
- `date` (YYYY-MM-DD) and `time` (HH:MM) are optional until the post is booked.
- Optional: `title` and `category` (Skool, YouTube), `account`, `media` (a path inside this repo or a link) and `media_type` (image or video), `job`, `posted_at`, `link`, `notes`.

Posting calendars (`calendar-<date>.md`) go in `posts/calendars/`.
