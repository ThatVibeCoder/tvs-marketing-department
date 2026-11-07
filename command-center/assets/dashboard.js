// Dashboard and Overview: the Command Center's two home pages.
// Dashboard = the business at a glance: Revenue · MRR · Website Visitors · Open invoices, the Total Revenue
// dot-matrix, revenue by customer and the recent payments. The money comes from command-center/data/payments.json
// (the Payments Agent fills it; it never leaves this computer), the visitors from the Web pull. With nothing
// there yet, every tile says how to connect it. Never a made-up number.
// Overview = a welcome band and one card per module.

const TREND_PERIODS = [["weekly", "Weekly"], ["monthly", "Monthly"], ["yearly", "Yearly"]];
function greeting() {
  const hr = +new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: tzName() }).format(new Date());
  return hr < 5 ? "Burning the midnight oil" : hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";
}
const longToday = () => new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: tzName() });
const firstName = () => ((settings().account || {}).name || "").trim().split(/\s+/)[0];

// A KPI card: the label, the big number, then the change, its caption and where it came from. No sparkline (Brian, 11/07).
function kpiCard({ label, value, delta, caption, footnote }) {
  const up = delta !== null && delta >= 0;
  return h("div", { class: "glass kpi-card" }, [
    h("div", { class: "kpi-body" }, [
      h("div", { class: "min0" }, [h("div", { class: "kpi-label" }, label), h("div", { class: "kpi-value" }, value)])
    ]),
    h("div", { class: "kpi-foot" }, [
      h("span", { class: cls("b", delta === null ? "muted-sub" : up ? "accent" : "danger") }, delta === null ? "—" : `${up ? "▲" : "▼"} ${Math.abs(delta).toFixed(1)}%`),
      h("span", { class: "tiny-sub" }, caption),
      footnote ? h("span", { class: "kpi-note" }, footnote) : null
    ])
  ]);
}

// The LED board: every cell dim, the lit skyline in the accent with a gray echo outline (as in the original).
function dotMatrix(segments, xLabels, labelKind, fmtValue = (v) => Math.round(v).toLocaleString("en-US"), yFloor = 0) {
  const W = 760, H = 260, PAD_L = 40, PAD_R = 8, PAD_TOP = 6, PAD_BOTTOM = 28, TARGET_COLS = 72;
  const niceTight = (v) => { if (v <= 4) return 4; const mag = 10 ** Math.floor(Math.log10(v)); for (const m of [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (v <= m * mag) return m * mag; return 10 * mag; };
  const real = segments.filter((s) => !s.decorative);
  const n = Math.max(1, xLabels.length), k = Math.max(1, Math.round(TARGET_COLS / n)), cols = n * k;
  const expand = (vals) => { if (k === 1) return vals; const out = []; for (let i = 0; i < vals.length; i++) { const a = vals[i] || 0, b = i + 1 < vals.length ? vals[i + 1] || 0 : a; for (let j = 0; j < k; j++) out.push(a + ((b - a) * j) / k); } return out; };
  const exp = segments.map((s) => ({ ...s, values: expand(s.values) }));
  const expTotals = Array.from({ length: cols }, (_, i) => exp.reduce((s, g) => s + (g.values[i] || 0), 0));
  const dayTotals = xLabels.map((_, i) => real.reduce((s, g) => s + (g.values[i] || 0), 0));
  // A floor (the revenue target) fixes the top of the scale so the bars sit low against the board, as in the
  // Command Center; real data above it stretches the scale.
  const yMax = Math.max(niceTight(Math.max(1, ...dayTotals) * 1.08), yFloor || 0);
  const plotW = W - PAD_L - PAD_R, plotH = H - PAD_TOP - PAD_BOTTOM, colW = plotW / cols;
  const ROWS = Math.max(6, Math.floor(plotH / colW)), cellH = plotH / ROWS, cell = Math.max(1.2, colW * 0.78), baseY = PAD_TOP + plotH;
  const filled = (i) => {
    const out = []; if (expTotals[i] <= 0) return out; let used = 0;
    exp.forEach((g, s) => { const v = g.values[i] || 0, outline = s === exp.length - 1 && exp.length > 1; let rows = Math.round((v / yMax) * ROWS * (outline ? 3 : 1)); if (v > 0 && rows === 0) rows = 1; rows = Math.min(rows, ROWS - used); if (rows > 0) out.push({ color: g.color, rows, s }); used += rows; });
    return out;
  };
  const ticks = [0, ...(yFloor && yMax % 5 === 0 ? [0.2, 0.4, 0.6, 0.8, 1] : yMax % 4 === 0 ? [0.25, 0.5, 0.75, 1] : [0.5, 1])]; // a floored scale gets fifths ($5k steps at $25k)
  let svg = "";
  for (const f of ticks) {
    const y = PAD_TOP + plotH * (1 - f);
    if (f > 0) svg += `<line x1="${PAD_L}" x2="${W - PAD_R}" y1="${y}" y2="${y}" style="stroke:var(--chart-grid)"/>`;
    svg += `<text x="${PAD_L - 12}" y="${y + 3}" text-anchor="end" font-size="9" style="fill:var(--color-fg-subtle)">${fmtValue(yMax * f, true)}</text><path d="M ${PAD_L - 8} ${y - 2.5} L ${PAD_L - 2} ${y} L ${PAD_L - 8} ${y + 2.5} Z" style="fill:var(--chart-axis)"/>`;
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
      h("div", { class: "dm-tip-body" }, real.map((g) => h("div", { class: "row gap2 muted" }, [h("span", { class: "dm-sw", style: `background:${g.color}` }), g.label, h("span", { class: "ml-auto b fg" }, fmtValue(g.values[day] || 0))]))));
    tip.classList.remove("hide");
  });
  svgEl.addEventListener("pointerleave", () => { tip.classList.add("hide"); hov.setAttribute("width", 0); });
  return wrap;
}

