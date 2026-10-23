const $ = (sel, root = document) => root.querySelector(sel);
const app = $("#app");
const DASH = "—";
const AREA_LABEL = {
  content: "Content", proposals: "Proposals", reactivation: "Reactivation", web: "Web",
  notion: "Notion", reviews: "Reviews", agency: "Agency", community: "Community", email: "Email",
  marketing: "Marketing", operations: "Operations", sales: "Sales"
};
const DEPARTMENT_LABEL = {
  sales: "Sales", marketing: "Marketing", operations: "Operations", engineering: "IT / Systems",
  finance: "Finance", customer_support: "Customer Support", it_systems: "IT / Systems",
  legal: "Legal", people_hr: "People / HR", product: "Product"
};
const BUILD_STATUS_LABEL = { planning: "Planning", building: "Building", active: "Active", archived: "Archived" };
const ICONS = {
  waypoints: '<path d="M12 2v6"/><path d="M12 16v6"/><circle cx="12" cy="12" r="3"/><path d="m5 8 3 3"/><path d="m16 13 3 3"/>',
  power: '<path d="M12 3v9"/><path d="M6.6 6.6a8 8 0 1 0 10.8 0"/>',
  activity: '<path d="M3 12h4l3 8 4-16 3 8h4"/>',
  alert: '<path d="M12 3 2 20h20L12 3z"/><path d="M12 9v5"/><path d="M12 17h.01"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M9 2h6"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 5.5a3 3 0 0 1 0 5"/><path d="M18 20a5.5 5.5 0 0 0-3-4.5"/>',
  terminal: '<path d="m7 8 4 4-4 4"/><path d="M13 16h4"/><rect x="3" y="4" width="18" height="16" rx="2"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  sparkle: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  zap: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>',
  webhook: '<path d="M6 10a6 6 0 1 1 10 4"/><path d="M9 21a6 6 0 0 1-3-11"/><path d="M15 21a6 6 0 0 0 3-11"/>',
  form: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8"/><path d="M8 12h8"/><path d="M8 16h4"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.5 2.5 4.5-5"/>',
  db: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  bell: '<path d="M18 9a6 6 0 1 0-12 0c0 6-3 7-3 7h18s-3-1-3-7"/><path d="M10.3 20a2 2 0 0 0 3.4 0"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  route: '<path d="M4 6h6a4 4 0 0 1 4 4v8"/><path d="M14 10a4 4 0 0 1 4-4h2"/><path d="m18 4 2 2-2 2"/><path d="m12 16 2 2 2-2"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  send: '<path d="m22 2-7 20-4-9-9-4 20-7z"/>',
  notion: '<rect x="5" y="4" width="14" height="16" rx="2"/><path d="M9 8h6"/><path d="M9 16V8l6 8V8"/>',
  browser: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/>',
  log: '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>',
  trend: '<path d="m3 17 6-6 4 4 7-8"/><path d="M14 7h6v6"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'
};
const icon = (name, cls = "") => `<svg viewBox="0 0 24 24" class="${cls}" aria-hidden="true">${ICONS[name] || ICONS.zap}</svg>`;

const state = { automations: [], teams: [], executions: [], route: {}, flow: { zoom: 1, pan: { x: 0, y: 0 } } };

function h(tag, attrs = {}, children = []) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === "class") n.className = v;
    else if (k === "html") n.innerHTML = v;
    else if (k.startsWith("on")) n.addEventListener(k.slice(2).toLowerCase(), v);
    else n.setAttribute(k, String(v));
  }
  for (const c of [].concat(children)) {
    if (c == null || c === false) continue;
    n.append(c?.nodeType ? c : document.createTextNode(String(c)));
  }
  return n;
}
const labelArea = (x) => AREA_LABEL[x] || titleCase(x || "");
const labelDept = (x) => { const t = (state.teams || []).find((s) => s.department === x && s.departmentName); return (t && t.departmentName) || DEPARTMENT_LABEL[x] || titleCase((x || "").replaceAll("_", " ").replaceAll("-", " ")); };
const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
const titleCase = (s) => String(s || "").replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase());
const slug = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
const fmtRunMs = (ms) => ms == null || Number.isNaN(ms) ? null : ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(2)}s`;
const rel = (iso) => {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return null;
  const sec = Math.round((Date.now() - then) / 1000);
  if (sec < 45) return "just now";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  return day < 7 ? `${day}d ago` : new Date(then).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};
const started = (iso) => new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const triggerSummary = (t) => !t ? "Trigger" : t.type === "cron" ? `Schedule · ${t.schedule}` : t.type === "webhook" ? `Webhook · ${t.path}` : `On event · ${t.source}`;
const lastRunVerb = (s) => ({ success: "Ran", error: "Failed", skipped: "Skipped", running: "Running" }[s] || null);

function moduleShell(active, child) {
  return [
    h("div", { class: "module-head" }, [
      h("div", { class: "dash-gutter" }, [
        h("div", { class: "module-head-inner" }, [
          h("div", {}, [
            h("p", { class: "eyebrow" }, "Dashboard"),
            h("h1", {}, "Automations"),
            h("p", { class: "lede" }, "Every agent team you can summon, and every scheduled or event-driven job the Command Center runs.")
          ])
        ]),
        h("nav", { class: "tabs", "aria-label": "Automations sections" }, [
          tab("/agent-teams", "Agent Teams", active === "agent-teams"),
          tab("/automations", "Automations", active === "automations"),
          tab("/executions", "Executions", active === "executions")
        ])
      ])
    ]),
    child
  ];
}
function tab(path, label, active) {
  return h("a", { class: "tab", href: `#${path}`, "aria-current": active ? "page" : null }, label);
}
function chip(text, cls = "") { return h("span", { class: `chip ${cls}`.trim() }, text); }
function statusChip(active) {
  return h("span", { class: `chip status-chip ${active ? "active" : ""}` }, [h("span", { class: "status-dot" }), active ? "Active" : "Paused"]);
}
function buildStatusChip(status) {
  return h("span", { class: `chip status-chip ${status === "active" ? "active" : ""}` }, [h("span", { class: "status-dot" }), BUILD_STATUS_LABEL[status] || titleCase(status)]);
}
function commandPill(command) { return chip(command || "no command yet", `mono ${command ? "" : "dashed"}`); }
function statTile(iconName, label, value, sub, warn = false) {
  return h("div", { class: "stat-tile glass rounded-xl" }, [
    h("div", { class: "stat-top" }, [h("span", { class: "stat-icon", html: icon(iconName) }), h("span", { class: "stat-label" }, label)]),
    h("p", { class: `stat-value ${value === DASH ? "muted" : warn ? "warn" : ""}` }, String(value)),
    h("p", { class: "stat-sub" }, sub)
  ]);
}
function emptyState(iconName, title, desc) {
  return h("div", { class: "empty glass rounded-xl" }, [
    h("div", { html: icon(iconName) }),
    h("p", { class: "empty-title" }, title),
    h("p", { class: "empty-desc", html: desc })
  ]);
}
function arrow() { return h("span", { class: "chev", html: icon("chevron") }); }

