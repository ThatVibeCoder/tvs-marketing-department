#!/usr/bin/env python3
"""Pull your website's numbers into the Command Center's Web pages.

Reads Google Analytics 4 and Google Search Console, read-only, with a Google service account, and
writes dashboard/data/web.json plus web.js (so the page still opens straight from the folder).
Both files stay on your computer: .gitignore skips them, so your traffic never lands on GitHub.

  python3 tools/pull_web.py           pull now (Mac and Linux)
  py tools/pull_web.py                the same on Windows (or: python tools/pull_web.py)
  ... --test                          only check the connection, write nothing

What it needs, all in the .env file at the top of the repo (the Command Center's Web → Settings
page saves them for you, or your AI's add-a-key skill does):
  GA_SERVICE_ACCOUNT_KEY   the service account's JSON key, on one line
  GA_PROPERTY_ID           your GA4 property id, the number in Admin → Property details
  GSC_SITE                 your Search Console property: sc-domain:yoursite.com or https://www.yoursite.com/

Standard library only, on purpose: the service-account login needs an RS256 signature, and this file
does that signature itself (RSA with Python's own big numbers), so there's nothing to install and it
works the same on Mac, Windows and Linux. It never posts, edits or deletes anything in Google.
"""
import base64
import datetime
import hashlib
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_FILE = os.path.join(ROOT, ".env")
DATA = os.path.join(ROOT, "dashboard", "data")
SETTINGS_FILE = os.path.join(ROOT, "dashboard", "settings.json")
TOKEN_URL = "https://oauth2.googleapis.com/token"
SCOPES = "https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/webmasters.readonly"
GA_BASE = "https://analyticsdata.googleapis.com/v1beta"
GSC_BASE = "https://searchconsole.googleapis.com/webmasters/v3"
# AWS and Google datacenter towns: their "visitors" are bots, so the US map leaves them out.
DATACENTER_CITIES = ["Boardman", "Ashburn", "Council Bluffs"]
METRICS = [{"name": "activeUsers"}, {"name": "sessions"}, {"name": "newUsers"}, {"name": "screenPageViews"}]


class WebPullError(Exception):
    """A problem worth telling the owner about, in plain words."""


# ---------- .env ----------
def read_env():
    out = {}
    if os.path.isfile(ENV_FILE):
        with open(ENV_FILE, encoding="utf-8") as f:
            for line in f:
                m = re.match(r"^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$", line)
                if m:
                    v = m.group(2).strip()
                    if len(v) >= 2 and v[0] == v[-1] and v[0] in "\"'" and not v.startswith('"{'):
                        v = v[1:-1]
                    out[m.group(1)] = v
    return out


def config():
    env = read_env()
    raw = env.get("GA_SERVICE_ACCOUNT_KEY", "").strip()
    sa = None
    if raw:
        try:
            parsed = json.loads(raw)
            if isinstance(parsed, dict) and parsed.get("client_email") and parsed.get("private_key"):
                sa = {"client_email": parsed["client_email"], "private_key": parsed["private_key"]}
        except ValueError:
            sa = None
    prop = env.get("GA_PROPERTY_ID", "").strip()
    if prop and not prop.startswith("properties/"):
        prop = "properties/" + prop
    return {"sa": sa, "keyPresent": bool(raw), "propertyId": prop, "gscSite": env.get("GSC_SITE", "").strip()}


# ---------- RS256, standard library only ----------
# The signature Google's service-account login wants (a JWT signed "RS256") is RSASSA-PKCS1-v1_5 with SHA-256,
# RFC 8017 section 8.2: build EMSA-PKCS1-v1_5 (section 9.2: 0x00 0x01, 0xFF padding, 0x00, the SHA-256
# DigestInfo, then the hash) and raise it to d mod n. The key comes as PEM: Google's "BEGIN PRIVATE KEY" is
# PKCS #8 (RFC 5208), a wrapper whose OCTET STRING holds the PKCS #1 RSAPrivateKey (RFC 8017 appendix A.1.2:
# version, n, e, d, p, q, ...). The DER reader below is strict: any length that runs past the data means the
# key is damaged, never a guess.
DAMAGED = "The private key in the JSON is damaged. Download a fresh JSON key."


