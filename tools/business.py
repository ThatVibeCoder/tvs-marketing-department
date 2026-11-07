"""Read and write the business files the Command Center's My Business pages show.

The files keep their own shape and nothing else changes: a title, a **Filled by:** line, an `## At a Glance`
block of `Key: value` lines, `## <Section>` headings (each with a one-paragraph guide, then the answer, or
`_Not filled in yet._`), bold `**Field:** value` lines inside some sections, and `## Updates` with dated lines,
newest on top. `parse` reads that shape; `apply` changes only the values it's given and leaves every other
character as it was, so the skills that read these files keep working.

Standard library only.
"""
import datetime
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MARKER = "_Not filled in yet._"
FENCE = "```"
FIELD = re.compile(r"^\*\*([^*]+?):\*\*\s?(.*)$")

# Where each kind of file lives. "main" is the file every skill already reads; extras sit in the folder next to it.
KINDS = {
    "icp": {"main": "brand/icp.md", "folder": "brand/icps", "template": "brand/icps/_template.md"},
    "offer": {"main": "brand/offer.md", "folder": "brand/offers", "template": "brand/offers/_template.md"},
    "persona": {"main": None, "folder": "brand/personas", "template": "brand/personas/_template.md"},
    "competitor": {"main": None, "folder": "knowledge/competitors", "template": "knowledge/competitors/_template.md"},
}
SINGLE = {"friction": "brand/friction-points.md", "contrarian": "brand/contrarian-take.md", "business": "business.md"}
SKIP = ("_template.md", "README.md")
SLUG = re.compile(r"^[a-z0-9][a-z0-9-]{0,60}$")


def read(rel):
    with open(os.path.join(ROOT, rel), encoding="utf-8") as f:
        return f.read()


def slugify(name):
    s = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")[:60].strip("-")
    return s or "untitled"


def empty(text):
    t = (text or "").strip()
    return not t or MARKER in t or t in ("-", "—")


def split_key(line):
    """`One liner (I help [person] ...): value` -> (key, value). The key ends at the first colon outside brackets."""
    depth = 0
    for i, ch in enumerate(line):
        if ch in "([":
            depth += 1
        elif ch in ")]":
            depth = max(0, depth - 1)
        elif ch == ":" and depth == 0:
            return line[:i].strip(), line[i + 1:].strip()
    return None, None


def short_key(key):
    """The key without its hint: `One liner (I help ...)` -> `One liner`."""
    return re.sub(r"\s*\(.*\)\s*$", "", key).strip()


# ---------- reading ----------
def _blocks(lines):
    """(start, end) line ranges of every `## ` section, ignoring headings inside code fences."""
    heads, fenced = [], False
    for i, ln in enumerate(lines):
        if ln.strip().startswith(FENCE):
            fenced = not fenced
        elif not fenced and ln.startswith("## "):
            heads.append(i)
    return [(s, heads[n + 1] if n + 1 < len(heads) else len(lines)) for n, s in enumerate(heads)]


def _paragraphs(lines):
    """[(start, end)] of the paragraphs (runs of non-blank lines) in a list of lines."""
    out, start = [], None
    for i, ln in enumerate(lines + [""]):
        if ln.strip() and start is None:
            start = i
        elif not ln.strip() and start is not None:
            out.append((start, i))
            start = None
    return out


def _looks_like_guide(text):
    """A guide is one plain paragraph: not the marker, not a field, a list, a quote or code."""
    return MARKER not in text and not re.match(r"^(\*\*|[-*+] |\d+[.)] |>|```|~~~|#)", text)


def _guide_count(title, body_lines, guides):
    """How many leading paragraphs are the section's guide (kept as is, never shown as the answer): the guide
    the template has for it, or, when there's no template or the guide was reworded, the first plain paragraph
    when more follows it (an answer or the marker); plus the italic `_How to fill this..._` line some carry."""
    paras = _paragraphs(body_lines)
    n = 0
    want = (guides or {}).get(title)
    for i, (a, b) in enumerate(paras):
        text = "\n".join(body_lines[a:b]).strip()
        if n == 0 and i == 0 and (text == want or (len(paras) > 1 and _looks_like_guide(text) and not text.startswith("_How to fill this"))):
            n += 1
            continue
        if text.startswith("_How to fill this") and text.endswith("_"):
            n += 1
            continue
        break
    return n, paras