// ---------- money (pure: no page, so it can be checked on its own) ----------
function moneyFmt(currency, compact) {
  let f;
  try { f = new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD", maximumFractionDigits: 0, ...(compact ? { notation: "compact" } : {}) }); }
  catch { f = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }); }
  return (v) => f.format(v || 0);
}
// Axis ticks the way the Command Center writes them: $0, $5k, $12.5k.
function tickFmt(currency) {
  const whole = moneyFmt(currency);
  return (v) => { if (v < 1000) return whole(v); const k = v / 1000; return whole(0).replace(/0(\.0+)?$/, "") + (Number.isInteger(k) ? k : k.toFixed(1)) + "k"; };
}
// The revenue target sets the chart's scale: Settings → Workspace, $25,000 unless you change it.
const revenueTarget = () => { const t = Number((settings().workspace || {}).revenueTarget); return Number.isFinite(t) && t > 0 ? t : 25000; };
function revenueSummary(pay, todayKey, period) {
  const paid = (pay.payments || []).filter((p) => p.status === "paid"); // refunded and failed never count as revenue
  const onDay = (k) => paid.filter((p) => p.date === k).reduce((s, p) => s + p.amount, 0);
  const span = (from, n) => Array.from({ length: n }, (_, i) => onDay(addDays(todayKey, from + i)));
  const sum = (a) => a.reduce((s, x) => s + x, 0);
  const last30 = span(-29, 30), prev30 = span(-59, 30);
  let keys, values, labelKind = "day";
  if (period === "yearly") {
    const [y, m] = todayKey.split("-").map(Number);
    keys = Array.from({ length: 12 }, (_, i) => new Date(Date.UTC(y, m - 1 - (11 - i), 1)).toISOString().slice(0, 10));
    values = keys.map((k) => paid.filter((p) => p.date.slice(0, 7) === k.slice(0, 7)).reduce((s, p) => s + p.amount, 0));
    labelKind = "month";
  } else {
    const n = period === "weekly" ? 7 : 30;
    keys = Array.from({ length: n }, (_, i) => addDays(todayKey, i - n + 1));
    values = keys.map(onDay);
  }
  const byCustomer = Object.entries(paid.reduce((m, p) => { const c = (p.customer || "").trim() || "No name"; m[c] = (m[c] || 0) + p.amount; return m; }, {})).map(([customer, total]) => ({ customer, total })).sort((x, y) => y.total - x.total);
  const open = (pay.invoices || []).filter((i) => i.status === "open");
  return {
    revenue30: sum(last30), revenuePrev30: sum(prev30),
    trend: { keys, values, labelKind }, allTime: sum(paid.map((p) => p.amount)), byCustomer,
    openCount: open.length, openAmount: sum(open.map((i) => i.amount)), overdue: open.filter((i) => i.dueDate && i.dueDate < todayKey).length,
    recent: [...(pay.payments || [])].sort((x, y) => (y.date || "").localeCompare(x.date || "")).slice(0, 8)
  };
}