def _der(data, i):
    """Read one DER item at i: (tag, value bytes, next index). A length past the end is a damaged key."""
    if i + 2 > len(data):
        raise WebPullError(DAMAGED)
    tag, length, i = data[i], data[i + 1], i + 2
    if length & 0x80:
        n = length & 0x7F
        if not 1 <= n <= 4 or i + n > len(data):
            raise WebPullError(DAMAGED)
        length = int.from_bytes(data[i:i + n], "big")
        i += n
    if i + length > len(data):
        raise WebPullError(DAMAGED)
    return tag, data[i:i + length], i + length


def _der_seq(data):
    tag, body, end = _der(data, 0)
    if tag != 0x30:
        raise WebPullError("The private key in the JSON isn't a key this can read.")
    if end != len(data):
        raise WebPullError(DAMAGED)
    items, i = [], 0
    while i < len(body):
        t, v, i = _der(body, i)
        items.append((t, v))
    return items


def rsa_private_numbers(pem):
    """n and d from a PEM private key (PKCS #8 like Google's 'BEGIN PRIVATE KEY', or PKCS #1)."""
    body = re.sub(r"-----[^-]+-----|\s", "", pem.replace("\\n", "\n"))
    try:
        der = base64.b64decode(body, validate=True)
    except ValueError:
        raise WebPullError(DAMAGED)
    items = _der_seq(der)
    if len(items) == 3 and items[2][0] == 0x04:  # PKCS #8 wraps the PKCS #1 key in an OCTET STRING
        items = _der_seq(items[2][1])
    ints = [int.from_bytes(v, "big") for t, v in items if t == 0x02]
    if len(ints) < 9 or ints[1].bit_length() < 1024 or not 1 < ints[3] < ints[1]:  # all nine PKCS #1 numbers, a real-size n
        raise WebPullError("The private key in the JSON isn't an RSA key.")
    return ints[1], ints[3]  # version, n, e, d, ...


def rs256(message, pem):
    """RSASSA-PKCS1-v1_5 with SHA-256 (RFC 8017 8.2, what Google's service-account login expects)."""
    n, d = rsa_private_numbers(pem)
    k = (n.bit_length() + 7) // 8
    digest_info = bytes.fromhex("3031300d060960864801650304020105000420") + hashlib.sha256(message).digest()
    em = b"\x00\x01" + b"\xff" * (k - len(digest_info) - 3) + b"\x00" + digest_info
    return pow(int.from_bytes(em, "big"), d, n).to_bytes(k, "big")


def b64url(b):
    return base64.urlsafe_b64encode(b).rstrip(b"=").decode()


def build_assertion(sa, now_sec):
    header = b64url(json.dumps({"alg": "RS256", "typ": "JWT"}, separators=(",", ":")).encode())
    claims = b64url(json.dumps({"iss": sa["client_email"], "scope": SCOPES, "aud": TOKEN_URL,
                                "iat": now_sec, "exp": now_sec + 3600}, separators=(",", ":")).encode())
    signing_input = f"{header}.{claims}".encode()
    return f"{header}.{claims}.{b64url(rs256(signing_input, sa['private_key']))}"


# ---------- HTTP ----------
def _post(url, body, token=None, form=False):
    data = urllib.parse.urlencode(body).encode() if form else json.dumps(body).encode()
    headers = {"Content-Type": "application/x-www-form-urlencoded" if form else "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read() or b"{}")
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "replace")[:300]
        raise urllib.error.HTTPError(e.url, e.code, detail, e.headers, None)
    except urllib.error.URLError as e:
        raise WebPullError(f"Couldn't reach Google ({e.reason}). Check your internet connection and try again.")


def access_token(sa):
    try:
        res = _post(TOKEN_URL, {"grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
                                "assertion": build_assertion(sa, int(time.time()))}, form=True)
    except urllib.error.HTTPError as e:
        raise WebPullError("Google turned the key down. Download a fresh JSON key for the service account and save it "
                           f"again (Google said {e.code}).")
    if not res.get("access_token"):
        raise WebPullError("Google didn't hand back a login token. Try again in a minute.")
    return res["access_token"]