def template_guides(rel):
    """Each section's guide paragraph, read from a template file (or a shipped blank file)."""
    try:
        text = read(rel)
    except OSError:
        return {}
    lines = text.splitlines()
    out = {}
    for s, e in _blocks(lines):
        title = lines[s][3:].strip()
        body = lines[s + 1:e]
        paras = _paragraphs(body)
        if paras:
            first = "\n".join(body[paras[0][0]:paras[0][1]]).strip()
            if MARKER not in first and not first.startswith("**"):
                out[title] = first
    return out


def parse(text, guides=None):
    lines = text.splitlines()
    title = next((ln[2:].strip() for ln in lines if ln.startswith("# ")), "")
    filled = next((ln for ln in lines if ln.startswith("**Filled by:**")), "")
    lessons = re.findall(r"\(([^()]+?) lesson\)", filled)
    doc = {"title": title, "filledBy": filled.replace("**Filled by:**", "").strip(), "lessons": lessons,
           "glance": [], "sections": []}
    for s, e in _blocks(lines):
        name = lines[s][3:].strip()
        body = lines[s + 1:e]
        if name == "At a Glance":
            fenced = False
            for ln in body:
                if ln.strip().startswith(FENCE):
                    fenced = not fenced
                    continue
                if fenced:
                    k, v = split_key(ln)
                    if k:
                        doc["glance"].append({"key": k, "label": short_key(k), "value": "" if empty(v) else v,
                                              "hint": v.replace(MARKER, "").strip() if MARKER in v else ""})
            continue
        n, paras = _guide_count(name, body, guides)
        guide = "\n".join("\n".join(body[a:b]) for a, b in paras[:n]).strip()
        rest = body[paras[n][0]:paras[-1][1]] if len(paras) > n else []
        answer = "\n".join(rest).strip()
        fields = []
        for ln in rest:
            m = FIELD.match(ln.strip())
            if m:
                fields.append({"key": m.group(1).strip(), "value": "" if empty(m.group(2)) else m.group(2).strip()})
        doc["sections"].append({"title": name, "guide": guide, "body": "" if empty(answer) else answer, "fields": fields})
    return doc


def glance(doc, label):
    want = label.lower()
    return next((g["value"] for g in doc["glance"] if g["label"].lower() == want or g["key"].lower() == want), "")


def section(doc, title):
    return next((s for s in doc["sections"] if s["title"].lower() == title.lower()), None)


# ---------- writing ----------
def _set_glance(lines, key, value):
    blocks = _blocks(lines)
    gl = next(((s, e) for s, e in blocks if lines[s][3:].strip() == "At a Glance"), None)
    if not gl:
        return lines
    s, e = gl
    open_i = next((i for i in range(s, e) if lines[i].strip().startswith(FENCE)), None)
    close_i = next((i for i in range(open_i + 1, e) if lines[i].strip().startswith(FENCE)), None) if open_i is not None else None
    if close_i is None:
        return lines
    val = value.strip().replace("\n", " ") or MARKER
    for i in range(open_i + 1, close_i):
        k, _ = split_key(lines[i])
        if k and (k == key or short_key(k).lower() == short_key(key).lower()):
            lines[i] = f"{k}: {val}"
            return lines
    lines.insert(close_i, f"{key}: {val}")
    return lines


def _find(lines, title):
    return next(((s, e) for s, e in _blocks(lines) if lines[s][3:].strip().lower() == title.lower()), None)


def _insert_section(lines, title, guide):
    """A section the file doesn't have yet goes in right before ## Updates (or at the end)."""
    upd = _find(lines, "Updates")
    at = upd[0] if upd else len(lines)
    block = [f"## {title}"] + ([guide, ""] if guide else []) + [MARKER, ""]
    if at > 0 and lines[at - 1].strip():
        block = [""] + block
    lines[at:at] = block
    return lines


def _answer_span(lines, title, guides):
    s, e = _find(lines, title)
    body = lines[s + 1:e]
    n, paras = _guide_count(title, body, guides)
    start = s + 1 + (paras[n - 1][1] if n else 0)
    # the answer runs to the last non-blank line before the next heading
    end = e
    while end > start and not lines[end - 1].strip():
        end -= 1
    return start, end


def _set_section(lines, title, value, guides):
    if not _find(lines, title):
        lines = _insert_section(lines, title, (guides or {}).get(title, ""))
    start, end = _answer_span(lines, title, guides)
    new = (value or "").strip("\n").splitlines() or [MARKER]
    if not any(ln.strip() for ln in new):
        new = [MARKER]
    lines[start:end] = [""] + new
    return lines


