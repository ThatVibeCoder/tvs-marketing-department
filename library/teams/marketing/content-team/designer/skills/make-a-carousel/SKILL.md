---
name: make-a-carousel
description: "Turn one post idea into a swipeable carousel (5 to 8 slides at 1080 x 1350, in the owner's colors and fonts), with a hook slide, one idea per slide and a last slide that asks for the save or the send. Use when the owner says \"make a carousel\", \"turn this into slides\", \"Instagram carousel\", \"LinkedIn document post\", or /make-a-carousel."
---

# Make a Carousel

A carousel is a post people swipe through, so they stay longer and save it for later. This turns one idea into 5 to 8 slides that look like the owner's brand, and the owner walks out with the slide images ready to post today.

## Read first
- `brand/colors.md` and `brand/typography.md`. If either still says `_Not filled in yet._`, say so in one line and use one dark color, one light color and one accent from their logo or website, plus a single clean sans-serif font, then note it so the Build Your Landing Page lesson's colors step replaces it later. Never invent a brand they don't have.
- `brand/voice.md`, `brand/icp.md` and the topic's line in `knowledge/topics.md` (its job, its reader).
- The opener bank and the five structures in the Copywriter's write-hooks skill (`departments/marketing/content-team/copywriter/skills/write-hooks/SKILL.md`), and `knowledge/hooks.md` for openers that already won.
- If a platform specialist exists for where it's going, read its file first: it knows the size and the caption rules.

## Say this first
Tell the owner, in your own plain words: "I'm turning this into a carousel: a hook slide, one idea per slide, and a last slide that gets people to save it or send it to someone. You'll see the words first, then the slides."

## Step 1: The words (you approve before any design)
- **Slide 1 is the hook,** from the opener bank, in 8 words or fewer. It's the cover: the only slide most people see, and every other slide is cut to its size.
- **Slides 2 to the second-last carry one idea each,** in one of the five structures (a list with the best one last works best for carousels). 15 to 25 words a slide, never a paragraph.
- **The last slide pays off slide 1,** then asks for ONE thing: save this, send it to someone who needs it, or reply with a word. Never "like and follow".
- **The caption** opens with a second hook in one line, then two or three lines that back it up.
Show the words, slide by slide, and wait for the owner's yes. A carousel with the wrong words is wasted design.

## Step 2: The slides
1. Build ONE self-contained HTML file with every slide as its own 1080 × 1350 frame (4:5, which takes the most room in a feed), in the owner's colors and fonts: big text, lots of space, the same layout on every slide, and a small slide counter ("2/6") so people know to swipe. LinkedIn takes the same slides as a PDF document post.
2. Export each frame as a PNG. If Node.js is installed, take a screenshot of each frame with a headless browser (for example `npx playwright screenshot`). If it isn't, open the file for the owner and have them print it to PDF (LinkedIn takes that PDF as it is) or screenshot each slide. Say plainly which way you're using.
3. Look at every slide yourself before showing it. Is the text the same size on every slide? Does anything run off the edge? Does it read from across a room? Fix it first.

## Three examples (made-up businesses from the other lessons; never copy them)
- **Marcus, the roofer:** 1 "Repair or replace? Check these 5 first" · 2-6 one photo-check each (the flashing, the boots, the valleys, the decking, the age) · last "Save this for the next storm."
- **Priya, who coaches therapists:** 1 "Before your first post, answer these 4" · 2-5 one question each · 6 "Send this to a therapist leaving agency work."
- **Hannah, the candle maker:** 1 "Your candle isn't bad" · 2 "The first burn sets the memory" · 3-5 the steps · 6 "Save this before you light your next one."

## Where it goes
`departments/marketing/content-team/designer/output/carousels/<YYYY-MM-DD>-<short-name>/`: the HTML file, one PNG per slide (`01.png`, `02.png`...) and `caption.md` with the caption. The post itself goes out through the Social Manager's post-content, and the topic moves to Used in `knowledge/topics.md`.

## The ending, always
1. Show the slides as one strip, in order, and the caption.
2. Hand it to the Social Manager's post-content to stage for the owner's send.
3. Save the work with the GitHub Agent's save-work skill (`departments/it-systems/dev-team/github-agent/skills/save-work/SKILL.md`), and tell the owner in one line what changed.

## Done when
The slides read in order with a hook, one idea per slide and one ask at the end, they're in the owner's colors and fonts at 1080 × 1350, the owner said yes to the words before the design, and the carousel is staged to post.
