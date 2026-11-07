// The live post previews: "exactly what it looks like" on each platform.
// Ported from the measured preview family. Each card is drawn in the platform's real font size,
// line height and card width, so the browser wraps the text the way the platform does. Card colors
// are literal values (never the dashboard's theme tokens), so a card never repaints with the page;
// each card has its platform's light skin, and a dark skin that matches the dashboard's dark mode.

// ─── The per-platform spec: what each platform counts and how it renders ─────
const LINKEDIN_FONT_STACK = '-apple-system, system-ui, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", "Fira Sans", Ubuntu, Oxygen, "Oxygen Sans", Cantarell, "Droid Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Lucida Grande", Helvetica, Arial, sans-serif';
const THREADS_FONT_STACK = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const INSTAGRAM_FONT_STACK = '-apple-system, "system-ui", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
// TikTok and X use their own fonts, which a browser doesn't have, so their wrap is close, not exact.
const TIKTOK_FONT_STACK = "TikTokFont, Arial, Tahoma, PingFangSC, sans-serif";
const TWITTER_FONT_STACK = 'TwitterChirp, -apple-system, system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const PLATFORM_FIDELITY = {
  linkedin: {
    fontFamily: LINKEDIN_FONT_STACK, fontSizePx: 14, lineHeightPx: 21, letterSpacing: "normal", fontWeight: 400,
    whiteSpace: "pre-wrap", overflowWrap: "break-word", wordBreak: "normal",
    cardWidthPx: { desktop: 504, mobile: 424 }, bodyColor: "rgba(0, 0, 0, 0.9)",
    entity: { color: "#0a66c2", fontWeight: 600 },
    // The collapsed feed clamps to exactly 3 rendered lines, then "…more".
    truncation: { desktop: { maxLines: 3, maxChars: null }, mobile: { maxLines: 3, maxChars: null }, label: "…more", labelColor: "rgba(0,0,0,0.6)" }
  },
  threads: {
    fontFamily: THREADS_FONT_STACK, fontSizePx: 14, lineHeightPx: 21, letterSpacing: "normal", fontWeight: 400,
    whiteSpace: "pre-line", overflowWrap: "break-word", wordBreak: "normal",
    cardWidthPx: { desktop: 576, mobile: 384 }, bodyColor: "rgba(0, 0, 0, 0.9)",
    entity: { color: "#0a66c2", fontWeight: 600 }, truncation: null
  },
  instagram: {
    fontFamily: INSTAGRAM_FONT_STACK, fontSizePx: 14, lineHeightPx: 18, letterSpacing: "normal", fontWeight: 400,
    whiteSpace: "pre-line", overflowWrap: "break-word", wordBreak: "normal",
    cardWidthPx: { desktop: 470, mobile: 343 }, bodyColor: "rgb(0, 0, 0)",
    entity: { color: "#00376b", fontWeight: 400 },
    // Instagram cuts on characters: the last word boundary under ~125, with "… more" reserved.
    truncation: { desktop: { maxLines: null, maxChars: 125 }, mobile: { maxLines: null, maxChars: 125 }, label: "… more", labelColor: "#737373" }
  },
  tiktok: {
    fontFamily: TIKTOK_FONT_STACK, fontSizePx: 14, lineHeightPx: 18, letterSpacing: "0.0938px", fontWeight: 400,
    whiteSpace: "pre-wrap", overflowWrap: "break-word", wordBreak: "normal",
    cardWidthPx: { desktop: 418, mobile: 418 }, bodyColor: "#f6f6f6",
    entity: { color: "rgba(255,255,255,0.88)", fontWeight: 400 },
    // The caption clamps to 1 line over the video, then "...more".
    truncation: { desktop: { maxLines: 1, maxChars: null }, mobile: { maxLines: 1, maxChars: null }, label: "...more", labelColor: "rgba(255,255,255,0.88)" }
  },
  youtube: {
    fontFamily: 'Roboto, Arial, "Helvetica Neue", sans-serif', fontSizePx: 14, lineHeightPx: 20, letterSpacing: "normal", fontWeight: 400,
    whiteSpace: "pre-wrap", overflowWrap: "break-word", wordBreak: "normal",
    cardWidthPx: { desktop: 418, mobile: 360 }, bodyColor: "#f1f1f1",
    entity: { color: "#3ea6ff", fontWeight: 400 }, truncation: null
  },
  twitter: {
    fontFamily: TWITTER_FONT_STACK, fontSizePx: 15, lineHeightPx: 20, letterSpacing: "normal", fontWeight: 400,
    whiteSpace: "pre-wrap", overflowWrap: "break-word", wordBreak: "normal",
    cardWidthPx: { desktop: 508, mobile: 350 }, bodyColor: "rgb(15, 20, 25)",
    entity: { color: "#1d9bf0", fontWeight: 400 }, truncation: null
  },
  skool: {
    fontFamily: "Roboto, Helvetica, Arial, sans-serif", fontSizePx: 16, lineHeightPx: 24, letterSpacing: "normal", fontWeight: 400,
    whiteSpace: "pre-wrap", overflowWrap: "break-word", wordBreak: "normal",
    cardWidthPx: { desktop: 640, mobile: 380 }, bodyColor: "rgb(228, 228, 228)",
    entity: { color: "#8ba6ff", fontWeight: 400 }, truncation: null
  }
};

/** Per-platform character limit for one post (one link of a chain on Threads and X). */
const PLATFORM_CHAR_LIMIT = { threads: 500, instagram: 2200, tiktok: 2200, linkedin: 3000, twitter: 280, youtube: 5000, skool: 10000 };
/** Threads and X post chains (the post, then its replies); the others post one caption. */
const PLATFORM_SUPPORTS_CHAIN = { threads: true, twitter: true, instagram: false, tiktok: false, linkedin: false, youtube: false, skool: false };
const PLATFORM_MAX_MEDIA = { threads: 1, instagram: 10, twitter: 4, tiktok: null, linkedin: null, youtube: 1, skool: 0 };
const SKOOL_TITLE_MAX = 100;
const YOUTUBE_TITLE_MAX = 100;
const PLATFORM_LABEL = { tiktok: "TikTok", instagram: "Instagram", twitter: "X (Twitter)", threads: "Threads", youtube: "YouTube", skool: "Skool", linkedin: "LinkedIn" };
const PLATFORM_ORDER = ["tiktok", "instagram", "twitter", "threads", "youtube", "skool", "linkedin"];