function renderAutomations() {
  const area = state.route.query.get("area");
  const list = state.automations;
  if (!list.length) return moduleShell("automations", h("div", { class: "dash-container" }, emptyState("waypoints", "No automations registered", "Add a routine in <code>routines/</code>, run <code>python3 tools/sync.py</code>, and it shows up here.")));
  const areas = [...new Set(list.map((a) => a.area).filter(Boolean))];
  const shown = area ? list.filter((a) => a.area === area) : list;
  const total = list.length;
  const active = list.filter((a) => a.active).length;
  const runBacked = list.filter((a) => a.stats?.runCount != null);
  const totalRuns = runBacked.length ? runBacked.reduce((s, a) => s + a.stats.runCount, 0) : null;
  const failBacked = list.filter((a) => a.stats?.failureCount != null);
  const fails = failBacked.length ? failBacked.reduce((s, a) => s + a.stats.failureCount, 0) : null;
  const avgBacked = list.filter((a) => a.stats?.avgRunMs != null);
  let avg = null;
  if (avgBacked.length) {
    const w = avgBacked.reduce((s, a) => s + (a.stats.runCount ?? 1), 0);
    avg = w ? avgBacked.reduce((s, a) => s + a.stats.avgRunMs * (a.stats.runCount ?? 1), 0) / w : null;
  }
  const avgLabel = fmtRunMs(avg);
  const jobs = (n) => `Across ${n} logged job${n === 1 ? "" : "s"}`;
  return moduleShell("automations", h("div", { class: "dash-container space-y-6" }, [
    h("div", { class: `stat-grid ${avgLabel ? "five" : ""}` }, [
      statTile("waypoints", "Automations", total, "Registered jobs"),
      statTile("power", "Active", active, `${total - active} paused`),
      statTile("activity", "Total runs", totalRuns ?? DASH, totalRuns == null ? "Awaiting run log" : runBacked.length === total ? "All time" : jobs(runBacked.length)),
      statTile("alert", "Failures", fails ?? DASH, fails == null ? "Awaiting run log" : failBacked.length === total ? "All time" : jobs(failBacked.length), (fails ?? 0) > 0),
      avgLabel ? statTile("timer", "Avg run time", avgLabel, "Per run") : null
    ].filter(Boolean)),
    h("div", {}, [
      h("div", { class: "list-head" }, [
        h("p", { class: "overline" }, area ? `${labelArea(area)} automations` : "All automations"),
        h("div", { class: "filters" }, [
          filterChip("/automations", `All · ${list.length}`, !area),
          ...areas.map((a) => filterChip(`/automations?area=${encodeURIComponent(a)}`, `${labelArea(a)} · ${list.filter((x) => x.area === a).length}`, area === a))
        ])
      ]),
      h("div", { class: "list-block glass" }, shown.map(automationRow))
    ])
  ]));
}
function filterChip(path, text, active) { return h("a", { class: `chip-link ${active ? "active" : ""}`, href: `#${path}` }, text); }
function automationRow(a) {
  const st = a.stats || {};
  const when = rel(st.lastRunAt);
  const verb = lastRunVerb(st.lastRunStatus);
  const meta = [h("span", {}, triggerSummary(a.trigger))];
  if (when && verb) meta.push(h("span", { class: "sep" }, "·"), h("span", {}, `${verb} ${when}`));
  else if (when) meta.push(h("span", { class: "sep" }, "·"), h("span", {}, `Last run ${when}`));
  for (const x of st.extras || []) meta.push(h("span", { class: "sep" }, "·"), h("span", { html: `${esc(x.label)} <b>${esc(x.value)}</b>` }));
  return h("a", { class: "item-link", href: `#/automations/${encodeURIComponent(a.id)}` }, [
    h("div", { class: "item-main" }, [
      h("div", { class: "item-title" }, [h("span", { class: "item-name" }, a.name || a.id), chip(labelArea(a.area)), statusChip(!!a.active)]),
      a.description ? h("p", { class: "item-desc" }, a.description) : null,
      h("div", { class: "meta" }, meta)
    ]),
    arrow()
  ].filter(Boolean));
}

