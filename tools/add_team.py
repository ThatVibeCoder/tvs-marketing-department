#!/usr/bin/env python3
"""Add a whole team from the team library into your department.

Your department starts nearly empty on purpose (just the Example Team). Every full team, with all its team
members, skills and workflows, waits in `library/teams/<department>/<team>/` until the classroom gets to it.
This copies one team into `departments/<department>/<team>/` and runs the sync command, so it shows up as a
command (/website-team) and in the Command Center.

  python3 tools/add_team.py                  list what's in your department and what's in the library
  python3 tools/add_team.py website-team     add the Website Team (Windows: py tools/add_team.py website-team)
  ... --anyway                               also add a team (or team member) marked not ready
  ... --from-github                          take the team from the public template on GitHub, even if this
                                             repo has its own library copy

It never touches business.md or anything in brand/, and never replaces a team that's already in departments/:
if the folder is there, it stops and changes nothing. If this repo has no library copy of the team (a copy made
before the library existed), it fetches the team from the public template on GitHub, read-only.

Standard library only.
"""
import json
import os
import re
import shutil
import subprocess
import sys
import urllib.error
import urllib.request

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
import sync  # noqa: E402  (the same readers sync uses)

LIBRARY = os.path.join(ROOT, "library", "teams")
DEPTS = os.path.join(ROOT, "departments")
NOT_READY = "NOT-READY.md"
REPO_API = "https://api.github.com/repos/ThatVibeCoder/tvs-marketing-department/contents/"
REPO_RAW = "https://raw.githubusercontent.com/ThatVibeCoder/tvs-marketing-department/main/"


def first_line(path):
    """The first real line of a NOT-READY.md: what's missing, in one line."""
    for ln in sync.read(path).splitlines():
        ln = ln.strip()
        if ln and not ln.startswith("#"):
            return ln
    return "marked not ready"


def library_teams():
    """Every team in the library: folder, department, name, purpose, ready or not, the members not ready yet."""
    out = []
    if not os.path.isdir(LIBRARY):
        return out
    for dept in sorted(os.listdir(LIBRARY)):
        ddir = os.path.join(LIBRARY, dept)
        if not os.path.isdir(ddir):
            continue
        for team in sorted(os.listdir(ddir)):
            tdir = os.path.join(ddir, team)
            tpath = os.path.join(tdir, "team.md")
            if not os.path.isfile(tpath):
                continue
            meta, body = sync.frontmatter(sync.read(tpath))
            members = [m for m in sorted(os.listdir(tdir)) if os.path.isfile(os.path.join(tdir, m, m + ".md"))]
            skills = sorted({s for m in members for s in (os.listdir(os.path.join(tdir, m, "skills"))
                                                            if os.path.isdir(os.path.join(tdir, m, "skills")) else [])
                             if os.path.isfile(os.path.join(tdir, m, "skills", s, "SKILL.md"))})
            nr = os.path.join(tdir, NOT_READY)
            out.append({"id": team, "department": dept, "name": meta.get("name", team), "purpose": meta.get("purpose", ""),
                        "ready": not os.path.isfile(nr), "notReady": first_line(nr) if os.path.isfile(nr) else "",
                        "members": members, "skills": skills, "body": body,
                        "membersNotReady": {m: first_line(os.path.join(tdir, m, NOT_READY)) for m in members
                                            if os.path.isfile(os.path.join(tdir, m, NOT_READY))},
                        "added": os.path.isfile(os.path.join(DEPTS, dept, team, "team.md"))})
    # "works best with": a workflow step that names another team's member or skill
    owner_of = {}
    for t in out:
        for m in t["members"]:
            owner_of[m.replace("-", " ")] = t["id"]
            mt = sync.read(os.path.join(LIBRARY, t["department"], t["id"], m, m + ".md"))
            title = re.search(r"^# (.+)$", mt, re.M)
            if title:
                owner_of[title.group(1).strip().lower()] = t["id"]
        for s in t["skills"]:
            owner_of[s] = t["id"]
    for t in out:
        need = set()
        for w in sync.read_workflows(t["body"], t["id"]):
            for st in w["steps"]:
                for key in (st["member"].lower(), st["skill"]):
                    o = owner_of.get(key)
                    if key and o and o != t["id"]:
                        need.add(o)
        t["worksWith"] = sorted(need)
    sync.errors.clear()
    return out


def added_teams():
    out = []
    for dept in sorted(os.listdir(DEPTS)) if os.path.isdir(DEPTS) else []:
        ddir = os.path.join(DEPTS, dept)
        for team in sorted(os.listdir(ddir)) if os.path.isdir(ddir) else []:
            if os.path.isfile(os.path.join(ddir, team, "team.md")):
                out.append((dept, team))
    return out


