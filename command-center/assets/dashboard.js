// Dashboard and Overview: the Command Center's two home pages.
// Dashboard = the business at a glance (KPI row, the dot-matrix trend, a breakdown, the recent list).
// Overview = a welcome band and one card per module. Every number comes from the repo's own files
// (posts, the Web pull, the agent teams); with nothing there yet, they say so.

const TREND_PERIODS = [["weekly", "Weekly"], ["monthly", "Monthly"], ["yearly", "Yearly"]];
function greeting() {
  const hr = +new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: tzName() }).format(new Date());
  return hr < 5 ? "Burning the midnight oil" : hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";
}
const longToday = () => new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: tzName() });
const firstName = () => ((settings().account || {}).name || "").trim().split(/\s+/)[0];

function kpiCard({ label, value, delta, caption, spark, footnote }) {
  const W = 84, H = 44, n = Math.max(1, spark.length), max = Math.max(1, ...spark), colW = W / n, barW = Math.max(1.5, colW * 0.62);
  const bars = spark.map((v, i) => { const hh = Math.max(v > 0 ? 2 : 0, (v / max) * (H - 2)); return `<rect x="${(i * colW + (colW - barW) / 2).toFixed(2)}" y="${(H - hh).toFixed(2)}" width="${barW.toFixed(2)}" height="${hh.toFixed(2)}" rx="1" style="fill:var(--color-accent)" opacity="${(0.5 + 0.5 * (i / n)).toFixed(2)}"/>`; }).join("");
  const up = delta !== null && delta >= 0;
  return h("div", { class: "glass kpi-card" }, [
    h("div", { class: "kpi-body" }, [
      h("div", { class: "min0" }, [h("div", { class: "kpi-label" }, label), h("div", { class: "kpi-value" }, value)]),
      h("div", { html: `<svg viewBox="0 0 ${W} ${H}" class="kpi-spark" aria-hidden="true">${bars}</svg>` })
    ]),
    h("div", { class: "kpi-foot" }, [
      h("span", { class: cls("b", delta === null ? "muted-sub" : up ? "accent" : "danger") }, delta === null ? "—" : `${up ? "▲" : "▼"} ${Math.abs(delta).toFixed(1)}%`),
      h("span", { class: "tiny-sub" }, caption),
      footnote ? h("span", { class: "kpi-note" }, footnote) : null
    ])
  ]);
}

