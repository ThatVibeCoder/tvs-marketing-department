---
name: stand-up-a-specialist
description: "Set up a platform specialist on the Content Team for each platform the owner actually posts on (Instagram, YouTube, LinkedIn, Facebook, Threads, X or TikTok), from that platform's playbook, rewritten for this owner's business. Use when the owner says \"stand up my Instagram specialist\", \"set up my platform\", \"how does LinkedIn work\", or /stand-up-a-specialist."
---

# Stand Up a Specialist

Each platform plays by its own rules. This gives every platform the owner picked its own team member, which knows those rules and applies them to THIS business, so the Copywriter's posts get shaped right for where they're going. The owner walks out with one specialist per picked platform and their first native post planned for today.

## Read first
- `brand/channels.md`. If Where You Show Up still says `_Not filled in yet._`, stop and run the content-brain skill first (the Pick Your Platforms lesson). Only the 1 or 2 platforms named there get a specialist, because a specialist for a platform they don't post on is a folder lying to them.
- `brand/icp.md`, `brand/offer.md`, `brand/voice.md` and `knowledge/topics.md`, so the specialist speaks for this business, not a generic one.
- `departments/marketing/content-team/platform-specialists.md`: the shape every specialist takes.
- The playbook for each picked platform, in this skill's own folder: `playbooks/instagram.md`, `playbooks/youtube.md`, `playbooks/linkedin-facebook.md`, `playbooks/threads-x.md`, `playbooks/tiktok.md`.

## Say this first
Tell the owner, in your own plain words: "Each platform plays by different rules. I'm going to set up a specialist for each one you picked, with that platform's rules written for your business, and then we plan your first post for it. Skip anything here about platforms you didn't pick."

## The job
For each platform in Where You Show Up (never more than two):
1. **Check it doesn't already exist.** If `departments/marketing/content-team/<platform>-specialist/` is there, sharpen it instead of making a second one.
2. **Read its playbook** and tell the owner the three rules that matter most for THEIR business, in one line each. Ask which one surprises them. Their answer tells you what to stress in the file.
3. **Make the specialist** in the shape from `platform-specialists.md`: `departments/marketing/content-team/<platform>-specialist/<platform>-specialist.md` with `**Status:** live`, `**Team:** Content Team`, the read-first line from AGENTS.md word for word, then the playbook's rules rewritten for this owner (their buyer, their offer, their topics in place of the playbook's examples), an empty `skills/` folder and an `output/` folder. Use `instagram-specialist`, `youtube-specialist`, `linkedin-specialist`, `facebook-specialist`, `threads-specialist`, `x-specialist` or `tiktok-specialist`.
4. **Add it to the Members list** in the Content Team's `team.md`, one line in the same shape as the others.
5. **Plan today's native post** for that platform: pick one topic from `knowledge/topics.md` and the format the playbook says to start with (a carousel, a reel, a group answer, a short post). If it's a carousel, hand it to the Designer's make-a-carousel skill. Otherwise the Copywriter's draft-post writes it, shaped by this specialist.

## The self-learning rule
- Every correction about how a post should look on this platform gets noted. The same correction twice becomes a permanent rule in the specialist's own Memory section. A correction about how the owner sounds gets offered to `brand/voice.md`, added only once they confirm, marked (owner confirmed).

## Where it goes
- `departments/marketing/content-team/<platform>-specialist/<platform>-specialist.md`, plus `skills/` and `output/`.
- One line per new specialist under `## Members` in `departments/marketing/content-team/team.md`.
- One dated line in `brand/channels.md` `## Updates`: which specialists were set up.

## The ending, always
1. Read back what you made, one line each, naming the file.
2. Run the sync command (`python3 tools/sync.py`, or `py tools/sync.py` on Windows). The specialist now shows in the Command Center.
3. Save the work with the GitHub Agent's save-work skill (`departments/it-systems/dev-team/github-agent/skills/save-work/SKILL.md`), and tell the owner in one line what changed.

## Done when
Every platform named in Where You Show Up has exactly one live specialist with this owner's rules in it, the team's Members list names them, today's post for each is planned, and the work is saved.
