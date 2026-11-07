// Web & Analytics: Overview · Traffic · Geography · Pages · Search · Settings.
// Drawn from command-center/data/web.json, which tools/pull_web.py writes from Google Analytics 4 and
// Search Console (read-only). No file yet = empty states that point at Web → Settings. Never a made-up number.

const WEB_RANGES = ["7d", "30d", "90d"];
const WEB_RANGE_LABELS = { "7d": "7 days", "30d": "30 days", "90d": "90 days" };
const WEB_TABS = [
  ["", "Overview"],
  ["landing", "Landing Pages"],
  ["traffic", "Traffic"],
  ["geography", "Geography"],
  ["pages", "Pages"],
  ["search", "Search"],
  ["settings", "Settings"],
];
const webNf = new Intl.NumberFormat("en-US");
const webPct = (n) => `${(n * 100).toFixed(1)}%`;
const webSnap = () => {
  const s = state.web;
  return s && s.ranges && s.ranges["30d"] && s.ranges["30d"].trend && s.capturedAt ? s : null;
};
function webFlag(code) {
  return code && code.length === 2
    ? code.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    : "";
}
function webAsOf(iso) {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: tzName(),
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
function webDay(iso) {
  return iso ? new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";
}
function webDelta(cur, prev) {
  if (prev === 0) return cur === 0 ? { pct: 0, dir: "flat", isNew: false } : { pct: 100, dir: "up", isNew: true };
  const pct = ((cur - prev) / prev) * 100;
  return { pct, dir: pct > 0.5 ? "up" : pct < -0.5 ? "down" : "flat", isNew: false };
}
const webRange = () => (WEB_RANGES.includes(state.route.query.get("range")) ? state.route.query.get("range") : "30d");

function webPanel(title, ic, meta, child) {
  return h("div", { class: "glass rounded-xl" }, [
    h("div", { class: "web-panel-head" }, [
      h("p", { class: "web-panel-title" }, [svgIcon(ic, "accent"), title]),
      meta ? h("span", { class: "tiny-sub web-panel-meta" }, meta) : null,
    ]),
    child,
  ]);
}
function webLink(href, label) {
  return h("a", { href, class: "accent-link row gap1" }, [label, svgIcon("chevronRight", "xs")]);
}
function webRangeToggle(base) {
  const r = webRange();
  return h(
    "div",
    { role: "group", "aria-label": "Time range", class: "web-range" },
    WEB_RANGES.map((k) =>
      h(
        "a",
        { href: `#${base}?range=${k}`, "aria-current": k === r ? "page" : null },
        WEB_RANGE_LABELS[k].replace(" days", "d"),
      ),
    ),
  );
}
function webStatTiles(rd, rangeLabel) {
  const defs = [
    ["activeUsers", "Active users", "users"],
    ["sessions", "Sessions", "activity"],
    ["newUsers", "New users", "user"],
    ["pageViews", "Pageviews", "browser"],
  ];
  return h(
    "div",
    { class: "stat-grid" },
    defs.map(([k, label, ic]) => {
      const d = webDelta(rd.totals[k], rd.previousTotals[k]);
      const glyph = d.dir === "up" ? "▲" : d.dir === "down" ? "▼" : "—";
      return h("div", { class: "stat-tile glass rounded-xl" }, [
        h("div", { class: "stat-top" }, [
          h("span", { class: "stat-icon", html: icon(ic) }),
          h("span", { class: "stat-label" }, label),
        ]),
        h("p", { class: "stat-value web-stat" }, webNf.format(rd.totals[k])),
        d.isNew
          ? h("p", { class: "web-delta up" }, `New vs previous ${rangeLabel}`)
          : h("p", { class: cls("web-delta", d.dir) }, [
              h("span", {}, `${glyph} ${Math.abs(d.pct).toFixed(0)}%`),
              " ",
              h("span", { class: "tiny-sub" }, `vs prev. ${rangeLabel}`),
            ]),
      ]);
    }),
  );
}
function webTrend(points) {
  const W = 720,
    H = 180,
    P = { l: 6, r: 6, t: 10, b: 6 },
    iw = W - P.l - P.r,
    ih = H - P.t - P.b,
    base = P.t + ih;
  const max = Math.max(1, ...points.map((p) => p.sessions), ...points.map((p) => p.users));
  const grid = [P.t, P.t + ih / 2, base].map((y) => `<line x1="0" x2="${W}" y1="${y}" y2="${y}"/>`).join("");
  const series = (vals) => {
    const n = vals.length,
      x = (i) => (n <= 1 ? P.l + iw / 2 : P.l + (i / (n - 1)) * iw),
      y = (v) => P.t + ih - (v / max) * ih;
    const pts = vals.map((v, i) => `${x(i).toFixed(2)},${y(v).toFixed(2)}`);
    return {
      line: `M${pts.join("L")}`,
      area: `M${x(0).toFixed(2)},${base.toFixed(2)}L${pts.join("L")}L${x(n - 1).toFixed(2)},${base.toFixed(2)}Z`,
    };
  };
  const empty = points.length === 0,
    gid = `trend-fill-${++gidSeq}`;
  const u = empty ? null : series(points.map((p) => p.users)),
    s = empty ? null : series(points.map((p) => p.sessions));
  const first = empty ? "" : points[0].date,
    last = empty ? "" : points[points.length - 1].date;
  const label = empty
    ? "Visitor trend chart. No data for this period."
    : `Visitor trend, ${webDay(first)} to ${webDay(last)}. Peak ${webNf.format(max)}. Most recent ${webNf.format(points[points.length - 1].users)} users.`;
  return h("figure", { class: "m0" }, [
    h("div", {
      html: `<svg viewBox="0 0 ${W} ${H}" class="web-svg" role="img" aria-label="${esc(label)}"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" style="stop-color:var(--color-accent)" stop-opacity="0.35"/><stop offset="100%" style="stop-color:var(--color-accent)" stop-opacity="0"/></linearGradient></defs><g style="stroke:var(--trend-grid)" stroke-width="0.5">${grid}</g>${empty ? `<text x="${W / 2}" y="${H / 2}" text-anchor="middle" dominant-baseline="middle" style="fill:var(--color-fg-subtle)" font-size="11">No data for this period</text>` : `<path d="${s.line}" fill="none" style="stroke:var(--color-accent)" stroke-opacity="0.3" stroke-width="1"/><path d="${u.area}" fill="url(#${gid})"/><path d="${u.line}" fill="none" style="stroke:var(--color-accent)" stroke-width="1.75" stroke-linejoin="round" stroke-linecap="round"/>`}</svg>`,
    }),
    h("figcaption", { class: "web-cap" }, [
      h("span", {}, webDay(first)),
      h("span", { class: "row gap3" }, [
        h("span", { class: "row gap15" }, [h("span", { class: "web-dot" }), "Users"]),
        h("span", { class: "row gap15" }, [h("span", { class: "web-dash" }), "Sessions"]),
      ]),
      h("span", {}, webDay(last)),
    ]),
  ]);
}
function webBarList(items) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return h(
    "ul",
    { class: "web-bars" },
    items.map((it) =>
      h("li", {}, [
        h("span", { class: "web-bar-label" }, it.label),
        h(
          "span",
          { class: "web-bar-track" },
          h("span", {
            class: "web-bar-fill",
            style: `width:${it.value > 0 ? Math.max(4, (it.value / max) * 100) : 0}%`,
          }),
        ),
        h("span", { class: "web-bar-val" }, webNf.format(it.value)),
      ]),
    ),
  );
}
const countryLabel = (c) => `${webFlag(c.countryCode)} ${c.country}`;