// The LED board: every cell dim, the lit skyline in the accent with a gray echo outline (as in the original).
function dotMatrix(segments, xLabels, labelKind) {
  const W = 760, H = 260, PAD_L = 40, PAD_R = 8, PAD_TOP = 6, PAD_BOTTOM = 28, TARGET_COLS = 72;
  const niceTight = (v) => { if (v <= 4) return 4; const mag = 10 ** Math.floor(Math.log10(v)); for (const m of [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (v <= m * mag) return m * mag; return 10 * mag; };
  const real = segments.filter((s) => !s.decorative);
  const n = Math.max(1, xLabels.length), k = Math.max(1, Math.round(TARGET_COLS / n)), cols = n * k;
  const expand = (vals) => { if (k === 1) return vals; const out = []; for (let i = 0; i < vals.length; i++) { const a = vals[i] || 0, b = i + 1 < vals.length ? vals[i + 1] || 0 : a; for (let j = 0; j < k; j++) out.push(a + ((b - a) * j) / k); } return out; };
  const exp = segments.map((s) => ({ ...s, values: expand(s.values) }));
  const expTotals = Array.from({ length: cols }, (_, i) => exp.reduce((s, g) => s + (g.values[i] || 0), 0));
  const dayTotals = xLabels.map((_, i) => real.reduce((s, g) => s + (g.values[i] || 0), 0));
  const yMax = niceTight(Math.max(1, ...dayTotals) * 1.08);
  const plotW = W - PAD_L - PAD_R, plotH = H - PAD_TOP - PAD_BOTTOM, colW = plotW / cols;
  const ROWS = Math.max(6, Math.floor(plotH / colW)), cellH = plotH / ROWS, cell = Math.max(1.2, colW * 0.78), baseY = PAD_TOP + plotH;
  const filled = (i) => {
    const out = []; if (expTotals[i] <= 0) return out; let used = 0;
    exp.forEach((g, s) => { const v = g.values[i] || 0, outline = s === exp.length - 1 && exp.length > 1; let rows = Math.round((v / yMax) * ROWS * (outline ? 3 : 1)); if (v > 0 && rows === 0) rows = 1; rows = Math.min(rows, ROWS - used); if (rows > 0) out.push({ color: g.color, rows, s }); used += rows; });
    return out;
  };
  const ticks = [0, ...(yMax % 4 === 0 ? [0.25, 0.5, 0.75, 1] : [0.5, 1])];
  let svg = "";
  for (const f of ticks) {
    const y = PAD_TOP + plotH * (1 - f);
    if (f > 0) svg += `<line x1="${PAD_L}" x2="${W - PAD_R}" y1="${y}" y2="${y}" style="stroke:var(--chart-grid)"/>`;
    svg += `<text x="${PAD_L - 12}" y="${y + 3}" text-anchor="end" font-size="9" style="fill:var(--color-fg-subtle)">${Math.round(yMax * f).toLocaleString("en-US")}</text><path d="M ${PAD_L - 8} ${y - 2.5} L ${PAD_L - 2} ${y} L ${PAD_L - 8} ${y + 2.5} Z" style="fill:var(--chart-axis)"/>`;
  }
  let board = "";
  for (let i = 0; i < cols; i++) { const cx = PAD_L + i * colW + (colW - cell) / 2; for (let r = 0; r < ROWS; r++) board += `<rect x="${cx.toFixed(2)}" y="${(baseY - (r + 1) * cellH + (cellH - cell) / 2).toFixed(2)}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}" rx="1" style="fill:var(--chart-cell)"/>`; }
  let lit = "";
  for (let i = 0; i < cols; i++) { const cx = PAD_L + i * colW + (colW - cell) / 2; let row = 0; for (const seg of filled(i)) { for (let r = 0; r < seg.rows; r++) lit += `<rect x="${cx.toFixed(2)}" y="${(baseY - (row + r + 1) * cellH + (cellH - cell) / 2).toFixed(2)}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}" rx="1" style="fill:${seg.color}"/>`; row += seg.rows; } }
  const fmt = (key) => { const d = new Date(`${key}T12:00:00Z`); return labelKind === "month" ? d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }) : d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }); };
  const every = labelKind === "month" ? 1 : Math.max(1, Math.ceil(n / 8));
  const xl = xLabels.map((l, i) => (i % every === 0 ? `<text x="${PAD_L + i * k * colW + (k * colW) / 2}" y="${H - 8}" text-anchor="middle" font-size="9" style="fill:var(--color-fg-subtle)">${fmt(l)}</text>` : "")).join("");
  const wrap = h("div", { class: "rel" });
  wrap.innerHTML = `<svg viewBox="0 0 ${W} ${H}" class="chart-svg dm-svg" role="img" aria-label="${real.map((s) => s.label).join(" and ")} by ${labelKind}">${svg}<rect class="dm-hover" x="0" y="${PAD_TOP}" width="0" height="${plotH}" style="fill:var(--color-accent-soft)"/><g>${board}</g><g>${lit}</g>${xl}</svg>`;
  const tip = h("div", { class: "dm-tip hide" });
  wrap.append(tip);
  const svgEl = wrap.querySelector("svg"), hov = wrap.querySelector(".dm-hover");
  svgEl.addEventListener("pointermove", (e) => {
    const rect = svgEl.getBoundingClientRect(), px = ((e.clientX - rect.left) / rect.width) * W;
    if (px < PAD_L || px > W - PAD_R) { tip.classList.add("hide"); hov.setAttribute("width", 0); return; }
    const day = Math.min(n - 1, Math.floor(Math.min(cols - 1, Math.max(0, Math.floor((px - PAD_L) / colW))) / k));
    hov.setAttribute("x", PAD_L + day * k * colW); hov.setAttribute("width", k * colW);
    const wr = wrap.getBoundingClientRect();
    tip.style.left = `${Math.min(e.clientX - wr.left + 14, wr.width - 160)}px`; tip.style.top = `${Math.max(e.clientY - wr.top - 64, 0)}px`;
    tip.replaceChildren(h("div", { class: "dm-tip-head" }, labelKind === "month" ? new Date(`${xLabels[day]}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" }) : fmt(xLabels[day])),
      h("div", { class: "dm-tip-body" }, real.map((g) => h("div", { class: "row gap2 muted" }, [h("span", { class: "dm-sw", style: `background:${g.color}` }), g.label, h("span", { class: "ml-auto b fg" }, Math.round(g.values[day] || 0).toLocaleString("en-US"))]))));
    tip.classList.remove("hide");
  });
  svgEl.addEventListener("pointerleave", () => { tip.classList.add("hide"); hov.setAttribute("width", 0); });
  return wrap;
}

function postedBuckets(period) {
  const now = todayParts(), posted = posts().filter((p) => p.status === "posted");
  if (period === "yearly") {
    const keys = [];
    for (let i = 11; i >= 0; i--) { const d = new Date(Date.UTC(now.y, now.m - i, 1)); keys.push(d.toISOString().slice(0, 10)); }
    return { keys, labelKind: "month", values: keys.map((k) => posted.filter((p) => (postedKey(p) || "").slice(0, 7) === k.slice(0, 7)).length) };
  }
  const days = period === "weekly" ? 7 : 30, keys = Array.from({ length: days }, (_, i) => addDays(now.key, i - days + 1));
  return { keys, labelKind: "day", values: keys.map((k) => posted.filter((p) => postedKey(p) === k).length) };
}

function renderDashboard() {
  const q = state.route.query, period = TREND_PERIODS.some(([k]) => k === q.get("trend")) ? q.get("trend") : "monthly";
  const now = todayParts(), all = posts(), name = firstName();
  const last = (n, list, keyFn) => Array.from({ length: n }, (_, i) => { const k = addDays(now.key, i - n + 1); return list.filter((p) => keyFn(p) === k).length; });
  const posted = all.filter((p) => p.status === "posted");
  const posted30 = last(30, posted, postedKey), postedPrev = Array.from({ length: 30 }, (_, i) => { const k = addDays(now.key, i - 59); return posted.filter((p) => postedKey(p) === k).length; });
  const sum = (a) => a.reduce((s, x) => s + x, 0);
  const pct = (cur, prev) => (prev > 0 ? ((cur - prev) / prev) * 100 : null);
  const drafts = all.filter((p) => p.status === "draft");
  const snap = webSnap(), w30 = snap && snap.ranges["30d"];
  const live = state.teams.filter((t) => t.buildStatus === "active").length;
  const b = postedBuckets(period);
  const segments = [{ label: "Posts out", color: "var(--color-accent)", values: b.values }, { label: "Echo", color: "var(--chart-echo)", values: b.values, decorative: true }];
  const byPlatform = PLATFORM_ORDER.map((p) => ({ p, n: posted.filter((x) => x.platform === p).length })).filter((x) => x.n > 0).sort((a, c) => c.n - a.n);
  const maxP = Math.max(1, ...byPlatform.map((x) => x.n));
  const recent = [...all].sort((a, c) => ((c.postedAt || c.date || c.created || "") + c.time).localeCompare((a.postedAt || a.date || a.created || "") + a.time)).slice(0, 8);
  const statusBadge = (s) => h("span", { class: cls("badge", s === "posted" ? "success" : s === "rejected" ? "danger" : "neutral") }, titleCase(s));
  return h("div", { class: "dash-page" }, [
    h("div", { class: "row wrap dash-head" }, h("div", {}, [h("h1", { class: "dash-h1" }, `${greeting()}${name ? `, ${name}` : ""}`), h("p", { class: "tiny-sub dash-date" }, `${longToday()} · the business at a glance`)])),
    readOnlyNote(),
    h("div", { class: "kpi-row" }, [
      kpiCard({ label: "Posts Out", value: sum(posted30).toLocaleString("en-US"), delta: pct(sum(posted30), sum(postedPrev)), caption: "posted, last 30 days", spark: posted30.slice(-14) }),
      kpiCard({ label: "Waiting On You", value: drafts.length.toLocaleString("en-US"), delta: null, caption: "drafts to review", spark: last(14, drafts, (p) => (p.created || "").slice(0, 10)) }),
      kpiCard({ label: "Website Visitors", value: w30 ? w30.totals.activeUsers.toLocaleString("en-US") : "—", delta: w30 ? pct(w30.totals.activeUsers, w30.previousTotals.activeUsers) : null, caption: w30 ? "active users, 30 days" : "connect it in Web → Settings", spark: w30 ? w30.trend.slice(-14).map((t) => t.users) : [], footnote: snap ? `GA4 · ${new Date(snap.capturedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: tzName() })}` : null }),
      kpiCard({ label: "Agent Teams", value: state.teams.length.toLocaleString("en-US"), delta: null, caption: `${live} live, ${state.teams.length - live} waiting on a lesson`, spark: [] })
    ]),
    h("div", { class: "dash-hero-grid" }, [
      h("div", { class: "glass dash-panel" }, [
        h("div", { class: "dash-strip" }, h("div", { class: "dash-strip-title" }, ["Posting Trend", h("span", { html: '<svg viewBox="0 0 14 14" width="13" height="13" aria-hidden="true"><circle cx="7" cy="7" r="7" fill="currentColor" opacity="0.4"/><path d="M7 3.8v5.4M4.7 7 7 9.4 9.3 7" style="stroke:var(--color-surface-solid)" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' })])),
        h("div", { class: "dash-bar" }, [
          h("div", { class: "row gap25" }, [h("span", { class: "dash-hero-l" }, "Posts Out :"), h("span", { class: "dash-hero-v" }, sum(b.values).toLocaleString("en-US"))]),
          h("div", { class: "row gap3" }, [h("span", { class: "row gap15 tiny-sub dash-legend" }, [h("span", { class: "web-dot sm" }), "Posts out"]),
            h("nav", { class: "dash-periods", "aria-label": "Chart period" }, TREND_PERIODS.map(([k, l]) => h("a", { href: `#/dashboard${k === "monthly" ? "" : `?trend=${k}`}`, "aria-current": k === period ? "page" : null }, l)))])
        ]),
        h("div", { class: "dash-chart" }, [h("div", { class: "rel" }, [dotMatrix(segments, b.keys, b.labelKind), b.values.every((v) => v === 0) ? h("p", { class: "dash-nodata" }, all.length ? "Nothing marked posted in this range yet." : "No posts yet. Your Content Team's posts show up here as they go out.") : null]),
          h("p", { class: "kpi-note mt2" }, `Counted from posts marked posted in ${POSTS_HOME}/`)])
      ]),
      h("div", { class: "glass dash-panel col" }, [
        h("div", { class: "dash-strip" }, h("div", { class: "dash-strip-title" }, "Posts by Platform")),
        h("div", { class: "dash-break" }, [h("div", { class: "dash-hero-v" }, posted.length.toLocaleString("en-US")), h("div", { class: "tiny-sub" }, "posted, all-time"),
          byPlatform.length ? h("ul", { class: "dash-break-list" }, byPlatform.map((x) => h("li", {}, [h("div", { class: "dash-break-row" }, [h("span", { class: "row gap15 muted" }, [markIcon(x.p, "tiny"), PLATFORM_LABEL[x.p]]), h("span", { class: "b fg" }, x.n)]), h("div", { class: "dash-track" }, h("div", { class: "dash-fill", style: `width:${Math.max(2, (x.n / maxP) * 100)}%` }))])))
            : h("p", { class: "lede mt6" }, "Nothing posted yet. Each platform shows up here the moment its first post goes out.")])
      ])
    ]),
    h("div", { class: "glass dash-panel mt5" }, [
      h("div", { class: "dash-strip row" }, [h("div", { class: "dash-strip-title" }, "Recent Posts"), h("a", { href: "#/content/calendar", class: "sec-link ml-auto" }, "Calendar →")]),
      recent.length ? h("div", { class: "table-wrap" }, h("table", {}, [
        h("thead", {}, h("tr", {}, [h("th", {}, "Post"), h("th", {}, "Platform"), h("th", {}, "Status"), h("th", { class: "right" }, "Day")])),
        h("tbody", {}, recent.map((p) => h("tr", { class: "click-row", onclick: () => openComposer({ postId: p.id, source: "calendar" }) }, [h("td", { class: "truncate fg" }, preview(p.body, 70) || "(no caption)"), h("td", {}, h("span", { class: "row gap15" }, [markIcon(p.platform, "tiny"), PLATFORM_LABEL[p.platform]])), h("td", {}, statusBadge(p.status)), h("td", { class: "right num" }, p.date ? fmtDay(p.date) : "—")])))
      ])) : h("p", { class: "lede dash-empty" }, "No posts yet. When your Content Team writes one, it lands here.")
    ])
  ]);
}