function renderTeams() {
  const dept = state.route.query.get("department");
  const list = state.teams;
  if (!list.length) return moduleShell("agent-teams", h("div", { class: "dash-container" }, emptyState("users", "No agent teams registered", "Run <code>python3 tools/sync.py</code> from the top of your repo and every team shows up here.")));
  const depts = [...new Set(list.map((t) => t.department).filter(Boolean))];
  const shown = dept ? list.filter((t) => t.department === dept) : list;
  const seats = list.reduce((s, t) => s + (t.seats || []).length, 0);
  const skills = list.reduce((s, t) => s + (t.skills || []).length, 0);
  const groups = new Map();
  for (const t of shown) groups.set(t.department, [...(groups.get(t.department) || []), t]);
  return moduleShell("agent-teams", h("div", { class: "dash-container space-y-6" }, [
    h("div", { class: "stat-grid" }, [
      statTile("users", "Agent teams", list.length, "Registered here"),
      statTile("terminal", "With a command", list.filter((t) => t.command).length, `${list.filter((t) => !t.command).length} without one`),
      statTile("user", "Team members", seats, "Across all teams"),
      statTile("sparkle", "Skills", skills, "Skills and workflows you can run")
    ]),
    h("div", {}, [
      h("div", { class: "list-head" }, [
        h("p", { class: "overline" }, dept ? `${labelDept(dept)} teams` : "All agent teams"),
        h("div", { class: "filters" }, [
          filterChip("/agent-teams", `All · ${list.length}`, !dept),
          ...depts.map((d) => filterChip(`/agent-teams?department=${encodeURIComponent(d)}`, `${labelDept(d)} · ${list.filter((t) => t.department === d).length}`, dept === d))
        ])
      ]),
      h("div", {}, [...groups.entries()].map(([d, teams]) => h("section", { class: "dept-section" }, [
        h("p", { class: "dept-label" }, labelDept(d)),
        h("div", { class: "list-block glass" }, teams.map(teamRow))
      ])))
    ])
  ]));
}
function teamRow(t) {
  return h("a", { class: "item-link", href: `#/agent-teams/${encodeURIComponent(t.id)}` }, [
    h("div", { class: "item-main" }, [
      h("div", { class: "item-title" }, [h("span", { class: "item-name" }, t.name), commandPill(t.command), chip(labelDept(t.department)), buildStatusChip(t.buildStatus)]),
      h("p", { class: "item-desc" }, t.purpose || ""),
      h("div", { class: "meta" }, [
        h("span", {}, t.teamType || "Team"),
        h("span", { class: "sep" }, "·"),
        h("span", {}, `${(t.seats || []).length} team member${(t.seats || []).length === 1 ? "" : "s"}`),
        h("span", { class: "sep" }, "·"),
        h("span", {}, `${(t.skills || []).length} skill${(t.skills || []).length === 1 ? "" : "s"}`),
        h("span", { class: "sep" }, "·"),
        h("span", {}, hasFlow(t.flow) ? `flow as of ${t.flowAsOf || "unknown"}` : "no flow drawn yet")
      ])
    ]),
    arrow()
  ]);
}

function renderExecutions(rows = state.executions, hideAutomation = false, emptyTitle = "No run history yet") {
  if (!rows.length) return h("div", { class: "glass rounded-xl" }, emptyState("activity", emptyTitle, "Scheduled and event runs appear here as they happen, each with status, start time, detail, and duration."));
  return h("div", { class: "glass rounded-xl table-wrap" }, h("table", {}, [
    h("thead", {}, h("tr", {}, [
      !hideAutomation ? h("th", {}, "Automation") : null,
      h("th", {}, "Status"), h("th", {}, "Started"), h("th", {}, "Detail"), h("th", { class: "right" }, "Run time")
    ].filter(Boolean))),
    h("tbody", {}, rows.map((r) => h("tr", {}, [
      !hideAutomation ? h("td", {}, h("a", { href: `#/automations/${encodeURIComponent(r.automationId)}` }, r.automationName || r.automationId || DASH)) : null,
      h("td", {}, statusBadge(r.status)),
      h("td", {}, r.startedAt ? started(r.startedAt) : DASH),
      h("td", { class: "truncate", title: r.detail || "" }, r.detail || DASH),
      h("td", { class: "right" }, fmtRunMs(r.runMs) || DASH)
    ].filter(Boolean))))
  ]));
}
function statusBadge(status) {
  const cls = status === "success" ? "success" : status === "error" ? "danger" : "neutral";
  return h("span", { class: `badge ${cls}` }, titleCase(status || "unknown"));
}
function renderExecutionsPage() {
  const status = state.route.query.get("status");
  const rows = status ? state.executions.filter((r) => r.status === status) : state.executions;
  return moduleShell("executions", h("div", { class: "dash-container space-y-6" }, [
    h("div", { class: "list-head" }, [
      h("p", {}, "Recent runs across every automation, newest first."),
      h("div", { class: "filters" }, [
        filterChip("/executions", "All", !status),
        ...["success", "error", "skipped"].map((s) => filterChip(`/executions?status=${s}`, titleCase(s), status === s))
      ])
    ]),
    renderExecutions(rows, false, status ? `No ${status} runs` : "No run history yet")
  ]));
}

