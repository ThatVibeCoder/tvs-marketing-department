// The Content section: Overview, Calendar, Research, and one page per platform (Overview · Review · Calendar).
// Everything here is drawn from the post files in the repo (see the posts/README.md next to them).
// Numbers only ever come from those files; with no files, the pages say so.

const POSTS_HOME = "departments/marketing/content-team/social-manager/posts";
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];
const DECIDE_HINT = "A approve · R reject";
const TEXT_PLATFORMS = ["threads", "linkedin", "twitter", "skool"];
const ACTION_ICONS = { twitter: ["messageCircle", "repeat2", "heart", "barChart2"], threads: ["heart", "messageCircle", "repeat2", "sendPlane"], linkedin: ["thumbsUp", "messageCircle", "repeat2", "sendPlane"], skool: ["thumbsUp", "messageSquare"] };

// ─── Shared helpers ──────────────────────────────────────────────────────────
const posts = () => (state.content && state.content.posts) || [];
const settings = () => state.settings || {};
const tzName = () => (settings().workspace || {}).timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
const activeBrand = () => (settings().brands || []).find((b) => b.active) || (settings().brands || [])[0] || { name: "Your Brand", handle: "@yourhandle" };
const handleFor = (platform) => ((settings().accounts || {})[platform] || {}).handle || activeBrand().handle || "@yourhandle";
const authorFor = (platform) => ({ displayName: activeBrand().name || "Your Brand", handle: handleFor(platform), headline: null, avatarUrl: null });
const pad2 = (n) => String(n).padStart(2, "0");
const dateKey = (y, m, d) => `${y}-${pad2(m + 1)}-${pad2(d)}`;
function todayParts() {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: tzName(), year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
  const g = (t) => p.find((x) => x.type === t).value;
  return { y: +g("year"), m: +g("month") - 1, d: +g("day"), key: `${g("year")}-${g("month")}-${g("day")}`, hm: `${g("hour")}:${g("minute")}` };
}
function addDays(key, n) { const [y, m, d] = key.split("-").map(Number); const t = new Date(Date.UTC(y, m - 1, d + n)); return t.toISOString().slice(0, 10); }
function weekdayOf(key) { const [y, m, d] = key.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); }
function fmtTime(hm) { if (!hm) return ""; const [h, m] = hm.split(":").map(Number); return `${h % 12 === 0 ? 12 : h % 12}:${pad2(m)} ${h < 12 ? "AM" : "PM"}`; }
function fmtDay(key) { const [y, m, d] = key.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" }); }
function fmtSlot(key, hm) { return `${fmtDay(key)}${hm ? `, ${fmtTime(hm)}` : ""}`; }
const postedKey = (p) => (p.postedAt || "").slice(0, 10) || p.date;
const postedHm = (p) => (p.postedAt || "").slice(11, 16) || p.time;
const preview = (s, n) => { const c = String(s || "").replace(/^\s*---\s*$/gm, " ").replace(/\s+/g, " ").trim(); return c.length > n ? c.slice(0, n).trimEnd() + "…" : c; };
function mediaUrl(p) {
  const m = p.media || "";
  if (!m) return null;
  if (/^(https?:|data:)/.test(m)) return m;
  return state.server ? `/repo/${m.replace(/^\/+/, "")}` : `../${m.replace(/^\/+/, "")}`;
}
const postMedia = (p) => (p.media ? { url: mediaUrl(p), type: p.mediaType === "video" ? "video" : "image" } : null);
function cls(...a) { return a.filter(Boolean).join(" "); }
function svgIcon(name, c = "") { return h("span", { class: cls("ic-wrap", c), html: lineIcon(name) }); }
function markIcon(platform, c = "") { return h("span", { class: cls("ic-wrap", c), html: platformMark(platform) }); }
function contentTeamNote() {
  if ((state.teams || []).some((t) => t.id === "content-team")) return null;
  return h("p", { class: "ro-note" }, ["Your posts come from the Content Team, and it isn't in your department yet. Ask your AI: ", h("code", {}, "add the content team"), " (or run ", h("code", {}, "python3 tools/add_team.py content-team"), "). Until then these pages stay empty."]);
}
function readOnlyNote() {
  return state.server ? null : h("p", { class: "ro-note" }, ["Read-only view. To approve, edit or schedule from here, run ", h("code", {}, "python3 tools/serve.py"), " (Windows: ", h("code", {}, "py tools/serve.py"), ") and open the link it prints."]);
}

/** POST a change to tools/serve.py; on success the server hands back the fresh state. */
async function api(path, body) {
  if (!state.server) { toast("Start the server to make changes: python3 tools/serve.py"); return null; }
  try {
    const res = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body || {}) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { toast(data.error || "That didn't save."); return null; }
    if (data.state) applyState(data.state);
    if (data.synced && !data.synced.ok && data.synced.fix && data.synced.fix.length) toast(`Saved. Sync says to fix: ${data.synced.fix[0]}`);
    return data;
  } catch (e) {
    toast("The server stopped. Start it again with python3 tools/serve.py");
    return null;
  }
}
function toast(text, action) {
  const box = $("#toast");
  box.replaceChildren(...[h("span", {}, text), action ? h("button", { type: "button", class: "toast-btn", onclick: () => { box.classList.add("hide"); action.run(); } }, action.label) : null, h("button", { type: "button", class: "toast-x", "aria-label": "Dismiss", onclick: () => box.classList.add("hide"), html: lineIcon("x") })].filter(Boolean));
  box.classList.remove("hide");
  clearTimeout(toast.t);
  toast.t = setTimeout(() => box.classList.add("hide"), 6000);
}

// Posting cadence → open slots. A slot is one weekday + time for one platform (Settings → Posting Cadence).
function cadenceFor(platform) { return (settings().cadence || []).filter((s) => !platform || s.platform === platform); }
// A day with no time yet gets one: that day's first posting time for the platform, else its first posting time on
// any day, else 9:00 AM. A scheduled post always has a time.
function defaultTimeFor(platform, dateKey) {
  const hm = (t) => `${pad2(Number(String(t).split(":")[0]))}:${String(t).split(":")[1] || "00"}`;
  const all = cadenceFor(platform).map((s) => ({ wd: Number(s.weekday), t: hm(s.time) })).sort((x, y) => x.t.localeCompare(y.t));
  const sameDay = dateKey ? all.find((s) => s.wd === weekdayOf(dateKey)) : null;
  return (sameDay || all[0] || {}).t || "09:00";
}
function openSlots(platform, fromKey, days, taken) {
  const out = [], now = todayParts();
  for (let i = 0; i < days; i++) {
    const key = addDays(fromKey, i), wd = weekdayOf(key);
    for (const s of cadenceFor(platform)) {
      if (Number(s.weekday) !== wd) continue;
      const hm = pad2(Number(String(s.time).split(":")[0])) + ":" + String(s.time).split(":")[1];
      if (key === now.key && hm <= now.hm) continue;
      const k = `${s.platform}|${key}|${hm}`;
      if (taken && taken.has(k)) continue;
      out.push({ platform: s.platform, date: key, time: hm });
    }
  }
  return out.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}