const CONNECT_PAYMENTS = "Connect your payments in Settings → Payments", CONNECT_SHORT = "Connect in Settings → Payments";
function renderDashboard() {
  const q = state.route.query, period = TREND_PERIODS.some(([k]) => k === q.get("trend")) ? q.get("trend") : "monthly";
  const now = todayParts(), name = firstName(), pay = state.payments;
  const pct = (cur, prev) => (prev > 0 ? ((cur - prev) / prev) * 100 : null);
  const snap = webSnap(), w30 = snap && snap.ranges["30d"];
  const r = pay ? revenueSummary(pay, now.key, period) : null;
  const money = moneyFmt(pay && pay.currency), tick = tickFmt(pay && pay.currency);
  const provider = pay && pay.provider ? (PAYMENT_PROVIDERS.find((p) => p.id === pay.provider) || { name: titleCase(pay.provider) }).name : "payments.json";
  const stamp = pay && pay.capturedAt ? `${provider} · ${new Date(pay.capturedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: tzName() })}` : pay ? provider : null;
  const trend = r ? r.trend : { keys: Array.from({ length: period === "weekly" ? 7 : 30 }, (_, i) => addDays(now.key, i - (period === "weekly" ? 6 : 29))), values: [], labelKind: "day" };
  if (!r && period === "yearly") { trend.keys = Array.from({ length: 12 }, (_, i) => new Date(Date.UTC(now.y, now.m - 11 + i, 1)).toISOString().slice(0, 10)); trend.labelKind = "month"; }
  const vals = r ? trend.values : trend.keys.map(() => 0);
  const segments = [{ label: "Revenue", color: "var(--color-accent)", values: vals }, { label: "Echo", color: "var(--chart-echo)", values: vals, decorative: true }];
  const maxC = Math.max(1, ...(r ? r.byCustomer.map((c) => c.total) : [1]));
  const connect = (cls2) => h("a", { href: "#/settings/payments", class: cls("accent-link", cls2) }, CONNECT_PAYMENTS);
  const payBadge = (s) => h("span", { class: cls("badge", s === "paid" ? "success" : s === "failed" ? "danger" : "neutral") }, titleCase(s));
  return h("div", { class: "dash-page" }, [
    h("div", { class: "row wrap dash-head" }, h("div", {}, [h("h1", { class: "dash-h1" }, `${greeting()}${name ? `, ${name}` : ""}`), h("p", { class: "tiny-sub dash-date" }, `${longToday()} · the business at a glance`)])),
    readOnlyNote(),
    h("div", { class: "kpi-row" }, [
      kpiCard({ label: "Revenue", value: r ? money(r.revenue30) : "—", delta: r ? pct(r.revenue30, r.revenuePrev30) : null, caption: r ? "collected, last 30 days" : CONNECT_SHORT, footnote: stamp }),
      kpiCard({ label: "MRR", value: r && pay.mrr !== null ? money(pay.mrr) : "—", delta: null, caption: !r ? CONNECT_SHORT : pay.mrr !== null ? `recurring / mo${pay.activeSubscriptions !== null ? ` · ${pay.activeSubscriptions} active` : ""}` : "no subscriptions in payments.json", footnote: stamp }),
      kpiCard({ label: "Website Visitors", value: w30 ? w30.totals.activeUsers.toLocaleString("en-US") : "—", delta: w30 ? pct(w30.totals.activeUsers, w30.previousTotals.activeUsers) : null, caption: w30 ? "active users, 30 days" : "connect it in Web → Settings", footnote: snap ? `GA4 · ${new Date(snap.capturedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: tzName() })}` : null }),
      kpiCard({ label: "Open Invoices", value: r ? r.openCount.toLocaleString("en-US") : "—", delta: null, caption: r ? `${money(r.openAmount)} unpaid` : CONNECT_SHORT, footnote: r && r.overdue ? `${r.overdue} past due` : stamp })
    ]),
    h("div", { class: "dash-hero-grid" }, [
      h("div", { class: "glass dash-panel" }, [
        h("div", { class: "dash-strip" }, h("div", { class: "dash-strip-title" }, ["Sales Trend", h("span", { html: '<svg viewBox="0 0 14 14" width="13" height="13" aria-hidden="true"><circle cx="7" cy="7" r="7" fill="currentColor" opacity="0.4"/><path d="M7 3.8v5.4M4.7 7 7 9.4 9.3 7" style="stroke:var(--color-surface-solid)" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' })])),
        h("div", { class: "dash-bar" }, [
          h("div", { class: "row gap25" }, [h("span", { class: "dash-hero-l" }, "Total Revenue :"), h("span", { class: "dash-hero-v" }, r ? money(vals.reduce((s, v) => s + v, 0)) : "—")]),
          h("div", { class: "row gap3" }, [h("span", { class: "row gap15 tiny-sub dash-legend" }, [h("span", { class: "web-dot sm" }), "Revenue"]), h("a", { href: "#/settings/workspace", class: "tiny-sub dash-legend", title: "Change it in Settings → Workspace" }, `Target ${tick(revenueTarget())}`),
            h("nav", { class: "dash-periods", "aria-label": "Chart period" }, TREND_PERIODS.map(([k, l]) => h("a", { href: `#/dashboard${k === "monthly" ? "" : `?trend=${k}`}`, "aria-current": k === period ? "page" : null }, l)))])
        ]),
        h("div", { class: "dash-chart" }, [h("div", { class: "rel" }, [dotMatrix(segments, trend.keys, trend.labelKind, (v, axis) => (axis ? tick(v) : money(v)), revenueTarget()),
          !r ? h("div", { class: "dash-nodata col" }, [h("span", {}, "No revenue yet. Your payments show up here once they're connected."), connect("mt2")])
            : vals.every((v) => v === 0) ? h("p", { class: "dash-nodata" }, "No payments in this range.") : null]),
          h("p", { class: "kpi-note mt2" }, r ? `Paid payments in command-center/data/payments.json${stamp ? ` (${stamp})` : ""}. Refunds and failed payments don't count.` : "Read from command-center/data/payments.json, which the Payments Agent fills. It stays on this computer.")])
      ]),
      h("div", { class: "glass dash-panel col" }, [
        h("div", { class: "dash-strip" }, h("div", { class: "dash-strip-title" }, "Revenue by Customer")),
        h("div", { class: "dash-break" }, [h("div", { class: "dash-hero-v" }, r ? money(r.allTime) : "—"), h("div", { class: "tiny-sub" }, "collected, all-time"),
          r && r.byCustomer.length ? h("ul", { class: "dash-break-list" }, r.byCustomer.slice(0, 8).map((c) => h("li", {}, [h("div", { class: "dash-break-row" }, [h("span", { class: "muted truncate" }, c.customer), h("span", { class: "b fg" }, money(c.total))]), h("div", { class: "dash-track" }, h("div", { class: "dash-fill", style: `width:${Math.max(2, (c.total / maxC) * 100)}%` }))])))
            : r ? h("p", { class: "lede mt6" }, "No paid payments yet. Each customer shows up here with their first one.")
              : h("div", { class: "mt6" }, [h("p", { class: "lede" }, "Every customer and what they've paid you, biggest first."), connect("mt3 block")])])
      ])
    ]),
    h("div", { class: "glass dash-panel mt5" }, [
      h("div", { class: "dash-strip row" }, [h("div", { class: "dash-strip-title" }, "Recent Payments"), h("a", { href: "#/settings/payments", class: "sec-link ml-auto" }, "Payments settings →")]),
      r && r.recent.length ? h("div", { class: "table-wrap" }, h("table", {}, [
        h("thead", {}, h("tr", {}, [h("th", {}, "Customer"), h("th", {}, "For"), h("th", {}, "Status"), h("th", { class: "right" }, "Amount"), h("th", { class: "right" }, "Day")])),
        h("tbody", {}, r.recent.map((p) => h("tr", {}, [h("td", { class: "truncate fg" }, p.customer || "No name"), h("td", { class: "truncate muted" }, p.description || "—"), h("td", {}, payBadge(p.status)), h("td", { class: "right num fg" }, money(p.amount)), h("td", { class: "right num" }, fmtDay(p.date))])))
      ])) : r ? h("p", { class: "lede dash-empty" }, "No payments yet.") : h("div", { class: "dash-empty" }, [h("p", { class: "lede" }, "No payments yet."), connect("mt2 block")])
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
