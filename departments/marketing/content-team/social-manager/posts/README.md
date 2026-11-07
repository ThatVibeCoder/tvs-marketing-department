# Posts

Every post your Content Team makes is one file in this folder, named `<date>-<platform>-<a-few-words>.md`. The Command Center's Content pages read these files, and its editor writes them back when `python3 tools/serve.py` is running.

## The shape

```
---
platform: instagram
status: draft
date: 2026-11-07
time: "09:30"
title: ""
category: ""
media: ""
job: give
---
The post itself, exactly as it goes out.
```

- `platform`: one of `tiktok`, `instagram`, `twitter` (X), `threads`, `youtube`, `skool`, `linkedin`. One platform per file; the same idea on two platforms is two files.
- `status`: `draft` (waiting for your yes), `approved` (yes, it's on the calendar), `rejected` (sent back), `posted` (it went out).
- `date` and `time`: the day and the time it goes out, in your workspace timezone (Settings). Leave them empty and the review page shows the next open slot from your posting cadence; approving books it.
- `title`: the Skool post title, or the YouTube title (YouTube falls back to the first line).
- `category`: the Skool category.
- `media`: a link, or a path inside this repo (`recordings/clip.mp4`), to the photo or video that goes with it.
- `job`: `give`, `prove` or `invite`, from `knowledge/topics.md`.
- After it goes out: `posted_at` (when, like `2026-11-07T09:34`) and `link` (where it lives now).

On Threads and X, a line with only `---` on it inside the post splits it into a chain: the post, then its replies, in order.

Run `python3 tools/sync.py` after an AI writes or changes a file here, so the Command Center picture catches up. Edits made in the Command Center's editor sync on their own.
