#!/usr/bin/env python3
"""Rebuild the dashboard's data from the engine's own files.

Run it after a routine, a post, a setting, a landing page or the payments file changes, and before every save.
It reads only files inside this repo:

  routines/<name>/README.md        -> the Automations page (one card and one flow per routine)
  dashboard/data/executions.json   -> the Executions page (one line per run, written by your routines)
  posts/<id>.md                    -> the Content pages (posts/calendars/ holds the posting calendars)
  dashboard/settings.json          -> Settings (never a key: keys live in .env)
  dashboard/landing-pages.json     -> Web & Analytics, Landing Pages
  dashboard/data/payments.json     -> the Dashboard's revenue (copied to payments.js; both stay on this computer)

and writes dashboard/data/ (automations.json, content.json, executions.json when missing, data.js), so the
dashboard opens straight from the folder. It prints FIX for anything broken and writes nothing until it's fixed.

  python3 tools/sync.py           rebuild the dashboard data (Mac and Linux)
  py tools/sync.py                the same on Windows (or: python tools/sync.py)
  ... --check                     change nothing; exit 1 if anything is out of date or broken

Standard library only.
"""
import datetime, hashlib, json, os, re, sys

# Windows consoles often can't print every character; never crash over that
for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

ROOT = os.path.realpath(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CC = os.path.join(ROOT, "dashboard")
CC_DATA = os.path.join(CC, "data")

errors, warnings = [], []


def rel(p):
    return os.path.relpath(p, ROOT).replace(os.sep, "/")  # same paths on Windows, Mac and Linux


def read(p):
    with open(p, encoding="utf-8") as f:
        return f.read()


def write(p, text, mode=None):
    """Write a whole file at once: into a temp file next to it, then swapped in, so a crash (or an AI reading at
    that moment) never sees half a file. mode=0o600 keeps a file private to you (.env)."""
    import tempfile
    d = os.path.dirname(p)
    os.makedirs(d, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=d, prefix="." + os.path.basename(p) + ".", suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8", newline="") as f:
            f.write(text)
        if mode is None:  # mkstemp makes the temp file 0600: give it the old file's mode, or the usual one for a new file
            if os.path.exists(p):
                mode = os.stat(p).st_mode & 0o777
            else:
                um = os.umask(0); os.umask(um)
                mode = 0o666 & ~um
        os.chmod(tmp, mode)
        os.replace(tmp, p)
    except BaseException:
        if os.path.exists(tmp):
            os.remove(tmp)
        raise


def frontmatter(text):
    """Simple `key: value` frontmatter between --- lines. Values may be wrapped in quotes. Returns (dict, body)."""
    # A doc pasted from Google Docs often carries blank lines (or an invisible BOM) above the first ---.
    # They change nothing, so skip them instead of failing with "needs a name: and a description:".
    text = text.lstrip("\ufeff \t\r\n")
    if not text.startswith("---"):
        return {}, text
    end = text.find("\n---", 3)
    if end < 0:
        return {}, text
    meta, raw = {}, {}
    for line in text[3:end].strip().splitlines():
        if ":" in line and not line.startswith((" ", "\t")):
            k, v = line.split(":", 1)
            v = v.strip()
            raw[k.strip()] = v
            if len(v) >= 2 and v[0] == v[-1] and v[0] in "\"'":
                try:
                    v = json.loads(v) if v[0] == '"' else v[1:-1]
                except ValueError:
                    v = v[1:-1]
            meta[k.strip()] = v
    meta["__raw__"] = raw
    return meta, text[end + 4:].lstrip("\n")


def yaml_safe(raw_value):
    """True if a value is safe in strict YAML: quoted, or free of ': ', ' #' and a leading special character."""
    v = raw_value.strip()
    if len(v) >= 2 and v[0] == v[-1] and v[0] in "\"'":
        return True
    return ": " not in v and " #" not in v and v[:1] not in set("[]{}&*!|>%@`'\"")


def first_paragraph(body):
    for block in re.split(r"\n\s*\n", body):
        b = block.strip()
        if b and not b.startswith(("#", "---", "```")):
            return re.sub(r"\s+", " ", b)
    return ""


def section_text(body, title):
    m = re.search(r"^## " + re.escape(title) + r"\s*$(.*?)(?=^## |\Z)", body, re.M | re.S)
    return m.group(1) if m else ""


# ---------- 1. Automations (routines/) ----------
ICON_FOR = [("approve", "check"), ("plan", "form"), ("save", "db"), ("ship", "send"), ("live", "send"),
            ("test", "check"), ("security", "shield"), ("sweep", "shield"), ("read", "search"), ("check", "search"),
            ("write", "form"), ("draft", "form"), ("key", "shield"), ("report", "log"), ("research", "search")]


def icon(text):
    t = text.lower()
    for k, v in ICON_FOR:
        if k in t:
            return v
    return "sparkle"


# The flow canvas: a row of cards on a COL 300 x ROW 110 grid, the trigger on the left, then who runs it, then each
# step, inside colour-coded frames. Frame geometry is in builder units (a 288x76 card on screen is about 229x72 here).
FLOW_COL, FLOW_ROW = 300, 110


def flow_at(col, row):
    return {"x": col * FLOW_COL, "y": row * FLOW_ROW}


def flow_frame(fid, title, subtitle, tone, c0, r0, c1, r1, icon_key=None):
    f = {"id": fid, "title": title, "subtitle": subtitle, "tone": tone, "x": c0 * FLOW_COL - 24, "y": r0 * FLOW_ROW - 74,
         "width": (c1 - c0) * FLOW_COL + 229 + 48, "height": (r1 - r0) * FLOW_ROW + 72 + 90}
    if icon_key:
        f["icon"] = icon_key
    return f


def routine_flow(meta, body, sched, live, source):
    steps = [re.sub(r"^\s*\d+\.\s*", "", ln).strip() for ln in section_text(body, "Steps").splitlines() if re.match(r"^\s*\d+\.\s", ln)]
    team = meta.get("team", "") or "you"
    nodes = [{"id": "trigger", **flow_at(0, 0), "icon": "clock", "title": sched or "Not scheduled yet",
              "stat": "runs on its own" if live else "not turned on yet", "tone": "accent" if live else "dimmed",
              "hint": "schedule", "detail": "When it runs. Fill in `schedule:` in the routine's README.md and set `status: live` to turn it on."},
             {"id": "team", **flow_at(1, 0), "icon": "users", "title": team, "stat": "runs the steps", "tone": "default",
              "detail": f"Who runs the steps: {team} (the routine's `team:` line)."}]
    edges = [{"id": "e-trigger-team", "source": "trigger", "target": "team", "animated": live, "label": "run"}]
    prev = "team"
    for i, st in enumerate(steps or ["Steps not written yet"], start=1):
        nid = f"s{i}"
        nodes.append({"id": nid, **flow_at(1 + i, 0), "icon": icon(st), "title": f"Step {i}" if steps else "Steps",
                      "stat": st[:60], "tone": "default" if steps else "dimmed", "detail": st})
        edges.append({"id": f"e-{prev}-{nid}", "source": prev, "target": nid, "animated": live})
        prev = nid
    last = 1 + max(1, len(steps))
    return {"topologySource": source, "nodes": nodes, "edges": edges, "sections": [
        flow_frame("trigger", "Trigger", "when it runs", "runtime", 0, 0, 0, 0, "clock"),
        flow_frame("run", "Runs", team, "action", 1, 0, last, 0, "users")]}


def build_cc():
    autos = []
    rdir = os.path.join(ROOT, "routines")
    for r in sorted(os.listdir(rdir)) if os.path.isdir(rdir) else []:
        p = os.path.join(rdir, r, "README.md")
        if not os.path.isfile(p):
            continue
        meta, body = frontmatter(read(p))
        title = re.search(r"^# (.+)$", body, re.M)
        sched = meta.get("schedule", "")
        for k, v in meta.get("__raw__", {}).items():
            if not yaml_safe(v):
                errors.append(f"{rel(p)}: the `{k}:` line has ': ' in it; wrap the value in double quotes")
        status = meta.get("status", "planned")
        if status not in ("planned", "live"):
            errors.append(f"{rel(p)}: `status:` must be `planned` or `live`")
        autos.append({"id": r, "name": meta.get("name") or (title.group(1) if title else r),
                      "description": meta.get("purpose", first_paragraph(body)), "area": meta.get("team", "routines"),
                      "trigger": {"type": "cron" if sched else "manual", "schedule": sched or "not scheduled yet"},
                      "active": status == "live", "sourceOfTruth": rel(p),
                      "stats": {"lastRunAt": None, "lastRunStatus": None, "runCount": None, "failureCount": None,
                                "failureRate": None, "avgRunMs": None, "extras": []},
                      "flow": routine_flow(meta, body, sched, status == "live", rel(p))})
    return {"automations.json": autos, "content.json": build_content()}


# ---------- 3. Content data (the Content pages of the dashboard) ----------
# Every post is one file in posts/<id>.md: a small header, then the post (posts/README.md shows the shape).
# tools/serve.py edits them, and this reads them for the dashboard.
POSTS_DIR = os.path.join(ROOT, "posts")
CALENDARS_DIR = os.path.join(POSTS_DIR, "calendars")
SETTINGS_FILE = os.path.join(CC, "settings.json")
PLATFORMS = ["tiktok", "instagram", "twitter", "threads", "youtube", "skool", "linkedin"]
POST_STATUSES = ["draft", "approved", "rejected", "posted"]
POST_FIELDS = ["platform", "status", "date", "time", "title", "category", "account", "media", "media_type",
               "job", "posted_at", "link", "notes", "created", "updated"]
VIDEO_EXT = (".mp4", ".mov", ".webm", ".m4v")
DEFAULT_SETTINGS = {
    "account": {"name": "", "role": "Owner"},
    "workspace": {"name": "Your Department", "timezone": "America/New_York", "revenueTarget": 25000},
    "brands": [{"id": "your-brand", "name": "Your Brand", "handle": "@yourhandle", "active": True}],
    "accounts": {p: {"handle": "", "connectedVia": "manual"} for p in PLATFORMS},
    "poster": "manual",
    "cadence": [],
    "skoolCategories": ["General discussion", "Announcements", "Wins"],
    "web": {"siteDomain": ""},
    "payments": {"provider": ""},
    "hiddenPlatforms": [],  # platforms left out of the sidebar (Settings → Connected Accounts)
}


def load_settings():
    """dashboard/settings.json, filled out with the defaults for anything missing. Never holds a key."""
    s = json.loads(json.dumps(DEFAULT_SETTINGS))
    if os.path.isfile(SETTINGS_FILE):
        try:
            mine = json.loads(read(SETTINGS_FILE))
        except ValueError as e:
            errors.append(f"dashboard/settings.json isn't valid JSON ({e}). Fix it, or delete it to start from the defaults.")
            mine = {}
        for k, v in mine.items():
            if isinstance(v, dict) and isinstance(s.get(k), dict):
                s[k].update(v)
            else:
                s[k] = v
    return s


def read_post(path):
    raw = read(path)
    meta, body = frontmatter(raw)
    pid = os.path.splitext(os.path.basename(path))[0]
    platform = str(meta.get("platform", "")).strip().lower()
    status = str(meta.get("status", "draft")).strip().lower() or "draft"
    if platform not in PLATFORMS:
        errors.append(f"{rel(path)}: `platform:` must be one of {', '.join(PLATFORMS)} (found `{platform or 'nothing'}`)")
        return None
    if status not in POST_STATUSES:
        errors.append(f"{rel(path)}: `status:` must be one of {', '.join(POST_STATUSES)} (found `{status}`)")
        return None
    date = str(meta.get("date", "")).strip()
    if date and not re.match(r"^\d{4}-\d{2}-\d{2}$", date):
        errors.append(f"{rel(path)}: `date:` must look like 2026-11-07 (found `{date}`)")
        return None
    time = str(meta.get("time", "")).strip()
    if time and not re.match(r"^\d{1,2}:\d{2}$", time):
        errors.append(f"{rel(path)}: `time:` must look like 09:30 (found `{time}`)")
        return None
    media = str(meta.get("media", "")).strip()
    mtype = str(meta.get("media_type", "")).strip().lower()
    if media and mtype not in ("image", "video"):
        mtype = "video" if media.lower().split("?")[0].endswith(VIDEO_EXT) else "image"
    post = {"id": pid, "path": rel(path), "platform": platform, "status": status, "date": date,
            "time": time.zfill(5) if time else "", "body": body.rstrip("\n"), "media": media,
            "mediaType": mtype if media else "",
            "hash": hashlib.sha1(raw.encode("utf-8")).hexdigest()[:16]}  # sent back with a save: a 409 if the file changed
    for k in ("title", "category", "account", "job", "posted_at", "link", "notes", "created", "updated"):
        post[{"posted_at": "postedAt"}.get(k, k)] = str(meta.get(k, "")).strip() if k != "notes" else str(meta.get(k, ""))
    return post


def build_content():
    posts = []
    if os.path.isdir(POSTS_DIR):
        for f in sorted(os.listdir(POSTS_DIR)):
            if f.endswith(".md") and f.lower() != "readme.md":
                p = read_post(os.path.join(POSTS_DIR, f))
                if p:
                    posts.append(p)
    calendars = [rel(os.path.join(CALENDARS_DIR, f)) for f in sorted(os.listdir(CALENDARS_DIR), reverse=True)
                 if re.match(r"^calendar-.*\.md$", f)] if os.path.isdir(CALENDARS_DIR) else []
    return {"posts": posts, "calendars": calendars, "postsDir": rel(POSTS_DIR)}


# ---------- payments (dashboard/data/payments.json, filled from your payment provider, never saved to GitHub) ----------
PAYMENTS_FILE = os.path.join(CC_DATA, "payments.json")
PAY_STATUS = ("paid", "refunded", "failed")
INVOICE_STATUS = ("open", "paid", "void")
DAY = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def real_day(s):
    try:
        return bool(DAY.match(s)) and bool(datetime.date.fromisoformat(s))
    except ValueError:
        return False


def load_payments():
    """The payments file, checked and cleaned: (data or None, problems). A bad row is skipped and named, never guessed."""
    if not os.path.isfile(PAYMENTS_FILE):
        return None, []
    try:
        raw = json.loads(read(PAYMENTS_FILE))
    except ValueError as e:
        return None, [f"dashboard/data/payments.json isn't valid JSON ({e}). The Dashboard shows no revenue until it is."]
    if not isinstance(raw, dict):
        return None, ["dashboard/data/payments.json should be one object (see dashboard/data/README.md)."]
    problems = []
    money = lambda v: isinstance(v, (int, float)) and not isinstance(v, bool)  # noqa: E731

    def rows(key, status_ok, date_key, need):
        out = []
        for i, r in enumerate(raw.get(key) or []):
            bad = [f for f in need if f not in r] if isinstance(r, dict) else ["the whole row"]
            if not bad and not money(r["amount"]):
                bad = ["amount (a number, like 49.00)"]
            if not bad and r.get(date_key) and not real_day(str(r[date_key])):
                bad = [f"{date_key} (YYYY-MM-DD)"]
            if not bad and str(r.get("status", "")) not in status_ok:
                bad = ["status (one of " + ", ".join(status_ok) + ")"]
            if bad:
                problems.append(f"payments.json {key}[{i}] skipped: check {', '.join(bad)}.")
                continue
            out.append({k: r[k] for k in r if k in ("id", "date", "dueDate", "amount", "customer", "description", "status")})
        return out
    out = {"provider": str(raw.get("provider") or ""), "currency": str(raw.get("currency") or "USD").upper()[:3],
           "capturedAt": raw.get("capturedAt"), "mrr": raw["mrr"] if money(raw.get("mrr")) else None,
           "activeSubscriptions": raw.get("activeSubscriptions") if isinstance(raw.get("activeSubscriptions"), int) else None,
           "payments": rows("payments", PAY_STATUS, "date", ("date", "amount", "status")),
           "invoices": rows("invoices", INVOICE_STATUS, "dueDate", ("amount", "status"))}
    return out, problems


def sync_payments():
    """Copy payments.json to payments.js for the page (or remove a payments.js left behind). Not part of --check:
    both files are gitignored, so they never make a fresh copy look out of date."""
    data, problems = load_payments()
    js = os.path.join(CC_DATA, "payments.js")
    for p in problems:
        warnings.append(p)
    if data is None:
        if os.path.exists(js):
            os.remove(js)  # no file (or a broken one): show the empty state, never yesterday's numbers
        return
    write(js, "// written by tools/sync.py from payments.json so the Dashboard opens straight from the folder. Stays on this computer.\n"
              "window.CC_PAYMENTS = " + json.dumps(data, ensure_ascii=False) + ";\n")


# ---------- landing pages (dashboard/landing-pages.json: one entry per page you ship;
# kept out of site/ so the list of drafts never goes live with the pages) ----------
PAGES_FILE = os.path.join(CC, "landing-pages.json")
PAGE_KINDS = ("landing", "product", "form", "thank-you", "upsell", "other")


def landing_pages():
    """The landing page registry, checked: every page has an id, a kind, and a parent that exists. A bad entry
    is still shown and named in a NOTE, never dropped silently."""
    if not os.path.isfile(PAGES_FILE):
        return {"pages": [], "registry": False}
    try:
        raw = json.loads(read(PAGES_FILE))
    except ValueError as e:
        warnings.append(f"dashboard/landing-pages.json isn't valid JSON ({e}). The Landing Pages page shows nothing until it is.")
        return {"pages": [], "registry": True}
    pages = raw.get("pages") if isinstance(raw, dict) else None
    if not isinstance(pages, list):
        warnings.append('dashboard/landing-pages.json should look like {"pages": [...]} (see dashboard/data/README.md).')
        return {"pages": [], "registry": True}
    out, ids = [], set()
    for i, p in enumerate(pages):
        if not isinstance(p, dict) or not str(p.get("id", "")).strip():
            warnings.append(f"dashboard/landing-pages.json page {i + 1} has no id, so it's skipped.")
            continue
        pid = str(p["id"]).strip()
        if pid in ids:
            warnings.append(f"dashboard/landing-pages.json has two pages with the id {pid}; the second is skipped.")
            continue
        ids.add(pid)
        kind = str(p.get("kind") or "landing")
        if kind not in PAGE_KINDS:
            warnings.append(f"dashboard/landing-pages.json page {pid}: kind {kind!r} isn't one of {', '.join(PAGE_KINDS)}; shown as other.")
            kind = "other"
        out.append({"id": pid, "title": str(p.get("title") or pid), "kind": kind, "parent": str(p.get("parent") or "") or None,
                    "url": str(p.get("url") or ""), "domain": str(p.get("domain") or ""), "route": str(p.get("route") or ""),
                    "file": str(p.get("file") or ""), "offer": str(p.get("offer") or ""), "purpose": str(p.get("purpose") or ""),
                    "status": "live" if p.get("status") == "live" else "draft", "built": str(p.get("built") or ""), "shipped": str(p.get("shipped") or "")})
    for p in out:
        if p["parent"] and p["parent"] not in ids:
            warnings.append(f"dashboard/landing-pages.json page {p['id']}: its parent {p['parent']} isn't in the list, so it shows as a page of its own.")
            p["parent"] = None
    return {"pages": out, "registry": True}


def sync_cc(data, check):
    stale = []
    ex = os.path.join(CC_DATA, "executions.json")
    executions = []
    if os.path.exists(ex):
        try:
            executions = json.loads(read(ex))
        except ValueError as e:
            errors.append(f"dashboard/data/executions.json isn't valid JSON ({e}). Fix it, or replace it with [] to start over.")
        if not isinstance(executions, list):
            errors.append("dashboard/data/executions.json should be a list of runs, like [] when nothing has run yet.")
            executions = []
    files = {k: json.dumps(v, indent=2, ensure_ascii=False) + "\n" for k, v in data.items()}
    if not os.path.exists(ex):
        files["executions.json"] = "[]\n"
    files["data.js"] = ("// generated by tools/sync.py so the dashboard opens straight from the folder. Do not edit.\n"
                        "window.CC_DATA = " + json.dumps({"automations": data["automations.json"],
                                                          "executions": executions, "content": data["content.json"],
                                                          "settings": load_settings(),
                                                          "landingPages": landing_pages()},
                                                         ensure_ascii=False) + ";\n")

    for name, text in files.items():
        p = os.path.join(CC_DATA, name)
        old = read(p) if os.path.exists(p) else None
        if old != text:
            stale.append(rel(p))
            if not check:
                write(p, text)
    return stale


def main():
    check = "--check" in sys.argv
    data = build_cc()
    # look first, write only if nothing is broken
    stale = sync_cc(data, check=True)
    if not check and not errors:
        stale = sync_cc(data, check=False)
    if not check:
        sync_payments()
    content = data["content.json"]
    many = lambda n, word: f"{n} {word}" + ("" if n == 1 else "s")  # noqa: E731
    print(" · ".join([many(len(data["automations.json"]), "routine"), many(len(content["posts"]), "post"),
                      many(len(landing_pages()["pages"]), "landing page")]))
    for w in dict.fromkeys(warnings):
        print("NOTE:", w)
    for e in dict.fromkeys(errors):
        print("FIX:", e)
    if check:
        for s in stale:
            print("OUT OF DATE:", s)
        if errors or stale:
            if errors:
                print("Not in sync. Show the owner each FIX line above, word for word, and stop. Don't rerun until "
                      "something has changed.")
            else:
                print("Not in sync. Run `python3 tools/sync.py` once (Windows: `py tools/sync.py`).")
            sys.exit(1)
        print("Everything is in sync.")
    else:
        if errors:
            print("Nothing was rebuilt. Show the owner each FIX line above, word for word, and stop. Don't rerun "
                  "until something has changed.")
            sys.exit(1)
        print(f"Rebuilt {len(stale)} file(s)." if stale else "Already in sync. Nothing changed.")


if __name__ == "__main__":
    try:
        main()
    except PermissionError as e:  # an AI's sandbox (Codex's keeps .agents/ read-only) blocked a write: say so, once, and stop
        where = os.path.relpath(getattr(e, "filename", "") or ROOT, ROOT)
        print(f"BLOCKED: your AI isn't allowed to write {where}. Ask the owner to approve this command once "
              "(or to run it themselves in a terminal in this folder), then run it again. Don't try to work around it.")
        sys.exit(1)