const bookedKey = (p) => `${p.platform}|${p.date}|${p.time}`;
/** Review in posting order: each draft gets the slot it would take if you approve the queue in order. */
function projectQueue(platform) {
  const drafts = posts().filter((p) => p.platform === platform && p.status === "draft")
    .sort((a, b) => ((a.date || "9") + (a.time || "") + a.created + a.id).localeCompare((b.date || "9") + (b.time || "") + b.created + b.id));
  const taken = new Set(posts().filter((p) => p.platform === platform && (p.status === "approved" || p.status === "posted") && p.date).map(bookedKey));
  const free = openSlots(platform, todayParts().key, 90, taken);
  const would = {};
  for (const p of drafts) {
    if (p.date) { would[p.id] = { date: p.date, time: p.time }; taken.add(bookedKey(p)); continue; }
    const i = free.findIndex((s) => !taken.has(`${s.platform}|${s.date}|${s.time}`));
    if (i >= 0) { would[p.id] = free[i]; taken.add(`${free[i].platform}|${free[i].date}|${free[i].time}`); free.splice(i, 1); }
  }
  drafts.sort((a, b) => ((would[a.id] ? would[a.id].date + would[a.id].time : "9")).localeCompare(would[b.id] ? would[b.id].date + would[b.id].time : "9"));
  return { drafts, would };
}

// ─── Small charts (the Overview's chart family) ──────────────────────────────
function smoothPath(pts) {
  if (pts.length < 2) return "";
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], cx = (x0 + x1) / 2; d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`; }
  return d;
}
let gidSeq = 0;
function areaChart({ labels, series, height = 340, unit }) {
  const W = 1000, H = height, padT = 16, padB = 8, gid = `g${++gidSeq}`;
  const all = series.flatMap((s) => s.values), max = Math.max(1, ...all), n = labels.length;
  const x = (i) => (n <= 1 ? 0 : (i / (n - 1)) * W), y = (v) => padT + (1 - v / max) * (H - padT - padB);
  const paths = series.map((s) => smoothPath(s.values.map((v, i) => [x(i), y(v)])));
  const colour = (i) => (i === 0 ? "var(--color-accent)" : "var(--chart-line-dim)");
  const grid = [0, 0.5, 1].map((t) => `<line x1="0" x2="${W}" y1="${y(max * t)}" y2="${y(max * t)}" style="stroke:var(--chart-grid)" vector-effect="non-scaling-stroke"/>`).join("");
  const lines = series.map((s, i) => `<path d="${paths[i]}" fill="none" style="stroke:${colour(i)}" stroke-width="${i === 0 ? 2 : 1.5}" ${s.dashed ? 'stroke-dasharray="5 5"' : ""} vector-effect="non-scaling-stroke"/>`).join("");
  const wrap = h("div", { class: "chart" });
  wrap.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" class="chart-svg" style="height:${H}px" aria-hidden="true"><defs><linearGradient id="${gid}" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" style="stop-color:var(--color-accent)" stop-opacity="0.3"/><stop offset="100%" style="stop-color:var(--color-accent)" stop-opacity="0"/></linearGradient></defs>${grid}${paths[0] ? `<path d="${paths[0]} L${W},${H} L0,${H} Z" fill="url(#${gid})"/>` : ""}${lines}<line class="cross hide" x1="0" x2="0" y1="0" y2="${H}" style="stroke:var(--color-border-strong)" vector-effect="non-scaling-stroke"/></svg>`;
  const tip = h("div", { class: "chart-tip hide" });
  const dots = series.map((s, i) => h("span", { class: "chart-dot hide", style: `background:${colour(i)}` }));
  wrap.append(tip, ...dots, h("div", { class: "chart-axis" }, [h("span", {}, labels[0] || ""), h("span", {}, labels[Math.floor(n / 2)] || ""), h("span", {}, labels[n - 1] || "")]));
  const cross = wrap.querySelector(".cross");
  wrap.addEventListener("pointermove", (e) => {
    const r = wrap.getBoundingClientRect(), i = Math.max(0, Math.min(n - 1, Math.round(((e.clientX - r.left) / r.width) * (n - 1))));
    const left = `${(x(i) / W) * 100}%`;
    cross.setAttribute("x1", x(i)); cross.setAttribute("x2", x(i)); cross.classList.remove("hide");
    dots.forEach((d, k) => { d.classList.remove("hide"); d.style.left = left; d.style.top = `${y(series[k].values[i] || 0)}px`; });
    tip.classList.remove("hide"); tip.style.left = left; tip.style.transform = `translateX(${i > n / 2 ? "calc(-100% - 12px)" : "12px"})`;
    tip.replaceChildren(h("p", { class: "tip-label" }, labels[i]), ...series.map((s, k) => h("p", { class: "tip-row" }, [h("span", { class: "tip-dot", style: `background:${colour(k)}` }), h("span", { class: "muted" }, s.name), h("span", { class: "tip-val" }, `${(s.values[i] || 0).toLocaleString()} ${unit}`)])));
  });
  wrap.addEventListener("pointerleave", () => { cross.classList.add("hide"); tip.classList.add("hide"); dots.forEach((d) => d.classList.add("hide")); });
  return wrap;
}
function spark(values, height = 34, accent = false) {
  const W = 200, H = height, gid = `s${++gidSeq}`, max = Math.max(1, ...values), colour = accent ? "var(--color-accent)" : "var(--chart-line-dim)";
  const d = smoothPath(values.map((v, i) => [values.length <= 1 ? 0 : (i / (values.length - 1)) * W, 3 + (1 - v / max) * (H - 6)]));
  return h("div", { html: `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" class="chart-svg" style="height:${H}px" aria-hidden="true"><defs><linearGradient id="${gid}" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" style="stop-color:${colour}" stop-opacity="0.3"/><stop offset="100%" style="stop-color:${colour}" stop-opacity="0"/></linearGradient></defs>${d ? `<path d="${d} L${W},${H} L0,${H} Z" fill="url(#${gid})"/><path d="${d}" fill="none" style="stroke:${colour}" stroke-width="1.5" vector-effect="non-scaling-stroke"/>` : ""}</svg>` });
}
function ghostChart(text, height = 340) {
  const W = 400, pts = [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1].map((f, i) => [f * W, height * (0.75 - i * 0.07 + (i % 2 ? 0.05 : 0))]);
  return h("div", { class: "ghost-chart", style: `height:${height}px` }, [
    h("div", { html: `<svg viewBox="0 0 ${W} ${height}" preserveAspectRatio="none" class="ghost-svg" aria-hidden="true"><path d="${smoothPath(pts)}" fill="none" style="stroke:var(--color-border-strong)" stroke-width="1.5" stroke-dasharray="4 6" vector-effect="non-scaling-stroke"/></svg>` }),
    h("div", { class: "ghost-msg" }, h("p", {}, text))
  ]);
}
function delta(text, up) { return h("span", { class: cls("delta", up === null ? "flat" : up ? "up" : "down") }, `${up === null ? "" : up ? "↑ " : "↓ "}${text}`); }
function kpiSegments(tabs) {
  let i = 0;
  const box = h("div", {});
  const draw = () => {
    const t = tabs[i];
    box.replaceChildren(
      h("div", { role: "tablist", "aria-label": "Metric", class: "lg-seg" }, tabs.map((x, j) => h("button", { type: "button", role: "tab", "aria-selected": j === i ? "true" : "false", class: "lg-seg-item", onclick: () => { i = j; draw(); } }, [
        h("p", { class: "seg-name" }, x.name),
        h("p", { class: "seg-val" }, [h("span", { class: "big-num" }, x.value), x.change ? delta(x.change.text, x.change.up) : null])
      ]))),
      h("div", { class: "seg-panel", role: "tabpanel", "aria-label": t.name }, [t.empty ? ghostChart(t.empty) : areaChart({ labels: t.labels, series: t.series, unit: t.unit }), t.caption ? h("p", { class: "caption" }, t.caption) : null])
    );
  };
  draw();
  return box;
}
function heatmap(grid) {
  const max = Math.max(1, ...grid.flat());
  const hourLabel = (hr) => (hr === 0 ? "12a" : hr < 12 ? `${hr}a` : hr === 12 ? "12p" : `${hr - 12}p`);
  const readout = h("p", { class: "heat-readout", "aria-live": "polite" }, "Hover a square to see the count");
  const cells = [];
  grid.forEach((row, d) => {
    cells.push(h("span", { class: "heat-day" }, WEEKDAYS[d]));
    row.forEach((v, hr) => cells.push(h("span", {
      class: "ov-tile", "data-hot": v / max > 0.6 ? "1" : null, title: `${WEEKDAYS[d]} ${hourLabel(hr)}: ${v}`,
      style: `background:${v ? `color-mix(in srgb, var(--color-accent) ${Math.round(22 + (v / max) * 78)}%, transparent)` : "var(--chart-cell)"}`,
      onpointerenter: () => { readout.textContent = `${WEEKDAYS[d]} ${hourLabel(hr)}: ${v} ${v === 1 ? "post" : "posts"} went out`; },
      onpointerleave: () => { readout.textContent = "Hover a square to see the count"; }
    })));
  });
  cells.push(h("span", {}), ...Array.from({ length: 24 }, (_, hr) => h("span", { class: "heat-hour" }, hr % 6 === 0 ? hourLabel(hr) : "")));
  return h("div", {}, [h("div", { class: "heat-grid" }, cells), readout]);
}
function section(title, meta, child) {
  return h("section", { class: "ov-section" }, [h("h2", { class: "ov-h2" }, [h("span", {}, title), meta ? h("span", { class: "ov-meta" }, meta) : null]), child]);
}
function iconChip(platform) { return h("span", { class: "icon-chip", title: PLATFORM_LABEL[platform] }, [markIcon(platform), h("span", { class: "sr-only" }, PLATFORM_LABEL[platform])]); }
function agoShort(key, nowKey) {
  if (!key) return "—";
  const [a, b] = [key, nowKey].map((k) => Date.UTC(...k.split("-").map((x, i) => (i === 1 ? x - 1 : +x))));
  const days = Math.round((b - a) / 86400000);
  return days <= 0 ? "today" : days < 7 ? `${days}d` : days < 60 ? `${Math.round(days / 7)}w` : `${Math.round(days / 30)}mo`;
}
function changeOf(cur, prior, range) {
  if (cur === 0 && prior === 0) return { text: `flat vs prior ${range}d`, up: null };
  if (prior === 0) return { text: `new vs prior ${range}d`, up: true };
  const pct = Math.round(((cur - prior) / prior) * 100);
  return pct === 0 ? { text: `flat vs prior ${range}d`, up: null } : { text: `${Math.abs(pct)}% vs prior ${range}d`, up: pct > 0 };
}

