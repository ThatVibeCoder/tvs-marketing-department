"""A small stand-in Content Team for tests that need posts or a second team.

The template ships with the Dev Team only: the Content Team is built later by its classroom lesson. Tests that
check posts, the editor or sync's handling of a member-built team write this minimal team into a throwaway copy
of the repo, in the same shape a lesson's skill doc builds. It is never written into the repo itself.
"""
import os
import subprocess
import sys

READ_LINE = "Each skill names the files it reads. Read those, then this file, and stay inside this file's edges."
BASE = "departments/marketing/content-team"

FILES = {
    "team.md": """---
name: Content Team
command: /content-team
department: Marketing
status: seeded
purpose: "A stand-in Content Team written by the tests."
---
# Content Team

## Members
- **Copywriter** (`copywriter/`): writes the posts.
- **Social Manager** (`social-manager/`): dates and posts them.

## Workflow: write my post
Say: "write my post"
When: A test workflow.
### Write
1. **Copywriter** · draft-post · writes one post.
2. **You** read it and say yes. [you approve]
### Post
3. **Social Manager** dates it.
""",
    "copywriter/copywriter.md": f"""# Copywriter

**Status:** seeded
**Team:** Content Team

{READ_LINE}

Writes the posts.
""",
    "copywriter/skills/draft-post/SKILL.md": """---
name: draft-post
description: "Draft one post. Use when the owner says draft a post."
---
# draft-post

1. Write one post into the posts folder.
""",
    "social-manager/social-manager.md": f"""# Social Manager

**Status:** seeded
**Team:** Content Team

{READ_LINE}

Dates and posts what the Copywriter writes.
""",
    "social-manager/posts/README.md": "# Posts\n\nOne file per post.\n",
}


def add_content_team(repo, sync=True):
    """Write the stand-in Content Team into `repo` (a throwaway copy), then run sync there the way a lesson's skill
    doc ends. Returns its folder."""
    for rel, text in FILES.items():
        p = os.path.join(repo, BASE, rel)
        os.makedirs(os.path.dirname(p), exist_ok=True)
        with open(p, "w", encoding="utf-8") as f:
            f.write(text)
    if sync:
        subprocess.run([sys.executable, "tools/sync.py"], cwd=repo, capture_output=True, check=True)
    return os.path.join(repo, BASE)