def ga_report(token, prop, body):
    try:
        return _post(f"{GA_BASE}/{prop}:runReport", body, token)
    except urllib.error.HTTPError as e:
        if e.code in (403, 404):
            raise WebPullError("Google Analytics said no. Add the service account's email as a Viewer on the GA4 property "
                               "(Admin → Property access management), and check the property id is the number from "
                               "Admin → Property details.")
        if e.code == 400:
            raise WebPullError("Google Analytics didn't accept the property id. Use just the number from Admin → Property details.")
        raise WebPullError(f"Google Analytics answered {e.code}. Try again in a minute.")


def gsc_query(token, site, body):
    try:
        return _post(f"{GSC_BASE}/sites/{urllib.parse.quote(site, safe='')}/searchAnalytics/query", body, token)
    except urllib.error.HTTPError as e:
        if e.code in (403, 404):
            raise WebPullError("Search Console said no. Add the service account's email as a user (Restricted is enough) "
                               "on your Search Console property, and write the property exactly as Search Console shows it: "
                               "sc-domain:yoursite.com, or the full https:// address with its last slash.")
        raise WebPullError(f"Search Console answered {e.code}. Try again in a minute.")


# ---------- shaping the answers (the snapshot shape the Web pages read) ----------
def num(v):
    try:
        f = float(v)
        return int(f) if f.is_integer() else f
    except (TypeError, ValueError):
        return 0


def rows(report):
    return report.get("rows") or []


def dims(r):
    return [d.get("value", "") for d in r.get("dimensionValues") or []]


def mets(r):
    return [num(m.get("value")) for m in r.get("metricValues") or []]


def totals_pair(report):
    zero = {"activeUsers": 0, "sessions": 0, "newUsers": 0, "pageViews": 0}
    out = [dict(zero), dict(zero)]
    for r in rows(report):
        which = 1 if (dims(r) or [""])[0] == "date_range_1" else 0
        m = mets(r) + [0, 0, 0, 0]
        out[which] = {"activeUsers": m[0], "sessions": m[1], "newUsers": m[2], "pageViews": m[3]}
    return out


def day_span(start, end):
    d, e, out = datetime.date.fromisoformat(start), datetime.date.fromisoformat(end), []
    while d <= e:
        out.append(d.isoformat())
        d += datetime.timedelta(days=1)
    return out


def trend(report, days):
    by = {}
    for r in rows(report):
        v = (dims(r) or [""])[0]
        iso = f"{v[:4]}-{v[4:6]}-{v[6:8]}"
        m = mets(r) + [0, 0]
        by[iso] = {"date": iso, "users": m[0], "sessions": m[1]}
    return [by.get(d, {"date": d, "users": 0, "sessions": 0}) for d in days]  # a quiet day is an honest 0


def regions(report):
    out = []
    for r in rows(report):
        name, users = (dims(r) or [""])[0], (mets(r) or [0])[0]
        if name and name != "(not set)" and users > 0:
            out.append({"region": name, "activeUsers": users})
    return out


def search(totals, queries):
    t = (totals.get("rows") or [{}])[0]
    return {"totalClicks": t.get("clicks", 0), "totalImpressions": t.get("impressions", 0), "avgCtr": t.get("ctr", 0),
            "avgPosition": t.get("position", 0),
            "queries": [{"query": (q.get("keys") or [""])[0], "clicks": q.get("clicks", 0), "impressions": q.get("impressions", 0),
                         "ctr": q.get("ctr", 0), "position": q.get("position", 0)} for q in queries.get("rows") or []]}


def property_today():
    """Today's date where the business is (the workspace timezone in Settings), for labeling the windows.
    The queries themselves use GA's own 'yesterday' / 'NdaysAgo', which GA counts in the property's timezone."""
    tz = "America/New_York"
    try:
        with open(SETTINGS_FILE, encoding="utf-8") as f:
            tz = (json.load(f).get("workspace") or {}).get("timezone") or tz
    except (OSError, ValueError):
        pass
    try:
        from zoneinfo import ZoneInfo
        return datetime.datetime.now(ZoneInfo(tz)).date()
    except Exception:  # Windows without the tz database: the computer's own date is the closest honest answer
        return datetime.date.today()