// ─── Content · Overview ─────────────────────────────────────────────────────
function renderContentOverview() {
  const q = state.route.query, range = [7, 30, 90].includes(+q.get("range")) ? +q.get("range") : 30, account = q.get("account");
  const now = todayParts(), all = posts();
  const scope = account ? all.filter((p) => p.platform === account) : all;
  const labels = [], keys = [];
  for (let i = range - 1; i >= 0; i--) { const k = addDays(now.key, -i); keys.push(k); labels.push(fmtDay(k).replace(/^\w+, /, "")); }
  const priorKeys = keys.map((k) => addDays(k, -range));
  const posted = scope.filter((p) => p.status === "posted");
  const countBy = (list, ks, keyFn) => ks.map((k) => list.filter((p) => keyFn(p) === k).length);
  const postedDaily = countBy(posted, keys, postedKey), postedPrior = countBy(posted, priorKeys, postedKey);
  const postedTotal = postedDaily.reduce((s, x) => s + x, 0), priorTotal = postedPrior.reduce((s, x) => s + x, 0);
  const drafts = scope.filter((p) => p.status === "draft");
  const waitingDaily = countBy(drafts, keys, (p) => (p.created || "").slice(0, 10));
  const booked = scope.filter((p) => p.status === "approved" && p.date && p.date >= now.key);
  const fwdKeys = Array.from({ length: range }, (_, i) => addDays(now.key, i));
  const rejected = scope.filter((p) => p.status === "rejected");
  const inRange = (p) => (p.updated || "").slice(0, 10) >= keys[0];
  const decidedYes = scope.filter((p) => (p.status === "approved" || p.status === "posted") && inRange(p)).length;
  const decidedNo = rejected.filter(inRange).length;
  const rate = decidedYes + decidedNo ? Math.round((decidedYes / (decidedYes + decidedNo)) * 100) : null;
  const olderWaiting = drafts.length - waitingDaily.reduce((s, x) => s + x, 0);
  const brand = activeBrand();
  const kpis = [
    { name: "Posts out", value: postedTotal.toLocaleString(), change: changeOf(postedTotal, priorTotal, range), unit: "posts", labels, series: [{ name: "Posts", values: postedDaily }, { name: `Prior ${range}d`, values: postedPrior, dashed: true }],
      caption: `Posts that went out each day, ${account ? `${handleFor(account)} on ${PLATFORM_LABEL[account]}` : "every platform"}. The dashed line is the ${range} days before. Counted from posts marked posted in ${POSTS_HOME}/.`,
      empty: all.length ? null : `No posts yet. When your Content Team writes one, it lands in ${POSTS_HOME}/ and shows up here.` },
    { name: "Waiting on you", value: drafts.length.toLocaleString(), unit: "drafts", labels, series: [{ name: "Arrived", values: waitingDaily }], caption: `Drafts waiting for your review, by the day they were written.${olderWaiting > 0 ? ` ${olderWaiting} more arrived before this range.` : ""}`, empty: all.length ? null : "Nothing waiting. Drafts land here when your Content Team writes them." },
    { name: "Booked", value: booked.length.toLocaleString(), unit: "posts", labels: fwdKeys.map((k) => fmtDay(k).replace(/^\w+, /, "")), series: [{ name: "Booked", values: countBy(booked, fwdKeys, (p) => p.date) }], caption: `Approved posts on the calendar, the next ${range} days.`, empty: booked.length ? null : "Nothing booked yet. Approving a draft puts it on its day." },
    { name: "Followers", value: "Not yet", unit: "", labels: [], series: [], empty: "Follower counts aren't kept in your files yet. The read-the-stats skill saves your numbers to knowledge/reports/ each week." }
  ];
  const profiles = PLATFORM_ORDER.filter((p) => ((settings().accounts || {})[p] || {}).handle || all.some((x) => x.platform === p));
  const href = (r, a) => `#/content?range=${r}${a ? `&account=${a}` : ""}`;
  const platformsShown = account ? [account] : PLATFORM_ORDER;
  const summary = (pl) => {
    const mine = all.filter((p) => p.platform === pl), mp = mine.filter((p) => p.status === "posted");
    const daily = countBy(mp, keys, postedKey), cur = daily.reduce((s, x) => s + x, 0), prior = countBy(mp, priorKeys, postedKey).reduce((s, x) => s + x, 0);
    const last = mp.map(postedKey).filter(Boolean).sort().pop();
    return { platform: pl, posted: cur, daily, change: changeOf(cur, prior, range), last, booked: mine.filter((p) => p.status === "approved" && p.date >= now.key).length, waiting: mine.filter((p) => p.status === "draft").length, rejected: mine.filter((p) => p.status === "rejected").length };
  };
  const sums = platformsShown.map(summary);
  const ranked = [...sums].sort((a, b) => b.posted - a.posted);
  const maxPosted = Math.max(1, ranked[0] ? ranked[0].posted : 0);
  const grid = WEEKDAYS.map(() => Array(24).fill(0));
  for (const p of posted) {
    const k = postedKey(p), hm = postedHm(p);
    if (!k || !hm || k < addDays(now.key, -90)) continue;
    grid[(weekdayOf(k) + 6) % 7][+hm.slice(0, 2)] += 1;
  }
  const hs = (() => { let best = [null, -1], bestH = [null, -1], total = 0; grid.forEach((r, d) => { const s = r.reduce((a, b) => a + b, 0); total += s; if (s > best[1] && s > 0) best = [d, s]; }); for (let hr = 0; hr < 24; hr++) { const s = grid.reduce((a, r) => a + r[hr], 0); if (s > bestH[1] && s > 0) bestH = [hr, s]; } return { day: best[0], hour: bestH[0], total }; })();
  const recent = posted.filter((p) => postedKey(p) >= addDays(now.key, -6)).sort((a, b) => (postedKey(b) + postedHm(b)).localeCompare(postedKey(a) + postedHm(a))).slice(0, 8);
  const nextDays = Array.from({ length: 7 }, (_, i) => { const k = addDays(now.key, i); return { key: k, items: scope.filter((p) => (p.status === "approved" || p.status === "posted") && p.date === k).sort((a, b) => (a.time || "").localeCompare(b.time || "")) }; });
  const pipeParts = [{ k: "Waiting for you", v: drafts.length, c: "bg-accent" }, { k: "Booked", v: booked.length, c: "bg-fg" }, { k: "Sent back", v: rejected.length, c: "bg-danger" }];
  const pipeTotal = Math.max(1, pipeParts.reduce((s, p) => s + p.v, 0));
  return h("div", { class: "dash-container content-page" }, [
    h("div", { class: "lg-profilebar" }, h("nav", { class: "lg-profiles", "aria-label": "Profiles" }, [
      h("a", { class: "lg-profile", href: href(range, null), "aria-current": account ? null : "page" }, [h("span", { class: "profile-all" }, "All"), h("span", { class: "profile-name" }, "All profiles")]),
      ...profiles.map((p) => h("a", { class: "lg-profile", href: href(range, p), "aria-current": account === p ? "page" : null, title: `${handleFor(p)} · ${PLATFORM_LABEL[p]}` }, [
        h("span", { class: "profile-av" }, [h("span", { class: "profile-initial" }, handleFor(p).replace(/^@/, "").slice(0, 1)), h("span", { class: "profile-badge", html: platformMark(p) })]),
        h("span", { class: "profile-lines" }, [h("span", { class: "profile-handle" }, handleFor(p)), h("span", { class: "lg-profile-sub" }, PLATFORM_LABEL[p])])
      ]))
    ])),
    h("header", { class: "ov-head" }, [
      h("div", { class: "min0" }, [h("p", { class: "eyebrow-lg" }, account ? `${handleFor(account)} · ${PLATFORM_LABEL[account]}` : `${brand.name} · All profiles`), h("h1", { class: "h1-lg" }, "Content")]),
      h("div", { class: "row gap3 wrap" }, [
        h("nav", { class: "lg-tabs flush", "aria-label": "Date range" }, [7, 30, 90].map((r) => h("a", { href: href(r, account), "aria-current": r === range ? "page" : null }, `${r}D`))),
        h("button", { type: "button", class: "btn-accent-outline", onclick: () => openComposer({ create: { platform: account || "instagram", date: now.key } }) }, [svgIcon("plus", "accent"), "New post"])
      ])
    ]),
    contentTeamNote() || readOnlyNote(),
    h("div", { class: "ov-stack" }, [
      h("div", { class: "ov-grid-top" }, [
        kpiSegments(kpis),
        h("div", { class: "ov-side" }, [
          section("Platforms", `posts · ${range}d`, h("ul", { class: "rank-list" }, ranked.map((s) => h("li", {}, h("a", { href: `#/content/${s.platform}`, class: "rank-row", title: `${PLATFORM_LABEL[s.platform]}: ${s.posted} posts in ${range}d` }, [
            s.posted > 0 ? h("span", { class: "ov-row-fill", style: `width:${Math.max(6, (s.posted / maxPosted) * 100)}%`, "aria-hidden": "true" }) : null,
            markIcon(s.platform, "rel"), h("span", { class: "rel" }, PLATFORM_LABEL[s.platform]), h("span", { class: "rel ml-auto num" }, s.posted)
          ]))))),
          section("Pipeline health", null, h("div", {}, [
            h("div", { class: "ov-meter", "aria-hidden": "true" }, pipeParts.filter((p) => p.v > 0).map((p) => h("span", { class: p.c, style: `width:${(p.v / pipeTotal) * 100}%` }))),
            h("dl", { class: "pipe-dl" }, pipeParts.map((p) => h("div", { class: "min0" }, [h("dd", { class: "num-2xl" }, p.v), h("dt", { class: "pipe-dt" }, [h("span", { class: cls("dot6", p.c) }), p.k])]))),
            h("p", { class: "pipe-rate" }, ["Approval rate · ", `${range}d `, h("b", {}, rate === null ? "—" : `${rate}%`), ` · ${decidedYes} approved, ${decidedNo} sent back`])
          ]))
        ])
      ]),
      section(account ? PLATFORM_LABEL[account] : "Every platform", null, h("div", { class: cls("tile-grid", account && "single") }, sums.map((s) => h("a", { href: `#/content/${s.platform}`, class: "glass plat-tile" }, [
        h("div", { class: "row gap25" }, [iconChip(s.platform), h("span", { class: "truncate-sm" }, PLATFORM_LABEL[s.platform]), h("span", { class: "tiny-sub ml-auto" }, agoShort(s.last, now.key))]),
        h("div", {}, [h("p", { class: "row-baseline" }, [h("span", { class: "num-32" }, s.posted), h("span", { class: "tiny-sub" }, `posts · ${range}d`)]), h("div", { class: "mt15" }, delta(s.change.text, s.change.up))]),
        spark(s.daily, 34, s.posted > 0),
        h("p", { class: "tile-foot" }, [h("span", {}, [h("b", {}, s.booked), " booked"]), h("span", {}, [h("b", { class: s.waiting ? "accent" : "" }, s.waiting), " waiting"]), h("span", {}, [h("b", { class: s.rejected ? "danger" : "" }, s.rejected), " sent back"])])
      ])))),
      h("div", { class: "ov-grid-bottom" }, [
        section("When posts go out · 90 days", "your timezone", h("div", {}, [heatmap(grid), h("dl", { class: "heat-stats" }, [["Busiest day", hs.day === null ? "—" : WEEKDAYS[hs.day]], ["Busiest hour", hs.hour === null ? "—" : fmtTime(`${pad2(hs.hour)}:00`).replace(":00", "")], ["Posts · 90d", hs.total.toLocaleString()]].map(([k, v]) => h("div", { class: "min0" }, [h("dt", { class: "tiny-sub" }, k), h("dd", { class: "num-2xl mt1" }, v)])))])),
        section("Recent posts", "last 7 days", recent.length ? h("ul", { class: "glass recent-list" }, recent.map((p) => h("li", {}, h("a", { href: `#/content/${p.platform}`, class: "recent-row" }, [iconChip(p.platform), h("p", { class: "recent-cap" }, preview(p.body, 120) || "(no caption)"), h("span", { class: "tiny-sub num" }, agoShort(postedKey(p), now.key))]))))
          : h("p", { class: "glass empty-pill" }, "Nothing went out in the last 7 days."))
      ]),
      section("Next 7 days", h("a", { href: "#/content/calendar" }, "Calendar →"), h("div", { class: "next-grid" }, nextDays.map((d, i) => h("div", { class: cls("glass next-day", i === 0 && "today") }, [
        h("p", { class: "next-wd" }, i === 0 ? "Today" : fmtDay(d.key).split(",")[0]),
        h("p", { class: "next-date" }, fmtDay(d.key).split(", ")[1]),
        h("div", { class: "next-items" }, d.items.length ? [...d.items.slice(0, 5).map((p) => h("span", { class: "next-chip" }, [markIcon(p.platform, "tiny"), h("span", { class: "sr-only" }, PLATFORM_LABEL[p.platform]), fmtTime(p.time) || "any time"])), d.items.length > 5 ? h("span", { class: "tiny-sub" }, `+${d.items.length - 5} more`) : null] : [h("span", { class: "tiny-sub" }, "open")])
      ]))))
    ])
  ]);
}

