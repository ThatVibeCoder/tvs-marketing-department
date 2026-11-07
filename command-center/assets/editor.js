// The post editor: a full-screen sheet. Left = the editor (platform chip, chain tabs on Threads and X,
// the post box with its media strip and toolbar, the per-post counter, the platform's own fields,
// the checks); right = the live preview of exactly how it looks on that platform, on a phone or a
// desktop. Opened from a review card (Save changes is the only write), from the calendar (date,
// Duplicate and Save changes), or to create a new post. Every save writes the post's file.

let comp = null;

function openComposer(opts) {
  const now = todayParts();
  if (opts.postId) {
    const p = posts().find((x) => x.id === opts.postId);
    if (!p) return toast("That post file isn't there anymore.");
    comp = { mode: "edit", source: opts.source || "review", postId: p.id, status: p.status, platform: p.platform, segments: PLATFORM_SUPPORTS_CHAIN[p.platform] ? captionToSegments(p.body) : [p.body],
      title: p.title || "", category: p.category || "", media: p.media || "", mediaType: p.mediaType || "image", date: p.date || "", time: p.time || "", notes: p.notes || "" };
  } else {
    const c = opts.create || {};
    comp = { mode: "create", source: "calendar", platform: c.platform || "instagram", status: "draft", segments: [""], title: "", category: (settings().skoolCategories || [])[0] || "General discussion",
      media: "", mediaType: "image", date: c.date || now.key, time: c.time || defaultTimeFor(c.platform || "instagram", c.date || now.key), notes: "" };
  }
  Object.assign(comp, { activeTab: 0, device: "mobile", showNotes: false, showMedia: false, saving: false, error: null, touched: false, dirty: false, saveMode: "draft", modeMenu: false });
  comp.initial = JSON.stringify(snapshot());
  for (const k of Object.keys(previewExpanded)) delete previewExpanded[k];
  document.body.classList.add("sheet-open");
  drawSheet(true);
}
function snapshot() { return { segments: comp.segments, title: comp.title, category: comp.category, media: comp.media, mediaType: comp.mediaType, date: comp.date, time: comp.time, notes: comp.notes, platform: comp.platform }; }
function isDirty() { return comp && JSON.stringify(snapshot()) !== comp.initial; }
function closeComposer(force) {
  if (!comp) return;
  if (!force && isDirty() && !confirm("Close without saving? Your changes to this post will be lost.")) return;
  comp = null;
  document.body.classList.remove("sheet-open");
  const s = document.querySelector(".sheet");
  if (s) s.remove();
  render();
}
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && comp && !comp.modeMenu) closeComposer(); });

