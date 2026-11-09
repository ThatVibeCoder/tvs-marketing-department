# Recordings

Your raw takes before they're edited: phone videos, screen recordings, voice memos.

- **The video and audio files stay on your computer.** They're too big for GitHub, so this folder's own `.gitignore` keeps them out of every save. Back them up the way you back up your phone.
- **What does get saved:** one note per take, named `<YYYY-MM-DD>-<short-name>.md`, with what you recorded, the script it came from, the transcript once your AI makes one, and where the edited version went.
- Your AI reads a take from here. Posts that use a take point at it with `media:` (see `posts/README.md`), and the dashboard plays it from here when `python3 tools/serve.py` is running.