function detailHead(kind, item, tabKey) {
  const isTeam = kind === "team";
  const base = isTeam ? `/agent-teams/${item.id}` : `/automations/${item.id}`;
  return h("div", {}, [
    h("nav", { class: "crumb", "aria-label": "Breadcrumb" }, [
      h("a", { href: isTeam ? "#/agent-teams" : "#/automations" }, isTeam ? "Agent Teams" : "Automations"),
      h("span", { html: icon("chevron") }),
      h("span", {}, item.name || item.id)
    ]),
    h("div", { class: "detail-title-row" }, isTeam
      ? [h("h1", {}, item.name), commandPill(item.command), chip(labelDept(item.department)), buildStatusChip(item.buildStatus)]
      : [h("h1", {}, item.name || item.id), chip(labelArea(item.area)), statusChip(!!item.active)]),
    h("p", { class: "trigger-line" }, isTeam
      ? [h("span", {}, item.teamType || "Team"), h("span", { class: "sep" }, "·"), h("span", {}, plural((item.seats || []).length, "team member")), h("span", { class: "sep" }, "·"), h("span", {}, plural((item.skills || []).length, "skill")), h("span", { class: "sep" }, "·"), h("span", {}, `flow as of ${item.flowAsOf || "unknown"}`), item.lastUsed ? h("span", { class: "sep" }, "·") : null, item.lastUsed ? h("span", {}, `last used ${rel(item.lastUsed) || item.lastUsed}`) : null].filter(Boolean)
      : triggerSummary(item.trigger)),
    h("nav", { class: "subtabs detail-subtabs", "aria-label": `${item.name} sections` }, isTeam
      ? [tab(base, "Flow", tabKey === "flow"), tab(`${base}/members`, "Team members & skills", tabKey === "seats")]
      : [tab(base, "Editor", tabKey === "editor"), tab(`${base}/executions`, "Executions", tabKey === "executions")])
  ]);
}
function renderAutomationDetail(id, sub = "editor") {
  const a = state.automations.find((x) => x.id === id);
  if (!a) return notFound("Automation not found");
  if (sub === "executions") return h("div", { class: "dash-container" }, [
    h("div", { class: "detail-normal" }, detailHead("automation", a, "executions")),
    h("div", { style: "margin-top:1.5rem" }, renderExecutions(state.executions.filter((r) => r.automationId === a.id), true, "No executions logged for this automation"))
  ]);
  return h("div", { class: "dash-flow-shell" }, [
    h("div", { class: "flow-head" }, h("div", { class: "dash-gutter" }, detailHead("automation", a, "editor"))),
    h("div", { class: "flow-body" }, renderFlow(a.flow, a.name || a.id))
  ]);
}
function renderTeamDetail(id, sub = "flow", memberSlug = null) {
  const t = state.teams.find((x) => x.id === id);
  if (!t) return notFound("Agent team not found");
  if (memberSlug) return h("div", { class: "dash-container" }, [
    h("div", { class: "detail-normal" }, detailHead("team", t, "seats")),
    h("div", { style: "margin-top:1.5rem" }, renderMemberDetail(t, memberSlug))
  ]);
  if (sub === "seats") return h("div", { class: "dash-container" }, [
    h("div", { class: "detail-normal" }, detailHead("team", t, "seats")),
    h("div", { style: "margin-top:1.5rem" }, renderSeats(t))
  ]);
  return h("div", { class: "dash-flow-shell" }, [
    h("div", { class: "flow-head" }, h("div", { class: "dash-gutter" }, detailHead("team", t, "flow"))),
    h("div", { class: "flow-body" }, renderFlow(t.flow, t.name, "team"))
  ]);
}
function renderSeats(t) {
  return h("div", { class: "seats-grid" }, [
    h("section", {}, [
      h("p", { class: "overline", style: "padding:0 .25rem .5rem" }, "Team members"),
      h("div", { class: "glass rounded-xl list-block" }, (t.seats || []).map((s) => h("a", { class: "seat-row", href: `#/agent-teams/${t.id}/members/${slug(s.name)}` }, [h("span", {}, s.name), chip(s.type)])))
    ]),
    h("section", {}, [
      h("p", { class: "overline", style: "padding:0 .25rem .5rem" }, "Skills · the members' hands"),
      h("div", { class: "glass rounded-xl list-block" }, (t.skills || []).map((s) => h("div", { class: "skill-row" }, [
        h("div", { class: "item-title" }, [h("span", { class: "item-name" }, s.name), commandPill(s.command)]),
        h("p", {}, s.owns || "")
      ])))
    ]),
    h("p", { class: "meta", style: "padding:0 .25rem" }, `Procedure lives in ${t.sourceOfTruth || "the team's source of truth"}; this flow was checked on ${t.flowAsOf || "unknown"}.`)
  ]);
}
function renderMemberDetail(t, memberSlug) {
  const seat = (t.seats || []).find((s) => slug(s.name) === memberSlug);
  if (!seat) return notFound("Team member not found");
  const skills = (t.skills || []).filter((s) => s.seat && slug(s.seat) === memberSlug);
  return h("div", { class: "glass rounded-xl", style: "padding:1.25rem" }, [
    h("p", { class: "overline" }, "Team member"),
    h("h1", { style: "margin-top:.25rem" }, seat.name),
    h("p", { class: "lede" }, seat.type),
    h("div", { style: "margin-top:1.25rem" }, [
      h("p", { class: "overline" }, "Mapped skills"),
      skills.length ? h("div", { class: "list-block", style: "margin-top:.5rem" }, skills.map((s) => h("div", { class: "skill-row" }, [h("div", { class: "item-title" }, [h("span", { class: "item-name" }, s.name), commandPill(s.command)]), h("p", {}, s.owns || "")]))) : h("p", { class: "lede" }, "No skills installed for this team member yet.")
    ])
  ]);
}