/** The ONE count basis: CRLF to LF, trimmed, UTF-16 length. The counter and the checks both use it. */
function countChars(text) { return String(text || "").replace(/\r\n?/g, "\n").trim().length; }

/** A post's tabs → one caption (blank-line paragraphs). Chains render from the tabs themselves. */
function platformCaption(segments) { return segments.filter((s) => s.trim()).join("\n\n"); }

/** A stored post → its tabs. A line with only `---` splits a Threads/X chain. */
function captionToSegments(caption) {
  const segs = String(caption || "").split(/^\s*---\s*$/m).map((s) => s.replace(/^\n+|\n+$/g, ""));
  while (segs.length > 1 && segs[segs.length - 1].trim() === "") segs.pop();
  return segs.length ? segs : [""];
}
function joinChain(segments) { return segments.map((s) => s.replace(/^\n+|\n+$/g, "")).join("\n\n---\n\n"); }

// Bare URLs, and #tags / @mentions that start a word. An email or word#tag is not an entity.
const LINK_RE = /(https?:\/\/[^\s]+|(?<![^\s])#[^\s#]+|(?<![^\s])@[^\s@]+)/g;
function linkifyRuns(text) {
  return String(text).split(LINK_RE).filter((p) => p !== "" && p != null)
    .map((part) => ({ text: part, entity: /^https?:\/\//.test(part) || /^#[^\s#]/.test(part) || /^@[^\s@]/.test(part) }));
}
function wordBoundaryBackoff(prefix, next) {
  let out = prefix;
  if (next !== undefined && !/\s/.test(next)) {
    const lastSpace = out.replace(/\s+$/, "").lastIndexOf(" ");
    if (lastSpace > 0) out = out.slice(0, lastSpace);
  }
  return out.replace(/\s+$/, "");
}
/** Instagram's character cut: the last whitespace under the budget, label length reserved. */
function truncateByChars(text, maxChars, label) {
  const cps = Array.from(text);
  if (cps.length <= maxChars) return { shown: text, truncated: false };
  const slice = cps.slice(0, Math.max(0, maxChars - Array.from(label).length));
  let boundary = -1;
  for (let i = slice.length - 1; i >= 0; i--) if (/\s/.test(slice[i])) { boundary = i; break; }
  const cut = boundary > 0 ? boundary : slice.length;
  return { shown: cps.slice(0, cut).join("").replace(/\s+$/, ""), truncated: true };
}

/** The Skool title is plain text: markdown marks come off. */
function cleanSkoolTitle(t) {
  let s = String(t || "");
  s = s.replace(/(\*\*|__)(.+?)\1/g, "$2").replace(/(^|[^\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])/g, "$1$2")
    .replace(/(^|[^\w_])_(?!\s)(.+?)(?<!\s)_(?![\w_])/g, "$1$2").replace(/`([^`]*)`/g, "$1");
  return s.replace(/\s+/g, " ").trim();
}
/** Skool body: blank line = a new paragraph, one line break stays tight, [phrase](url) = a link on the phrase. */
function parseSkoolBody(body) {
  const text = String(body || "").replace(/\r\n?/g, "\n").trim();
  if (!text) return [];
  const strip = (s) => s.replace(/(\*\*|__)(.+?)\1/g, "$2");
  return text.split(/\n{2,}/).map((block) => block.split("\n").map((raw) => {
    const line = raw.replace(/^#{1,6}\s+/, "");
    const out = [], re = /\[([^\]]+)\]\(([^)\s]+)\)/g;
    let last = 0, m;
    while ((m = re.exec(line))) {
      if (m.index > last) out.push({ text: strip(line.slice(last, m.index)) });
      out.push({ text: m[1], href: m[2] });
      last = m.index + m[0].length;
    }
    if (last < line.length) out.push({ text: strip(line.slice(last)) });
    return out.filter((r) => r.text !== "");
  }));
}
function skoolPostProblem({ title, category, body }, categories) {
  const t = cleanSkoolTitle(title);
  if (!t) return "Skool needs a title (the hook members see in the feed).";
  if (t.length > SKOOL_TITLE_MAX) return `Skool titles are capped at ${SKOOL_TITLE_MAX} characters.`;
  if (!categories.includes(category)) return "Pick a Skool category.";
  if (!String(body || "").trim()) return "Skool posts need a body.";
  return null;
}
/** The Short's title: the one you set, else the caption's first line, cut to 100 on a word. */
function youtubeTitleFrom(caption, stored) {
  const pick = typeof stored === "string" && stored.trim() ? stored : (String(caption || "").split(/\r?\n/).find((l) => l.trim()) || "");
  const line = pick.replace(/\s+/g, " ").trim();
  if (!line) return null;
  if (line.length <= YOUTUBE_TITLE_MAX) return line;
  const cut = line.slice(0, YOUTUBE_TITLE_MAX - 1), sp = cut.lastIndexOf(" ");
  return `${(sp > 40 ? cut.slice(0, sp) : cut).trimEnd()}…`;
}

// ─── Tiny DOM helpers for the cards (inline styles only) ─────────────────────
function cssText(o) { return Object.entries(o || {}).filter(([, v]) => v != null && v !== false).map(([k, v]) => `${k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}:${typeof v === "number" && !/^(fontWeight|opacity|flex|zIndex|lineHeight)$/.test(k) ? v + "px" : v}`).join(";"); }
function E(tag, style, children, attrs) {
  const n = document.createElement(tag);
  if (style) n.style.cssText = cssText(style);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith("on")) n.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === "html") n.innerHTML = v;
    else n.setAttribute(k, String(v));
  }
  for (const c of [].concat(children == null ? [] : children)) {
    if (c == null || c === false) continue;
    n.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return n;
}
function I(name, size, style) { return E("span", { display: "inline-flex", flexShrink: 0, ...(style || {}) }, null, { html: lineIcon(name, "", size), "aria-hidden": "true" }); }
function isDarkTheme() { return !document.documentElement.classList.contains("dash-light"); }
function bodyStyleFrom(spec, color) {
  return { fontFamily: spec.fontFamily, fontSize: spec.fontSizePx, lineHeight: spec.lineHeightPx + "px", letterSpacing: spec.letterSpacing,
    fontWeight: spec.fontWeight, whiteSpace: spec.whiteSpace, overflowWrap: spec.overflowWrap, wordBreak: spec.wordBreak, color };
}
function entityRuns(text, color, weight) {
  return linkifyRuns(text).map((r) => r.entity ? E("span", { color, fontWeight: weight }, r.text) : document.createTextNode(r.text));
}
function avatarCircle(size, bg, fg, initial, fontSize, extra) {
  return E("span", { width: size, height: size, borderRadius: "9999px", backgroundColor: bg, color: fg, display: "inline-flex",
    alignItems: "center", justifyContent: "center", fontSize, fontWeight: 600, flexShrink: 0, ...(extra || {}) }, initial, { "aria-hidden": "true" });
}
function mediaEl(media, style, extra) {
  if (!media) return null;
  return media.type === "video"
    ? E("video", style, null, { src: media.url, muted: "", playsinline: "", preload: "metadata", ...(extra || {}) })
    : E("img", style, null, { src: media.url, alt: "", ...(extra || {}) });
}
// The expanded/collapsed "…more" state, per platform card (resets when the card's platform changes).
const previewExpanded = {};

/** Measure a body in a hidden node at the pinned width: returns its rendered height. */
function measureHeight(style, widthPx, text) {
  const node = E("div", { ...style, position: "absolute", left: -99999, top: 0, width: widthPx + "px", visibility: "hidden", pointerEvents: "none" }, null, { "aria-hidden": "true" });
  document.body.append(node);
  node.textContent = text;
  const h = node.scrollHeight;
  const api = (t) => { node.textContent = t; return node.scrollHeight; };
  return { h, api, done: () => node.remove() };
}

// ─── LinkedIn ────────────────────────────────────────────────────────────────
function LinkedInPreview({ segments, device, author, media, rerender }) {
  const spec = PLATFORM_FIDELITY.linkedin;
  const c = isDarkTheme()
    ? { cardBg: "#2f2d2c", cardBorder: "rgba(255,255,255,0.08)", cardShadow: "0 0 0 1px rgba(255,255,255,0.03)", displayName: "#f2f1ef", headline: "#969390", meta: "#969390", body: "#f2f1ef", placeholder: "rgba(242,241,239,0.45)", entity: "#70b5f9", moreLabel: "#bcb9b6", reactionBorder: "rgba(255,255,255,0.1)", reactionColor: "#bcb9b6" }
    : { cardBg: "#ffffff", cardBorder: "rgba(0,0,0,0.08)", cardShadow: "0 0 0 1px rgba(0,0,0,0.02)", displayName: "rgba(0,0,0,0.9)", headline: "rgba(0,0,0,0.6)", meta: "rgba(0,0,0,0.6)", body: spec.bodyColor, placeholder: "rgba(0,0,0,0.45)", entity: spec.entity.color, moreLabel: spec.truncation.labelColor, reactionBorder: "rgba(0,0,0,0.08)", reactionColor: "rgba(0,0,0,0.6)" };
  const body = platformCaption(segments);
  const widthPx = spec.cardWidthPx[device];
  const maxLines = spec.truncation[device].maxLines;
  const budgetPx = maxLines * spec.lineHeightPx;
  const label = spec.truncation.label;
  const bodyStyle = bodyStyleFrom(spec, c.body);
  const expanded = previewExpanded.linkedin;
  // Find the 3-line cut: the longest word-boundary prefix that fits 3 lines WITH the inline "…more".
  let shown = null;
  if (!expanded && body.length) {
    const m = measureHeight(bodyStyle, widthPx - 32, body);
    if (m.h > budgetPx + 1) {
      const chars = Array.from(body);
      let lo = 0, hi = chars.length;
      while (lo < hi) {
        const mid = Math.ceil((lo + hi) / 2);
        if (m.api(`${chars.slice(0, mid).join("")} ${label}`) <= budgetPx + 1) lo = mid; else hi = mid - 1;
      }
      shown = wordBoundaryBackoff(chars.slice(0, lo).join(""), chars[lo]);
    }
    m.done();
  }
  const initial = (author.displayName.trim()[0] || "?").toUpperCase();
  const reactions = [["thumbsUp", "Like"], ["messageSquare", "Comment"], ["repeat2", "Repost"], ["sendPlane", "Send"]];
  return E("div", { margin: "0 auto", width: "100%", maxWidth: widthPx + "px" }, E("div", { overflow: "hidden", borderRadius: 8, width: "100%", backgroundColor: c.cardBg, border: `1px solid ${c.cardBorder}`, boxShadow: c.cardShadow }, [
    E("div", { display: "flex", alignItems: "flex-start", gap: 8, padding: "12px 16px 0" }, [
      author.avatarUrl ? E("img", { width: 48, height: 48, borderRadius: "9999px", objectFit: "cover" }, null, { src: author.avatarUrl, alt: "" }) : avatarCircle(48, "#0a66c2", "#ffffff", initial, 18),
      E("div", { minWidth: 0, flex: 1 }, [
        E("div", { fontFamily: spec.fontFamily, fontSize: 14, fontWeight: 600, color: c.displayName, lineHeight: "20px" }, author.displayName),
        author.headline ? E("div", { fontFamily: spec.fontFamily, fontSize: 12, color: c.headline, lineHeight: "16px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, author.headline) : null,
        E("div", { display: "flex", alignItems: "center", gap: 4, fontFamily: spec.fontFamily, fontSize: 12, color: c.meta, lineHeight: "16px" }, [E("span", null, "1h"), E("span", null, "·", { "aria-hidden": "true" }), I("globe", 12)])
      ])
    ]),
    E("div", { padding: "8px 16px 0" }, body.length === 0
      ? E("p", { fontFamily: spec.fontFamily, fontSize: 14, color: c.placeholder, margin: 0 }, "Your LinkedIn post preview shows up here as you type.")
      : E("div", bodyStyle, [...entityRuns(shown !== null ? shown : body, c.entity, spec.entity.fontWeight),
        shown !== null ? E("button", { display: "inline", marginLeft: 4, fontFamily: "inherit", fontSize: "inherit", lineHeight: "inherit", color: c.moreLabel, background: "none", border: "none", padding: 0, cursor: "pointer", fontWeight: 400, verticalAlign: "baseline" }, label, { type: "button", onclick: () => { previewExpanded.linkedin = true; rerender(); } }) : null])),
    media ? E("div", { marginTop: 12, width: "100%" }, mediaEl(media, { width: "100%", maxHeight: 320, objectFit: "cover", display: "block" })) : null,
    E("div", { display: "flex", alignItems: "center", justifyContent: "space-around", gap: 4, marginTop: 8, padding: "4px 8px 8px", borderTop: `1px solid ${c.reactionBorder}`, color: c.reactionColor },
      reactions.map(([ic, l]) => E("span", { display: "inline-flex", alignItems: "center", gap: 6, fontFamily: spec.fontFamily, fontSize: 13, fontWeight: 600, padding: "6px 8px" }, [I(ic, 18), l])))
  ]));
}

// ─── Threads (a chain: the post, then its replies, joined by the connector line) ─
function ThreadsPreview({ segments, device, author, media }) {
  const spec = PLATFORM_FIDELITY.threads;
  const handle = (author.handle || "").replace(/^@/, "") || author.displayName || "your-handle";
  const initial = (handle[0] || "?").toUpperCase();
  const c = isDarkTheme()
    ? { cardBg: "#2f2d2c", cardBorder: "rgba(255,255,255,0.08)", placeholder: "rgba(242,241,239,0.45)", avatarBg: "#f2f1ef", avatarText: "#252322", connector: "rgba(255,255,255,0.16)", handle: "#f2f1ef", meta: "#969390", chipBg: "rgba(255,255,255,0.08)", chipText: "#bcb9b6", body: "#f2f1ef", empty: "rgba(242,241,239,0.45)", mediaBorder: "rgba(255,255,255,0.08)", icons: "#bcb9b6" }
    : { cardBg: "#ffffff", cardBorder: "rgba(0,0,0,0.08)", placeholder: "rgba(0,0,0,0.45)", avatarBg: "#000000", avatarText: "#ffffff", connector: "rgba(0,0,0,0.15)", handle: "rgba(0,0,0,0.9)", meta: "rgba(0,0,0,0.45)", chipBg: "rgba(0,0,0,0.06)", chipText: "rgba(0,0,0,0.55)", body: spec.bodyColor, empty: "rgba(0,0,0,0.45)", mediaBorder: "rgba(0,0,0,0.08)", icons: "rgba(0,0,0,0.55)" };
  const shown = segments.map((text, i) => ({ text, i })).filter((s) => s.text.trim().length > 0 || (segments.length === 1 && s.i === 0));
  const total = shown.length;
  const widthPx = spec.cardWidthPx[device];
  const bodyStyle = { ...bodyStyleFrom(spec, c.body), margin: "4px 0 0" };
  const inner = shown.length === 0
    ? E("p", { fontFamily: spec.fontFamily, fontSize: 14, color: c.placeholder, textAlign: "center", padding: "32px 0", margin: 0 }, "Your Threads post preview shows up here as you type.")
    : E("ol", { listStyle: "none", margin: 0, padding: 0 }, shown.map((seg, idx) => {
      const last = idx === shown.length - 1;
      return E("li", { position: "relative", display: "flex", gap: 12 }, [
        E("div", { display: "flex", flexDirection: "column", alignItems: "center" }, [
          author.avatarUrl ? E("img", { width: 36, height: 36, flexShrink: 0, borderRadius: "9999px", objectFit: "cover" }, null, { src: author.avatarUrl, alt: "" }) : avatarCircle(36, c.avatarBg, c.avatarText, initial, 12),
          !last ? E("span", { marginTop: 4, width: 1, flex: 1, backgroundColor: c.connector }, null, { "aria-hidden": "true" }) : null
        ]),
        E("div", { minWidth: 0, flex: 1, paddingBottom: last ? 4 : 20 }, [
          E("div", { display: "flex", alignItems: "center", gap: 6 }, [
            E("span", { fontFamily: spec.fontFamily, fontSize: 14, fontWeight: 600, color: c.handle, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, handle),
            E("span", { fontSize: 12, color: c.meta }, "1h"),
            total > 1 ? E("span", { marginLeft: 4, borderRadius: "9999px", backgroundColor: c.chipBg, padding: "1px 6px", fontSize: 10, fontWeight: 500, fontVariantNumeric: "tabular-nums", color: c.chipText }, `${idx + 1}/${total}`) : null
          ]),
          E("p", bodyStyle, seg.text.length > 0 ? seg.text : E("span", { color: c.empty }, "(empty)")),
          idx === 0 && media ? E("div", { position: "relative", marginTop: 8, overflow: "hidden", borderRadius: 8, border: `1px solid ${c.mediaBorder}` }, mediaEl(media, { maxHeight: 256, width: "100%", objectFit: "cover", display: "block" })) : null,
          E("div", { marginTop: 10, display: "flex", alignItems: "center", gap: 16, color: c.icons }, ["heart", "messageCircle", "repeat2", "sendPlane"].map((n) => I(n, 16)))
        ])
      ]);
    }));
  return E("div", { margin: "0 auto", width: "100%", maxWidth: widthPx + "px" }, E("div", { backgroundColor: c.cardBg, border: `1px solid ${c.cardBorder}`, borderRadius: 12, padding: 16 }, inner));
}

// ─── Instagram (header · square media or 9:16 reel · icons · "username caption" · … more) ─
function InstagramPreview({ segments, device, author, media, rerender }) {
  const spec = PLATFORM_FIDELITY.instagram;
  const c = isDarkTheme()
    ? { cardBg: "#2f2d2c", cardBorder: "rgba(255,255,255,0.08)", username: "#f2f1ef", moreIcon: "#f2f1ef", mediaEmptyBg: "#252322", mediaEmptyBorder: "rgba(255,255,255,0.06)", mediaEmptyText: "rgba(242,241,239,0.4)", iconRow: "#f2f1ef", captionPlaceholder: "rgba(242,241,239,0.4)", entity: "#e0f1ff", moreLabel: "#969390", body: "#f2f1ef", viewComments: "#969390", timestamp: "#969390" }
    : { cardBg: "#ffffff", cardBorder: "rgba(0,0,0,0.1)", username: "#000000", moreIcon: "#000000", mediaEmptyBg: "#fafafa", mediaEmptyBorder: "rgba(0,0,0,0.06)", mediaEmptyText: "rgba(0,0,0,0.35)", iconRow: "#000000", captionPlaceholder: "rgba(0,0,0,0.4)", entity: spec.entity.color, moreLabel: spec.truncation.labelColor, body: spec.bodyColor, viewComments: "#737373", timestamp: "#8e8e8e" };
  const body = platformCaption(segments);
  const widthPx = spec.cardWidthPx[device];
  const isReel = media && media.type === "video";
  const username = (author.handle || "").replace(/^@/, "") || author.displayName || "your-handle";
  const initial = (username.trim()[0] || "?").toUpperCase();
  const cut = truncateByChars(body, spec.truncation[device].maxChars, spec.truncation.label);
  const collapsed = cut.truncated && !previewExpanded.instagram;
  const bodyStyle = bodyStyleFrom(spec, c.body);
  const mediaBox = isReel
    ? E("div", { position: "relative", width: "100%", aspectRatio: "9 / 16", backgroundColor: "#000000" }, [
      mediaEl(media, { width: "100%", height: "100%", objectFit: "cover", display: "block" }, { "aria-label": "Reel cover frame" }),
      E("span", { position: "absolute", top: 10, right: 10, display: "inline-flex", color: "#ffffff", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.6))" }, I("clapperboard", 18))])
    : media ? E("div", { width: "100%", aspectRatio: "1 / 1", backgroundColor: "#000000" }, mediaEl(media, { width: "100%", height: "100%", objectFit: "cover", display: "block" }))
      : E("div", { width: "100%", aspectRatio: "1 / 1", backgroundColor: c.mediaEmptyBg, borderTop: `1px solid ${c.mediaEmptyBorder}`, borderBottom: `1px solid ${c.mediaEmptyBorder}`, display: "flex", alignItems: "center", justifyContent: "center", color: c.mediaEmptyText, fontFamily: spec.fontFamily, fontSize: 13 }, "Add a photo or video");
  return E("div", { margin: "0 auto", width: "100%", maxWidth: widthPx + "px" }, [
    E("div", { overflow: "hidden", width: "100%", backgroundColor: c.cardBg, border: `1px solid ${c.cardBorder}`, borderRadius: 4 }, [
      E("div", { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px" }, [
        author.avatarUrl ? E("img", { width: 32, height: 32, borderRadius: "9999px", objectFit: "cover", flexShrink: 0 }, null, { src: author.avatarUrl, alt: "" })
          : avatarCircle(32, "linear-gradient(45deg,#f09433,#dc2743,#bc1888)", "#ffffff", initial, 13, { background: "linear-gradient(45deg,#f09433,#dc2743,#bc1888)" }),
        E("span", { flex: 1, minWidth: 0, fontFamily: spec.fontFamily, fontSize: 13, fontWeight: 600, color: c.username, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, username),
        I("moreHorizontal", 18, { color: c.moreIcon })
      ]),
      mediaBox,
      E("div", { display: "flex", alignItems: "center", gap: 16, padding: "8px 12px 4px", color: c.iconRow }, [I("heart", 24), I("messageCircle", 24), I("sendPlane", 24), I("bookmark", 24, { marginLeft: "auto" })]),
      E("div", { padding: "2px 12px 4px" }, body.length === 0
        ? E("p", { ...bodyStyle, color: c.captionPlaceholder, margin: 0 }, "Your Instagram caption shows up here as you type.")
        : E("div", { ...bodyStyle, margin: 0 }, [E("span", { fontWeight: 600, color: c.username }, username), E("span", null, " "),
          ...entityRuns(collapsed ? cut.shown : body, c.entity, spec.entity.fontWeight),
          collapsed ? E("button", { display: "inline", fontFamily: "inherit", fontSize: "inherit", lineHeight: "inherit", color: c.moreLabel, background: "none", border: "none", padding: 0, cursor: "pointer", fontWeight: 400, verticalAlign: "baseline" }, spec.truncation.label, { type: "button", onclick: () => { previewExpanded.instagram = true; rerender(); } }) : null])),
      E("div", { padding: "2px 12px 12px" }, [
        E("div", { fontFamily: spec.fontFamily, fontSize: 14, color: c.viewComments, marginBottom: 4 }, "View all comments"),
        E("div", { fontFamily: spec.fontFamily, fontSize: 10, letterSpacing: "0.2px", textTransform: "uppercase", color: c.timestamp }, "Just now")
      ])
    ]),
    isReel ? E("div", { display: "flex", alignItems: "center", gap: 10, marginTop: 10 }, [
      E("div", { width: 54, aspectRatio: "3 / 4", overflow: "hidden", borderRadius: 4, border: `1px solid ${c.cardBorder}`, backgroundColor: "#000000", flexShrink: 0 }, mediaEl(media, { width: "100%", height: "100%", objectFit: "cover", display: "block" })),
      E("span", { fontFamily: spec.fontFamily, fontSize: 12, color: c.viewComments }, "No cover picked, so Instagram uses a frame from the reel.")
    ]) : null
  ]);
}

// ─── TikTok (dark 9:16 video frame, caption over the video, right rail) ──────
function TikTokPreview({ segments, device, author, media, rerender }) {
  const spec = PLATFORM_FIDELITY.tiktok;
  const LEFT_PAD = 12, RAIL_W = 56;
  const body = platformCaption(segments);
  const captionW = spec.cardWidthPx[device];
  const frameW = captionW + LEFT_PAD + RAIL_W;
  const label = spec.truncation.label;
  const username = (author.handle || "").replace(/^@/, "") || author.displayName || "your-handle";
  const bodyStyle = bodyStyleFrom(spec, spec.bodyColor);
  let overflows = false;
  if (body.length) { const m = measureHeight(bodyStyle, captionW, body); overflows = m.h > spec.lineHeightPx + 1; m.done(); }
  const collapsed = overflows && !previewExpanded.tiktok;
  const captionStyle = collapsed ? { ...bodyStyle, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden", maxHeight: spec.lineHeightPx + "px" } : bodyStyle;
  const shadow = "0 1px 2px rgba(0,0,0,0.4)";
  const clamp = E("div", { ...captionStyle, flex: 1, minWidth: 0, margin: 0, textShadow: shadow }, entityRuns(body, spec.entity.color, spec.entity.fontWeight));
  if (collapsed) clamp.style.setProperty("-webkit-line-clamp", "1"), clamp.style.setProperty("-webkit-box-orient", "vertical");
  return E("div", { margin: "0 auto", width: "100%", maxWidth: frameW + "px" }, E("div", { position: "relative", width: "100%", aspectRatio: "9 / 16", backgroundColor: "#000000", borderRadius: 8, overflow: "hidden" }, [
    media ? mediaEl(media, { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" })
      : E("div", { position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, background: "linear-gradient(160deg,#1c1c1e,#000000)", color: "rgba(255,255,255,0.5)", fontFamily: spec.fontFamily, fontSize: 13 }, [I("play", 40), E("span", null, "Add a video to preview")]),
    E("div", { position: "absolute", left: 0, right: 0, bottom: 0, height: "45%", background: "linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0))", pointerEvents: "none" }, null, { "aria-hidden": "true" }),
    E("div", { position: "absolute", left: LEFT_PAD, bottom: 12, width: captionW + "px", maxWidth: `calc(100% - ${LEFT_PAD + RAIL_W}px)` }, [
      E("div", { fontFamily: spec.fontFamily, fontSize: 15, fontWeight: 700, color: "#ffffff", marginBottom: 4, textShadow: shadow }, "@" + username),
      body.length === 0 ? E("p", { ...bodyStyle, margin: 0, color: "rgba(255,255,255,0.75)" }, "Your TikTok caption shows up here as you type.")
        : E("div", { display: "flex", alignItems: "flex-end", gap: 4 }, [clamp,
          collapsed ? E("button", { flexShrink: 0, fontFamily: spec.fontFamily, fontSize: spec.fontSizePx, lineHeight: spec.lineHeightPx + "px", color: spec.truncation.labelColor, fontWeight: 600, background: "none", border: "none", padding: 0, cursor: "pointer", textShadow: shadow }, label, { type: "button", onclick: () => { previewExpanded.tiktok = true; rerender(); } }) : null]),
      E("div", { display: "flex", alignItems: "center", gap: 6, marginTop: 8, color: "#ffffff", fontFamily: spec.fontFamily, fontSize: 13, textShadow: shadow }, [I("music", 14), E("span", { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, "original sound - " + username)])
    ]),
    E("div", { position: "absolute", right: 8, bottom: 12, width: RAIL_W - 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, color: "#ffffff" }, [
      E("div", { position: "relative", marginBottom: 4 }, [
        author.avatarUrl ? E("img", { width: 40, height: 40, borderRadius: "9999px", objectFit: "cover", border: "1px solid #ffffff" }, null, { src: author.avatarUrl, alt: "" })
          : avatarCircle(40, "#333333", "#ffffff", (username.trim()[0] || "?").toUpperCase(), 16, { border: "1px solid #ffffff", fontWeight: 700 }),
        E("span", { position: "absolute", left: "50%", bottom: -8, transform: "translateX(-50%)", width: 18, height: 18, borderRadius: "9999px", backgroundColor: "#fe2c55", display: "inline-flex", alignItems: "center", justifyContent: "center" }, I("plus", 12))
      ]),
      ...["heart", "messageCircle", "bookmark", "share2"].map((n) => I(n, 30, { filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))" })),
      E("span", { width: 36, height: 36, borderRadius: "9999px", background: "radial-gradient(circle, #333 30%, #111 32%)", border: "3px solid #222", display: "inline-block" }, null, { "aria-hidden": "true" })
    ])
  ]));
}

// ─── X (Twitter): each tab is its own post in a reply chain, each with its own 280 ─
function XPreview({ segments, device, author, media }) {
  const spec = PLATFORM_FIDELITY.twitter;
  const nonEmpty = segments.filter((s) => s.trim().length > 0);
  const posts = nonEmpty.length > 0 ? nonEmpty : [""];
  const displayName = author.displayName || "Your Name";
  const handle = (author.handle || "").replace(/^@/, "") || "your-handle";
  const initial = (displayName.trim()[0] || handle[0] || "?").toUpperCase();
  const widthPx = spec.cardWidthPx[device];
  const limit = PLATFORM_CHAR_LIMIT.twitter;
  const c = isDarkTheme()
    ? { cardBg: "#2f2d2c", cardBorder: "rgba(255,255,255,0.08)", placeholder: "rgba(242,241,239,0.45)", avatarBg: "#f2f1ef", avatarText: "#252322", name: "#f2f1ef", meta: "#969390", body: "#f2f1ef", entity: "#1d9bf0", icons: "#969390", mediaBorder: "rgba(255,255,255,0.10)", overText: "#f4212e" }
    : { cardBg: "#ffffff", cardBorder: "rgba(0,0,0,0.08)", placeholder: "rgba(0,0,0,0.45)", avatarBg: "#0f1419", avatarText: "#ffffff", name: "rgb(15,20,25)", meta: "rgb(83,100,113)", body: spec.bodyColor, entity: "#1d9bf0", icons: "rgb(83,100,113)", mediaBorder: "rgba(0,0,0,0.10)", overText: "#f4212e" };
  const bodyStyle = { ...bodyStyleFrom(spec, c.body), margin: "4px 0 0" };
  return E("div", { margin: "0 auto", width: "100%", maxWidth: widthPx + "px" }, [
    E("div", { backgroundColor: c.cardBg, border: `1px solid ${c.cardBorder}`, borderRadius: 16, padding: 16 }, posts.map((text, idx) => E("div", { display: "flex", gap: 12, marginTop: idx === 0 ? 0 : 16 }, [
      author.avatarUrl ? E("img", { width: 40, height: 40, flexShrink: 0, borderRadius: "9999px", objectFit: "cover" }, null, { src: author.avatarUrl, alt: "" }) : avatarCircle(40, c.avatarBg, c.avatarText, initial, 15, { fontWeight: 700 }),
      E("div", { minWidth: 0, flex: 1 }, [
        E("div", { display: "flex", alignItems: "center", gap: 6, minWidth: 0 }, [
          E("span", { fontFamily: spec.fontFamily, fontSize: 15, fontWeight: 700, color: c.name, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, displayName),
          E("span", { fontFamily: spec.fontFamily, fontSize: 15, color: c.meta, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, "@" + handle),
          E("span", { fontSize: 15, color: c.meta }, "· 1h")
        ]),
        text.length === 0 ? E("p", { fontFamily: spec.fontFamily, fontSize: spec.fontSizePx, color: c.placeholder, margin: "4px 0 0" }, "Your X post preview shows up here as you type.")
          : E("p", bodyStyle, entityRuns(text, c.entity, spec.entity.fontWeight)),
        media && idx === 0 ? E("div", { marginTop: 12, overflow: "hidden", borderRadius: 16, border: `1px solid ${c.mediaBorder}` }, mediaEl(media, { maxHeight: 288, width: "100%", objectFit: "cover", display: "block" })) : null,
        E("div", { marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }, [
          E("div", { display: "flex", alignItems: "center", gap: 24, color: c.icons }, ["messageCircle", "repeat2", "heart", "barChart2"].map((n) => I(n, 16))),
          E("span", { fontFamily: spec.fontFamily, fontSize: 12, fontVariantNumeric: "tabular-nums", color: countChars(text) > limit ? c.overText : c.meta }, `${countChars(text)}/${limit}`)
        ])
      ])
    ]))),
    E("p", { fontFamily: spec.fontFamily, fontSize: 11, lineHeight: "16px", color: c.meta, margin: "8px 2px 0" }, "Approximate — X uses a proprietary font (TwitterChirp), so wrapping is close, not exact.")
  ]);
}

// ─── YouTube Shorts (dark 9:16 player; the title is what a Short shows) ──────
function YouTubeShortsPreview({ segments, device, author, media, youtubeTitle }) {
  const spec = PLATFORM_FIDELITY.youtube;
  const body = platformCaption(segments);
  const title = youtubeTitleFrom(body, youtubeTitle) || "Your Short's title (the caption's first line)";
  const frameW = spec.cardWidthPx[device] + 56;
  const channel = (author.handle || "").replace(/^@/, "") || author.displayName || "your-channel";
  const rail = [["thumbsUp", "Like"], ["thumbsDown", "Dislike"], ["messageSquare", "0"], ["share2", "Share"]];
  const titleEl = E("div", { fontSize: 14, lineHeight: "20px", fontWeight: 500, display: "-webkit-box", overflow: "hidden" }, title);
  titleEl.style.setProperty("-webkit-line-clamp", "2"); titleEl.style.setProperty("-webkit-box-orient", "vertical");
  return E("div", { margin: "0 auto", width: "100%", maxWidth: frameW + "px" }, E("div", { position: "relative", width: "100%", aspectRatio: "9 / 16", backgroundColor: "#000000", borderRadius: 12, overflow: "hidden" }, [
    media ? mediaEl(media, { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" })
      : E("div", { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.5)" }, I("play", 40)),
    E("div", { position: "absolute", left: 0, right: 0, bottom: 0, height: "45%", background: "linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0))" }),
    E("div", { position: "absolute", right: 8, bottom: 70, display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }, rail.map(([ic, l]) =>
      E("div", { display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: "#ffffff", fontFamily: spec.fontFamily, fontSize: 11 }, [
        E("div", { width: 40, height: 40, borderRadius: 20, background: "rgba(255,255,255,0.14)", display: "flex", alignItems: "center", justifyContent: "center" }, I(ic, 20)), l]))),
    E("div", { position: "absolute", left: 12, right: 64, bottom: 16, color: spec.bodyColor, fontFamily: spec.fontFamily }, [
      E("div", { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }, [
        author.avatarUrl ? E("img", { width: 28, height: 28, borderRadius: 14 }, null, { src: author.avatarUrl, alt: "" }) : E("div", { width: 28, height: 28, borderRadius: 14, background: "#3f3f3f" }),
        E("span", { fontSize: 13, fontWeight: 500 }, "@" + channel),
        E("span", { fontSize: 12, fontWeight: 500, background: "#ffffff", color: "#0f0f0f", borderRadius: 999, padding: "4px 10px" }, "Subscribe")
      ]),
      titleEl
    ]),
    E("div", { position: "absolute", top: 10, left: 12, color: "#ffffff", fontFamily: spec.fontFamily, fontSize: 13, fontWeight: 600, opacity: 0.9 }, "Shorts")
  ]));
}

// ─── Skool (dark feed card by default, with its own Light/Dark switch) ───────
const SKOOL_THEMES = {
  dark: { page: "rgb(34,34,34)", card: "rgb(51,51,51)", border: "rgba(255,255,255,0.08)", text: "rgb(228,228,228)", meta: "rgb(144,144,144)", ph: "rgb(120,120,120)", link: "#8ba6ff", btn: "rgba(255,255,255,0.18)" },
  light: { page: "#f8f7f5", card: "#ffffff", border: "#e8e6e1", text: "#202124", meta: "#8a8a8a", ph: "#b5b5b5", link: "#2b6fff", btn: "#d9d7d2" }
};
let skoolPreviewMode = "dark";
function SkoolPreview({ segments, device, author, skool, rerender }) {
  const spec = PLATFORM_FIDELITY.skool;
  const c = SKOOL_THEMES[skoolPreviewMode];
  const blocks = parseSkoolBody(platformCaption(segments));
  const title = cleanSkoolTitle(skool && skool.title);
  const category = (skool && skool.category) || "General discussion";
  const name = author.displayName || "Your Name";
  const width = spec.cardWidthPx[device];
  return E("div", { margin: "0 auto", width: "100%", maxWidth: width + 32 + "px" }, [
    E("div", { backgroundColor: c.page, borderRadius: 12, padding: 16 }, E("div", { backgroundColor: c.card, border: `1px solid ${c.border}`, borderRadius: 10, padding: 16, fontFamily: spec.fontFamily, color: c.text }, [
      E("div", { display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }, [
        E("div", { position: "relative", width: 40, height: 40, flexShrink: 0 }, [
          author.avatarUrl ? E("img", { width: 40, height: 40, borderRadius: 20, objectFit: "cover" }, null, { src: author.avatarUrl, alt: "" })
            : E("div", { width: 40, height: 40, borderRadius: 20, backgroundColor: "#6b6b6b", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 16 }, (name.trim()[0] || "?").toUpperCase()),
          E("span", { position: "absolute", left: -2, bottom: -2, width: 17, height: 17, borderRadius: 9, backgroundColor: "#3b4fb8", color: "#ffffff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${c.card}`, boxSizing: "content-box" }, "1")
        ]),
        E("div", { minWidth: 0 }, [
          E("div", { fontSize: 16, fontWeight: 500, color: c.text, lineHeight: "20px" }, name),
          E("div", { fontSize: 13, fontWeight: 700, color: c.meta, lineHeight: "18px" }, `now · ${category}`)
        ])
      ]),
      E("div", { fontSize: 20, fontWeight: 700, lineHeight: "30px", color: c.text, marginBottom: 12, overflowWrap: "break-word" }, title || E("span", { color: c.ph }, "Post title")),
      E("div", { fontSize: spec.fontSizePx, lineHeight: spec.lineHeightPx + "px", whiteSpace: spec.whiteSpace, overflowWrap: spec.overflowWrap, color: c.text },
        blocks.length === 0 ? E("span", { color: c.ph }, "Write something…") : blocks.map((lines, bi) => E("p", { margin: bi === 0 ? 0 : "16px 0 0" },
          lines.flatMap((runs, li) => [li > 0 ? "\n" : null, ...runs.map((r) => r.href ? E("span", { color: c.link, textDecoration: "underline" }, r.text) : r.text)])))),
      E("div", { display: "flex", alignItems: "center", gap: 24, marginTop: 20, color: c.meta, fontSize: 13, fontWeight: 700 }, [
        E("span", { display: "inline-flex", border: `1px solid ${c.btn}`, borderRadius: 6, overflow: "hidden", color: c.text }, [
          E("span", { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px" }, [I("thumbsUp", 14), "Like"]),
          E("span", { padding: "8px 12px", borderLeft: `1px solid ${c.btn}`, color: c.meta }, "0")
        ]),
        E("span", { display: "inline-flex", alignItems: "center", gap: 8 }, [I("messageSquare", 16), "0 comments"])
      ])
    ])),
    E("div", { marginTop: 8, display: "flex", justifyContent: "center", gap: 10, alignItems: "center", fontSize: 11, color: "#8a8a8a" }, [
      E("span", null, "Matches Skool's dark feed; link colour approximate."),
      E("button", { border: "1px solid #8a8a8a", borderRadius: 999, padding: "1px 8px", color: "#8a8a8a", background: "transparent", fontSize: 11, cursor: "pointer" }, skoolPreviewMode === "dark" ? "Light" : "Dark", { type: "button", onclick: () => { skoolPreviewMode = skoolPreviewMode === "dark" ? "light" : "dark"; rerender(); } })
    ])
  ]);
}

/** Dispatch to the platform's card. */
function PlatformPreview(props) {
  switch (props.platform) {
    case "linkedin": return LinkedInPreview(props);
    case "instagram": return InstagramPreview(props);
    case "tiktok": return TikTokPreview(props);
    case "twitter": return XPreview(props);
    case "youtube": return YouTubeShortsPreview(props);
    case "skool": return SkoolPreview(props);
    default: return ThreadsPreview(props);
  }
}