function renderGlance() {
  const now = todayParts(), snap = webSnap();
  const scheduled = posts().filter((p) => p.status === "approved" && p.date && p.date >= now.key).length;
  const metric = { content: { value: scheduled, label: "Scheduled" }, web: snap ? { value: snap.ranges["30d"].totals.activeUsers.toLocaleString("en-US"), label: "Active users (30d)" } : null };
  const hr = +new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: tzName() }).format(new Date());
  const part = hr < 12 ? "morning" : hr < 18 ? "afternoon" : "evening", name = firstName();
  return h("div", { class: "dash-gutter glance" }, [
    h("header", { class: "glass glance-band" }, [h("p", { class: "eyebrow" }, longToday()), h("h1", { class: "glance-h1" }, `Good ${part}${name ? `, ${name}` : ""}.`), h("p", { class: "lede" }, "Welcome back to your Command Center: every system you run, in one calm place.")]),
    h("section", {}, [h("p", { class: "overline mb4" }, "Overview"), h("div", { class: "glance-grid" }, MODULES.map((m) => {
      const mt = metric[m.key];
      return h("a", { href: `#${m.href}`, class: "glass glance-card" }, [
        h("div", { class: "row glance-top" }, [h("span", { class: "glance-ic", html: lineIcon(m.icon) }), h("span", { class: "glance-arrow", html: lineIcon("arrowUpRight") })]),
        h("div", { class: "flex1 mt4" }, [h("p", { class: "b fg m0 glance-name" }, m.label), h("p", { class: "tiny-sub glance-desc" }, m.description)]),
        mt ? h("div", { class: "glance-metric" }, [h("span", { class: "glance-num" }, mt.value), h("span", { class: "tiny-sub" }, mt.label)]) : null
      ]);
    }))])
  ]);
}