const POS_SCALE_X = 1.26, POS_SCALE_Y = 1.06, NODE_W = 288, NODE_H = 76, SMALL_W = 214, HINT_NUDGE = 11;
const hasFlow = (flow) => !!flow && Array.isArray(flow.nodes) && flow.nodes.length > 0;
function renderFlow(flow, title, kind = "automation") {
  const wrap = h("div", { class: "dash-flow-canvas", "aria-label": `${title} flow diagram` });
  if (!hasFlow(flow)) {
    wrap.append(kind === "team"
      ? emptyState("waypoints", "No system mapped yet", "When this team gets a workflow in its <code>team.md</code>, run <code>python3 tools/sync.py</code> and it gets drawn here.")
      : emptyState("waypoints", "No diagram yet", "Add a <code>flow</code> block with nodes and edges. Draw every real branch, including switched-off paths."));
    return wrap;
  }
  if (Array.isArray(flow.phases) && flow.phases.length) return renderPhasedFlow(flow, wrap);
  const stage = h("div", { class: "flow-stage" });
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  stage.append(svg);
  wrap.append(stage);
  const byId = new Map();
  for (const n of flow.nodes) {
    const w = n.small ? SMALL_W : NODE_W;
    const hgt = n.hint ? 96 : NODE_H;
    byId.set(n.id, { ...n, sx: n.x * POS_SCALE_X, sy: n.y * POS_SCALE_Y - (n.hint ? HINT_NUDGE : 0), w, h: hgt });
  }
  for (const e of flow.edges || []) {
    const s = byId.get(e.source), t = byId.get(e.target);
    if (!s || !t) continue;
    const backward = t.sx < s.sx;
    const x1 = backward ? s.sx : s.sx + s.w;
    const y1 = s.sy + s.h / 2;
    const x2 = backward ? t.sx + t.w : t.sx;
    const y2 = t.sy + t.h / 2;
    const d = backward ? smoothStep(x1, y1, x2, y2) : bezier(x1, y1, x2, y2);
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("class", `edge-path ${e.animated ? "live" : ""} ${e.dashed ? "dashed" : ""}`);
    svg.append(path);
    if (e.animated) {
      for (const cls of ["bead", "bead two"]) {
        const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        c.setAttribute("r", "3.4");
        c.setAttribute("class", cls);
        c.style.setProperty("--edge-d", `"${d}"`);
        svg.append(c);
      }
    }
    if (e.label && labelFits(e.label, Math.abs(x2 - x1))) {
      stage.append(h("span", { class: "edge-label", style: `left:${(x1+x2)/2}px;top:${(y1+y2)/2}px` }, e.label));
    }
  }
  let selected = null;
  const inspect = h("aside", { class: "inspect glass hide" });
  const showInspect = (n) => {
    selected?.classList.remove("selected");
    selected = $(`[data-node-id="${CSS.escape(n.id)}"]`, stage);
    selected?.classList.add("selected");
    inspect.classList.remove("hide");
    inspect.innerHTML = "";
    inspect.append(h("div", { class: "inspect-head" }, [
      h("span", { class: "inspect-icon", html: icon(n.icon || "waypoints") }),
      h("div", {}, [h("h3", {}, n.title || n.id), h("p", { class: "stat" }, n.stat || "")]),
      h("button", { type: "button", "aria-label": "Close details", onclick: () => inspect.classList.add("hide"), html: icon("close") })
    ]));
    inspect.append(h("p", {}, n.detail || n.hint || "No detail has been written for this step."));
  };
  for (const n of byId.values()) {
    const node = h("button", {
      type: "button",
      class: `node glass ${n.small ? "small" : ""} ${n.tone === "accent" ? "accent" : ""} ${n.tone === "dimmed" ? "dimmed" : ""}`,
      style: `left:${n.sx}px;top:${n.sy}px;min-height:${n.h}px`,
      "data-node-id": n.id,
      onclick: () => showInspect(n)
    }, [h("div", { class: "node-row" }, [
      h("span", { class: "node-icon", html: icon(n.icon || "waypoints") }),
      h("span", { class: "node-text" }, [
        h("span", { class: "node-title" }, [h("span", {}, n.title || n.id), n.pill ? h("span", { class: `node-badge ${n.pill.tone || ""}` }, n.pill.label || n.pill) : null].filter(Boolean)),
        h("p", { class: "node-stat" }, n.stat || ""),
        n.hint ? h("p", { class: "node-hint" }, n.hint) : null
      ].filter(Boolean))
    ])]);
    stage.append(node);
  }
  const bounds = graphBounds(flow);
  wrap.append(inspect, controls(stage, wrap, bounds), minimap(flow));
  requestAnimationFrame(() => fitFlow(wrap, stage, bounds));
  wirePanZoom(wrap, stage, bounds);
  return wrap;
}
// ---- Phased flow: each phase is a coloured, labelled box holding its steps ----
// flow = { phases: [{id, label, color?, x?, y?}], nodes: [{id, phase, label, sub?, icon?, badge?, detail?}],
//          edges: [{from, to, label?, dashed?}], perRow? }. Phases auto-lay left→right (wrapping after
// perRow, default 6); a phase with x/y keeps that spot. Steps stack top→bottom inside their box.
const PHASE_COLORS = { teal: "#42caad", sky: "#5aa9e6", violet: "#a78bfa", amber: "#f5b54a", rose: "#f4728b", lime: "#9bd35a", slate: "#9aa3ad" };
const PH = { W: 296, PAD: 20, HEAD: 50, GAP: 12, NODE_H: 66, COL_GAP: 96, ROW_GAP: 110 };
const phaseColor = (c) => PHASE_COLORS[c] || (/^#[0-9a-f]{3,8}$/i.test(c || "") ? c : PHASE_COLORS.slate);
function layoutPhases(flow) {
  const phases = flow.phases.map((p) => ({ ...p, color: phaseColor(p.color), nodes: flow.nodes.filter((n) => n.phase === p.id) }));
  const perRow = Math.max(1, flow.perRow || 6);
  let rowTop = 0, rowH = 0;
  phases.forEach((p, i) => {
    const col = i % perRow;
    if (col === 0 && i > 0) { rowTop += rowH + PH.ROW_GAP; rowH = 0; }
    p.w = PH.W;
    p.h = PH.HEAD + Math.max(1, p.nodes.length) * (PH.NODE_H + PH.GAP) - PH.GAP + PH.PAD;
    p.x = Number.isFinite(p.x) ? p.x : col * (PH.W + PH.COL_GAP);
    p.y = Number.isFinite(p.y) ? p.y : rowTop;
    rowH = Math.max(rowH, p.h);
    p.nodes.forEach((n, j) => Object.assign(n, { _x: p.x + PH.PAD, _y: p.y + PH.HEAD + j * (PH.NODE_H + PH.GAP), _w: PH.W - PH.PAD * 2, _h: PH.NODE_H }));
  });
  const nodes = new Map(phases.flatMap((p) => p.nodes.map((n) => [n.id, n])));
  const boxes = new Map(phases.map((p) => [p.id, { _x: p.x, _y: p.y, _w: p.w, _h: p.h, phase: p.id }]));
  const b = { x: Math.min(...phases.map((p) => p.x)), y: Math.min(...phases.map((p) => p.y)), r: Math.max(...phases.map((p) => p.x + p.w)), b: Math.max(...phases.map((p) => p.y + p.h)) };
  return { phases, nodes, boxes, bounds: b };
}
function phaseEdgePath(s, t, sPhase, tPhase, floor) {
  const sx = s._x, sy = s._y, tx = t._x, ty = t._y;
  if (sPhase === tPhase && ty > sy) { // the next step in the same box: straight down
    const x = sx + s._w / 2;
    return `M ${x} ${sy + s._h} L ${x} ${ty}`;
  }
  if (tx >= sx + s._w) return bezier(sx + s._w, sy + s._h / 2, tx, ty + t._h / 2); // forward
  if (ty >= sy + s._h + 40 && Math.abs(tx - sx) < s._w) { // straight below in another row
    const x1 = sx + s._w / 2, x2 = tx + t._w / 2, mid = (sy + s._h + ty) / 2;
    return `M ${x1} ${sy + s._h} C ${x1} ${mid}, ${x2} ${mid}, ${x2} ${ty}`;
  }
  // a loop back: drop under everything, run left, come up into the target's bottom
  const x1 = sx + s._w / 2, x2 = tx + t._w / 2, y = floor + 56;
  return `M ${x1} ${sy + s._h} C ${x1} ${y}, ${x1} ${y}, ${x1 - 40} ${y} L ${x2 + 40} ${y} C ${x2} ${y}, ${x2} ${y}, ${x2} ${ty + t._h}`;
}
function renderPhasedFlow(flow, wrap) {
  const L = layoutPhases(flow);
  const b = L.bounds;
  const stage = h("div", { class: "flow-stage", style: `width:${b.r + 400}px;height:${b.b + 400}px` });
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.innerHTML = '<defs><marker id="ph-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(255,255,255,.42)" stroke="none"/></marker></defs>';
  for (const p of L.phases) {
    stage.append(h("section", { class: "phase-box", style: `left:${p.x}px;top:${p.y}px;width:${p.w}px;height:${p.h}px;--ph:${p.color}`, "aria-label": `${p.label} phase` }, [
      h("header", { class: "phase-head" }, [h("span", { class: "phase-dot" }), h("span", { class: "phase-label" }, p.label), h("span", { class: "phase-count" }, `${p.nodes.length} step${p.nodes.length === 1 ? "" : "s"}`)]),
      p.nodes.length ? null : h("p", { class: "phase-empty" }, "No steps yet")
    ].filter(Boolean)));
  }
  stage.append(svg);
  const end = (id) => L.nodes.get(id) || L.boxes.get(id);
  for (const e of flow.edges || []) {
    const s = end(e.from ?? e.source), t = end(e.to ?? e.target);
    if (!s || !t) continue;
    const d = phaseEdgePath(s, t, s.phase, t.phase, b.b);
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("class", `edge-path phase-edge ${e.dashed ? "dashed" : ""}`);
    path.setAttribute("marker-end", "url(#ph-arrow)");
    svg.append(path);
    if (e.label) {
      const forward = t._x >= s._x + s._w;
      const lx = forward ? (s._x + s._w + t._x) / 2 : (s._x + s._w / 2 + t._x + t._w / 2) / 2;
      const ly = forward ? (s._y + s._h / 2 + t._y + t._h / 2) / 2 : s.phase === t.phase ? (s._y + s._h + t._y) / 2 : b.b + 56;
      stage.append(h("span", { class: "edge-label", style: `left:${lx}px;top:${ly}px` }, e.label));
    }
  }
  let selected = null;
  const inspect = h("aside", { class: "inspect glass hide" });
  for (const p of L.phases) for (const n of p.nodes) {
    const node = h("button", {
      type: "button", class: "node glass phase-node", "data-node-id": n.id,
      style: `left:${n._x}px;top:${n._y}px;width:${n._w}px;min-height:${n._h}px;--ph:${p.color}`,
      onclick: () => {
        selected?.classList.remove("selected"); selected = node; node.classList.add("selected");
        inspect.classList.remove("hide"); inspect.innerHTML = "";
        inspect.append(h("div", { class: "inspect-head" }, [
          h("span", { class: "inspect-icon", style: `color:${p.color};border-color:${p.color}66;background:${p.color}1f`, html: icon(n.icon || "waypoints") }),
          h("div", {}, [h("h3", {}, n.label || n.id), h("p", { class: "stat" }, `${p.label} phase${n.sub ? ` · ${n.sub}` : ""}`)]),
          h("button", { type: "button", "aria-label": "Close details", onclick: () => inspect.classList.add("hide"), html: icon("close") })
        ]), h("p", {}, n.detail || "No detail has been written for this step."));
      }
    }, [h("div", { class: "node-row" }, [
      h("span", { class: "node-icon", html: icon(n.icon || "waypoints") }),
      h("span", { class: "node-text" }, [
        h("span", { class: "node-title" }, [h("span", {}, n.label || n.id), n.badge ? h("span", { class: "node-badge" }, n.badge) : null].filter(Boolean)),
        n.sub ? h("p", { class: "node-stat" }, n.sub) : null
      ].filter(Boolean))
    ])]);
    stage.append(node);
  }
  wrap.append(stage);
  // minimap: the coloured phase boxes, scaled to fit
  const mw = b.r - b.x, mh = b.b - b.y + 70, k = Math.min(130 / mw, 70 / mh);
  const rects = L.phases.map((p) => `<rect x="${10 + (p.x - b.x) * k}" y="${10 + (p.y - b.y) * k}" width="${Math.max(4, p.w * k)}" height="${Math.max(4, p.h * k)}" rx="2" fill="${p.color}" fill-opacity=".28" stroke="${p.color}" stroke-opacity=".8" stroke-width=".8"/>`).join("");
  const bounds = { ...b, b: b.b + 70 };
  wrap.append(inspect, controls(stage, wrap, bounds), h("div", { class: "minimap glass", html: `<svg viewBox="0 0 150 90" aria-hidden="true">${rects}</svg>` }));
  requestAnimationFrame(() => fitFlow(wrap, stage, bounds));
  wirePanZoom(wrap, stage, bounds);
  return wrap;
}

function bezier(x1, y1, x2, y2) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const c = Math.max(.05, Math.min(.26, 85 / (len || 1)));
  const dx = Math.max(70, Math.abs(x2 - x1) * c);
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
}
function smoothStep(x1, y1, x2, y2) {
  const mx = (x1 + x2) / 2;
  return `M ${x1} ${y1} L ${mx} ${y1} Q ${mx + 22} ${y1} ${mx + 22} ${y1 + Math.sign(y2-y1)*22} L ${mx + 22} ${y2 - Math.sign(y2-y1)*22} Q ${mx + 22} ${y2} ${mx} ${y2} L ${x2} ${y2}`;
}
function labelFits(label, gap) { return /[→≥≤★]/.test(label) || gap >= label.length * 5.6 + 20; }
function graphBounds(flow) {
  const nodes = flow.nodes.map((n) => ({ x: n.x * POS_SCALE_X, y: n.y * POS_SCALE_Y - (n.hint ? HINT_NUDGE : 0), w: n.small ? SMALL_W : NODE_W, h: n.hint ? 96 : NODE_H }));
  return {
    x: Math.min(...nodes.map((n) => n.x)),
    y: Math.min(...nodes.map((n) => n.y)),
    r: Math.max(...nodes.map((n) => n.x + n.w)),
    b: Math.max(...nodes.map((n) => n.y + n.h))
  };
}
function fitFlow(wrap, stage, b) {
  const box = wrap.getBoundingClientRect();
  const z = Math.max(.35, Math.min(1.15, (box.width * .86) / (b.r - b.x), (box.height * .78) / (b.b - b.y)));
  state.flow.zoom = z;
  state.flow.pan = { x: Math.max(24, (box.width - (b.r - b.x) * z) / 2) - b.x * z, y: Math.max(24, (box.height - (b.b - b.y) * z) / 2) - b.y * z };
  applyFlow(stage);
}
function applyFlow(stage) {
  stage.style.transform = `translate(${state.flow.pan.x}px, ${state.flow.pan.y}px) scale(${state.flow.zoom})`;
  const z = $(".zoom-label", stage.parentElement);
  if (z) z.textContent = `${Math.round(state.flow.zoom * 100)}%`;
}
function controls(stage, wrap, bounds) {
  const c = h("div", { class: "flow-controls glass" }, [
    h("button", { type: "button", title: "Zoom in", onclick: () => { state.flow.zoom = Math.min(1.75, state.flow.zoom * 1.12); applyFlow(stage); } }, "+"),
    h("button", { type: "button", title: "Zoom out", onclick: () => { state.flow.zoom = Math.max(.2, state.flow.zoom * .89); applyFlow(stage); } }, "−"),
    h("button", { type: "button", title: "Fit", onclick: () => fitFlow(wrap, stage, bounds) }, "⤢"),
    h("span", { class: "zoom-label" }, "100%")
  ]);
  return c;
}
function wirePanZoom(wrap, stage, bounds) {
  let drag = null;
  wrap.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".node,.inspect,.flow-controls,.minimap")) return;
    drag = { x: e.clientX, y: e.clientY, pan: { ...state.flow.pan } };
    wrap.classList.add("dragging");
    wrap.setPointerCapture(e.pointerId);
  });
  wrap.addEventListener("pointermove", (e) => {
    if (!drag) return;
    state.flow.pan = { x: drag.pan.x + e.clientX - drag.x, y: drag.pan.y + e.clientY - drag.y };
    applyFlow(stage);
  });
  const stop = () => { drag = null; wrap.classList.remove("dragging"); };
  wrap.addEventListener("pointerup", stop);
  wrap.addEventListener("pointercancel", stop);
  wrap.addEventListener("wheel", (e) => {
    e.preventDefault();
    state.flow.zoom = Math.max(.2, Math.min(1.75, state.flow.zoom * (e.deltaY > 0 ? .92 : 1.08)));
    applyFlow(stage);
  }, { passive: false });
  window.addEventListener("resize", () => fitFlow(wrap, stage, bounds), { once: true });
}
function minimap(flow) {
  const b = graphBounds(flow), w = b.r - b.x, hgt = b.b - b.y;
  const rects = flow.nodes.map((n) => {
    const x = ((n.x * POS_SCALE_X - b.x) / w) * 130 + 10;
    const y = ((n.y * POS_SCALE_Y - b.y) / hgt) * 70 + 10;
    const ww = ((n.small ? SMALL_W : NODE_W) / w) * 130;
    return `<rect x="${x}" y="${y}" width="${Math.max(5, ww)}" height="6" rx="2" fill="${n.tone === "accent" ? "#42caad" : n.tone === "dimmed" ? "#454240" : "#6f6b67"}"/>`;
  }).join("");
  return h("div", { class: "minimap glass", html: `<svg viewBox="0 0 150 90" aria-hidden="true">${rects}</svg>` });
}