function composerChecks() {
  const out = [], { platform, segments } = comp, limit = PLATFORM_CHAR_LIMIT[platform];
  const hasMedia = !!comp.media.trim();
  const segs = PLATFORM_SUPPORTS_CHAIN[platform] ? segments : [platformCaption(segments)];
  segs.forEach((seg, i) => {
    const n = countChars(seg);
    if (n === 0 && !hasMedia) out.push({ severity: "error", message: `Post ${i + 1} → content length should be at least 1 character or 1 media file.` });
    if (n > limit) out.push({ severity: "error", message: `Post ${i + 1} → ${n} / ${limit} characters exceeds the ${PLATFORM_LABEL[platform]} limit.` });
  });
  if (platform === "skool") {
    const pr = skoolPostProblem({ title: comp.title, category: comp.category, body: platformCaption(segments) }, settings().skoolCategories || []);
    if (pr && comp.touched) out.push({ severity: "error", message: pr });
  }
  if (platform === "youtube") {
    if (comp.title.trim().length > YOUTUBE_TITLE_MAX) out.push({ severity: "error", message: `YouTube titles are capped at ${YOUTUBE_TITLE_MAX} characters.` });
    if (!hasMedia || comp.mediaType !== "video") out.push({ severity: "warning", message: "YouTube Shorts need exactly one vertical video. Add it before this goes out." });
  }
  if ((platform === "tiktok") && (!hasMedia || comp.mediaType !== "video")) out.push({ severity: "warning", message: "TikTok posts are a video. Add it before this goes out." });
  if (platform === "instagram" && !hasMedia) out.push({ severity: "warning", message: "Instagram posts need a photo or a video." });
  return out;
}
function bodyText() { return PLATFORM_SUPPORTS_CHAIN[comp.platform] ? joinChain(comp.segments.filter((s, i) => s.trim() || i === 0)) : comp.segments[0]; }
async function saveComposer(statusOverride) {
  if (comp.saving) return;
  comp.touched = true;
  if (composerChecks().some((c) => c.severity === "error")) return drawSheet();
  comp.saving = true; drawSheet();
  const fields = { body: bodyText(), title: comp.title, category: comp.platform === "skool" ? comp.category : comp.category, media: comp.media.trim(), media_type: comp.media.trim() ? comp.mediaType : "", notes: comp.notes };
  if (comp.source !== "review" || comp.mode === "create") Object.assign(fields, { date: comp.date, time: comp.time });
  let r;
  if (comp.mode === "create") r = await api("/api/posts", { ...fields, platform: comp.platform, status: statusOverride || "draft" });
  else r = await api(`/api/posts/${comp.postId}`, { ...fields, hash: (posts().find((p) => p.id === comp.postId) || {}).hash }); // 409 if the file changed meanwhile
  if (!comp) return;
  comp.saving = false;
  if (r) { toast(comp.mode === "create" ? `Saved to ${POSTS_HOME}/${r.id}.md` : "Saved."); closeComposer(true); }
  else drawSheet();
}
async function duplicateFromComposer() {
  const r = await api(`/api/posts/${comp.postId}/duplicate`, {});
  if (r) { closeComposer(true); openComposer({ postId: r.id, source: "calendar" }); toast("Copied as a new draft. Pick its day, then Save changes."); }
}