// ─── Platform pages (the platform's own mini-app: Overview · Review · Calendar) ─
function platformHeader(platform, active) {
  const mine = posts().filter((p) => p.platform === platform), now = todayParts();
  const next = mine.filter((p) => p.status === "approved" && p.date && (p.date + (p.time || "")) >= now.key).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
  const stat = (v, l, hot) => h("div", { class: "hstat" }, [h("span", { class: cls("hstat-v", hot && "accent") }, v), h("span", { class: "hstat-l" }, l)]);
  const waiting = mine.filter((p) => p.status === "draft").length;
  const base = `#/content/${platform}`;
  return h("div", {}, [
    h("div", { class: "phead" }, [
      h("div", { class: "row gap3 min0" }, [h("span", { html: platformGlassTile(platform, PLATFORM_LABEL[platform]) }), h("div", { class: "min0" }, [h("h1", { class: "phead-name" }, activeBrand().name || "Your Brand"), h("div", { class: "phead-handle" }, h("span", { class: "truncate" }, handleFor(platform)))])]),
      h("div", { class: "phead-stats", role: "group", "aria-label": `${PLATFORM_LABEL[platform]} at a glance` }, [stat(waiting, "waiting", waiting > 0), stat(mine.filter((p) => p.status === "approved").length, "approved"), stat(mine.filter((p) => p.status === "rejected").length, "rejected"), stat(next ? fmtSlot(next.date, next.time).replace(/^\w+, /, "") : "—", "next post")])
    ]),
    h("div", { class: "ptabs-row" }, [
      h("nav", { class: "lg-tabs", "aria-label": `${PLATFORM_LABEL[platform]} sections` }, [["overview", "Overview", ""], ["review", "Review", "/review"], ["calendar", "Calendar", "/calendar"]].map(([k, l, p]) => h("a", { href: base + p, "aria-current": active === k ? "page" : null }, l))),
      active === "review" ? h("p", { class: "key-hint" }, DECIDE_HINT) : null
    ])
  ]);
}
function renderPlatform(platform, tab) {
  const body = tab === "review" ? renderReview(platform) : tab === "calendar" ? renderCalendar(platform) : renderPlatformOverview(platform);
  return h("div", { class: "dash-container content-page" }, [platformHeader(platform, tab || "overview"), contentTeamNote() || readOnlyNote(), body]);
}
function sectionHead(title, href, label) { return h("div", { class: "sec-head" }, [h("h2", { class: "overline" }, title), href ? h("a", { href, class: "sec-link" }, `${label} →`) : null]); }
function renderPlatformOverview(platform) {
  const mine = posts().filter((p) => p.platform === platform), now = todayParts(), base = `#/content/${platform}`;
  const scheduled = mine.filter((p) => p.status === "approved" && p.date && p.date >= now.key).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const posted7 = mine.filter((p) => p.status === "posted" && postedKey(p) >= addDays(now.key, -6)).length;
  const rejected = mine.filter((p) => p.status === "rejected").length;
  const waiting = mine.filter((p) => p.status === "draft").length;
  const hero = (href, label, value, sub, alert) => h("a", { href, class: cls("hero-stat", alert && "alert") }, [h("p", { class: "hero-l" }, label), h("p", { class: "hero-v" }, value), h("p", { class: "hero-s" }, sub)]);
  const slots = openSlots(platform, now.key, 14, new Set(scheduled.map(bookedKey)));
  const upNext = [...scheduled.map((p) => ({ date: p.date, time: p.time, post: p })), ...slots.map((s) => ({ ...s, post: null }))].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).slice(0, 3);
  const lastPosted = mine.filter((p) => p.status === "posted").sort((a, b) => (postedKey(b) + postedHm(b)).localeCompare(postedKey(a) + postedHm(a))).slice(0, 6);
  return h("div", { class: "pov" }, [
    h("section", { class: "glass hero-strip", "aria-label": `${PLATFORM_LABEL[platform]} at a glance` }, [
      hero(`${base}/review`, "Needs review", waiting, waiting ? "waiting on you" : "queue is clear"),
      hero(`${base}/calendar`, "Scheduled", scheduled.length, scheduled.length ? `through ${fmtDay(scheduled[scheduled.length - 1].date)}` : "nothing booked yet"),
      hero(`${base}/calendar`, "Posted · 7 days", posted7, "marked posted in your files"),
      hero(`${base}/review`, "Sent back", rejected, rejected ? "rejected drafts" : "all clear", false)
    ]),
    h("div", { class: "pov-grid" }, [
      h("section", { class: "pov-main" }, [sectionHead("Up next", `${base}/calendar`, "Calendar"),
        cadenceFor(platform).length === 0 && !scheduled.length ? h("p", { class: "dashed-note" }, ["No posting times yet. ", h("a", { href: "#/settings/cadence", class: "accent-link" }, "Add them in Settings"), "."])
          : upNext.length === 0 ? h("p", { class: "dashed-note" }, "No posting times in the next two weeks.")
            : h("ul", { class: "upnext" }, upNext.map((u) => h("li", {}, u.post ? h("button", { type: "button", class: "glass upnext-card", onclick: () => openComposer({ postId: u.post.id, source: "calendar" }) }, [h("p", { class: "tiny-sub" }, fmtSlot(u.date, u.time)), h("p", { class: "upnext-cap" }, preview(u.post.body, 110) || "(no caption)"), h("span", { class: "chip" }, "booked")])
              : h("button", { type: "button", class: "upnext-card open", onclick: () => openComposer({ create: { platform, date: u.date, time: u.time } }) }, [h("p", { class: "tiny-sub" }, fmtSlot(u.date, u.time)), h("p", { class: "upnext-cap muted" }, "Open slot"), h("span", { class: "chip" }, [svgIcon("plus"), "fill it"])]))))]),
      h("section", { class: "pov-side" }, [sectionHead("Recently posted", null, null), lastPosted.length ? h("ul", { class: "glass recent-list" }, lastPosted.map((p) => h("li", {}, h("button", { type: "button", class: "recent-row", onclick: () => openComposer({ postId: p.id, source: "calendar" }) }, [h("p", { class: "recent-cap" }, preview(p.body, 80)), h("span", { class: "tiny-sub num" }, agoShort(postedKey(p), now.key))]))))
        : h("p", { class: "dashed-note" }, `Nothing on ${PLATFORM_LABEL[platform]} is marked posted yet. post-content marks each one when it goes out.`)])
    ])
  ]);
}