def pull_range(token, prop, today, days):
    # Windows end YESTERDAY: GA's today is still filling in.
    start, end = f"{days}daysAgo", "yesterday"
    prev_start, prev_end = f"{days * 2}daysAgo", f"{days + 1}daysAgo"
    tot = ga_report(token, prop, {"dateRanges": [{"startDate": start, "endDate": end}, {"startDate": prev_start, "endDate": prev_end}],
                                  "metrics": METRICS})
    tr = ga_report(token, prop, {"dateRanges": [{"startDate": start, "endDate": end}], "dimensions": [{"name": "date"}],
                                 "metrics": [{"name": "activeUsers"}, {"name": "sessions"}],
                                 "orderBys": [{"dimension": {"dimensionName": "date"}}], "limit": 1000})
    cur, prev = totals_pair(tot)
    range_start = (today - datetime.timedelta(days=days)).isoformat()
    range_end = (today - datetime.timedelta(days=1)).isoformat()
    return {"rangeStart": range_start, "rangeEnd": range_end, "totals": cur, "previousTotals": prev,
            "trend": trend(tr, day_span(range_start, range_end))}


def pull(cfg=None):
    cfg = cfg or config()
    problem = missing(cfg)
    if problem:
        raise WebPullError(problem)
    token = access_token(cfg["sa"])
    prop, today = cfg["propertyId"], property_today()
    recent = [{"startDate": "30daysAgo", "endDate": "yesterday"}]
    ranges = {f"{d}d": pull_range(token, prop, today, d) for d in (7, 30, 90)}
    pages = ga_report(token, prop, {"dateRanges": recent, "dimensions": [{"name": "pagePath"}, {"name": "pageTitle"}],
                                    "metrics": [{"name": "screenPageViews"}], "orderBys": [{"metric": {"metricName": "screenPageViews"}, "desc": True}], "limit": 50})
    sources = ga_report(token, prop, {"dateRanges": recent, "dimensions": [{"name": "sessionDefaultChannelGroup"}],
                                      "metrics": [{"name": "sessions"}], "orderBys": [{"metric": {"metricName": "sessions"}, "desc": True}], "limit": 10})
    # Countries and US states come from their own country- and region-level queries, never summed from city rows
    # (GA de-duplicates active users at each level, so city rows would double count).
    countries = ga_report(token, prop, {"dateRanges": recent, "dimensions": [{"name": "country"}, {"name": "countryId"}],
                                        "metrics": [{"name": "activeUsers"}], "orderBys": [{"metric": {"metricName": "activeUsers"}, "desc": True}], "limit": 50})
    us = ga_report(token, prop, {"dateRanges": recent, "dimensions": [{"name": "region"}], "metrics": [{"name": "activeUsers"}],
                                 "dimensionFilter": {"andGroup": {"expressions": [
                                     {"filter": {"fieldName": "country", "stringFilter": {"matchType": "EXACT", "value": "United States"}}},
                                     {"notExpression": {"filter": {"fieldName": "city", "inListFilter": {"values": DATACENTER_CITIES}}}}]}},
                                 "orderBys": [{"metric": {"metricName": "activeUsers"}, "desc": True}], "limit": 60})
    snap_search, search_note = None, None
    if cfg["gscSite"]:
        g_end = (today - datetime.timedelta(days=3)).isoformat()  # Search Console runs ~3 days behind
        g_start = (today - datetime.timedelta(days=30)).isoformat()
        try:
            snap_search = search(gsc_query(token, cfg["gscSite"], {"startDate": g_start, "endDate": g_end, "rowLimit": 1}),
                                 gsc_query(token, cfg["gscSite"], {"startDate": g_start, "endDate": g_end, "dimensions": ["query"], "rowLimit": 12}))
        except WebPullError as e:
            search_note = str(e)
    return {
        "source": "live",
        "propertyId": mask(prop),
        "siteDomain": site_domain(cfg),
        "capturedAt": datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat(),
        "ranges": ranges,
        "topPages": [{"path": (dims(r) + ["", ""])[0], "title": (dims(r) + ["", ""])[1], "views": (mets(r) or [0])[0]} for r in rows(pages)],
        "sources": [{"channel": (dims(r) or [""])[0], "sessions": (mets(r) or [0])[0]} for r in rows(sources)],
        "countries": [{"country": (dims(r) + ["", ""])[0], "countryCode": (dims(r) + ["", ""])[1], "activeUsers": (mets(r) or [0])[0]} for r in rows(countries)],
        "usRegions": regions(us),
        "search": snap_search,
        "searchNote": search_note,
    }


