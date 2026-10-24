---
name: cut-a-recording
description: "Turn a raw phone take from recordings/ into a video ready to post: trim the start and end, cut the long pauses, level the sound, add captions, and size it for the platform. Never changes what the owner said. Use when the owner says \"cut my video\", \"edit this recording\", \"add captions\", \"clean up my take\", or /cut-a-recording."
---

# Cut a Recording

A one-take video doesn't need fancy editing, it needs the dead air gone and captions on, because most people watch with the sound off. This takes the owner's raw take and hands back a tight, captioned video in under 15 minutes, without changing a single word they said.

## Read first
- The take: a video file in `recordings/` and its note (`recordings/<YYYY-MM-DD>-<short-name>.md`, with the script it came from). No file there → stop and ask the owner to drop the recording in `recordings/` first (the Record It In One Take lesson).
- The platform's specialist file if one exists (for example `tiktok-specialist.md`): it knows the size and length rules. Otherwise: vertical 9:16 at 1080 × 1920, under 60 seconds.
- `brand/colors.md` and `brand/typography.md` for the caption style. If they're empty, use white captions with a dark outline and say so.

## Say this first
Tell the owner, in your own plain words: "I'm going to cut the pauses out of your take, level the sound and put captions on it. I won't change anything you said. You watch it at the end and tell me if anything got cut that shouldn't have."

## Check the tools first (one time)
- **ffmpeg** does the cutting. Run `ffmpeg -version`. If it's missing, install it (Mac: `brew install ffmpeg`; Windows: `winget install ffmpeg`), which takes a couple of minutes, then continue.
- **Captions need a transcript.** If a local speech-to-text tool is installed (for example Whisper), use it to make an `.srt` file with word timings. If none is, say so plainly and use the platform's own auto-captions when posting instead (Instagram, TikTok and YouTube all have them). Never type captions from memory of the script, because people go off-script and the captions must match what was said.

## The cut
1. **Copy, never touch the original.** Work on a copy in `departments/marketing/editing-team/video-editor/output/<YYYY-MM-DD>-<short-name>/`. The raw take stays exactly as it was.
2. **Trim the ends:** cut everything before the first word and after the last.
3. **Cut the long pauses:** find silences longer than about half a second (ffmpeg's `silencedetect`) and cut them down to a short breath, about 0.15 seconds. Never cut inside a word, and leave a pause that's clearly on purpose (a beat before the payoff line).
4. **A second take of a line:** if the owner repeated a sentence because they tripped, keep the last clean version and cut the earlier one. Say which line you cut and why.
5. **Level the sound** (ffmpeg's `loudnorm`) so it plays at the same volume as everything else in the feed.
6. **Size it** for the platform: 9:16 vertical at 1080 × 1920, centered on the face. Don't stretch it.
7. **Captions:** burn the transcript in (big, two to five words at a time, low-middle of the frame, in the brand font if there is one), and also save the `.srt` on its own for platforms that take caption files.

## Look before you hand it back
Watch the whole cut yourself (or read the transcript of the cut against the script): does every sentence survive? Is anything clipped mid-word? Do the captions match what's said? Fix it, then show the owner.

## Where it goes
- `departments/marketing/editing-team/video-editor/output/<YYYY-MM-DD>-<short-name>/`: `final.mp4`, `captions.srt` and `EDIT.md` (what got cut and why, the length before and after). The video files stay on the computer (that folder's `.gitignore` keeps them out of saves); `EDIT.md` and the `.srt` get saved.
- Add one line to the take's note in `recordings/`: where the edit is and its final length.

## The ending, always
1. Tell the owner the final length and what you cut, in one line each, and open the video for them. ⛔ They watch it and say yes or what to fix.
2. Hand it to the Designer's make-a-cover, then the Copywriter's repurpose-it, the way the "edit my video" workflow runs.
3. Save the work with the GitHub Agent's save-work skill (`departments/it-systems/dev-team/github-agent/skills/save-work/SKILL.md`), and tell the owner in one line what changed.

## The self-learning rule
- Every correction gets noted ("you cut my pause before the punchline", "captions too small"). The same correction twice becomes a permanent rule in the Video Editor's own Memory section.

## Done when
The owner watched the cut and said yes, every word they said is still in it, the captions match, it's the right size for the platform, and the notes are saved.