function drawSheet(focus) {
  if (!comp) return;
  const old = document.querySelector(".sheet");
  const sel = old && old.querySelector("textarea.post-box");
  const caret = sel && document.activeElement === sel ? [sel.selectionStart, sel.selectionEnd] : null;
  const sheet = buildSheet();
  if (old) old.replaceWith(sheet); else document.body.append(sheet);
  const ta = sheet.querySelector("textarea.post-box");
  if (ta && (focus || caret)) { ta.focus(); if (caret) ta.setSelectionRange(caret[0], caret[1]); }
}
function updateLive() {
  // Typing only touches the counter, the checks and the preview, so the text box keeps its place.
  const sheet = document.querySelector(".sheet");
  if (!sheet) return;
  sheet.querySelector(".counter-slot").replaceWith(counterEl());
  sheet.querySelector(".checks-slot").replaceWith(checksEl());
  sheet.querySelector(".preview-slot").replaceWith(previewEl());
  const t = sheet.querySelector(".skool-len"); if (t) { t.textContent = `${comp.title.trim().length}/${SKOOL_TITLE_MAX}`; t.classList.toggle("over", comp.title.trim().length > SKOOL_TITLE_MAX); }
  const y = sheet.querySelector(".yt-len"); if (y) { y.textContent = `${comp.title.trim().length}/${YOUTUBE_TITLE_MAX}`; y.classList.toggle("over", comp.title.trim().length > YOUTUBE_TITLE_MAX); }
}
function counterEl() {
  const n = countChars(comp.segments[comp.activeTab] || ""), limit = PLATFORM_CHAR_LIMIT[comp.platform];
  return h("span", { class: cls("counter counter-slot", n > limit && "over") }, [`${n} / ${limit}`, h("span", { class: "ic-wrap sm", html: platformMark(comp.platform) })]);
}
function checksEl() {
  const all = composerChecks(), errs = all.filter((c) => c.severity === "error"), warns = all.filter((c) => c.severity === "warning");
  return h("div", { class: "checks-slot" }, [
    errs.length ? h("div", { class: "check-box danger" }, [h("div", { class: "check-head" }, [svgIcon("alertTriangle"), `${errs.length} ${errs.length === 1 ? "error" : "errors"}`]), h("ul", {}, errs.map((e) => h("li", {}, e.message)))]) : null,
    warns.length ? h("div", { class: "check-box warn" }, [h("div", { class: "check-head" }, [svgIcon("info"), `${warns.length} ${warns.length === 1 ? "warning" : "warnings"}`]), h("ul", {}, warns.map((e) => h("li", {}, e.message)))]) : null
  ]);
}
function previewEl() {
  const media = comp.media.trim() ? { url: mediaUrl({ media: comp.media.trim() }), type: comp.mediaType } : null;
  const rerender = () => { const s = document.querySelector(".sheet .preview-slot"); if (s) s.replaceWith(previewEl()); };
  const card = PlatformPreview({ platform: comp.platform, device: comp.device, segments: comp.segments, author: authorFor(comp.platform), media, skool: { title: comp.title, category: comp.category }, youtubeTitle: comp.title, rerender });
  return h("div", { class: "preview-slot" }, [
    h("div", { class: "pv-head" }, [
      h("span", { class: "pv-label" }, [h("span", { class: "ic-wrap sm", html: platformMark(comp.platform) }), PLATFORM_LABEL[comp.platform]]),
      h("div", { role: "group", "aria-label": "Preview device", class: "pv-device" }, [["mobile", "smartphone"], ["desktop", "monitor"]].map(([d, ic]) => h("button", { type: "button", "aria-pressed": comp.device === d ? "true" : "false", onclick: () => { comp.device = d; rerender(); } }, [svgIcon(ic), h("span", { class: "sr-only" }, d)])))
    ]),
    h("div", { class: "pv-body" }, card),
    h("div", { class: "pv-note" }, [svgIcon("info"), h("span", {}, `Preview matches how ${PLATFORM_LABEL[comp.platform]} renders on this device. Other viewers' devices may wrap text slightly differently.`)])
  ]);
}