# ---------- fetching a team from the public template (for copies made before the library) ----------
def _get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "tvs-add-team", "Accept": "application/vnd.github+json"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def fetch_from_github(team):
    """Download library/teams/<dept>/<team>/ into the local library, file by file, read-only. Returns its dept."""
    try:
        depts = [d["name"] for d in json.loads(_get(REPO_API + "library/teams")) if d.get("type") == "dir"]
        for dept in depts:
            names = [d["name"] for d in json.loads(_get(REPO_API + f"library/teams/{dept}")) if d.get("type") == "dir"]
            if team in names:
                _fetch_dir(f"library/teams/{dept}/{team}")
                return dept
    except (urllib.error.URLError, ValueError) as e:
        raise SystemExit(f"Couldn't reach the public template on GitHub ({e}). Check your internet connection and try again.")
    return None


def _fetch_dir(path):
    for item in json.loads(_get(REPO_API + path)):
        if item.get("type") == "dir":
            _fetch_dir(item["path"])
        elif item.get("type") == "file":
            dest = os.path.join(ROOT, *item["path"].split("/"))
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            with open(dest, "wb") as f:
                f.write(_get(REPO_RAW + item["path"]))


# ---------- adding ----------
def find(team, teams):
    key = team.strip().lower().replace(" ", "-")
    if not key.endswith("-team") and not any(t["id"] == key for t in teams):
        key += "-team"
    return next((t for t in teams if t["id"] == key), None), key


def add(team, anyway=False, from_github=False):
    teams = library_teams()
    t, key = find(team, teams)
    if from_github or not t:
        if from_github and t:
            raise SystemExit(f"There's already a library copy of {key} here; remove library/teams/{t['department']}/{key}/ "
                             "first if you want the GitHub one instead.")
        print(f"No library copy of {key} here, so fetching it from the public template on GitHub (read-only)...")
        if not fetch_from_github(key):
            raise SystemExit(f"There's no team called {key} in the library. Run python3 tools/add_team.py to see them all.")
        teams = library_teams()
        t, key = find(key, teams)
    src = os.path.join(LIBRARY, t["department"], t["id"])
    dest = os.path.join(DEPTS, t["department"], t["id"])
    if os.path.exists(dest):
        raise SystemExit(f"departments/{t['department']}/{t['id']}/ is already there, so nothing was changed. "
                         "It may hold your own edits: compare it with the library copy before replacing anything.")
    if not t["ready"] and not anyway:
        raise SystemExit(f"The {t['name']} is marked not ready: {t['notReady']}\n"
                         "Nothing was added. Add it anyway with --anyway once you've heard what's missing.")
    if not os.path.isfile(os.path.join(DEPTS, t["department"], "README.md")):
        raise SystemExit(f"departments/{t['department']}/README.md is missing, so there's no {t['department']} department to "
                         "add the team to. Make it first (copy another department's README).")
    skip = set() if anyway else set(t["membersNotReady"])

    def ignore(d, names):
        here = os.path.relpath(d, src)
        drop = {NOT_READY}
        if here == ".":
            drop |= skip
        return [n for n in names if n in drop]
    shutil.copytree(src, dest, ignore=ignore)
    print(f"Added the {t['name']} to departments/{t['department']}/{t['id']}/: "
          f"{len(t['members']) - len(skip)} team members, {len(t['skills'])} skills.")
    for m, why in t["membersNotReady"].items():
        print(f"  {'Added' if anyway else 'Left out'} {m} (not ready: {why})")
    if t["worksWith"]:
        print("  Works best next to: " + ", ".join(t["worksWith"]) + " (add them when the classroom gets there).")
    r = subprocess.run([sys.executable, os.path.join(ROOT, "tools", "sync.py")], cwd=ROOT, capture_output=True, text=True, encoding="utf-8")
    print(r.stdout.strip())
    if r.returncode != 0:
        print("The team was added, but the sync command found something to fix (the lines above marked FIX).")
        sys.exit(1)


def show():
    teams = library_teams()
    have = added_teams()
    print("In your department now:")
    for dept, team in have:
        print(f"  {team}  ({dept})")
    print("\nIn the team library (add one with: python3 tools/add_team.py <team>):")
    for t in teams:
        state = "added" if t["added"] else "ready" if t["ready"] else "not ready"
        line = f"  {t['id']:<17} {state:<10} {t['purpose']}"
        print(line)
        if not t["ready"]:
            print(f"  {'':<17} {'':<10} missing: {t['notReady']}")
        for m, why in t["membersNotReady"].items():
            print(f"  {'':<17} {'':<10} {m} not ready yet: {why}")
        if t["worksWith"]:
            print(f"  {'':<17} {'':<10} works best with: {', '.join(t['worksWith'])}")


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args:
        show()
        return
    add(" ".join(args), anyway="--anyway" in sys.argv, from_github="--from-github" in sys.argv)


if __name__ == "__main__":
    main()