// ─── Review (the daily surface) ─────────────────────────────────────────────
const reviewUi = { active: null, undo: null };
async function decide(post, status, slot) {
  const body = { status };
  if (status === "approved" && !post.date && slot) Object.assign(body, { date: slot.date, time: slot.time });
  else if (status === "approved" && post.date && !post.time) body.time = defaultTimeFor(post.platform, post.date);
  const before = { status: post.status, date: post.date, time: post.time };
  const r = await api(`/api/posts/${post.id}`, body);
  if (r) {
    render();
    toast(status === "approved" ? `Approved${body.date ? ` for ${fmtSlot(body.date, body.time)}` : ""}.` : "Sent back.", { label: "Undo", run: async () => { await api(`/api/posts/${post.id}`, before); render(); } });
  }
}
function quietBtn(label, onclick, strong, always) { return h("button", { type: "button", class: cls("quiet-btn", strong && "strong"), onclick, disabled: always || state.server ? null : "", title: always || state.server ? null : "Start python3 tools/serve.py to decide from here" }, label); }
function cardActions(post, slot, onEdit) {
  return h("div", { class: "card-actions" }, [quietBtn("Edit", onEdit, false, true), quietBtn("Reject", () => decide(post, "rejected")), quietBtn("Approve", () => decide(post, "approved", slot), true)]);
}
function wouldPostLine(slot, compact) { return slot ? h("p", { class: cls("would-post", compact && "compact") }, [svgIcon("calendarClock"), `Would post: ${fmtSlot(slot.date, slot.time)}`]) : null; }
function textCard(post, slot) {
  const platform = post.platform, segs = PLATFORM_SUPPORTS_CHAIN[platform] ? captionToSegments(post.body).filter((s) => s.trim()) : [post.body];
  const media = postMedia(post), handle = handleFor(platform), name = activeBrand().name;
  const bodyBox = h("div", { class: "tc-body" }, segs.length ? [h("p", { class: "tc-text" }, segs[0]), ...segs.slice(1).map((s) => h("div", { class: "tc-reply" }, h("p", { class: "tc-text" }, s)))] : [h("p", { class: "tc-empty" }, "(no caption)")]);
  const wrap = h("div", { class: "tc-fold" }, [bodyBox]);
  const card = h("article", { class: cls("text-card", reviewUi.active === post.id && "active"), "data-review-card": post.id, onpointerenter: () => { reviewUi.active = post.id; markActive(); } }, [
    h("div", { class: "tc-main" }, [
      h("span", { class: "tc-avatar", "aria-hidden": "true" }, handle.replace(/^@/, "")[0] ? handle.replace(/^@/, "")[0].toUpperCase() : "?"),
      h("div", { class: "tc-col" }, [
        h("div", { class: "tc-head" }, [h("p", { class: "tc-who" }, [name ? h("span", { class: "tc-name" }, name + " ") : null, h("span", { class: "tc-handle" }, handle)]), h("button", { type: "button", class: "tc-detail", onclick: () => openComposer({ postId: post.id, source: "review" }) }, "Detail →")]),
        platform === "skool" ? h("div", { class: "tc-skool" }, [h("p", { class: "tc-title" }, cleanSkoolTitle(post.title) || "(no title yet)"), h("p", { class: "tiny-sub" }, post.category || "General discussion")]) : null,
        platform === "youtube" && post.title ? h("p", { class: "tc-title" }, post.title) : null,
        wrap,
        media ? (media.type === "video" ? h("video", { class: "tc-media", src: media.url, controls: "", preload: "metadata", playsinline: "" }) : h("img", { class: "tc-media", src: media.url, alt: "" })) : null,
        post.job ? h("div", { class: "row gap15 wrap" }, h("span", { class: "kw-chip" }, post.job)) : null,
        h("div", { class: "tc-icons", "aria-hidden": "true" }, (ACTION_ICONS[platform] || ACTION_ICONS.threads).map((n) => svgIcon(n)))
      ])
    ]),
    h("div", { class: "tc-foot" }, [slot ? h("div", { class: "basis-full" }, wouldPostLine(slot)) : null, h("p", { class: "tc-meta" }, [PLATFORM_LABEL[platform], post.job ? ` · ${post.job}` : ""].join("")), cardActions(post, slot, () => openComposer({ postId: post.id, source: "review" }))])
  ]);
  requestAnimationFrame(() => {
    if (bodyBox.scrollHeight > bodyBox.clientHeight + 1) {
      const more = h("div", { class: "tc-fade" }, h("button", { type: "button", class: "read-more", onclick: () => { bodyBox.classList.add("open"); more.remove(); } }, "Read more"));
      wrap.append(more);
    }
  });
  return card;
}
function mediaTile(post, slot) {
  const media = postMedia(post);
  const poster = media ? (media.type === "video" ? h("video", { class: "tile-poster", src: media.url, muted: "", playsinline: "", preload: "metadata", controls: "" }) : h("img", { class: "tile-poster", src: media.url, alt: "", loading: "lazy" }))
    : h("button", { type: "button", class: "tile-poster text", "aria-label": "Read the whole post", onclick: () => openComposer({ postId: post.id, source: "review" }) }, [svgIcon("quote", "accent"), h("span", { class: "tile-text" }, post.body || "(no caption)")]);
  return h("div", { class: cls("glass review-tile", reviewUi.active === post.id && "active"), "data-review-card": post.id, onpointerenter: () => { reviewUi.active = post.id; markActive(); } }, [
    h("div", { class: "rel" }, [poster, post.platform === "youtube" && youtubeTitleFrom(post.body, post.title) ? h("span", { class: "tile-chip" }, "Short") : null]),
    media ? h("p", { class: "tile-cap" }, post.platform === "youtube" ? youtubeTitleFrom(post.body, post.title) : (post.body || h("span", { class: "muted" }, "(no caption)"))) : null,
    wouldPostLine(slot, true),
    h("div", { class: "tile-meta" }, [post.job ? h("span", { class: "kw-chip" }, post.job) : null, h("span", { class: "ml-auto row" }, [h("button", { type: "button", class: "icon-btn-sm", "aria-label": "Edit post", title: "Edit post", onclick: () => openComposer({ postId: post.id, source: "review" }), html: lineIcon("pencil") }), h("button", { type: "button", class: "tile-detail", onclick: () => openComposer({ postId: post.id, source: "review" }) }, "Detail")])]),
    h("div", { class: "card-actions compact" }, [quietBtn("Reject", () => decide(post, "rejected")), quietBtn("Approve", () => decide(post, "approved", slot), true)]),
    reviewUi.active === post.id ? h("p", { class: "decide-hint" }, DECIDE_HINT) : null
  ]);
}
function markActive() { document.querySelectorAll("[data-review-card]").forEach((n) => n.classList.toggle("active", n.dataset.reviewCard === reviewUi.active)); }
function renderReview(platform) {
  const { drafts, would } = projectQueue(platform);
  const mine = posts().filter((p) => p.platform === platform);
  const recentlyApproved = mine.filter((p) => p.status === "approved").sort((a, b) => (b.updated || "").localeCompare(a.updated || "")).slice(0, 5);
  const rejected = mine.filter((p) => p.status === "rejected");
  const text = TEXT_PLATFORMS.includes(platform);
  return h("div", {}, [
    h("section", { class: "mb10", "aria-label": "Needs review" }, drafts.length
      ? h("div", { class: text ? "text-grid" : "feed-grid" }, drafts.map((p) => (text ? textCard(p, would[p.id]) : mediaTile(p, would[p.id]))))
      : h("div", { class: "glass rounded-xl" }, emptyState("inbox", "Nothing waiting on you", `Drafts land here when your Content Team writes ${PLATFORM_LABEL[platform]} posts into <code>${POSTS_HOME}/</code>. Approve books the next open slot from your posting cadence.`))),
    h("section", { class: "mb10" }, [sectionHead("Recently approved", `#/content/${platform}/calendar`, "Calendar"),
      recentlyApproved.length ? h("div", { class: "glass rounded-xl" }, h("ul", {}, recentlyApproved.map((p) => h("li", { class: "row-li" }, h("button", { type: "button", class: "list-row", onclick: () => openComposer({ postId: p.id, source: "calendar" }) }, [h("span", { class: "success-ic", html: lineIcon("checkCircle") }), h("p", { class: "list-cap" }, preview(p.body, 90) || "(no caption)"), h("span", { class: "badge neutral" }, [svgIcon("calendarClock"), p.date ? fmtSlot(p.date, p.time) : "no slot yet"]), arrow()])))))
        : h("p", { class: "soft-note" }, "Nothing approved yet. Approvals land here with their booked slot.")]),
    h("section", {}, h("details", { class: "glass rounded-xl rejected" }, [
      h("summary", { class: "rej-sum" }, [svgIcon("archiveX"), `Rejected (${rejected.length})`, h("span", { class: "chev-rot", html: lineIcon("chevronRight") }), h("span", { class: "tiny-sub ml-auto" }, "sent back to your Content Team")]),
      rejected.length ? h("ul", { class: "rej-list" }, rejected.map((p) => h("li", { class: "row-li" }, h("button", { type: "button", class: "list-row", onclick: () => openComposer({ postId: p.id, source: "calendar" }) }, [h("p", { class: "list-cap muted" }, preview(p.body, 90) || "(no caption)"), h("span", { class: "tiny-sub" }, (p.updated || "").slice(0, 10)), arrow()]))))
        : h("p", { class: "rej-empty" }, "Nothing rejected. Passed-on drafts collect here so your Content Team can write a fresh take.")
    ]))
  ]);
}
// A / R decide the card under the pointer (never while typing or while the editor is open).
document.addEventListener("keydown", (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
  const t = e.target;
  if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
  if (document.querySelector(".sheet")) return;
  const k = e.key.toLowerCase();
  if ((k !== "a" && k !== "r") || !reviewUi.active || !state.route.parts || state.route.parts[2] !== "review") return;
  const post = posts().find((p) => p.id === reviewUi.active && p.status === "draft");
  if (!post) return;
  e.preventDefault();
  decide(post, k === "a" ? "approved" : "rejected", projectQueue(post.platform).would[post.id]);
});