function notFound(title) { return h("div", { class: "dash-container" }, emptyState("alert", title, "Check the URL or use the tab strip to return to the module.")); }
function parseRoute() {
  const raw = (location.hash || "#/automations").slice(1);
  const [pathRaw, queryRaw = ""] = raw.split("?");
  const parts = pathRaw.split("/").filter(Boolean).map(decodeURIComponent);
  state.route = { parts, query: new URLSearchParams(queryRaw) };
}
function render() {
  parseRoute();
  const p = state.route.parts;
  let view;
  if (p[0] === "agent-teams" && p[1] && p[2] === "members") view = renderTeamDetail(p[1], "seats", p[3]);
  else if (p[0] === "agent-teams" && p[1]) view = renderTeamDetail(p[1], p[2] === "members" ? "seats" : "flow");
  else if (p[0] === "agent-teams") view = renderTeams();
  else if (p[0] === "executions") view = renderExecutionsPage();
  else if (p[0] === "automations" && p[1]) view = renderAutomationDetail(p[1], p[2] === "executions" ? "executions" : "editor");
  else view = renderAutomations();
  app.replaceChildren(...[].concat(view));
  app.focus({ preventScroll: true });
}
async function loadJson(path, fallback) {
  try {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn(`Could not load ${path}`, err);
    return fallback;
  }
}
async function boot() {
  const demo = false; // sample-data mode lives in the Command Center Starter repo, not here
  if (!demo && window.CC_DATA) {
    // tools/sync.py writes data/data.js, so this page opens straight from the folder (no server needed)
    state.automations = window.CC_DATA.automations || [];
    state.teams = window.CC_DATA.teams || [];
    state.executions = window.CC_DATA.executions || [];
    $("#modePill").textContent = "From your repo";
  } else if (demo) {
    const ex = await loadJson("data/EXAMPLES.json", {});
    state.automations = ex.automations || [];
    state.teams = ex.teams || [];
    state.executions = ex.executions || [];
    $("#modePill").textContent = "Sample data";
  } else {
    const [automations, teams, executions] = await Promise.all([
      loadJson("data/automations.json", []),
      loadJson("data/teams.json", []),
      loadJson("data/executions.json", [])
    ]);
    state.automations = Array.isArray(automations) ? automations : automations.automations || [];
    state.teams = Array.isArray(teams) ? teams : teams.teams || [];
    state.executions = Array.isArray(executions) ? executions : executions.executions || [];
  }
  window.addEventListener("hashchange", render);
  if (!location.hash) history.replaceState(null, "", `${location.pathname}${location.search}#/agent-teams`);
  render();
}
boot();
