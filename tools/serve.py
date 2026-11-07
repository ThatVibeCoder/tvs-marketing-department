#!/usr/bin/env python3
"""Open the Command Center with editing turned on.

The Command Center opens straight from the folder (command-center/index.html) and shows everything,
read-only. Run this when you want its buttons to work: Save changes in the post editor, Approve and
Reject on the review pages, and the Settings pages. It serves the page on your own computer only, and
every change lands in a file in this repo:

  - a post edit        -> departments/marketing/content-team/social-manager/posts/<id>.md
  - a setting          -> command-center/settings.json (nothing secret ever goes here)
  - an API key         -> .env at the top of the repo (skipped by every save; never sent back to the page)

After each change it runs tools/sync.py, so the folder view catches up too.

  python3 tools/serve.py              start it on http://localhost:8765 (Mac and Linux)
  py tools/serve.py                   the same on Windows (or: python tools/serve.py)
  ... --port 9000                     use another port
  ... --open                          also open it in your browser

Stop it with Ctrl+C. Standard library only. Nothing here posts anywhere: posting stays with the
post-content skill (the Content Team's, once its lesson builds it), and you send every post yourself.
"""
import datetime
import json
import mimetypes
import os
import re
import subprocess
import sys
import threading
import traceback
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import unquote, urlparse

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