// ─── Calendar (month grid + list; on a platform page, just that platform) ────
const calUi = { y: null, m: null, view: "month" };
function renderCalendar(platform) {
  const now = todayParts();
  if (calUi.y === null) { calUi.y = now.y; calUi.m = now.m; }
  const scope = posts().filter((p) => (!platform || p.platform === platform) && p.date && p.status !== "rejected");
  const byDay = new Map();
  for (const p of scope) byDay.set(p.date, [...(byDay.get(p.date) || []), p]);
  const first = new Date(Date.UTC(calUi.y, calUi.m, 1)), startDow = first.getUTCDay(), daysIn = new Date(Date.UTC(calUi.y, calUi.m + 1, 0)).getUTCDate();
  const cells = [];
  for (let i = 0; i < 42; i++) { const t = new Date(Date.UTC(calUi.y, calUi.m, 1 - startDow + i)); cells.push({ y: t.getUTCFullYear(), m: t.getUTCMonth(), d: t.getUTCDate(), inMonth: t.getUTCMonth() === calUi.m }); }
  while (cells.length > 35 && cells.slice(-7).every((c) => !c.inMonth)) cells.splice(-7);
  void daysIn;
  const taken = new Set(scope.filter((p) => p.status === "approved" || p.status === "posted").map(bookedKey));
  const ghosts = openSlots(platform, now.key, 120, taken);
  const ghostsByDay = new Map();
  for (const g of ghosts) ghostsByDay.set(g.date, [...(ghostsByDay.get(g.date) || []), g]);
  const go = (n) => { const t = new Date(Date.UTC(calUi.y, calUi.m + n, 1)); calUi.y = t.getUTCFullYear(); calUi.m = t.getUTCMonth(); render(); };
  const toolbar = h("div", { class: "cal-toolbar" }, [
    h("div", { class: "row gap2 wrap" }, [
      h("div", { role: "group", "aria-label": "Calendar view", class: "seg-toggle" }, [["month", "Month", "layoutGrid"], ["list", "List", "list"]].map(([k, l, ic]) => h("button", { type: "button", "aria-pressed": calUi.view === k ? "true" : "false", onclick: () => { calUi.view = k; render(); } }, [svgIcon(ic), l]))),
      calUi.view === "month" ? h("button", { type: "button", class: "btn-outline", onclick: () => { calUi.y = now.y; calUi.m = now.m; render(); } }, "Today") : null,
      calUi.view === "month" ? h("div", { class: "row gap1" }, [h("button", { type: "button", class: "icon-btn", "aria-label": "Previous month", onclick: () => go(-1), html: lineIcon("chevronLeft") }), h("span", { class: "cal-month" }, `${MONTH_NAMES[calUi.m]} ${calUi.y}`), h("button", { type: "button", class: "icon-btn", "aria-label": "Next month", onclick: () => go(1), html: lineIcon("chevronRight") })]) : null
    ]),
    h("div", { class: "row gap3 wrap" }, [h("span", { class: "tz-chip" }, [svgIcon("clock"), `${fmtTime(now.hm)} · ${tzName()}`]), h("button", { type: "button", class: "btn-accent", onclick: () => openComposer({ create: { platform: platform || "instagram", date: now.key } }) }, [svgIcon("plus"), "Create post"])])
  ]);
  if (calUi.view === "list") {
    const upcoming = scope.filter((p) => p.date >= addDays(now.key, -7)).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    const days = [...new Set(upcoming.map((p) => p.date))];
    return h("div", { class: "cal" }, [toolbar, days.length ? h("div", { class: "runway" }, days.map((k) => h("section", { class: "runway-day" }, [h("p", { class: "overline" }, k === now.key ? `Today · ${fmtDay(k)}` : fmtDay(k)), h("div", { class: "glass rounded-xl" }, upcoming.filter((p) => p.date === k).map((p) => h("button", { type: "button", class: "list-row", onclick: () => openComposer({ postId: p.id, source: "calendar" }) }, [markIcon(p.platform, "accent"), h("span", { class: "num tiny-sub" }, fmtTime(p.time) || "any time"), h("p", { class: "list-cap" }, preview(p.body, 100)), h("span", { class: cls("badge", p.status === "posted" ? "success" : "neutral") }, p.status)])))])))
      : h("div", { class: "glass rounded-xl" }, emptyState("calendarDays", "Nothing on the calendar", "Approved posts with a date show up here. Approve a draft on a platform's Review page and it books the next open slot."))]);
  }
  return h("div", { class: "cal" }, [toolbar,
    h("div", { class: "cal-wd" }, WEEKDAY_LABELS.map((w, i) => h("div", {}, [h("span", { class: "wd-long" }, w), h("span", { class: "wd-short" }, WEEKDAY_LETTERS[i])]))),
    h("div", { class: "cal-grid" }, cells.map((c, i) => {
      const key = dateKey(c.y, c.m, c.d), isPast = key < now.key, isToday = key === now.key;
      const items = [...(byDay.get(key) || []).map((p) => ({ kind: "post", at: p.time || "99", p })), ...(isPast ? [] : (ghostsByDay.get(key) || [])).map((g) => ({ kind: "ghost", at: g.time, g }))]
        .sort((a, b) => a.at.localeCompare(b.at) || (a.kind === b.kind ? 0 : a.kind === "post" ? -1 : 1));
      const visible = items.slice(0, 4), overflow = items.length - 4;
      const cell = h("div", { class: cls("cal-cell", (i + 1) % 7 === 0 && "last-col", !c.inMonth && "out", isPast && "past"),
        ondragover: (e) => { if (calDrag) { e.preventDefault(); e.dataTransfer.dropEffect = isPast ? "none" : "move"; cell.classList.add(isPast ? "drop-bad" : "drop-ok"); } },
        ondragleave: (e) => { if (!cell.contains(e.relatedTarget)) cell.classList.remove("drop-ok", "drop-bad"); },
        ondrop: async (e) => { e.preventDefault(); cell.classList.remove("drop-ok", "drop-bad"); const p = calDrag; calDrag = null; if (!p || isPast || p.date === key) return; if (await api(`/api/posts/${p.id}`, { date: key })) render(); } }, [
        !isPast ? h("button", { type: "button", class: "cal-hit", "aria-label": `Create post on ${key}`, onclick: () => openComposer({ create: { platform: platform || "instagram", date: key } }) }) : null,
        h("div", { class: "cal-daynum" }, [h("span", { class: cls("daynum", isToday && "today") }, c.d), !isPast ? h("span", { class: "cal-plus", html: lineIcon("plus") }) : null]),
        h("div", { class: "cal-items" }, [...visible.map((it) => it.kind === "post" ? calPill(it.p) : h("button", { type: "button", class: "cal-ghost", title: `Open slot · ${fmtTime(it.g.time)} — click to create`, onclick: (e) => { e.stopPropagation(); openComposer({ create: { platform: it.g.platform, date: it.g.date, time: it.g.time } }); } }, [platform ? null : markIcon(it.g.platform, "tiny"), h("span", { class: "num" }, fmtTime(it.g.time)), h("span", { class: "ghost-plus", html: lineIcon("plus") })])),
          overflow > 0 ? h("button", { type: "button", class: "cal-more", onclick: () => { calUi.view = "list"; render(); } }, `+${overflow} more`) : null])
      ]);
      return cell;
    }))
  ]);
}
let calDrag = null;
function calPill(p) {
  const movable = p.status !== "posted" && state.server;
  return h("button", { type: "button", class: cls("cal-pill", p.status !== "approved" && p.status !== "posted" && "dim", movable && "grab"), draggable: movable ? "true" : null,
    ondragstart: (e) => { calDrag = p; e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", p.id); },
    ondragend: () => { calDrag = null; },
    title: `${fmtTime(p.time) || "any time"} · ${preview(p.body, 60)}${movable ? " · drag to reschedule" : ""}`,
    onclick: (e) => { e.stopPropagation(); openComposer({ postId: p.id, source: "calendar" }); } }, [
    markIcon(p.platform, "pill-ic"), h("span", { class: "num pill-time" }, fmtTime(p.time) || "—"), p.media ? h("span", { class: "pill-media", html: lineIcon(p.mediaType === "video" ? "film" : "image") }) : null, h("span", { class: "pill-cap" }, preview(p.body, 24))
  ]);
}
function renderContentCalendar() {
  return h("div", {}, [
    h("div", { class: "dash-gutter pt8" }, [h("h1", { class: "h1-2xl" }, "Calendar"), h("p", { class: "lede" }, "Every platform's posts on their days, and your open posting times. Click a day to write one, drag a post to move it.")]),
    h("div", { class: "dash-container" }, [contentTeamNote() || readOnlyNote(), renderCalendar(null)])
  ]);
}

// ─── Research (what the Researcher and the Content Team keep in knowledge/) ──
function mdToHtml(md) {
  const lines = String(md || "").replace(/\r\n?/g, "\n").split("\n"), out = [];
  let list = null, code = null, para = [];
  const inline = (s) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/(^|\W)_(.+?)_(?=\W|$)/g, "$1<i>$2</i>").replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  const flush = () => { if (para.length) { out.push(`<p>${inline(para.join(" "))}</p>`); para = []; } if (list) { out.push(`<${list.t}>${list.items.map((i) => `<li>${inline(i)}</li>`).join("")}</${list.t}>`); list = null; } };
  for (const ln of lines) {
    if (code !== null) { if (/^```/.test(ln)) { out.push(`<pre>${esc(code.join("\n"))}</pre>`); code = null; } else code.push(ln); continue; }
    if (/^```/.test(ln)) { flush(); code = []; continue; }
    const hm = /^(#{1,4})\s+(.*)$/.exec(ln);
    if (hm) { flush(); out.push(`<h${hm[1].length + 1}>${inline(hm[2])}</h${hm[1].length + 1}>`); continue; }
    const li = /^\s*(?:[-*]|(\d+)\.)\s+(.*)$/.exec(ln);
    if (li) { if (para.length) flush(); const t = li[1] ? "ol" : "ul"; if (!list || list.t !== t) { flush(); list = { t, items: [] }; } list.items.push(li[2]); continue; }
    if (!ln.trim()) { flush(); continue; }
    if (list) flush();
    para.push(ln.trim());
  }
  flush();
  return out.join("");
}
const isEmptyDoc = (text) => !text || /_None yet\._/.test(text);
function renderResearch() {
  const r = (state.content && state.content.research) || {}, tab = state.route.parts[2] || "outliers";
  const tabs = [["outliers", "Outliers"], ["topics", "Topics"], ["openers", "Openers"], ["competitors", "Competitors"], ["swipes", "Swipes"]];
  const docCard = (doc, emptyTitle, emptyDesc) => !doc ? h("div", { class: "glass rounded-xl" }, emptyState("search", emptyTitle, emptyDesc))
    : h("div", { class: "glass rounded-xl doc" }, [h("div", { class: "doc-path" }, [svgIcon("folderOpen"), h("code", {}, doc.path)]), h("div", { class: "md", html: mdToHtml(doc.text.replace(/^# .*\n/, "")) })]);
  let body;
  if (tab === "topics") body = docCard(r.topics, "No topics file", "Run content-brain to fill <code>knowledge/topics.md</code>.");
  else if (tab === "openers") body = docCard(r.hooks, "No openers file", "write-hooks and read-the-stats keep <code>knowledge/hooks.md</code>.");
  else if (tab === "competitors" || tab === "swipes") {
    const list = r[tab] || [];
    body = list.length ? h("div", { class: "space-y-6" }, list.map((d) => docCard(d))) : h("div", { class: "glass rounded-xl" }, emptyState("search", tab === "competitors" ? "No competitors saved yet" : "No swipes saved yet", tab === "competitors" ? "The Researcher's competitor-check saves one file per competitor in <code>knowledge/competitors/</code>." : "Posts and pages worth stealing the shape of go in <code>knowledge/swipes/</code>, one file each."));
  } else body = r.outliers && !isEmptyDoc(r.outliers.text) ? docCard(r.outliers) : h("div", { class: "glass rounded-xl" }, emptyState("trend", "No outliers yet", "The Researcher's find-outliers skill adds the top posts in your space to <code>knowledge/outliers.md</code> each month: posts doing far better than their channel's size, and the shape that made them work."));
  return h("div", {}, [
    h("div", { class: "dash-gutter pt8" }, [h("h1", { class: "h1-2xl" }, "Research"), h("p", { class: "lede" }, "Other creators' posts that beat their own normal, your topics, and the openers that won. Kept in knowledge/ by the Researcher and the Content Team."),
      h("nav", { class: "lg-tabs mt5", "aria-label": "Research sections" }, tabs.map(([k, l]) => h("a", { href: `#/content/research/${k}`, "aria-current": tab === k ? "page" : null }, l)))]),
    h("div", { class: "dash-container" }, body)
  ]);
}

function renderContent(parts) {
  const p = parts[1];
  if (!p) return renderContentOverview();
  if (p === "calendar") return renderContentCalendar();
  if (p === "research") return renderResearch();
  if (PLATFORM_ORDER.includes(p)) return renderPlatform(p, parts[2]);
  return notFound("That content page doesn't exist");
}