def mask(prop):
    digits = prop.replace("properties/", "")
    return f"properties/…{digits[-3:]}" if digits else ""


def site_domain(cfg):
    try:
        with open(SETTINGS_FILE, encoding="utf-8") as f:
            d = ((json.load(f).get("web") or {}).get("siteDomain") or "").strip()
            if d:
                return d
    except (OSError, ValueError):
        pass
    s = cfg["gscSite"]
    return s.replace("sc-domain:", "").replace("https://", "").replace("http://", "").strip("/") if s else ""


def missing(cfg):
    if not cfg["keyPresent"]:
        return "No service-account key yet. Save its JSON key in Web → Settings (step 2)."
    if not cfg["sa"]:
        return "The saved service-account key isn't the JSON Google gave you. Paste the whole downloaded file again."
    if not re.match(r"^properties/\d+$", cfg["propertyId"] or ""):
        return "No GA4 property id yet. Save the number from GA4 Admin → Property details in Web → Settings (step 4)."
    return None


def test_connection(cfg=None):
    """Check each piece and say which one is wrong. Writes nothing."""
    cfg = cfg or config()
    out = {"analytics": None, "search": None, "ok": False}
    problem = missing(cfg)
    if problem:
        out["analytics"] = problem
        return out
    try:
        token = access_token(cfg["sa"])
        ga_report(token, cfg["propertyId"], {"dateRanges": [{"startDate": "7daysAgo", "endDate": "yesterday"}], "metrics": [{"name": "activeUsers"}]})
        out["analytics"] = "ok"
    except WebPullError as e:
        out["analytics"] = str(e)
        return out
    if cfg["gscSite"]:
        try:
            end = (property_today() - datetime.timedelta(days=3)).isoformat()
            gsc_query(token, cfg["gscSite"], {"startDate": end, "endDate": end, "rowLimit": 1})
            out["search"] = "ok"
        except WebPullError as e:
            out["search"] = str(e)
    else:
        out["search"] = "No Search Console property saved yet (optional)."
    out["ok"] = out["analytics"] == "ok"
    return out


def write(snapshot):
    os.makedirs(DATA, exist_ok=True)
    text = json.dumps(snapshot, indent=2, ensure_ascii=False) + "\n"
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import sync  # its write(): the whole file at once, so the page never reads half a snapshot
    sync.write(os.path.join(DATA, "web.json"), text)
    sync.write(os.path.join(DATA, "web.js"), "// written by tools/pull_web.py so the Web pages open straight from the folder. Stays on this computer.\n"
               "window.CC_WEB = " + json.dumps(snapshot, ensure_ascii=False) + ";\n")


def main():
    try:
        if "--test" in sys.argv:
            r = test_connection()
            print(f"Google Analytics: {r['analytics']}")
            print(f"Search Console: {r['search']}")
            sys.exit(0 if r["ok"] else 1)
        snap = pull()
        write(snap)
        r30 = snap["ranges"]["30d"]["totals"]
        print(f"Pulled {snap['siteDomain'] or 'your site'}: {r30['activeUsers']} visitors in the last 30 days. "
              f"Saved to dashboard/data/web.json.")
        if snap.get("searchNote"):
            print("Search Console: " + snap["searchNote"])
    except WebPullError as e:
        print("Nothing was pulled. " + str(e))
        sys.exit(1)


if __name__ == "__main__":
    main()
