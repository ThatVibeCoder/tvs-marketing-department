"""Every write the dashboard makes goes through here: inside the repo, never through a link, all at once,
plus the stale-save check. Standard library only."""
import hashlib
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sync  # noqa: E402  (its write(): whole-file, atomic)

ROOT = os.path.realpath(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class Stale(ValueError):
    """The file changed after the page loaded it (an AI, another tab). serve.py answers 409."""


STALE = ("This file changed since you opened it (your AI may have edited it). Reload the page to see the new "
         "version, then make your change again.")


def content_hash(text):
    """What the page sends back with a save, so a save can tell the file changed under it."""
    return hashlib.sha1(text.encode("utf-8")).hexdigest()[:16]


def writable(path):
    """Refuse a write that would go through a symlink or land outside the repo: the path, as written, must be the
    same as where it really points. serve.py runs every write through this."""
    p = os.path.abspath(path)
    rel = os.path.relpath(p, ROOT)
    real = os.path.realpath(p)
    if rel.startswith(os.pardir) or os.path.isabs(rel) or real != os.path.join(ROOT, rel) or os.path.islink(p):
        raise ValueError(f"{rel} is a link to somewhere else, so it isn't saved. Keep the real file in the repo.")
    return p


def atomic_write(path, text, mode=None):
    """Every write from the dashboard: inside the repo, never through a link, all at once."""
    sync.write(writable(path), text, mode)