def _set_field(lines, title, key, value, guides):
    if not _find(lines, title):
        lines = _insert_section(lines, title, (guides or {}).get(title, ""))
        start, end = _answer_span(lines, title, guides)
        lines[start:end] = [""]
    s, e = _find(lines, title)
    val = (value or "").strip().replace("\n", " ")
    for i in range(s + 1, e):
        m = FIELD.match(lines[i].strip())
        if m and m.group(1).strip().lower() == key.lower():
            had_marker = MARKER in lines[i]
            lines[i] = f"**{m.group(1).strip()}:** {val or (MARKER if had_marker else '')}".rstrip()
            return lines
    start, end = _answer_span(lines, title, guides)
    body = lines[start:end]
    if len([b for b in body if b.strip()]) == 1 and MARKER in "".join(body):  # a fresh section: the field replaces the marker
        lines[start:end] = ["", f"**{key}:** {val}".rstrip()]
    else:
        lines.insert(end, f"**{key}:** {val}".rstrip())
    return lines


def _add_update(lines, note, today=None, title="Updates"):
    if not note:
        return lines
    if not _find(lines, title):
        if lines and lines[-1].strip():
            lines.append("")
        lines += [f"## {title}", ""]
    s, e = _find(lines, title)
    body = lines[s + 1:e]
    paras = _paragraphs(body)
    # keep the guide paragraph (the first one, when it isn't a dated line) on top
    at = s + 1
    if paras:
        first = body[paras[0][0]].strip()
        if not re.match(r"^(- )?\d{4}-\d{2}-\d{2}", first):
            at = s + 1 + paras[0][1]
    line = f"- {(today or datetime.date.today()).isoformat()}: {note.strip()}"
    lines[at:at] = ["", line] if at > s + 1 else [line]
    # a dated line sits right on top of the last one, with one blank line before the next heading
    return lines


def apply(text, changes, guides=None, today=None):
    """Change only what's asked: changes = {"title", "glance": {key: value}, "sections": {title: text},
    "fields": {section: {field: value}}, "update": "what changed"}. Everything else stays byte for byte."""
    trail = text.endswith("\n")
    lines = text.splitlines()
    if changes.get("title"):
        i = next((n for n, ln in enumerate(lines) if ln.startswith("# ")), None)
        if i is not None:
            lines[i] = "# " + changes["title"].strip()
    for k, v in (changes.get("glance") or {}).items():
        lines = _set_glance(lines, k, str(v))
    for t, v in (changes.get("sections") or {}).items():
        lines = _set_section(lines, t, str(v), guides)
    for t, fs in (changes.get("fields") or {}).items():
        for k, v in fs.items():
            lines = _set_field(lines, t, k, str(v), guides)
    lines = _add_update(lines, changes.get("update"), today, "What Changed" if _find(lines, "What Changed") and not _find(lines, "Updates") else "Updates")
    out = "\n".join(lines)
    return out + "\n" if trail or not out.endswith("\n") else out


# ---------- the whole picture, for the dashboard ----------
def guides_for(kind):
    if kind in KINDS:
        return template_guides(KINDS[kind]["template"])
    return {}


def docs(kind):
    k = KINDS[kind]
    out = []
    g = guides_for(kind)
    paths = [k["main"]] if k["main"] and os.path.isfile(os.path.join(ROOT, k["main"])) else []
    folder = os.path.join(ROOT, k["folder"])
    if os.path.isdir(folder):
        paths += [f"{k['folder']}/{n}" for n in sorted(os.listdir(folder)) if n.endswith(".md") and n not in SKIP]
    for p in paths:
        d = parse(read(p), g)
        d.update({"path": p, "slug": "main" if p == k["main"] else os.path.basename(p)[:-3], "main": p == k["main"]})
        out.append(d)
    return out


BUSINESS_GUIDES = {"Who Else They Could Pick": "Who else your customers could go to instead of you. Name names: this is the research team's list."}


