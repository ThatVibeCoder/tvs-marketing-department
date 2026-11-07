"""Is this the template as shipped, or a member's repo that has grown?

Some tests check the template itself: only the Dev Team in departments/, the business files still blank,
no posts and no landing pages. In a member's repo (teams added, files filled in) those facts are meant to be
false, so those tests skip with this reason instead of failing.
"""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MARKER = "_Not filled in yet._"


def _teams():
    out = []
    d = os.path.join(ROOT, "departments")
    for dept in sorted(os.listdir(d)) if os.path.isdir(d) else []:
        for team in sorted(os.listdir(os.path.join(d, dept))) if os.path.isdir(os.path.join(d, dept)) else []:
            if os.path.isfile(os.path.join(d, dept, team, "team.md")):
                out.append(team)
    return out


def _blank(rel):
    """Every At a Glance value in the file still says _Not filled in yet._"""
    try:
        with open(os.path.join(ROOT, rel), encoding="utf-8") as f:
            text = f.read()
    except OSError:
        return True
    block = re.search(r"## At a Glance\n.*?```\n(.*?)```", text, re.S)
    return not block or all(MARKER in ln for ln in block.group(1).splitlines() if ":" in ln)


def _empty_dir(rel, keep=("README.md", "_template.md", ".gitkeep")):
    d = os.path.join(ROOT, rel)
    return not os.path.isdir(d) or all(n in keep for n in os.listdir(d))


def as_shipped():
    return (_teams() == ["dev-team"]
            and all(_blank(f) for f in ("business.md", "brand/icp.md", "brand/offer.md", "brand/friction-points.md", "brand/contrarian-take.md"))
            and all(_empty_dir(d) for d in ("brand/icps", "brand/offers", "knowledge/competitors")))


AS_SHIPPED = as_shipped()
WHY = "checks the template as shipped; this repo has teams added or business files filled in, which is how a member's repo should look"