ROOT = os.path.realpath(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # real path, so a symlinked folder still serves
sys.path.insert(0, os.path.join(ROOT, "tools"))
import sync  # noqa: E402  (the same readers the folder view uses)
import pull_web  # noqa: E402  (the Web pages' Google pull)
import files  # noqa: E402  (every write: inside the repo, no links, all at once)

CC = os.path.join(ROOT, "command-center")
ENV_FILE = os.path.join(ROOT, ".env")
LOCK = threading.Lock()
MEDIA_EXT = (".png", ".jpg", ".jpeg", ".webp", ".gif", ".mp4", ".mov", ".webm", ".m4v")

# The keys the Connected Accounts page can save, by provider. Names only ever leave this file as names.
KEYS = {
    "blotato": ["BLOTATO_API_KEY"],
    "metricool": ["METRICOOL_USER_TOKEN", "METRICOOL_USER_ID", "METRICOOL_BLOG_ID"],
    "ayrshare": ["AYRSHARE_API_KEY"],
    "meta": ["META_ACCESS_TOKEN", "INSTAGRAM_ACCOUNT_ID", "THREADS_ACCESS_TOKEN"],
    "x": ["X_API_KEY", "X_API_SECRET", "X_ACCESS_TOKEN", "X_ACCESS_SECRET"],
    "linkedin": ["LINKEDIN_ACCESS_TOKEN"],
    "youtube": ["YOUTUBE_CLIENT_ID", "YOUTUBE_CLIENT_SECRET"],
    "tiktok": ["TIKTOK_CLIENT_KEY", "TIKTOK_CLIENT_SECRET"],
    "web": ["GA_SERVICE_ACCOUNT_KEY", "GA_PROPERTY_ID", "GSC_SITE"],
    # web tools set up in Settings → Web connections; nothing pulls from these yet
    "clarity": ["CLARITY_PROJECT_ID", "CLARITY_API_TOKEN"],
    "bing": ["BING_SITE_URL", "BING_WEBMASTER_API_KEY"],
    "otherweb": ["OTHER_ANALYTICS_API_KEY"],
    # payments: saved here for the Payments Agent; nothing in this repo calls a payment provider
    "stripe": ["STRIPE_RESTRICTED_KEY"],
    "square": ["SQUARE_ACCESS_TOKEN"],
    "paypal": ["PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET"],
    "lemonsqueezy": ["LEMONSQUEEZY_API_KEY"],
    "shopify": ["SHOPIFY_STORE_DOMAIN", "SHOPIFY_CLIENT_ID", "SHOPIFY_CLIENT_SECRET"],
    "otherpay": ["PAYMENTS_API_KEY"],
}
ALL_KEYS = [k for v in KEYS.values() for k in v]
EDITABLE = ["status", "date", "time", "title", "category", "account", "media", "media_type", "job",
            "posted_at", "link", "notes"]


# ---------- .env ----------
def read_env():
    out = {}
    if os.path.isfile(ENV_FILE):
        with open(ENV_FILE, encoding="utf-8") as f:
            for line in f:
                m = re.match(r"^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$", line)
                if m:
                    out[m.group(1)] = m.group(2).strip()
    return out


def key_presence():
    env = read_env()
    return {k: bool(env.get(k, "").strip().strip("\"'")) for k in ALL_KEYS}


def write_key(name, value):
    """Set or remove one KEY=value line in .env, keeping every other line exactly as it was."""
    lines = []
    if os.path.isfile(ENV_FILE):
        with open(ENV_FILE, encoding="utf-8") as f:
            lines = f.read().splitlines()
    pat = re.compile(r"^\s*" + re.escape(name) + r"\s*=")
    lines = [ln for ln in lines if not pat.match(ln)]
    if value:
        lines.append(f"{name}={value}")
    files.atomic_write(ENV_FILE, "\n".join(lines) + ("\n" if lines else ""), mode=0o600)  # .env: yours only, never half-written


# ---------- post files ----------
def post_path(pid):
    if not re.match(r"^[a-z0-9][a-z0-9-]{0,120}$", pid or ""):
        raise ValueError("That post id isn't valid.")
    return os.path.join(sync.POSTS_DIR, pid + ".md")


def fm_value(v):
    v = "" if v is None else str(v)
    if v == "" or re.search(r"[:#\n\"'\[\]{}&*!|>%@`]|^\s|\s$", v):
        return json.dumps(v, ensure_ascii=False)
    return v


def write_post(pid, meta, body):
    lines = ["---"]
    for k in sync.POST_FIELDS:
        v = meta.get(k, "")
        if k in ("platform", "status") or str(v).strip():
            lines.append(f"{k}: {fm_value(v)}")
    lines.append("---")
    text = "\n".join(lines) + "\n" + body.replace("\r\n", "\n").rstrip("\n") + "\n"
    os.makedirs(sync.POSTS_DIR, exist_ok=True)
    files.atomic_write(post_path(pid), text)


def load_post_meta(pid):
    p = post_path(pid)
    if not os.path.isfile(p):
        raise FileNotFoundError("That post file isn't there anymore.")
    meta, body = sync.frontmatter(sync.read(p))
    meta = {k: v for k, v in meta.items() if k != "__raw__"}
    return meta, body


def check_fields(data):
    for k in ("platform", "status", "date", "time", "title", "category", "body", "media", "media_type", "notes", "link", "account", "job", "posted_at", "hash"):
        if k in data and data[k] is not None and not isinstance(data[k], str):
            raise ValueError(f"{k} has to be plain text.")
    if "platform" in data and data["platform"] not in sync.PLATFORMS:
        raise ValueError("Pick one of the seven platforms.")
    if "status" in data and data["status"] not in sync.POST_STATUSES:
        raise ValueError("Status must be draft, approved, rejected or posted.")
    if data.get("date") and not re.match(r"^\d{4}-\d{2}-\d{2}$", data["date"]):
        raise ValueError("The date needs to look like 2026-11-07.")
    if data.get("time") and not re.match(r"^\d{1,2}:\d{2}$", data["time"]):
        raise ValueError("The time needs to look like 09:30.")


def now_iso():
    return datetime.datetime.now().replace(microsecond=0).isoformat()


def new_id(platform, date, body):
    words = re.sub(r"[^a-z0-9]+", "-", body.lower()).strip("-").split("-")[:5]
    base = "-".join([date or datetime.date.today().isoformat(), platform] + [w for w in words if w])[:80].strip("-")
    pid, n = base, 2
    while os.path.exists(post_path(pid)):
        pid, n = f"{base}-{n}", n + 1
    return pid


def update_post(pid, data):
    check_fields(data)
    meta, body = load_post_meta(pid)
    if data.get("hash") and files.content_hash(sync.read(post_path(pid))) != data["hash"]:
        raise files.Stale(files.STALE)
    for k in EDITABLE:
        if k in data:
            meta[k] = data[k]
    if "body" in data:
        body = str(data["body"])
    if data.get("status") == "posted" and not meta.get("posted_at"):
        meta["posted_at"] = now_iso()
    meta["updated"] = now_iso()
    write_post(pid, meta, body)
    return pid


def create_post(data):
    if not os.path.isfile(os.path.join(os.path.dirname(os.path.dirname(sync.POSTS_DIR)), "team.md")):
        raise ValueError("Posts belong to the Content Team, and it isn't in your folder yet: the Content Team lesson builds it.")
    data = {k: v for k, v in data.items() if v not in (None,)}
    if data.get("platform") not in sync.PLATFORMS:
        raise ValueError("Pick a platform first.")
    data.setdefault("status", "draft")
    check_fields(data)
    body = str(data.get("body", ""))
    pid = new_id(data["platform"], data.get("date", ""), body)
    meta = {k: data.get(k, "") for k in sync.POST_FIELDS if k in data}
    meta.update({"platform": data["platform"], "status": data["status"], "created": now_iso(), "updated": now_iso()})
    write_post(pid, meta, body)
    return pid


def duplicate_post(pid):
    meta, body = load_post_meta(pid)
    copy = {k: meta.get(k, "") for k in ("platform", "title", "category", "account", "media", "media_type", "job")}
    copy.update({"status": "draft", "body": body})
    return create_post(copy)


# ---------- settings ----------
# what a pasted secret looks like: provider prefixes, a private key, a Google or Meta token, a long token-ish run
KEY_SHAPE = re.compile(r"\b(?:sk|rk|pk)_(?:live|test)_[A-Za-z0-9]{10,}|-----BEGIN [A-Z ]*KEY-----|\"?private_key\"?\s*:|"
                       r"\bghp_[A-Za-z0-9]{20,}|\bgithub_pat_[A-Za-z0-9_]{20,}|\bAIza[0-9A-Za-z_-]{30,}|\bEAA[A-Za-z0-9]{24,}|"
                       r"\bxox[abposr]-[A-Za-z0-9-]{10,}|\bsk-(?:ant-)?[A-Za-z0-9_-]{20,}|(?=[A-Za-z0-9+/_-]*\d)(?=[A-Za-z0-9+/_-]*[A-Z])[A-Za-z0-9+/_-]{40,}")


def strings_in(value):
    """Every text value inside a settings object, however deep."""
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for v in value.values():
            yield from strings_in(v)
    elif isinstance(value, list):
        for v in value:
            yield from strings_in(v)


SETTING_KEYS = ("account", "workspace", "brands", "accounts", "poster", "cadence", "skoolCategories", "web", "payments", "hiddenPlatforms")


def merge3(current, base, new):
    """What the page changed (base -> new), applied on top of what the file holds now, so a tab opened before
    someone else edited settings.json can't put the old values back. Lists merge by item (added and removed
    items), objects by field; a plain value is just the new one."""
    if new == base:
        return current
    if current == base:
        return new
    if isinstance(new, dict) and isinstance(base, dict) and isinstance(current, dict):
        out = dict(current)
        for k in set(base) | set(new):
            if new.get(k) == base.get(k):
                continue
            if k not in new:
                out.pop(k, None)
            else:
                out[k] = merge3(current.get(k), base.get(k), new[k])
        return out
    if isinstance(new, list) and isinstance(base, list) and isinstance(current, list):
        removed = [x for x in base if x not in new]
        added = [x for x in new if x not in base]
        return [x for x in current if x not in removed] + [x for x in added if x not in current]
    return new


def save_settings(data):
    if not isinstance(data, dict):
        raise ValueError("Settings must be an object.")
    named = re.compile(r"\b(?:" + "|".join(map(re.escape, ALL_KEYS)) + r")\s*[=:]\s*\S")  # a pasted .env line
    for v in strings_in({k: v for k, v in data.items() if k != "_base"}):  # _base is what the file already held
        if re.match(r"^https?://", v.strip()):
            continue  # a link (a Google Sheet, a long LinkedIn URL) is never a key
        if KEY_SHAPE.search(v) or named.search(v):
            raise ValueError("That looks like a key. Keys never go in settings.json (it's saved to GitHub): paste it under "
                             "Connected Accounts, Payments or Web connections, which keep it in .env.")
    hidden = data.get("hiddenPlatforms")
    if hidden is not None and not (isinstance(hidden, list) and all(p in sync.PLATFORMS for p in hidden)):
        raise ValueError("Hidden platforms must be a list of the seven platforms.")
    base = data.get("_base") if isinstance(data.get("_base"), dict) else None  # what the page had when it changed it
    current = sync.load_settings()
    for k in SETTING_KEYS:
        if k in data:
            current[k] = merge3(current.get(k), base[k], data[k]) if base is not None and k in base else data[k]
    files.atomic_write(sync.SETTINGS_FILE, json.dumps(current, indent=2, ensure_ascii=False) + "\n")
    return current


def resync():
    r = subprocess.run([sys.executable, os.path.join(ROOT, "tools", "sync.py")], cwd=ROOT,
                       capture_output=True, text=True, encoding="utf-8")
    fixes = [ln[5:] for ln in r.stdout.splitlines() if ln.startswith("FIX: ")]
    return {"ok": r.returncode == 0, "fix": fixes[:5]}


def web_snapshot():
    p = os.path.join(sync.CC_DATA, "web.json")
    try:
        with open(p, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return None


def clean_key(name, value):
    """One-line values only; the service-account JSON is checked and folded onto one line."""
    if name == "GA_SERVICE_ACCOUNT_KEY" and value:
        try:
            sa = json.loads(value)
        except ValueError:
            raise ValueError("That isn't the JSON key file. Open the .json file Google downloaded and paste all of it.")
        if not (isinstance(sa, dict) and sa.get("type") == "service_account" and sa.get("client_email") and sa.get("private_key")):
            raise ValueError("That JSON isn't a service-account key. In Google Cloud: the service account, Keys, Add key, JSON.")
        return json.dumps(sa, separators=(",", ":"))
    if name == "GA_PROPERTY_ID" and value and not re.match(r"^(properties/)?\d+$", value):
        raise ValueError("The GA4 property id is a number only, from Admin → Property details (not the G- measurement id).")
    if name == "GSC_SITE" and value and not re.match(r"^(sc-domain:[a-z0-9.-]+|https?://\S+/)$", value):
        raise ValueError("Write it the way Search Console shows it: sc-domain:yoursite.com, or https://www.yoursite.com/ with the last slash.")
    if name == "STRIPE_RESTRICTED_KEY" and value and not value.startswith("rk_"):
        if value.startswith("sk_"):
            raise ValueError("That's a secret key, which can move money. Make a restricted key (it starts with rk_) with Read access only, and paste that.")
        raise ValueError("A Stripe restricted key starts with rk_live_ (or rk_test_ for test mode).")
    if name == "SHOPIFY_STORE_DOMAIN" and value and not re.match(r"^[a-z0-9][a-z0-9-]*\.myshopify\.com$", value):
        raise ValueError("Write the store's myshopify address, like your-store.myshopify.com (no https://).")
    if name == "BING_SITE_URL" and value and not re.match(r"^https?://\S+/$", value):
        raise ValueError("Write the address the way Bing shows it, with https:// and the last slash: https://www.yoursite.com/")
    if name == "CLARITY_PROJECT_ID" and value and not re.match(r"^[A-Za-z0-9]{4,32}$", value):
        raise ValueError("The Clarity Project ID is the short code from Settings, Overview (a short code of letters and numbers).")
    if re.search(r"[\r\n]", value):
        raise ValueError("A key is one line.")
    return value


def state():
    sync.errors.clear()
    content = sync.build_content()
    problems = list(dict.fromkeys(sync.errors))
    sync.errors.clear()
    sync.warnings.clear()  # notes are for the terminal; the server would only pile them up
    return {"content": content, "settings": sync.load_settings(), "keys": key_presence(), "problems": problems, "web": web_snapshot(),
            "payments": sync.load_payments()[0], "landingPages": sync.landing_pages(),
            "server": {"python": sys.version.split()[0], "root": os.path.basename(ROOT),
                       "envFile": os.path.isfile(ENV_FILE), "version": read_version()}}


def read_version():
    p = os.path.join(ROOT, "VERSION")
    return sync.read(p).strip() if os.path.isfile(p) else ""


# ---------- the server ----------
class Handler(BaseHTTPRequestHandler):
    server_version = "CommandCenter"

    def log_message(self, fmt, *args):  # quiet: one line per write, nothing per file served
        pass

    def allowed_host(self):
        host = (self.headers.get("Host") or "").split(":")[0]
        return host in ("localhost", "127.0.0.1")

    def send_json(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def send_file(self, path):
        ctype = mimetypes.guess_type(path)[0] or "application/octet-stream"
        size = os.path.getsize(path)
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(size))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        with open(path, "rb") as f:
            while True:
                chunk = f.read(65536)
                if not chunk:
                    break
                self.wfile.write(chunk)

    def do_GET(self):
        if not self.allowed_host():
            return self.send_json(403, {"error": "Open this from localhost."})
        path = unquote(urlparse(self.path).path)
        if path == "/api/health":
            return self.send_json(200, {"ok": True})
        if path == "/api/state":
            return self.send_json(200, state())
        if path.startswith("/repo/"):  # media a post points at, inside this repo only
            target = os.path.realpath(os.path.join(ROOT, path[len("/repo/"):]))
            if (os.path.commonpath([ROOT, target]) != ROOT or target == ROOT or not target.lower().endswith(MEDIA_EXT)
                    or any(part.startswith(".") for part in os.path.relpath(target, ROOT).split(os.sep))
                    or not os.path.isfile(target)):
                return self.send_json(404, {"error": "Not found"})
            return self.send_file(target)
        rel_path = "index.html" if path in ("", "/") else path.lstrip("/")
        target = os.path.realpath(os.path.join(CC, rel_path))
        if os.path.commonpath([CC, target]) != CC or not os.path.isfile(target):
            return self.send_json(404, {"error": "Not found"})
        return self.send_file(target)

    def do_POST(self):
        if not self.allowed_host():
            return self.send_json(403, {"error": "Open this from localhost."})
        # a browser always says where a request comes from: only this page (this server's own address and port)
        # may change files. Another site, or another local dev server on a different port, gets a 403.
        origin = self.headers.get("Origin")
        port = self.server.server_address[1]
        if origin and origin not in (f"http://localhost:{port}", f"http://127.0.0.1:{port}"):
            return self.send_json(403, {"error": "Only this page can make changes."})
        # the exact media type: a "simple" text/plain (which a browser sends cross-site without asking) never counts
        if (self.headers.get("Content-Type") or "").split(";")[0].strip().lower() != "application/json":
            return self.send_json(415, {"error": "Send JSON."})
        try:
            length = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            length = -1
        if length < 0:
            return self.send_json(400, {"error": "That request had no readable length."})
        if length > 2_000_000:
            return self.send_json(413, {"error": "That's too big to save from here (2 MB at most)."})
        try:
            data = json.loads(self.rfile.read(length) or b"{}")
        except ValueError:
            return self.send_json(400, {"error": "That wasn't valid JSON."})
        if not isinstance(data, dict):
            return self.send_json(400, {"error": "Send one JSON object."})
        path = urlparse(self.path).path
        try:
            # the Google calls can take 30 seconds: they run before the lock, so a save never waits on them
            if path == "/api/web/test":
                result = {"test": pull_web.test_connection()}
                print(f"  {datetime.datetime.now():%H:%M:%S}  tested the Google connection", flush=True)
                result.update({"ok": True, "state": state()})
                return self.send_json(200, result)
            pulled = None
            if path == "/api/web/pull":
                try:
                    pulled = pull_web.pull()
                except pull_web.WebPullError as e:
                    raise ValueError(str(e))
            with LOCK:
                m = re.match(r"^/api/posts/([a-z0-9-]+)(/duplicate)?$", path)
                if path == "/api/posts":
                    result = {"id": create_post(data)}
                    what = f"new post {result['id']}"
                elif m and m.group(2):
                    result = {"id": duplicate_post(m.group(1))}
                    what = f"copied {m.group(1)} to {result['id']}"
                elif m:
                    result = {"id": update_post(m.group(1), data)}
                    what = f"saved {m.group(1)}"
                elif path == "/api/settings":
                    save_settings(data)
                    result, what = {}, "saved settings"
                elif path == "/api/keys":
                    if not isinstance(data.get("name"), str) or not isinstance(data.get("value", ""), str):
                        raise ValueError("A key is a name and a value, both plain text.")
                    name, value = data["name"], data.get("value", "").strip()
                    if name not in ALL_KEYS:
                        raise ValueError("That key name isn't on the list.")
                    write_key(name, clean_key(name, value))
                    result, what = {}, f"{'saved' if value else 'removed'} {name} in .env"
                elif path == "/api/web/pull":
                    files.writable(os.path.join(sync.CC_DATA, "web.json"))
                    pull_web.write(pulled)
                    result, what = {}, "pulled the website numbers into command-center/data/web.json"
                else:
                    return self.send_json(404, {"error": "Not found"})
                synced = resync()
        except files.Stale as e:
            return self.send_json(409, {"error": str(e)})
        except FileNotFoundError as e:
            return self.send_json(404, {"error": str(e)})
        except ValueError as e:
            return self.send_json(400, {"error": str(e)})
        except Exception:  # never a dropped connection: say so on the page, put the details in this window
            traceback.print_exc()
            return self.send_json(500, {"error": "Something went wrong saving that. The window running tools/serve.py has the details."})
        print(f"  {datetime.datetime.now():%H:%M:%S}  {what}", flush=True)
        result.update({"ok": True, "synced": synced, "state": state()})
        return self.send_json(200, result)


def main():
    port = 8765
    if "--port" in sys.argv:
        i = sys.argv.index("--port") + 1
        if i >= len(sys.argv) or not sys.argv[i].isdigit():
            sys.exit("--port needs a number, like: python3 tools/serve.py --port 8765")
        port = int(sys.argv[i])
    httpd = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    url = f"http://localhost:{port}/"
    print(f"Command Center with editing on: {url}")
    print("Changes land in your files. Stop with Ctrl+C.", flush=True)
    if "--open" in sys.argv:
        webbrowser.open(url)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")


if __name__ == "__main__":
    main()