function buildSheet() {
  const c = comp, posted = c.status === "posted", readOnly = posted || !state.server;
  const chain = PLATFORM_SUPPORTS_CHAIN[c.platform];
  const title = posted ? "Post already posted — can't edit" : c.mode === "edit" ? "Edit post" : "Create new post";
  const brand = activeBrand();
  const setSeg = (v) => { c.segments[c.activeTab] = v; updateLive(); };
  const ta = h("textarea", { class: "post-box", placeholder: c.segments.length > 1 ? `What's post ${c.activeTab + 1} about?` : "What's this post about?", readonly: readOnly ? "" : null, oninput: (e) => setSeg(e.target.value) });
  ta.value = c.segments[c.activeTab] || "";
  const hasImage = c.media.trim() && c.mediaType === "image";

  const networkRow = h("div", { class: "net-row" }, [
    h("div", { class: "row gap15 wrap" }, [
      c.mode === "create" && !readOnly
        ? h("label", { class: "plat-pick" }, [h("span", { class: "sr-only" }, "Platform"), h("select", { onchange: (e) => { c.platform = e.target.value; c.segments = PLATFORM_SUPPORTS_CHAIN[c.platform] ? c.segments : [platformCaption(c.segments)]; c.activeTab = 0; drawSheet(); } }, PLATFORM_ORDER.map((p) => { const o = h("option", { value: p }, PLATFORM_LABEL[p]); if (p === c.platform) o.selected = true; return o; }))])
        : null,
      h("span", { class: "net-chip", title: PLATFORM_LABEL[c.platform], html: platformMark(c.platform) })
    ]),
    chain ? h("div", { class: "vdiv", "aria-hidden": "true" }) : null,
    chain ? h("div", { class: "row gap15 wrap" }, [
      ...c.segments.map((_, i) => h("div", { class: cls("chain-tab", c.activeTab === i && "on") }, [
        h("button", { type: "button", onclick: () => { c.activeTab = i; drawSheet(true); } }, [h("span", { class: "ic-wrap xs muted", html: lineIcon("grip") }), `Post ${i + 1}`]),
        c.segments.length > 1 && !readOnly ? h("button", { type: "button", class: "tab-x", "aria-label": `Remove post ${i + 1}`, onclick: () => { c.segments.splice(i, 1); c.activeTab = Math.min(c.activeTab, c.segments.length - 1); drawSheet(); }, html: lineIcon("x") }) : null
      ])),
      !readOnly ? h("button", { type: "button", class: "tab-add", "aria-label": "Add a post to the chain", onclick: () => { c.segments.push(""); c.activeTab = c.segments.length - 1; drawSheet(true); }, html: lineIcon("plus") }) : null
    ]) : null,
    h("button", { type: "button", class: cls("notes-btn", c.showNotes && "on"), "aria-pressed": c.showNotes ? "true" : "false", onclick: () => { c.showNotes = !c.showNotes; drawSheet(); } }, [svgIcon("stickyNote"), "Notes"])
  ]);

  const editorBox = h("div", { class: cls("editor-box", readOnly && "ro") }, [
    ta,
    hasImage ? h("div", { class: "media-strip" }, h("ul", {}, [h("li", { class: "strip-thumb" }, [h("img", { src: mediaUrl({ media: c.media.trim() }), alt: "Attached image" }), !readOnly ? h("button", { type: "button", class: "strip-x", "aria-label": "Remove image", title: "Remove image", onclick: () => { c.media = ""; drawSheet(); }, html: lineIcon("trash") }) : null])])) : null,
    h("div", { class: "editor-foot" }, [
      h("div", { class: "row gap05" }, [
        h("button", { type: "button", class: cls("tool-btn", (c.showMedia || c.media) && "on"), "aria-label": "Attach media", title: "Attach media", "aria-pressed": c.showMedia ? "true" : "false", onclick: () => { c.showMedia = !c.showMedia; drawSheet(); }, html: lineIcon("image") }),
        h("button", { type: "button", class: cls("tool-btn", c.showMedia && "on"), "aria-label": "Paste a media link", title: "Paste a media link", onclick: () => { c.showMedia = true; drawSheet(); setTimeout(() => { const i = document.querySelector(".media-input"); if (i) i.focus(); }); }, html: lineIcon("link2") }),
        ...[["smile", "Emoji"], ["film", "GIF"], ["folderOpen", "Media library"]].map(([ic, l]) => h("button", { type: "button", class: "tool-btn", disabled: "", "aria-label": l, title: `${l} — coming soon`, html: lineIcon(ic) }))
      ]),
      counterEl()
    ])
  ]);

  const mediaPanel = c.showMedia ? h("div", { class: "media-panel" }, [
    h("label", { class: "field-label" }, "Add media"),
    h("p", { class: "field-hint" }, "Paste a link, or a path inside this repo (for example recordings/clip.mp4). The file stays where it is; the post just points at it."),
    h("input", { class: "media-input field", value: c.media, placeholder: "https://… or recordings/clip.mp4", readonly: readOnly ? "" : null, onchange: (e) => { c.media = e.target.value.trim(); if (/\.(mp4|mov|webm|m4v)(\?|$)/i.test(c.media)) c.mediaType = "video"; drawSheet(); } }),
    h("div", { class: "row gap2 wrap" }, [...["image", "video"].map((t) => h("button", { type: "button", class: cls("type-btn", c.mediaType === t && "on"), disabled: readOnly ? "" : null, onclick: () => { c.mediaType = t; drawSheet(); } }, t)), c.media ? h("button", { type: "button", class: "type-btn", disabled: readOnly ? "" : null, onclick: () => { c.media = ""; drawSheet(); } }, "Remove") : null])
  ]) : null;

  const platformFields = c.platform === "skool" ? h("section", { class: "pf-box", "aria-label": "Skool post details" }, [
    h("label", { class: "pf-field" }, [h("span", { class: "pf-label" }, ["Skool title", h("span", { class: cls("skool-len num", c.title.trim().length > SKOOL_TITLE_MAX && "over") }, `${c.title.trim().length}/${SKOOL_TITLE_MAX}`)]),
      h("input", { class: "field title-field", value: c.title, readonly: readOnly ? "" : null, placeholder: "The hook members see in the feed", oninput: (e) => { c.title = e.target.value; c.touched = true; updateLive(); } })]),
    h("label", { class: "pf-field" }, [h("span", { class: "pf-label" }, "Skool category"), h("select", { class: "field", disabled: readOnly ? "" : null, onchange: (e) => { c.category = e.target.value; c.touched = true; updateLive(); } },
      [...new Set([...(settings().skoolCategories || []), c.category].filter(Boolean))].map((x) => { const o = h("option", { value: x }, x); if (x === c.category) o.selected = true; return o; }))]),
    h("p", { class: "field-hint" }, "The text above is the post body. A blank line is a blank line, a single line break stays tight, and a [phrase](url) becomes a link on that phrase. Skool has no posting API, so you post it yourself; post-content walks you through it. Your categories live in Settings → Brands.")
  ]) : c.platform === "youtube" ? h("section", { class: "pf-box", "aria-label": "YouTube details" }, [
    h("label", { class: "pf-field" }, [h("span", { class: "pf-label" }, ["YouTube title", h("span", { class: cls("yt-len num", c.title.trim().length > YOUTUBE_TITLE_MAX && "over") }, `${c.title.trim().length}/${YOUTUBE_TITLE_MAX}`)]),
      h("input", { class: "field title-field", value: c.title, readonly: readOnly ? "" : null, placeholder: "Leave empty to use the caption's first line", oninput: (e) => { c.title = e.target.value; updateLive(); } })]),
    h("p", { class: "field-hint" }, "Shorts show the title over the video; the caption becomes the description behind it. Any vertical video of 3 minutes or less posts as a Short.")
  ]) : null;

  const left = h("div", { class: "sheet-left" }, h("div", { class: "sheet-left-in" }, [
    networkRow, editorBox, mediaPanel, platformFields, checksEl(),
    posted ? h("div", { role: "alert", class: "banner warn" }, [svgIcon("alertTriangle"), h("span", {}, "This post is already posted, so its words and time can't be edited. Duplicate it to run it again as a new draft.")]) : null,
    !state.server ? h("div", { role: "status", class: "banner" }, [svgIcon("info"), h("span", {}, ["You're looking at the read-only view. Run ", h("code", {}, "python3 tools/serve.py"), " and open the link it prints to edit and save."])]) : null,
    c.mode === "edit" ? h("p", { class: "file-path" }, [svgIcon("folderOpen"), h("code", {}, `${POSTS_HOME}/${c.postId}.md`)]) : null
  ]));

  const right = h("div", { class: "sheet-right" }, c.showNotes
    ? h("div", { class: "notes-panel" }, [h("div", { class: "notes-head" }, [h("span", { class: "row gap15 b" }, [svgIcon("stickyNote", "warn"), "Post notes"]), h("button", { type: "button", class: "icon-btn", "aria-label": "Close notes", title: "Close notes — back to preview", onclick: () => { c.showNotes = false; drawSheet(); }, html: lineIcon("x") })]),
      (() => { const n = h("textarea", { class: "notes-box", placeholder: "Internal notes (never published)…", readonly: readOnly ? "" : null, oninput: (e) => { c.notes = e.target.value; } }); n.value = c.notes; return n; })()])
    : previewEl());

  const dateTime = h("div", { class: "dt-group" }, [svgIcon("calendarDays"),
    h("input", { type: "date", class: "dt-input", value: c.date, "aria-label": "Day it goes out", disabled: readOnly ? "" : null, onchange: (e) => { c.date = e.target.value; } }),
    h("input", { type: "time", class: "dt-input", value: c.time, "aria-label": "Time it goes out", disabled: readOnly ? "" : null, onchange: (e) => { c.time = e.target.value; } }),
    h("span", { class: "tiny-sub" }, tzName())]);
  const hasError = composerChecks().some((x) => x.severity === "error");
  const primary = (label, onclick, icon) => h("button", { type: "button", class: "btn-primary", disabled: c.saving || (hasError && c.touched) ? "" : null, onclick }, [svgIcon(c.saving ? "clock" : icon || "checkMark"), c.saving ? "Saving…" : label]);
  const cancel = h("button", { type: "button", class: "btn-outline", onclick: () => closeComposer() }, posted || !state.server ? "Close" : "Cancel");
  let footer;
  if (posted) footer = [cancel, state.server ? h("button", { type: "button", class: "btn-primary", onclick: duplicateFromComposer }, [svgIcon("copy"), "Duplicate"]) : null];
  else if (!state.server) footer = [cancel];
  else if (c.mode === "edit") footer = [cancel, h("div", { class: "row gap3 wrap" }, [
    c.source !== "review" ? h("button", { type: "button", class: "btn-outline", onclick: duplicateFromComposer }, [svgIcon("copy"), "Duplicate"]) : null,
    c.source !== "review" ? dateTime : null,
    primary("Save changes", () => saveComposer())])];
  else footer = [cancel, h("div", { class: "row gap3 wrap" }, [dateTime, h("div", { class: "split" }, [
    primary(c.saveMode === "draft" ? "Save as draft" : "Schedule", () => saveComposer(c.saveMode === "draft" ? "draft" : "approved")),
    h("button", { type: "button", class: "split-caret", "aria-haspopup": "menu", "aria-expanded": c.modeMenu ? "true" : "false", "aria-label": "Choose save action", onclick: () => { c.modeMenu = !c.modeMenu; drawSheet(); }, html: lineIcon("chevronDown") }),
    c.modeMenu ? h("div", { role: "menu", class: "glass pop-menu" }, [["draft", "Save as draft", "Saved to your review queue for later."], ["schedule", "Schedule", c.date ? `Approve & schedule for ${fmtSlot(c.date, c.time)}.` : "Pick a date first, then this schedules it."]].map(([k, t, d]) =>
      h("button", { type: "button", role: "menuitemradio", "aria-checked": c.saveMode === k ? "true" : "false", class: "menu-item", onclick: () => { c.saveMode = k; c.modeMenu = false; drawSheet(); } }, [h("span", { class: "menu-check", html: c.saveMode === k ? lineIcon("checkMark") : "" }), h("span", {}, [h("span", { class: "menu-title" }, t), h("span", { class: "menu-desc" }, d)])]))) : null
  ])])];

  return h("div", { class: "sheet", role: "dialog", "aria-modal": "true", "aria-label": title }, [
    h("header", { class: "sheet-head" }, [
      h("div", { class: "row gap3" }, [h("h2", { class: "sheet-title" }, title), h("span", { class: "brand-chip" }, [h("span", { class: "brand-mono" }, (brand.name || "YB").slice(0, 2).toUpperCase()), brand.name || "Your Brand"])]),
      h("button", { type: "button", class: "close-btn", onclick: () => closeComposer() }, [svgIcon("x"), "Close"])
    ]),
    h("div", { class: "sheet-body" }, [left, right]),
    h("footer", { class: "sheet-foot" }, footer)
  ]);
}