// The maps: outlines from maps.js; lit shapes glow in the accent, brighter where there are more visitors.
const GA_TO_ATLAS = {
  "united states": "United States of America",
  türkiye: "Turkey",
  turkiye: "Turkey",
  "myanmar (burma)": "Myanmar",
  "congo - kinshasa": "Dem. Rep. Congo",
  "congo - brazzaville": "Congo",
  "bosnia & herzegovina": "Bosnia and Herz.",
  "north macedonia": "Macedonia",
  "south sudan": "S. Sudan",
  "dominican republic": "Dominican Rep.",
};
const mapNorm = (s) => String(s).toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, " ").trim();
function visitorMap(viewBox, paths, values, glowDev, strokeW, unmatched, caption) {
  const max = Math.max(1, ...values.values());
  const shapes = paths.map(([id, name, d]) => {
    const v = values.get(mapNorm(name)) || 0;
    return { id, name, d, v, i: v > 0 ? Math.sqrt(v / max) : 0 };
  });
  const lit = shapes.filter((s) => s.i > 0),
    fid = `glow-${++gidSeq}`;
  const svg =
    `<svg viewBox="${viewBox}" class="web-svg" role="img" aria-label="${esc(caption)}" preserveAspectRatio="xMidYMid meet"><defs><filter id="${fid}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${glowDev}"/></filter></defs>` +
    `<g style="stroke:var(--map-stroke)" stroke-width="${strokeW}">${shapes.map((s) => `<path d="${s.d}" style="fill:var(--map-base)"/>`).join("")}</g>` +
    `<g filter="url(#${fid})" aria-hidden="true">${lit.map((s) => `<path d="${s.d}" style="fill:var(--color-accent)" fill-opacity="${(0.12 + s.i * 0.5).toFixed(3)}"/>`).join("")}</g>` +
    `<g style="stroke:var(--color-accent)" stroke-opacity="0.35" stroke-width="${strokeW}">${lit.map((s) => `<path d="${s.d}" style="fill:var(--color-accent)" fill-opacity="${(0.22 + s.i * 0.72).toFixed(3)}"><title>${esc(s.name)} — ${webNf.format(s.v)} visitors</title></path>`).join("")}</g></svg>`;
  return { el: h("div", { html: svg }), lit };
}
function mapLegend(extra) {
  return h("figcaption", { class: "web-legend" }, [
    h("div", { class: "row gap2 tiny-sub" }, [
      h("span", {}, "Fewer"),
      h("span", { class: "web-ramp", "aria-hidden": "true" }),
      h("span", {}, "More visitors"),
    ]),
    extra,
  ]);
}
function worldMap(countries) {
  const atlas = new Set(WORLD_COUNTRY_PATHS.map(([, n]) => mapNorm(n)));
  const by = new Map(),
    unmatched = [];
  for (const c of countries) {
    const k = mapNorm(GA_TO_ATLAS[mapNorm(c.country)] || c.country);
    if (atlas.has(k)) by.set(k, (by.get(k) || 0) + c.activeUsers);
    else unmatched.push(c);
  }
  const top = [...countries].sort((a, b) => b.activeUsers - a.activeUsers).slice(0, 5);
  const m = visitorMap(
    "0 0 960 500",
    WORLD_COUNTRY_PATHS,
    by,
    3.5,
    0.4,
    unmatched,
    top.length
      ? `World visitor map. Busiest: ${top.map((c) => `${c.country} ${webNf.format(c.activeUsers)}`).join(", ")}.`
      : "World visitor map. No visitor data yet.",
  );
  const lost = unmatched.reduce((s, u) => s + u.activeUsers, 0);
  return h("figure", { class: "m0" }, [
    m.el,
    mapLegend(
      lost > 0
        ? h("span", { class: "tiny-sub" }, `+${webNf.format(lost)} in small territories not shown at this scale`)
        : null,
    ),
  ]);
}
function usMap(regions) {
  const by = new Map(regions.map((r) => [mapNorm(r.region), r.activeUsers]));
  const top = [...regions].sort((a, b) => b.activeUsers - a.activeUsers).slice(0, 3);
  const m = visitorMap(
    "0 0 975 610",
    US_STATE_PATHS,
    by,
    5,
    0.6,
    [],
    top.length
      ? `United States visitor map. Busiest: ${top.map((r) => `${r.region} ${webNf.format(r.activeUsers)}`).join(", ")}.`
      : "United States visitor map. No visitor data yet.",
  );
  return h("figure", { class: "m0" }, [
    m.el,
    mapLegend(
      top.length
        ? h(
            "div",
            { class: "row gap3 wrap web-top-states" },
            top.map((r) =>
              h("span", { class: "row gap15" }, [
                h("span", { class: "web-dot sm" }),
                h("span", { class: "muted" }, r.region),
                h("span", { class: "num" }, webNf.format(r.activeUsers)),
              ]),
            ),
          )
        : null,
    ),
  ]);
}