def competitor_names(business_doc):
    sec = section(business_doc, "Who Else They Could Pick")
    if not sec or not sec["body"]:
        return []
    names = []
    for ln in sec["body"].splitlines():
        ln = re.sub(r"^\s*([-*]|\d+[.)])\s*", "", ln).strip()
        if not ln:
            continue
        # "Name: why" / "Name (why)" / "Name, Name, Name"
        head = re.split(r"\s[-–—]\s|:\s|\s\(", ln, maxsplit=1)[0]
        for part in re.split(r",\s*|;\s*|\s+and\s+", head):
            part = part.strip(" .*_`")
            if 1 < len(part) <= 60:
                names.append(part)
    seen, out = set(), []
    for n in names:
        if n.lower() not in seen:
            seen.add(n.lower())
            out.append(n)
    return out


def build():
    """Everything the My Business pages need. Missing files show as empty, never an error."""
    def single(rel, guides=None):
        try:
            d = parse(read(rel), guides)
        except OSError:
            return None
        d["path"] = rel
        return d
    business = single(SINGLE["business"], BUSINESS_GUIDES)
    return {
        "icps": docs("icp"), "offers": docs("offer"), "personas": docs("persona"), "competitors": docs("competitor"),
        "friction": single(SINGLE["friction"]), "contrarian": single(SINGLE["contrarian"]),
        "business": {"path": "business.md", "glance": business["glance"], "lessons": business["lessons"],
                     "competitorNames": competitor_names(business)} if business else None,
    }


# ---------- saving (tools/serve.py calls these) ----------
def allowed(rel):
    """Only the business files, never a template, a README or anything outside them."""
    if rel in SINGLE.values() and rel != "business.md":
        return True
    for k in KINDS.values():
        if rel == k["main"]:
            return True
        folder, name = os.path.split(rel)
        if folder == k["folder"] and name.endswith(".md") and name not in SKIP and SLUG.match(name[:-3]):
            return True
    return False


def kind_of(rel):
    for kind, k in KINDS.items():
        if rel == k["main"] or os.path.dirname(rel) == k["folder"]:
            return kind
    return None


def save(rel, changes, today=None):
    if not allowed(rel):
        raise ValueError("That file isn't one of your business files.")
    p = os.path.join(ROOT, rel)
    if not os.path.isfile(p):
        raise FileNotFoundError(f"{rel} isn't there.")
    kind = kind_of(rel)
    text = apply(read(rel), changes, guides_for(kind) if kind else None, today)
    with open(p, "w", encoding="utf-8") as f:
        f.write(text)
    return rel


def create(kind, name, today=None):
    """A new ICP, offer, persona or competitor, copied from its template, named, and listed in the folder's README."""
    if kind not in KINDS:
        raise ValueError("You can add an ICP, an offer, a buyer or a competitor.")
    name = (name or "").strip()
    if not name:
        raise ValueError("Give it a name first.")
    k = KINDS[kind]
    slug = slugify(name)
    rel = f"{k['folder']}/{slug}.md"
    p = os.path.join(ROOT, rel)
    if os.path.exists(p) or rel == k["main"]:
        raise ValueError(f"{rel} is already there. Open it instead, or pick another name.")
    try:
        text = read(k["template"])
    except OSError:
        raise FileNotFoundError(f"{k['template']} is missing, so there's nothing to copy. Get it back from the template repo.")
    heading = {"icp": f"ICP: {name}", "offer": f"Offer: {name}", "persona": name, "competitor": name}[kind]
    text = re.sub(r"^# .*$", "# " + heading, text, count=1, flags=re.M)
    text = apply(text, {"update": "made in the Command Center"}, guides_for(kind), today)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        f.write(text)
    _list_in_readme(k["folder"], slug, name, kind)
    return rel


def _list_in_readme(folder, slug, name, kind):
    """personas/ and competitors/ keep a list in their README: add one line, and drop the "_None yet._" marker."""
    readme = os.path.join(ROOT, folder, "README.md")
    heading = {"persona": "The personas", "competitor": "Summary"}.get(kind)
    if not heading or not os.path.isfile(readme):
        return
    lines = read(f"{folder}/README.md").splitlines()
    span = _find(lines, heading)
    if not span:
        return
    s, e = span
    for i in range(s + 1, e):
        if lines[i].startswith("_None yet._"):
            lines[i] = lines[i].replace("_None yet._", "").strip()
    end = e
    while end > s + 1 and not lines[end - 1].strip():
        end -= 1
    lines.insert(end, f"- `{slug}.md`: {name}")
    if end < len(lines) - 1 and lines[end + 1].strip():
        lines.insert(end + 1, "")
    with open(readme, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
