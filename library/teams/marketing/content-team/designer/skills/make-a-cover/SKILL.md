---
name: make-a-cover
description: "Make the cover for a video or post in the owner's ONE locked cover style (set once, then reused so every cover looks like the same brand): their colors and fonts, three to five big words, and a real frame of them from the video. Use when the owner says \"make a cover\", \"thumbnail\", \"cover for this video\", or /make-a-cover."
---

# Make a Cover

The cover is what people see before they decide to watch, and on a profile grid every cover sits next to the others. So covers follow ONE locked style, set once and reused every time, and only the words and the frame change. The owner walks out with today's cover in that style.

## Read first
- `brand/colors.md` and `brand/typography.md`. If either still says `_Not filled in yet._`, say so and use one dark color, one light color and one accent from their logo or website, plus a single bold sans-serif, then note it so the Build Your Landing Page lesson's colors step replaces it. Never invent a brand they don't have.
- `brand/assets/cover-template.html`: the locked style. If it doesn't exist, this is the first cover, so Step 1 sets the style.
- The video and its script (the edit in `departments/marketing/editing-team/video-editor/output/` or the take in `recordings/`), or the post it's for.
- The platform's specialist file if one exists: Instagram crops covers to a square on the grid and shows the full 9:16 in the feed, and YouTube is 16:9.

## Say this first
Tell the owner, in your own plain words: "Your covers all follow one style, so your profile looks like one brand. The first time, we set that style together. After that, I only change the words and the picture."

## Step 1: Lock the style (first cover only)
Show two or three options for the one style, each the same layout idea in their colors: big words at the top or the bottom, a real frame of them from the video, the brand accent once. Keep them simple. A cover covered in icons and logos looks spammy and gets scrolled past. The owner picks one, and you save it as `brand/assets/cover-template.html` (one self-contained file, sized 1080 × 1920, with the safe square in the middle marked for the grid crop), plus one dated line in `brand/guidelines.md` Updates: "Cover style locked: <one line describing it>".

## Step 2: Make today's cover
1. **The words:** three to five, the video's promise, not its title. Pull them from the script's first sentence. Big enough to read on a phone from across the room.
2. **The frame:** a real still of the owner from the video where their face matches the words (surprised, pointing, serious). Grab it with `ffmpeg -ss <time> -i <video> -frames:v 1 frame.jpg`. A real frame beats a stock photo every time.
3. **Fill the template,** export it as a PNG at 1080 × 1920 (headless browser if Node.js is installed; otherwise open it and screenshot it), and check the words sit inside the square safe zone.
4. **Look at it next to the last three covers.** Does it look like the same brand? Same text size, same position? If not, fix it before showing it.

## Three examples (made-up businesses from the other lessons; never copy them)
- **Marcus, the roofer:** dark slate background, "IS YOUR ROOF REALLY DONE?" in white at the top, a frame of him holding a flashlight in the attic.
- **Priya, who coaches therapists:** cream background, "SKIP THE WEBSITE" in her deep green, a frame of her mid-sentence, smiling.
- **Hannah, the candle maker:** warm black, "YOUR CANDLE ISN'T BAD" in cream, the two candles side by side as the frame.

## Where it goes
- The locked style: `brand/assets/cover-template.html` (first time only).
- Today's cover: `departments/marketing/content-team/designer/output/covers/<YYYY-MM-DD>-<short-name>.png`.

## The ending, always
1. Show the cover next to the last three. ⛔ The owner says yes or what to fix.
2. Hand it to the Social Manager's post-content with the video.
3. Save the work with the GitHub Agent's save-work skill (`departments/it-systems/dev-team/github-agent/skills/save-work/SKILL.md`), and tell the owner in one line what changed.

## Done when
The cover follows the one locked style, the words are readable on a phone and sit inside the grid's safe square, it uses a real frame of the owner, and the owner said yes.