function webEmpty(ic, title, desc) {
  return h(
    "div",
    { class: "dash-container" },
    h("div", { class: "empty glass rounded-xl" }, [
      h("div", { html: lineIcon(ic) }),
      h("p", { class: "empty-title" }, title),
      h("p", { class: "empty-desc", html: desc }),
      h("a", { href: "#/settings/web", class: "btn-accent-outline mt2" }, [
        svgIcon("plug", "accent"),
        "Connect your site",
      ]),
    ]),
  );
}
function webHeader(tab) {
  const snap = webSnap(),
    domain = (snap && snap.siteDomain) || (settings().web || {}).siteDomain || "Your website";
  return h(
    "div",
    { class: "module-head" },
    h("div", { class: "dash-gutter" }, [
      h("div", { class: "module-head-inner" }, [
        h("div", {}, [
          h("p", { class: "eyebrow" }, "Web"),
          h("h1", {}, "Web & Analytics"),
          h("p", { class: "lede" }, domain),
        ]),
        snap ? h("span", { class: "tiny-sub num web-asof" }, `as of ${webAsOf(snap.capturedAt)}`) : null,
      ]),
      h(
        "nav",
        { class: "tabs", "aria-label": "Web & Analytics sections" },
        WEB_TABS.map(([k, l]) =>
          h(
            "a",
            { class: "tab", href: `#/web${k ? "/" + k : ""}`, "aria-current": (tab || "") === k ? "page" : null },
            l,
          ),
        ),
      ),
    ]),
  );
}
function renderWebOverview() {
  const snap = webSnap();
  if (!snap)
    return webEmpty(
      "globe",
      "No analytics yet",
      "Once your Google Analytics property is connected and you pull your numbers, your traffic, geography and search visibility show up here.",
    );
  const r = webRange(),
    rd = snap.ranges[r],
    label = WEB_RANGE_LABELS[r];
  const topC = [...snap.countries]
    .sort((a, b) => b.activeUsers - a.activeUsers)
    .slice(0, 5)
    .map((c) => ({ label: countryLabel(c), value: c.activeUsers }));
  const s = snap.search;
  const best =
    s && s.queries.length
      ? (() => {
          const b = [...s.queries].sort((a, c) => a.position - c.position)[0];
          return `${b.query} (#${b.position.toFixed(0)})`;
        })()
      : "—";
  const stat = (l, v) => h("div", {}, [h("p", { class: "tiny-sub" }, l), h("p", { class: "web-stat-sm" }, v)]);
  return h("div", { class: "dash-container space-y-6" }, [
    h("div", { class: "list-head" }, [h("p", { class: "lede m0" }, `Last ${label}`), webRangeToggle("/web")]),
    webStatTiles(rd, label),
    webPanel(
      "Visitors over time",
      "trend",
      webLink("#/web/traffic", "Traffic"),
      h("div", { class: "web-pad" }, webTrend(rd.trend)),
    ),
    h("div", { class: "web-two" }, [
      webPanel("Top countries", "globe", webLink("#/web/geography", "Geography"), webBarList(topC)),
      webPanel(
        "Top pages",
        "barChart2",
        webLink("#/web/pages", "Pages"),
        h(
          "ul",
          {},
          snap.topPages
            .slice(0, 5)
            .map((p) =>
              h(
                "li",
                { class: "row-li" },
                h("div", { class: "web-row" }, [
                  h("span", { class: "web-row-title" }, p.title || p.path),
                  h("span", { class: "num muted" }, webNf.format(p.views)),
                ]),
              ),
            ),
        ),
      ),
    ]),
    s
      ? webPanel(
          "Search visibility",
          "search",
          webLink("#/web/search", "Search"),
          h("div", { class: "web-stats-row" }, [
            stat("Impressions", webNf.format(s.totalImpressions)),
            stat("Clicks", webNf.format(s.totalClicks)),
            stat("Avg position", s.avgPosition.toFixed(1)),
            stat("Best query", best),
          ]),
        )
      : null,
  ]);
}
function renderWebTraffic() {
  const snap = webSnap();
  if (!snap)
    return webEmpty("trend", "No traffic data yet", "Connect your Google Analytics property to see traffic over time.");
  const r = webRange(),
    rd = snap.ranges[r];
  return h("div", { class: "dash-container space-y-6" }, [
    h("div", { class: "list-head" }, [
      h("p", { class: "lede m0" }, `Traffic over the last ${WEB_RANGE_LABELS[r]}`),
      webRangeToggle("/web/traffic"),
    ]),
    webPanel(
      "Visitors over time",
      "trend",
      `${rd.trend.length} days`,
      h("div", { class: "web-pad" }, webTrend(rd.trend)),
    ),
    webPanel(
      "Traffic sources",
      "send",
      "recent",
      webBarList(
        [...snap.sources].sort((a, b) => b.sessions - a.sessions).map((s) => ({ label: s.channel, value: s.sessions })),
      ),
    ),
    h("p", { class: "tiny-sub row gap15" }, [
      svgIcon("globe"),
      "Geography and per-page detail are on their own tabs. Tiles and the trend use the selected range; sources are the last 30 days.",
    ]),
  ]);
}
function renderWebPages() {
  const snap = webSnap();
  if (!snap || !snap.topPages.length)
    return webEmpty(
      "barChart2",
      "No page data yet",
      "Connect your Google Analytics property to see your most-visited pages.",
    );
  const max = Math.max(...snap.topPages.map((p) => p.views), 1);
  return h(
    "div",
    { class: "dash-container" },
    webPanel(
      "Top pages",
      "barChart2",
      `${snap.topPages.length} pages · last 30 days`,
      h(
        "ul",
        {},
        snap.topPages.map((p) =>
          h(
            "li",
            { class: "row-li" },
            h("div", { class: "web-row tall" }, [
              h("div", { class: "min0 flex1" }, [
                h("p", { class: "web-row-title" }, p.title || p.path),
                h("p", { class: "tiny-sub truncate" }, p.path),
              ]),
              h(
                "span",
                { class: "web-bar-track fixed" },
                h("span", { class: "web-bar-fill", style: `width:${Math.max(4, (p.views / max) * 100)}%` }),
              ),
              h("span", { class: "web-bar-val w16" }, webNf.format(p.views)),
            ]),
          ),
        ),
      ),
    ),
  );
}
function renderWebSearch() {
  const snap = webSnap(),
    s = snap && snap.search;
  if (!s)
    return webEmpty(
      "search",
      "Search Console not connected",
      snap && snap.searchNote
        ? esc(snap.searchNote)
        : "Connect Google Search Console for your site to see the searches you show up for, how often, and where you rank.",
    );
  return h("div", { class: "dash-container space-y-6" }, [
    h(
      "div",
      { class: "stat-grid" },
      [
        ["Clicks", webNf.format(s.totalClicks)],
        ["Impressions", webNf.format(s.totalImpressions)],
        ["Avg CTR", webPct(s.avgCtr)],
        ["Avg position", s.avgPosition.toFixed(1)],
      ].map(([l, v]) =>
        h("div", { class: "glass rounded-xl web-tile" }, [
          h("p", { class: "stat-label muted" }, l),
          h("p", { class: "web-tile-v" }, v),
        ]),
      ),
    ),
    webPanel(
      "Top search queries",
      "search",
      `${webNf.format(s.totalImpressions)} impressions`,
      h("div", {}, [
        h(
          "div",
          { class: "table-wrap" },
          h("table", { class: "web-table" }, [
            h(
              "thead",
              {},
              h("tr", {}, [
                h("th", {}, "Query"),
                h("th", { class: "right" }, "Clicks"),
                h("th", { class: "right" }, "Impr."),
                h("th", { class: "right" }, "CTR"),
                h("th", { class: "right" }, "Pos."),
              ]),
            ),
            h(
              "tbody",
              {},
              s.queries.map((q) =>
                h("tr", {}, [
                  h("td", { class: "fg b" }, q.query),
                  h("td", { class: "right num accent" }, webNf.format(q.clicks)),
                  h("td", { class: "right num" }, webNf.format(q.impressions)),
                  h("td", { class: "right num" }, webPct(q.ctr)),
                  h("td", { class: "right num" }, q.position.toFixed(1)),
                ]),
              ),
            ),
          ]),
        ),
        h(
          "p",
          { class: "web-foot" },
          `The last 30 days (Search Console runs about 3 days behind). Low-volume searches can show 0 clicks because Search Console hides rare clicked queries, so impressions and position are the signal there.`,
        ),
      ]),
    ),
  ]);
}
function renderWebGeography() {
  const snap = webSnap();
  if (!snap)
    return webEmpty(
      "globe",
      "No geography data yet",
      "Connect your Google Analytics property to see where your visitors are.",
    );
  const lit = snap.usRegions.filter((r) => r.activeUsers > 0).length;
  return h("div", { class: "dash-container space-y-6" }, [
    webPanel(
      "Where your visitors are",
      "globe",
      `${snap.countries.length} countries`,
      h("div", { class: "web-pad" }, worldMap(snap.countries)),
    ),
    h("div", { class: "web-two" }, [
      webPanel(
        "Inside the United States",
        "route",
        `${lit} states`,
        h("div", { class: "web-pad" }, [
          usMap(snap.usRegions),
          h(
            "p",
            { class: "tiny-sub mt3" },
            "Datacenter and bot traffic (AWS and Google server towns) is filtered out so the map shows real visitors.",
          ),
        ]),
      ),
      webPanel(
        "Top countries",
        "globe",
        `${snap.countries.length} total`,
        webBarList(
          [...snap.countries]
            .sort((a, b) => b.activeUsers - a.activeUsers)
            .slice(0, 12)
            .map((c) => ({ label: countryLabel(c), value: c.activeUsers })),
        ),
      ),
    ]),
  ]);
}

const webUi = { test: null, busy: null };
async function webTest() {
  webUi.busy = "test";
  render();
  const r = await api("/api/web/test", {});
  webUi.busy = null;
  webUi.test = r ? r.test : null;
  render();
}
async function webPull() {
  webUi.busy = "pull";
  render();
  const r = await api("/api/web/pull", {});
  webUi.busy = null;
  render();
  if (r) toast("Pulled. Your Web pages now show the latest numbers.");
}
function webGoogleSetup() {
  const snap = webSnap(),
    keys = state.keys || {},
    srv = !!state.server,
    w = settings().web || {};
  const row = (label, value, ok) =>
    h("div", { class: "web-set-row" }, [
      h("span", { class: "set-label" }, label),
      h("span", { class: "row gap2 set-value b" }, [
        ok === undefined ? null : h("span", { class: cls("presence", ok && "on") }),
        value,
      ]),
    ]);
  const has = (k) => srv && !!keys[k];
  const domainIn = fieldInput({ value: w.siteDomain || "", placeholder: "www.yoursite.com", maxlength: "120" });
  const saJson = h("textarea", {
    class: "field mono web-json",
    rows: "4",
    spellcheck: "false",
    autocomplete: "off",
    placeholder: has("GA_SERVICE_ACCOUNT_KEY")
      ? "Saved. Paste a new JSON key to replace it."
      : "Paste the whole .json file Google downloaded",
    readonly: srv ? null : "",
    "aria-label": "Service-account JSON key",
  });
  const propIn = h("input", {
    class: "field mono",
    type: "password",
    autocomplete: "off",
    placeholder: has("GA_PROPERTY_ID") ? "Saved. Type a new one to replace it." : "The number, for example 123456789",
    readonly: srv ? null : "",
    "aria-label": "GA4 property id",
  });
  const gscIn = h("input", {
    class: "field mono",
    type: "password",
    autocomplete: "off",
    placeholder: has("GSC_SITE")
      ? "Saved. Type a new one to replace it."
      : "sc-domain:yoursite.com or https://www.yoursite.com/",
    readonly: srv ? null : "",
    "aria-label": "Search Console property",
  });
  const saveKey = async (name, input, msg) => {
    const v = input.value.trim();
    if (!v) return toast("Paste it first.");
    const r = await api("/api/keys", { name, value: v });
    if (r) {
      toast(msg);
      render();
    }
  };
  const status = (k) =>
    h(
      "span",
      { class: cls("status-pill", has(k) && "ok") },
      srv ? (has(k) ? "saved in .env" : "not saved") : "start the server to check",
    );
  const step = (n, title, body) =>
    h("li", { class: "web-step" }, [
      h("span", { class: "web-step-n" }, n),
      h("div", { class: "min0 flex1" }, [h("p", { class: "set-value b" }, title), ...body]),
    ]);
  const t = webUi.test;
  const testLine = (label, v) =>
    v
      ? h("p", { class: cls("web-test", v === "ok" ? "ok" : "bad") }, [
          svgIcon(v === "ok" ? "checkCircle" : "alertTriangle"),
          h("span", {}, [h("b", {}, label + ": "), v === "ok" ? "connected" : v]),
        ])
      : null;
  return h("div", { class: "space-y-6" }, [
    webPanel(
      "Google Analytics 4 + Search Console",
      "key",
      "about 15 minutes, once",
      h("ol", { class: "web-steps" }, [
        step("1", "Make a Google service account (a robot login that can only read)", [
          h("p", { class: "set-hint" }, [
            "In ",
            h(
              "a",
              {
                class: "accent-link",
                href: "https://console.cloud.google.com/projectcreate",
                target: "_blank",
                rel: "noreferrer",
              },
              "Google Cloud",
            ),
            ", make a project (any name). Turn on the ",
            h(
              "a",
              {
                class: "accent-link",
                href: "https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com",
                target: "_blank",
                rel: "noreferrer",
              },
              "Google Analytics Data API",
            ),
            " and the ",
            h(
              "a",
              {
                class: "accent-link",
                href: "https://console.cloud.google.com/apis/library/searchconsole.googleapis.com",
                target: "_blank",
                rel: "noreferrer",
              },
              "Search Console API",
            ),
            ". Then open ",
            h(
              "a",
              {
                class: "accent-link",
                href: "https://console.cloud.google.com/iam-admin/serviceaccounts",
                target: "_blank",
                rel: "noreferrer",
              },
              "Service accounts",
            ),
            ", create one (no roles needed), open it, go to Keys, Add key, JSON. A .json file downloads.",
          ]),
        ]),
        step("2", "Save the key here", [
          h(
            "p",
            { class: "set-hint" },
            "Open the downloaded file in any text editor, copy all of it, and paste it below. It goes into .env only, and this page never shows it again. Then delete the downloaded file.",
          ),
          saJson,
          h("div", { class: "row gap2 mt2 wrap" }, [
            saveBtn(() => saveKey("GA_SERVICE_ACCOUNT_KEY", saJson, "Service-account key saved to .env."), "Save key"),
            status("GA_SERVICE_ACCOUNT_KEY"),
          ]),
        ]),
        step("3", "Let it read your Google Analytics", [
          h(
            "p",
            { class: "set-hint" },
            "Copy the service account's email (it ends in .iam.gserviceaccount.com; it's in the JSON as client_email). In Google Analytics, open Admin, Property access management, the + button, Add users, paste the email, pick the Viewer role, and add it.",
          ),
        ]),
        step("4", "Your GA4 property id", [
          h(
            "p",
            { class: "set-hint" },
            "In Google Analytics, Admin, Property details: the Property ID is a number like 123456789 (not the G- measurement id).",
          ),
          h("div", { class: "form-grid two mt2" }, [
            propIn,
            saveBtn(() => saveKey("GA_PROPERTY_ID", propIn, "GA4 property id saved to .env.")),
          ]),
          h("div", { class: "mt2" }, status("GA_PROPERTY_ID")),
        ]),
        step("5", "Search Console (optional, for the Search tab)", [
          h("p", { class: "set-hint" }, [
            "In ",
            h(
              "a",
              {
                class: "accent-link",
                href: "https://search.google.com/search-console",
                target: "_blank",
                rel: "noreferrer",
              },
              "Search Console",
            ),
            ", open your property, Settings, Users and permissions, Add user, paste the same email, permission Restricted (read-only). Then write the property below exactly as Search Console shows it.",
          ]),
          h("div", { class: "form-grid two mt2" }, [
            gscIn,
            saveBtn(() => saveKey("GSC_SITE", gscIn, "Search Console property saved to .env.")),
          ]),
          h("div", { class: "mt2" }, status("GSC_SITE")),
        ]),
        step("6", "The name of your site", [
          h(
            "p",
            { class: "set-hint" },
            "What the Web pages show at the top. Not secret, so it's saved in command-center/settings.json.",
          ),
          h("div", { class: "form-grid two mt2" }, [
            domainIn,
            saveBtn(() => saveSettings({ web: { ...w, siteDomain: domainIn.value.trim() } }, "Site name saved.")),
          ]),
        ]),
        step("7", "Test it, then pull", [
          h(
            "p",
            { class: "set-hint" },
            'Test checks each piece and tells you which one is wrong. Pull reads the last 90 days, read-only, and saves them to command-center/data/web.json on this computer (it\'s skipped by every save). Pull again whenever you want fresh numbers, or say "pull my website numbers" to your AI.',
          ),
          h("div", { class: "row gap2 mt2 wrap" }, [
            h(
              "button",
              { type: "button", class: "btn-outline", disabled: srv && !webUi.busy ? null : "", onclick: webTest },
              [svgIcon("plug"), webUi.busy === "test" ? "Testing…" : "Test connection"],
            ),
            h(
              "button",
              { type: "button", class: "btn-primary", disabled: srv && !webUi.busy ? null : "", onclick: webPull },
              [svgIcon("activity"), webUi.busy === "pull" ? "Pulling…" : "Pull now"],
            ),
          ]),
          t
            ? h("div", { class: "mt3" }, [
                testLine("Google Analytics", t.analytics),
                testLine("Search Console", t.search),
              ])
            : null,
          !srv
            ? h("p", { class: "set-hint mt2" }, [
                "Or from the terminal: ",
                h("code", {}, "python3 tools/pull_web.py --test"),
                " then ",
                h("code", {}, "python3 tools/pull_web.py"),
                ".",
              ])
            : null,
        ]),
      ]),
    ),
  ]);
}
// Every web tool's state in one list: Google Analytics and Search Console pull today; Clarity, Bing and the
// "other" slot are set up here so their keys are waiting when a pull for them exists, and say so.
const WEB_TOOLS = [
  { id: "ga4", name: "Google Analytics 4", keys: ["GA_SERVICE_ACCOUNT_KEY", "GA_PROPERTY_ID"], pulls: true },
  { id: "gsc", name: "Google Search Console", keys: ["GA_SERVICE_ACCOUNT_KEY", "GSC_SITE"], pulls: true },
  { id: "clarity", name: "Microsoft Clarity", keys: ["CLARITY_PROJECT_ID", "CLARITY_API_TOKEN"] },
  { id: "bing", name: "Bing Webmaster Tools", keys: ["BING_SITE_URL", "BING_WEBMASTER_API_KEY"] },
  { id: "otherweb", name: "Other", keys: ["OTHER_ANALYTICS_API_KEY"] },
];
function webToolState(t) {
  const snap = webSnap(),
    keys = state.keys || {},
    srv = !!state.server;
  if (t.id === "ga4" && snap) return ["Connected, pulling", true];
  if (t.id === "gsc" && snap && snap.search) return ["Connected, pulling", true];
  if (!srv) return ["start the server to check", false];
  const set = t.keys.filter((k) => keys[k]).length;
  if (!set) return ["Not connected", false];
  if (set < t.keys.length) return [`${set} of ${t.keys.length} saved`, false];
  return [t.pulls ? "Saved, not pulled yet" : "Set up, not pulled yet", false];
}
function webConnectionsList() {
  const other = ((settings().web || {}).otherName || "").trim();
  return h(
    "div",
    {},
    WEB_TOOLS.map((t) => {
      const [label, on] = webToolState(t);
      return h("div", { class: "web-set-row" }, [
        h("span", { class: "set-label" }, t.id === "otherweb" && other ? `Other: ${other}` : t.name),
        h("span", { class: "row gap2 set-value b" }, [h("span", { class: cls("presence", on && "on") }), label]),
      ]);
    }),
  );
}
function renderWebSettings() {
  const snap = webSnap(),
    w = settings().web || {},
    keys = state.keys || {};
  const row = (label, value) =>
    h("div", { class: "web-set-row" }, [
      h("span", { class: "set-label" }, label),
      h("span", { class: "row gap2 set-value b" }, value),
    ]);
  return h("div", { class: "dash-container space-y-6 web-settings" }, [
    webPanel(
      "Property & site",
      "settings",
      null,
      h("div", {}, [
        row("Site", (snap && snap.siteDomain) || w.siteDomain || "—"),
        row("GA4 property", (snap && snap.propertyId) || (state.server && keys.GA_PROPERTY_ID ? "saved" : "—")),
        row("Data as of", snap ? webAsOf(snap.capturedAt) : "—"),
      ]),
    ),
    webPanel(
      "Connections",
      "plug",
      null,
      h("div", {}, [
        webConnectionsList(),
        h("div", { class: "row wrap gap3 mt4" }, [
          h("a", { href: "#/settings/web", class: "btn-primary" }, [svgIcon("plug"), "Manage connections"]),
          h("span", { class: "tiny-sub" }, "Every web tool is connected in one place: Settings → Web connections."),
        ]),
      ]),
    ),
    webPanel(
      "Display",
      "settings",
      null,
      h("div", {}, [
        row("Default range", "Last 30 days"),
        row("Datacenter/bot filtering", "On"),
        row("Windows end", "Yesterday (today is still filling in)"),
      ]),
    ),
  ]);
}
// ---------- Landing Pages: every page the Website Team built, the pages under each one, grouped by offer ----------
const PAGE_KIND_LABEL = {
  landing: "Landing page",
  product: "Product page",
  form: "Form",
  "thank-you": "Thank-you",
  upsell: "Upsell",
  other: "Page",
};
const openPages = new Set();
function pageVisits(p, snap) {
  if (!snap || !p.route) return null;
  const site = (snap.siteDomain || "").replace(/^www\./, ""),
    dom = (p.domain || "").replace(/^www\./, "");
  if (dom && site && dom !== site) return null; // another domain: this site's GA property doesn't see it
  const hit = (snap.topPages || []).find(
    (t) => t.path === p.route || t.path === p.route.replace(/\/$/, "") || t.path === p.route + "/",
  );
  return hit ? hit.views : null; // not in the pull's top pages: unknown, never shown as 0
}
function offerLabel(path) {
  if (!path) return "No offer named";
  return path
    .replace(/^brand\/offers\//, "")
    .replace(/\.md$/, "")
    .replace(/^brand\/offer$/, "Main offer");
}
function renderLandingPages() {
  const reg = (window.CC_DATA && window.CC_DATA.landingPages) || { pages: [] },
    all = (state.landingPages || reg).pages || [],
    snap = webSnap();
  if (!all.length)
    return h(
      "div",
      { class: "dash-container" },
      h("div", { class: "empty glass rounded-xl" }, [
        h("div", { html: lineIcon("layoutGrid") }),
        h("p", { class: "empty-title" }, "No landing pages yet"),
        h("p", {
          class: "empty-desc",
          html: "Your Website Team lists every page it builds here, with the pages under it: forms, thank-you pages, upsells and product pages, on any domain. The Website Team lesson builds that team; then ask it to <b>build my landing page</b>. The list lives in <code>knowledge/landing-pages.json</code>.",
        }),
        h("a", { href: "#/agent-teams", class: "btn-accent-outline mt2" }, [
          svgIcon("users", "accent"),
          "See your teams",
        ]),
      ]),
    );
  const kids = (id) => all.filter((p) => p.parent === id);
  const under = (id) => kids(id).reduce((n, c) => n + 1 + under(c.id), 0); // every page below, at any depth
  const tops = all.filter((p) => !p.parent);
  const groups = {};
  for (const p of tops) (groups[p.offer || ""] = groups[p.offer || ""] || []).push(p);
  const domains = new Set(all.map((p) => p.domain).filter(Boolean));
  const views = (p) => {
    const v = pageVisits(p, snap);
    return v === null ? h("span", { class: "muted-sub" }, "—") : h("span", { class: "num fg" }, webNf.format(v));
  };
  const pill = (p) => h("span", { class: cls("status-pill", p.status === "live" && "ok") }, p.status);
  const where = (p) =>
    h("span", { class: "tiny-sub truncate" }, p.url || [p.domain, p.route].filter(Boolean).join("") || p.file || "—");
  const row = (p, depth) => {
    const sub = kids(p.id),
      open = openPages.has(p.id);
    const toggle = sub.length
      ? h(
          "button",
          {
            type: "button",
            class: cls("lp-toggle", open && "open"),
            "aria-expanded": open ? "true" : "false",
            onclick: () => {
              open ? openPages.delete(p.id) : openPages.add(p.id);
              render();
            },
          },
          [
            h("span", { class: "lp-caret", html: lineIcon("chevronRight") }),
            `${sub.length} sub-page${sub.length === 1 ? "" : "s"}`,
          ],
        )
      : h("span", { class: "tiny-sub" }, depth ? "" : "no sub-pages");
    return [
      h("div", { class: cls("lp-row", depth && "sub") }, [
        h("div", { class: "min0 lp-main" }, [
          h("div", { class: "row wrap gap2 min0" }, [
            h("span", { class: "b fg lp-title" }, p.title),
            h("span", { class: "chip" }, PAGE_KIND_LABEL[p.kind] || "Page"),
            pill(p),
          ]),
          h("div", { class: "row gap2 min0 mt1" }, [
            where(p),
            p.domain && depth && p.domain !== (all.find((x) => x.id === p.parent) || {}).domain
              ? h("span", { class: "chip dashed" }, "other domain")
              : null,
          ]),
          p.purpose ? h("p", { class: "tiny-sub mt1 m0" }, p.purpose) : null,
          depth && p.offer && p.offer !== (all.find((x) => x.id === p.parent) || {}).offer
            ? h("p", { class: "tiny-sub mt1 m0" }, ["Sells: ", h("span", { class: "fg" }, offerLabel(p.offer))])
            : null,
        ]),
        h(
          "div",
          {
            class: "lp-views",
            title:
              pageVisits(p, snap) === null
                ? snap
                  ? "Not in your Google Analytics top pages, or on another domain"
                  : "Connect Google Analytics to see views"
                : null,
          },
          [views(p), h("span", { class: "tiny-sub" }, "views, 30d")],
        ),
        h("div", { class: "lp-side" }, toggle),
      ]),
      ...(open ? sub.flatMap((c) => row(c, depth + 1)) : []),
    ];
  };
  return h("div", { class: "dash-container space-y-6" }, [
    h(
      "div",
      { class: "web-kpis lp-kpis" },
      [
        ["Landing pages", tops.length],
        ["Pages under them", all.length - tops.length],
        ["Live", all.filter((p) => p.status === "live").length],
        ["Domains", domains.size || "—"],
      ].map(([l, v]) =>
        h("div", { class: "glass rounded-xl lp-kpi" }, [
          h("p", { class: "tiny-sub" }, l),
          h("p", { class: "web-stat-sm" }, String(v)),
        ]),
      ),
    ),
    ...Object.entries(groups).map(([offer, list]) =>
      webPanel(
        offerLabel(offer),
        "layers",
        `${list.length} landing page${list.length === 1 ? "" : "s"} · ${list.reduce((n, p) => n + under(p.id), 0)} under them`,
        h(
          "div",
          { class: "lp-list" },
          list.flatMap((p) => row(p, 0)),
        ),
      ),
    ),
    h("p", { class: "tiny-sub" }, [
      "From ",
      h("code", {}, "knowledge/landing-pages.json"),
      ", which the Website Team's build-a-page and ship-a-page keep up to date. ",
      snap
        ? "Views are from your last Google Analytics pull, matched by each page's route."
        : "Connect Google Analytics in Settings → Web connections to see views.",
    ]),
  ]);
}
function renderWeb(parts) {
  const tab = parts[1] || "";
  const body =
    tab === "traffic"
      ? renderWebTraffic()
      : tab === "geography"
        ? renderWebGeography()
        : tab === "pages"
          ? renderWebPages()
          : tab === "search"
            ? renderWebSearch()
            : tab === "settings"
              ? renderWebSettings()
              : tab === "landing"
                ? renderLandingPages()
                : tab
                  ? notFound("That Web page doesn't exist")
                  : renderWebOverview();
  return [webHeader(tab), body];
}
