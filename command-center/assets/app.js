const $ = (sel, root = document) => root.querySelector(sel);
const app = $("#app");
const DASH = "—";
// Routine areas come from each routine's `team:` line; anything not listed here is shown as written.
const AREA_LABEL = {
  content: "Content",
  web: "Web",
  email: "Email",
  community: "Community",
  marketing: "Marketing",
  operations: "Operations",
  sales: "Sales",
  routines: "Routines",
};
const DEPARTMENT_LABEL = {
  sales: "Sales",
  marketing: "Marketing",
  operations: "Operations",
  engineering: "IT / Systems",
  finance: "Finance",
  customer_support: "Customer Support",
  it_systems: "IT / Systems",
  legal: "Legal",
  people_hr: "People / HR",
  product: "Product",
};
const BUILD_STATUS_LABEL = { planning: "Planning", building: "Building", active: "Active", archived: "Archived" };
const ICONS = {
  waypoints:
    '<path d="M12 2v6"/><path d="M12 16v6"/><circle cx="12" cy="12" r="3"/><path d="m5 8 3 3"/><path d="m16 13 3 3"/>',
  power: '<path d="M12 3v9"/><path d="M6.6 6.6a8 8 0 1 0 10.8 0"/>',
  activity: '<path d="M3 12h4l3 8 4-16 3 8h4"/>',
  alert: '<path d="M12 3 2 20h20L12 3z"/><path d="M12 9v5"/><path d="M12 17h.01"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M9 2h6"/>',
  users:
    '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 5.5a3 3 0 0 1 0 5"/><path d="M18 20a5.5 5.5 0 0 0-3-4.5"/>',
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
  route:
    '<path d="M4 6h6a4 4 0 0 1 4 4v8"/><path d="M14 10a4 4 0 0 1 4-4h2"/><path d="m18 4 2 2-2 2"/><path d="m12 16 2 2 2-2"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  send: '<path d="m22 2-7 20-4-9-9-4 20-7z"/>',
  notion: '<rect x="5" y="4" width="14" height="16" rx="2"/><path d="M9 8h6"/><path d="M9 16V8l6 8V8"/>',
  browser: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/>',
  log: '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>',
  trend: '<path d="m3 17 6-6 4 4 7-8"/><path d="M14 7h6v6"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  briefcase:
    '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/>',
  tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h4"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
};
const icon = (name, cls = "") =>
  `<svg viewBox="0 0 24 24" class="${cls}" aria-hidden="true">${ICONS[name] || ICONS.zap}</svg>`;

const state = {
  automations: [],
  teams: [],
  executions: [],
  content: null,
  web: null,
  payments: null,
  settings: null,
  keys: null,
  problems: [],
  server: null,
  route: {},
  flow: { zoom: 1, pan: { x: 0, y: 0 } },
};

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
const labelDept = (x) => {
  const t = (state.teams || []).find((s) => s.department === x && s.departmentName);
  return (
    (t && t.departmentName) || DEPARTMENT_LABEL[x] || titleCase((x || "").replaceAll("_", " ").replaceAll("-", " "))
  );
};
const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
const titleCase = (s) =>
  String(s || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
const slug = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m],
  );
const fmtRunMs = (ms) =>
  ms == null || Number.isNaN(ms) ? null : ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(2)}s`;
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
const started = (iso) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const triggerSummary = (t) =>
  !t
    ? "Trigger"
    : t.type === "cron"
      ? `Schedule · ${t.schedule}`
      : t.type === "webhook"
        ? `Webhook · ${t.path}`
        : `On event · ${t.source}`;
const lastRunVerb = (s) => ({ success: "Ran", error: "Failed", skipped: "Skipped", running: "Running" })[s] || null;

function moduleShell(active, child) {
  return [
    h("div", { class: "module-head" }, [
      h("div", { class: "dash-gutter" }, [
        h("div", { class: "module-head-inner" }, [
          h("div", {}, [
            h("p", { class: "eyebrow" }, "Command Center"),
            h("h1", {}, "Your Company"),
            h(
              "p",
              { class: "lede" },
              "Every agent team you can summon, its workflows and team members, and every routine your department runs. Rebuilt from your repo by python3 tools/sync.py.",
            ),
          ]),
        ]),
        h("nav", { class: "tabs", "aria-label": "Automations sections" }, [
          tab("/agent-teams", "Agent Teams", active === "agent-teams"),
          tab("/automations", "Automations", active === "automations"),
          tab("/executions", "Executions", active === "executions"),
        ]),
      ]),
    ]),
    child,
  ];
}
function tab(path, label, active) {
  return h("a", { class: "tab", href: `#${path}`, "aria-current": active ? "page" : null }, label);
}
function chip(text, cls = "") {
  return h("span", { class: `chip ${cls}`.trim() }, text);
}
function statusChip(active) {
  return h("span", { class: `chip status-chip ${active ? "active" : ""}` }, [
    h("span", { class: "status-dot" }),
    active ? "Active" : "Paused",
  ]);
}
function buildStatusChip(status) {
  return h("span", { class: `chip status-chip ${status === "active" ? "active" : ""}` }, [
    h("span", { class: "status-dot" }),
    BUILD_STATUS_LABEL[status] || titleCase(status),
  ]);
}
function commandPill(command) {
  return chip(command || "no command yet", `mono ${command ? "" : "dashed"}`);
}
function statTile(iconName, label, value, sub, warn = false) {
  return h("div", { class: "stat-tile glass rounded-xl" }, [
    h("div", { class: "stat-top" }, [
      h("span", { class: "stat-icon", html: icon(iconName) }),
      h("span", { class: "stat-label" }, label),
    ]),
    h("p", { class: `stat-value ${value === DASH ? "muted" : warn ? "warn" : ""}` }, String(value)),
    h("p", { class: "stat-sub" }, sub),
  ]);
}
function emptyState(iconName, title, desc) {
  return h("div", { class: "empty glass rounded-xl" }, [
    h("div", { html: icon(iconName) }),
    h("p", { class: "empty-title" }, title),
    h("p", { class: "empty-desc", html: desc }),
  ]);
}
function arrow() {
  return h("span", { class: "chev", html: icon("chevron") });
}

function renderAutomations() {
  const area = state.route.query.get("area");
  const list = state.automations;
  if (!list.length)
    return moduleShell(
      "automations",
      h(
        "div",
        { class: "dash-container" },
        emptyState(
          "waypoints",
          "No automations registered",
          "Add a routine in <code>routines/</code>, run <code>python3 tools/sync.py</code>, and it shows up here.",
        ),
      ),
    );
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
  return moduleShell(
    "automations",
    h("div", { class: "dash-container space-y-6" }, [
      h(
        "div",
        { class: `stat-grid ${avgLabel ? "five" : ""}` },
        [
          statTile("waypoints", "Automations", total, "Registered jobs"),
          statTile("power", "Active", active, `${total - active} paused`),
          statTile(
            "activity",
            "Total runs",
            totalRuns ?? DASH,
            totalRuns == null ? "Awaiting run log" : runBacked.length === total ? "All time" : jobs(runBacked.length),
          ),
          statTile(
            "alert",
            "Failures",
            fails ?? DASH,
            fails == null ? "Awaiting run log" : failBacked.length === total ? "All time" : jobs(failBacked.length),
            (fails ?? 0) > 0,
          ),
          avgLabel ? statTile("timer", "Avg run time", avgLabel, "Per run") : null,
        ].filter(Boolean),
      ),
      h("div", {}, [
        h("div", { class: "list-head" }, [
          h("p", { class: "overline" }, area ? `${labelArea(area)} automations` : "All automations"),
          h("div", { class: "filters" }, [
            filterChip("/automations", `All · ${list.length}`, !area),
            ...areas.map((a) =>
              filterChip(
                `/automations?area=${encodeURIComponent(a)}`,
                `${labelArea(a)} · ${list.filter((x) => x.area === a).length}`,
                area === a,
              ),
            ),
          ]),
        ]),
        h("div", { class: "list-block glass" }, shown.map(automationRow)),
      ]),
    ]),
  );
}
function filterChip(path, text, active) {
  return h("a", { class: `chip-link ${active ? "active" : ""}`, href: `#${path}` }, text);
}
function automationRow(a) {
  const st = a.stats || {};
  const when = rel(st.lastRunAt);
  const verb = lastRunVerb(st.lastRunStatus);
  const meta = [h("span", {}, triggerSummary(a.trigger))];
  if (when && verb) meta.push(h("span", { class: "sep" }, "·"), h("span", {}, `${verb} ${when}`));
  else if (when) meta.push(h("span", { class: "sep" }, "·"), h("span", {}, `Last run ${when}`));
  for (const x of st.extras || [])
    meta.push(h("span", { class: "sep" }, "·"), h("span", { html: `${esc(x.label)} <b>${esc(x.value)}</b>` }));
  return h(
    "a",
    { class: "item-link", href: `#/automations/${encodeURIComponent(a.id)}` },
    [
      h("div", { class: "item-main" }, [
        h("div", { class: "item-title" }, [
          h("span", { class: "item-name" }, a.name || a.id),
          chip(labelArea(a.area)),
          statusChip(!!a.active),
        ]),
        a.description ? h("p", { class: "item-desc" }, a.description) : null,
        h("div", { class: "meta" }, meta),
      ]),
      arrow(),
    ].filter(Boolean),
  );
}

function renderTeams() {
  const dept = state.route.query.get("department");
  const list = state.teams;
  if (!list.length)
    return moduleShell(
      "agent-teams",
      h(
        "div",
        { class: "dash-container" },
        emptyState(
          "users",
          "No agent teams registered",
          "Run <code>python3 tools/sync.py</code> from the top of your repo and every team shows up here.",
        ),
      ),
    );
  const depts = [...new Set(list.map((t) => t.department).filter(Boolean))];
  const shown = dept ? list.filter((t) => t.department === dept) : list;
  const seats = list.reduce((s, t) => s + (t.seats || []).length, 0);
  const skills = list.reduce((s, t) => s + (t.skills || []).length, 0);
  const groups = new Map();
  for (const t of shown) groups.set(t.department, [...(groups.get(t.department) || []), t]);
  return moduleShell(
    "agent-teams",
    h("div", { class: "dash-container space-y-6" }, [
      h("div", { class: "stat-grid" }, [
        statTile("users", "Agent teams", list.length, "Registered here"),
        statTile(
          "terminal",
          "With a command",
          list.filter((t) => t.command).length,
          `${list.filter((t) => !t.command).length} without one`,
        ),
        statTile("user", "Team members", seats, "Across all teams"),
        statTile("sparkle", "Skills", skills, "Skills and workflows you can run"),
      ]),
      h("div", {}, [
        h("div", { class: "list-head" }, [
          h("p", { class: "overline" }, dept ? `${labelDept(dept)} teams` : "All agent teams"),
          h("div", { class: "filters" }, [
            filterChip("/agent-teams", `All · ${list.length}`, !dept),
            ...depts.map((d) =>
              filterChip(
                `/agent-teams?department=${encodeURIComponent(d)}`,
                `${labelDept(d)} · ${list.filter((t) => t.department === d).length}`,
                dept === d,
              ),
            ),
          ]),
        ]),
        h(
          "div",
          {},
          [...groups.entries()].map(([d, teams]) =>
            h("section", { class: "dept-section" }, [
              h("p", { class: "dept-label" }, labelDept(d)),
              h("div", { class: "list-block glass" }, teams.map(teamRow)),
            ]),
          ),
        ),
        addTeamCard(),
      ]),
    ]),
  );
}
// The department ships with the Dev Team only; every other team is built by its classroom lesson.
function addTeamCard() {
  return h("section", { class: "dept-section" }, [
    h("p", { class: "dept-label" }, "More teams"),
    h("div", { class: "list-block glass add-team" }, [
      h("div", { class: "add-team-head" }, [
        h("p", { class: "item-name" }, "Your teams come from the classroom lessons"),
        h(
          "p",
          { class: "item-desc wrap-desc" },
          "Each lesson's skill builds one team in your folder from your own answers, and it shows up here as soon as it's built. The Dev Team is already here: it saves your work, keeps your keys and ships your pages.",
        ),
      ]),
    ]),
  ]);
}
function teamRow(t) {
  return h("a", { class: "item-link", href: `#/agent-teams/${encodeURIComponent(t.id)}` }, [
    h("div", { class: "item-main" }, [
      h("div", { class: "item-title" }, [
        h("span", { class: "item-name" }, t.name),
        commandPill(t.command),
        chip(labelDept(t.department)),
        buildStatusChip(t.buildStatus),
      ]),
      h("p", { class: "item-desc" }, t.purpose || ""),
      h("div", { class: "meta" }, [
        h("span", {}, t.teamType || "Team"),
        h("span", { class: "sep" }, "·"),
        h("span", {}, `${(t.seats || []).length} team member${(t.seats || []).length === 1 ? "" : "s"}`),
        h("span", { class: "sep" }, "·"),
        h("span", {}, `${(t.skills || []).length} skill${(t.skills || []).length === 1 ? "" : "s"}`),
        h("span", { class: "sep" }, "·"),
        h("span", {}, hasFlow(t.flow) ? `flow as of ${t.flowAsOf || "unknown"}` : "no flow drawn yet"),
      ]),
    ]),
    arrow(),
  ]);
}

function renderExecutions(rows = state.executions, hideAutomation = false, emptyTitle = "No run history yet") {
  if (!rows.length)
    return h(
      "div",
      { class: "glass rounded-xl" },
      emptyState(
        "activity",
        emptyTitle,
        "Scheduled and event runs appear here as they happen, each with status, start time, detail, and duration.",
      ),
    );
  return h(
    "div",
    { class: "glass rounded-xl table-wrap" },
    h("table", {}, [
      h(
        "thead",
        {},
        h(
          "tr",
          {},
          [
            !hideAutomation ? h("th", {}, "Automation") : null,
            h("th", {}, "Status"),
            h("th", {}, "Started"),
            h("th", {}, "Detail"),
            h("th", { class: "right" }, "Run time"),
          ].filter(Boolean),
        ),
      ),
      h(
        "tbody",
        {},
        rows.map((r) =>
          h(
            "tr",
            {},
            [
              !hideAutomation
                ? h(
                    "td",
                    {},
                    h(
                      "a",
                      { href: `#/automations/${encodeURIComponent(r.automationId)}` },
                      r.automationName || r.automationId || DASH,
                    ),
                  )
                : null,
              h("td", {}, statusBadge(r.status)),
              h("td", {}, r.startedAt ? started(r.startedAt) : DASH),
              h("td", { class: "truncate", title: r.detail || "" }, r.detail || DASH),
              h("td", { class: "right" }, fmtRunMs(r.runMs) || DASH),
            ].filter(Boolean),
          ),
        ),
      ),
    ]),
  );
}
function statusBadge(status) {
  const cls = status === "success" ? "success" : status === "error" ? "danger" : "neutral";
  return h("span", { class: `badge ${cls}` }, titleCase(status || "unknown"));
}
function renderExecutionsPage() {
  const status = state.route.query.get("status");
  const rows = status ? state.executions.filter((r) => r.status === status) : state.executions;
  return moduleShell(
    "executions",
    h("div", { class: "dash-container space-y-6" }, [
      h("div", { class: "list-head" }, [
        h("p", {}, "Recent runs across every automation, newest first."),
        h("div", { class: "filters" }, [
          filterChip("/executions", "All", !status),
          ...["success", "error", "skipped"].map((s) =>
            filterChip(`/executions?status=${s}`, titleCase(s), status === s),
          ),
        ]),
      ]),
      renderExecutions(rows, false, status ? `No ${status} runs` : "No run history yet"),
    ]),
  );
}

function detailHead(kind, item, tabKey) {
  const isTeam = kind === "team";
  const base = isTeam ? `/agent-teams/${item.id}` : `/automations/${item.id}`;
  return h("div", {}, [
    h("nav", { class: "crumb", "aria-label": "Breadcrumb" }, [
      h("a", { href: isTeam ? "#/agent-teams" : "#/automations" }, isTeam ? "Agent Teams" : "Automations"),
      h("span", { html: icon("chevron") }),
      h("span", {}, item.name || item.id),
    ]),
    h(
      "div",
      { class: "detail-title-row" },
      isTeam
        ? [
            h("h1", {}, item.name),
            commandPill(item.command),
            chip(labelDept(item.department)),
            buildStatusChip(item.buildStatus),
          ]
        : [h("h1", {}, item.name || item.id), chip(labelArea(item.area)), statusChip(!!item.active)],
    ),
    h(
      "p",
      { class: "trigger-line" },
      isTeam
        ? [
            h("span", {}, item.teamType || "Team"),
            h("span", { class: "sep" }, "·"),
            h("span", {}, plural((item.seats || []).length, "team member")),
            h("span", { class: "sep" }, "·"),
            h("span", {}, plural((item.skills || []).length, "skill")),
            h("span", { class: "sep" }, "·"),
            h("span", {}, `flow as of ${item.flowAsOf || "unknown"}`),
            item.lastUsed ? h("span", { class: "sep" }, "·") : null,
            item.lastUsed ? h("span", {}, `last used ${rel(item.lastUsed) || item.lastUsed}`) : null,
          ].filter(Boolean)
        : triggerSummary(item.trigger),
    ),
    h(
      "nav",
      { class: "subtabs detail-subtabs", "aria-label": `${item.name} sections` },
      isTeam
        ? [tab(base, "Flow", tabKey === "flow"), tab(`${base}/members`, "Team members & skills", tabKey === "seats")]
        : [tab(base, "Editor", tabKey === "editor"), tab(`${base}/executions`, "Executions", tabKey === "executions")],
    ),
  ]);
}
function renderAutomationDetail(id, sub = "editor") {
  const a = state.automations.find((x) => x.id === id);
  if (!a) return notFound("Automation not found");
  if (sub === "executions")
    return h("div", { class: "dash-container" }, [
      h("div", { class: "detail-normal" }, detailHead("automation", a, "executions")),
      h(
        "div",
        { style: "margin-top:1.5rem" },
        renderExecutions(
          state.executions.filter((r) => r.automationId === a.id),
          true,
          "No executions logged for this automation",
        ),
      ),
    ]);
  return h("div", { class: "dash-flow-shell" }, [
    h("div", { class: "flow-head" }, h("div", { class: "dash-gutter" }, detailHead("automation", a, "editor"))),
    h("div", { class: "flow-body" }, renderFlow(a.flow, a.name || a.id)),
  ]);
}
function renderTeamDetail(id, sub = "flow", memberSlug = null) {
  const t = state.teams.find((x) => x.id === id);
  if (!t) return notFound("Agent team not found");
  if (memberSlug)
    return h("div", { class: "dash-container" }, [
      h("div", { class: "detail-normal" }, detailHead("team", t, "seats")),
      h("div", { style: "margin-top:1.5rem" }, renderMemberDetail(t, memberSlug)),
    ]);
  if (sub === "seats")
    return h("div", { class: "dash-container" }, [
      h("div", { class: "detail-normal" }, detailHead("team", t, "seats")),
      h("div", { style: "margin-top:1.5rem" }, renderSeats(t)),
    ]);
  return h("div", { class: "dash-flow-shell" }, [
    h("div", { class: "flow-head" }, h("div", { class: "dash-gutter" }, detailHead("team", t, "flow"))),
    h("div", { class: "flow-body" }, renderFlow(t.flow, t.name, "team")),
  ]);
}
function renderSeats(t) {
  return h("div", { class: "seats-grid" }, [
    h("section", {}, [
      h("p", { class: "overline", style: "padding:0 .25rem .5rem" }, "Team members"),
      h(
        "div",
        { class: "glass rounded-xl list-block" },
        (t.seats || []).map((s) =>
          h("a", { class: "seat-row", href: `#/agent-teams/${t.id}/members/${slug(s.name)}` }, [
            h("span", {}, s.name),
            chip(s.type),
          ]),
        ),
      ),
    ]),
    h("section", {}, [
      h("p", { class: "overline", style: "padding:0 .25rem .5rem" }, "Skills"),
      h(
        "div",
        { class: "glass rounded-xl list-block" },
        (t.skills || []).map((s) =>
          h("div", { class: "skill-row" }, [
            h("div", { class: "item-title" }, [h("span", { class: "item-name" }, s.name), commandPill(s.command)]),
            h("p", {}, s.owns || ""),
          ]),
        ),
      ),
    ]),
    h(
      "p",
      { class: "meta", style: "padding:0 .25rem" },
      `Procedure lives in ${t.sourceOfTruth || "the team's source of truth"}; this flow was checked on ${t.flowAsOf || "unknown"}.`,
    ),
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
      skills.length
        ? h(
            "div",
            { class: "list-block", style: "margin-top:.5rem" },
            skills.map((s) =>
              h("div", { class: "skill-row" }, [
                h("div", { class: "item-title" }, [h("span", { class: "item-name" }, s.name), commandPill(s.command)]),
                h("p", {}, s.owns || ""),
              ]),
            ),
          )
        : h("p", { class: "lede" }, "No skills installed for this team member yet."),
    ]),
  ]);
}

// ---- The flow canvas, drawn the Command Center way: colour-coded section frames (a large coloured title, a
// one-line subtitle, a coloured top edge), wide cards with an icon tile, title, stat and detail lines and a pill,
// labelled connectors with beads on the live ones, a dot grid, zoom controls bottom-left and a map bottom-right.
// sync.py lays the graph out on a COL 300 x ROW 110 grid; these are the canvas's own scales and card sizes.
const POS_SCALE_X = 1.26,
  POS_SCALE_Y = 1.06,
  NODE_W = 288,
  NODE_H = 76,
  HINT_H = 96,
  SMALL_W = 214,
  HINT_NUDGE = 11;
const ZOOM_FLOOR = 0.95,
  ZOOM_CEIL = 1.15;
const SECTION_HEX = {
  runtime: "#2f6fd6",
  decision: "#c08a0c",
  knowledge: "#7a4fd1",
  review: "#c9463d",
  action: "#23915a",
  training: "#9b5de5",
};
const hasFlow = (flow) => !!flow && Array.isArray(flow.nodes) && flow.nodes.length > 0;
const isDarkMode = () => !document.documentElement.classList.contains("dash-light");
function flowBox(n) {
  const w = n.small ? SMALL_W : NODE_W,
    hgt = n.hint ? HINT_H : NODE_H;
  return { x: n.x * POS_SCALE_X, y: n.y * POS_SCALE_Y - (n.hint ? HINT_NUDGE : 0), w, h: hgt };
}
function flowBadge(p) {
  const tone = p.tone === "accent" ? "accent" : p.tone === "warn" ? "warn" : "";
  return h("span", { class: `node-badge ${tone}` }, p.label || p);
}
function renderFlow(flow, title, kind = "automation") {
  const wrap = h("div", { class: "dash-flow-canvas", "aria-label": `${title} flow diagram` });
  if (!hasFlow(flow)) {
    wrap.append(
      kind === "team"
        ? emptyState(
            "waypoints",
            "No system mapped yet",
            "When this team gets a workflow in its <code>team.md</code>, run <code>python3 tools/sync.py</code> and it gets drawn here.",
          )
        : emptyState(
            "waypoints",
            "No diagram yet",
            "Write this routine's steps in its <code>README.md</code>, run <code>python3 tools/sync.py</code>, and they get drawn here.",
          ),
    );
    return wrap;
  }
  const dark = isDarkMode();
  const boxes = new Map(flow.nodes.map((n) => [n.id, flowBox(n)]));
  const secs = (flow.sections || []).map((sx) => ({
    ...sx,
    X: sx.x * POS_SCALE_X,
    Y: sx.y * POS_SCALE_Y,
    W: sx.width * POS_SCALE_X,
    H: sx.height * POS_SCALE_Y,
  }));
  const all = [...boxes.values(), ...secs.map((sx) => ({ x: sx.X, y: sx.Y, w: sx.W, h: sx.H }))];
  const b = {
    x: Math.min(...all.map((q) => q.x)),
    y: Math.min(...all.map((q) => q.y)),
    r: Math.max(...all.map((q) => q.x + q.w)),
    b: Math.max(...all.map((q) => q.y + q.h)),
  };
  const stage = h("div", { class: "flow-stage", style: `width:${b.r + 400}px;height:${b.b + 400}px` });
  for (const sx of secs) {
    const hex = SECTION_HEX[sx.tone] || SECTION_HEX.runtime;
    stage.append(
      h(
        "section",
        {
          class: "flow-section",
          "aria-label": `${sx.title} section`,
          style: `left:${sx.X}px;top:${sx.Y}px;width:${sx.W}px;height:${sx.H}px;border-color:${hex}${dark ? "47" : "40"};background-image:linear-gradient(180deg, ${hex}${dark ? "1c" : "14"} 0%, ${hex}${dark ? "0a" : "08"} 38%, ${hex}05 100%)`,
        },
        [
          h("div", { class: "flow-section-top", style: `background-image:linear-gradient(90deg, ${hex}, ${hex}99)` }),
          h("div", { class: "flow-section-head" }, [
            h("span", {
              class: "flow-section-ic",
              style: `background-color:${hex}${dark ? "26" : "1a"};border-color:${hex}${dark ? "4d" : "40"};color:${hex}`,
              html: sx.icon ? icon(sx.icon) : `<span class="flow-section-dot" style="background:${hex}"></span>`,
            }),
            h("span", { class: "flow-section-text" }, [
              h("span", { class: "flow-section-title", style: `color:${dark ? hex + "f2" : hex}` }, sx.title),
              sx.subtitle ? h("span", { class: "flow-section-sub" }, sx.subtitle) : null,
            ]),
          ]),
        ],
      ),
    );
  }
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  stage.append(svg);
  for (const e of flow.edges || []) {
    const sb = boxes.get(e.source),
      tb = boxes.get(e.target);
    if (!sb || !tb) continue;
    const backward = tb.x < sb.x - 40;
    const x1 = sb.x + sb.w,
      y1 = sb.y + sb.h / 2,
      x2 = tb.x,
      y2 = tb.y + tb.h / 2;
    const d = backward ? smoothStep(x1, y1, x2, y2) : bezier(x1, y1, x2, y2);
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("class", `edge-path ${e.animated ? "live" : ""} ${e.dashed ? "dashed" : ""}`);
    svg.append(path);
    if (e.animated) {
      for (const [begin, op] of [
        ["0s", 1],
        ["-1.3s", 0.45],
      ]) {
        const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        c.setAttribute("r", "3.4");
        c.setAttribute("class", "bead-dot");
        c.setAttribute("opacity", op);
        c.innerHTML = `<animateMotion dur="2.6s" begin="${begin}" repeatCount="indefinite" path="${d}" calcMode="linear"/>`;
        svg.append(c);
      }
    }
    if (e.label && labelFits(e.label, x2 - x1))
      stage.append(
        h("span", { class: "edge-label", style: `left:${(x1 + x2) / 2}px;top:${(y1 + y2) / 2}px` }, e.label),
      );
  }
  let selected = null;
  const inspect = h("aside", { class: "inspect glass hide" });
  for (const n of flow.nodes) {
    const bx = boxes.get(n.id);
    const node = h(
      "button",
      {
        type: "button",
        class: `node glass flow-card ${n.small ? "small" : ""} ${n.tone === "accent" ? "accent" : ""} ${n.tone === "dimmed" ? "dimmed" : ""}`,
        style: `left:${bx.x}px;top:${bx.y}px;width:${bx.w}px`,
        "data-node-id": n.id,
        onclick: () => {
          selected?.classList.remove("selected");
          selected = node;
          node.classList.add("selected");
          inspect.classList.remove("hide");
          inspect.innerHTML = "";
          inspect.append(
            h("div", { class: "inspect-head" }, [
              h("span", { class: "inspect-icon", html: icon(n.icon || "waypoints") }),
              h("div", {}, [h("h3", {}, n.title || n.id), h("p", { class: "stat" }, n.stat || "")]),
              h("button", {
                type: "button",
                "aria-label": "Close details",
                onclick: () => inspect.classList.add("hide"),
                html: icon("close"),
              }),
            ]),
            h("p", {}, n.detail || n.hint || "No detail has been written for this step."),
          );
        },
      },
      [
        h("div", { class: "node-row" }, [
          h("span", { class: "node-icon", html: icon(n.icon || "waypoints") }),
          h(
            "span",
            { class: "node-text" },
            [
              h(
                "span",
                { class: "node-title" },
                [h("span", {}, n.title || n.id), n.pill ? flowBadge(n.pill) : null].filter(Boolean),
              ),
              h("p", { class: "node-stat" }, n.stat || ""),
              n.hint ? h("p", { class: "node-hint" }, n.hint) : null,
            ].filter(Boolean),
          ),
        ]),
      ],
    );
    stage.append(node);
  }
  wrap.append(stage);
  const entry = boxes.get("entry");
  const bounds = { ...b, entry, sections: secs.length > 0 };
  wrap.append(inspect, controls(stage, wrap, bounds), minimap(flow, boxes, b, dark));
  requestAnimationFrame(() => fitFlow(wrap, stage, bounds));
  wirePanZoom(wrap, stage, bounds);
  return wrap;
}
function bezier(x1, y1, x2, y2) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const c = Math.max(0.05, Math.min(0.26, 85 / (len || 1)));
  const dx = Math.max(70, Math.abs(x2 - x1) * c);
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
}
function smoothStep(x1, y1, x2, y2) {
  const mx = (x1 + x2) / 2;
  return `M ${x1} ${y1} L ${mx} ${y1} Q ${mx + 22} ${y1} ${mx + 22} ${y1 + Math.sign(y2 - y1) * 22} L ${mx + 22} ${y2 - Math.sign(y2 - y1) * 22} Q ${mx + 22} ${y2} ${mx} ${y2} L ${x2} ${y2}`;
}
function labelFits(label, gap) {
  return /[→≥≤★]/.test(label) || gap >= label.length * 5.6 + 20;
}
// Fit like the original: a sectioned canvas opens at zoom 0.95 from its top-left, with the trunk centred when
// it fits; anything else fits the whole graph between 0.95 and 1.15.
function fitFlow(wrap, stage, b) {
  const box = wrap.getBoundingClientRect();
  if (b.sections) {
    const z = box.width < 700 ? Math.max(0.45, Math.min(ZOOM_FLOOR, box.width / (b.r - b.x + 48))) : ZOOM_FLOOR;
    let y = 24 - b.y * z;
    if (b.entry) y = Math.min(y, box.height / 2 - (b.entry.y + b.entry.h / 2) * z);
    state.flow.zoom = z;
    state.flow.pan = { x: 24 - b.x * z, y };
  } else {
    const z = Math.max(0.35, Math.min(ZOOM_CEIL, (box.width * 0.86) / (b.r - b.x), (box.height * 0.78) / (b.b - b.y)));
    state.flow.zoom = z;
    state.flow.pan = {
      x: Math.max(24, (box.width - (b.r - b.x) * z) / 2) - b.x * z,
      y: Math.max(24, (box.height - (b.b - b.y) * z) / 2) - b.y * z,
    };
  }
  applyFlow(stage);
}
function applyFlow(stage) {
  stage.style.transform = `translate(${state.flow.pan.x}px, ${state.flow.pan.y}px) scale(${state.flow.zoom})`;
  const z = $(".zoom-label", stage.parentElement);
  if (z) z.textContent = `${Math.round(state.flow.zoom * 100)}%`;
}
function controls(stage, wrap, bounds) {
  return h("div", { class: "flow-controls glass" }, [
    h(
      "button",
      {
        type: "button",
        title: "Zoom in",
        onclick: () => {
          state.flow.zoom = Math.min(1.75, state.flow.zoom * 1.12);
          applyFlow(stage);
        },
      },
      "+",
    ),
    h(
      "button",
      {
        type: "button",
        title: "Zoom out",
        onclick: () => {
          state.flow.zoom = Math.max(0.1, state.flow.zoom * 0.89);
          applyFlow(stage);
        },
      },
      "−",
    ),
    h("button", { type: "button", title: "Fit", onclick: () => fitFlow(wrap, stage, bounds) }, "⤢"),
    h("span", { class: "zoom-label" }, "100%"),
  ]);
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
  const stop = () => {
    drag = null;
    wrap.classList.remove("dragging");
  };
  wrap.addEventListener("pointerup", stop);
  wrap.addEventListener("pointercancel", stop);
  wrap.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      state.flow.zoom = Math.max(0.1, Math.min(1.75, state.flow.zoom * (e.deltaY > 0 ? 0.92 : 1.08)));
      applyFlow(stage);
    },
    { passive: false },
  );
  window.addEventListener("resize", () => fitFlow(wrap, stage, bounds), { once: true });
}
function minimap(flow, boxes, b, dark) {
  const w = b.r - b.x,
    hh = b.b - b.y,
    k = Math.min(130 / w, 70 / hh);
  const col = (n) =>
    n.tone === "accent"
      ? dark
        ? "#42caad"
        : "#1d1c1a"
      : n.tone === "dimmed"
        ? dark
          ? "#454240"
          : "#d0ccc3"
        : dark
          ? "#6f6b67"
          : "#a8a39a";
  const rects = flow.nodes
    .map((n) => {
      const q = boxes.get(n.id);
      return `<rect x="${10 + (q.x - b.x) * k}" y="${10 + (q.y - b.y) * k}" width="${Math.max(4, q.w * k)}" height="${Math.max(3, q.h * k)}" rx="1.5" fill="${col(n)}"/>`;
    })
    .join("");
  return h("div", { class: "minimap glass", html: `<svg viewBox="0 0 150 90" aria-hidden="true">${rects}</svg>` });
}

function notFound(title) {
  return h(
    "div",
    { class: "dash-container" },
    emptyState("alert", title, "Check the URL or use the sidebar to get back."),
  );
}
function parseRoute() {
  const raw = (location.hash || "#/agent-teams").slice(1);
  const [pathRaw, queryRaw = ""] = raw.split("?");
  const parts = pathRaw.split("/").filter(Boolean).map(decodeURIComponent);
  state.route = { parts, query: new URLSearchParams(queryRaw) };
}

// ---- The shell: the Command Center's side panel (Dashboard · Agent · WORKSPACE: Content, Web & Analytics,
// Automations · Settings at the bottom) and the floating top bar. A module's sub-items drop down under it: always
// when you're inside it, or when you open it with its arrow (remembered on this computer).
const RAIL_KEY = "cc-sidepanel-collapsed",
  THEME_KEY = "cc-theme",
  OPEN_KEY = "cc-sidepanel-open";
const store = {
  get: (k) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* private window */
    }
  },
};
const UTILITY = [
  ["/dashboard", "Dashboard", "gauge"],
  ["/agent", "Agent", "sparkles"],
];
const MODULES = [
  {
    key: "content",
    label: "Content",
    href: "/content",
    icon: "radio",
    description: "Plan, schedule, and review posts for every platform you're on.",
    children: [
      ["/content", "Overview", "layoutGrid", null, true],
      ["/content/calendar", "Calendar", "calendarDays"],
      ["/content/research", "Research", "search"],
      ...["tiktok", "instagram", "twitter", "threads", "youtube", "skool", "linkedin"].map((p) => [
        `/content/${p}`,
        PLATFORM_LABEL[p],
        null,
        p,
      ]),
    ],
  },
  {
    key: "web",
    label: "Web & Analytics",
    href: "/web",
    icon: "globe",
    description: "See where your traffic comes from and how you rank in search.",
    children: [
      ["/web", "Overview", null, null, true],
      ["/web/landing", "Landing Pages"],
      ["/web/traffic", "Traffic"],
      ["/web/geography", "Geography"],
      ["/web/pages", "Pages"],
      ["/web/search", "Search"],
      ["/web/settings", "Settings"],
    ],
  },
  {
    key: "automations",
    label: "Automations",
    href: "/agent-teams",
    icon: "waypoints",
    description: "Your agent teams, their workflows, and every routine your department runs.",
    match: ["/agent-teams", "/automations", "/executions"],
    children: [
      ["/agent-teams", "Agent Teams"],
      ["/automations", "Automations"],
      ["/executions", "Executions"],
    ],
  },
];
let clickedSection = null; // { key, path }: the section opened by a click on this page (the pill moves to it)
let lastSection = null; // the section the previous screen was in (reset on every page load = first load opens it)
function sectionPrefs() {
  try {
    const v = JSON.parse(store.get(OPEN_KEY) || "{}");
    return v && typeof v === "object" && !Array.isArray(v) ? v : {};
  } catch {
    return {};
  }
}
function railLink(path, label, ic, active, extraCls, tip = true) {
  return h(
    "a",
    {
      href: `#${path}`,
      class: cls("rail-link", extraCls),
      "aria-current": active ? "page" : null,
      title: tip ? label : null,
    },
    [h("span", { class: "rail-ic", html: lineIcon(ic) }), h("span", { class: "rail-label truncate" }, label)],
  );
}
function renderShell() {
  const p = state.route.parts,
    path = "/" + p.join("/"),
    inSettings = p[0] === "settings";
  const collapsed = store.get(RAIL_KEY) === "1" && !matchMedia("(max-width: 767px)").matches;
  const rail = $("#rail");
  rail.classList.toggle("collapsed", collapsed);
  const under = (href) => path === href || path.startsWith(href + "/");
  let inner;
  if (inSettings) {
    const a = (state.settings && state.settings.account) || {};
    inner = [
      h(
        "div",
        { class: "rail-top" },
        h("a", { href: "#/dashboard", class: "rail-back" }, [
          h("span", { class: "rail-ic", html: lineIcon("arrowLeft") }),
          h("span", { class: "rail-label truncate" }, "Command Center"),
        ]),
      ),
      h("div", { class: "rail-id" }, [
        h("span", { class: "id-avatar" }, ((a.name || "Y").trim()[0] || "Y").toUpperCase()),
        h("span", { class: "min0 rail-label" }, [
          h("span", { class: "id-name" }, a.name || "Your name"),
          h("span", { class: "id-role" }, a.role || "Owner"),
        ]),
      ]),
      h("nav", { class: "rail-nav", "aria-label": "Settings sections" }, [
        h("p", { class: "rail-group" }, "Settings"),
        ...SETTINGS_SECTIONS.map((s) =>
          railLink(`/settings/${s.slug}`, s.label, s.icon, (p[1] || "account") === s.slug),
        ),
      ]),
    ];
  } else {
    // A section header is a button: it opens and closes its pages. The section you're in starts open;
    // what you open or close is remembered on this computer ("open" / "closed" per section).
    const prefs = sectionPrefs();
    const current = MODULES.find((m) => (m.match || [m.href]).some(under));
    if (current && current.key !== lastSection) {
      prefs[current.key] = "open";
      for (const o of MODULES) if (o.key !== current.key) prefs[o.key] = "closed";
      store.set(OPEN_KEY, JSON.stringify(prefs));
    } // entering a section opens it
    lastSection = current ? current.key : null;
    const isOpen = (m) => (prefs[m.key] ? prefs[m.key] === "open" : (m.match || [m.href]).some(under));
    // The pill marks the section of the page you're on, and moves to a section you open from here (one at a
    // time). A section left open from an earlier visit isn't lit; nor is anything in icons-only mode but the page's own.
    if (clickedSection && clickedSection.path !== path) clickedSection = null;
    const openMod =
      collapsed || !clickedSection ? null : MODULES.find((m) => m.key === clickedSection.key && isOpen(m));
    const modBlock = (m) => {
      const active = (m.match || [m.href]).some(under);
      const open = isOpen(m);
      const lit = openMod ? openMod.key === m.key : active;
      return h("li", {}, [
        h(
          "button",
          {
            type: "button",
            class: cls("rail-link mod rail-mod-btn", lit && "in-section"),
            "aria-current": active ? "true" : null,
            "aria-expanded": open ? "true" : "false",
            "data-label": m.label,
            title: collapsed ? m.label : null,
            onclick: () => {
              const pr = sectionPrefs();
              pr[m.key] = open ? "closed" : "open";
              clickedSection = open ? null : { key: m.key, path };
              if (!open) for (const o of MODULES) if (o.key !== m.key) pr[o.key] = "closed";
              /* accordion: one open at a time */ store.set(OPEN_KEY, JSON.stringify(pr));
              if (store.get(RAIL_KEY) === "1" && !open) {
                /* icons-only: opening goes to the section */ location.hash = `#${m.href}`;
              }
              renderShell();
            },
          },
          [
            h("span", { class: "rail-ic", html: lineIcon(m.icon) }),
            h("span", { class: "rail-label truncate" }, m.label),
            h("span", {
              class: cls("rail-caret", open && "open"),
              html: lineIcon("chevronDown"),
              "aria-hidden": "true",
            }),
          ],
        ),
        open
          ? h(
              "ul",
              { class: "rail-children" },
              m.children
                .filter(
                  ([, , , platform]) => !platform || !((state.settings || {}).hiddenPlatforms || []).includes(platform),
                )
                .map(([href, label, ic, platform, exact]) => {
                  const on = exact ? path === href : under(href);
                  return h(
                    "li",
                    {},
                    h("a", { href: `#${href}`, class: "rail-child", "aria-current": on ? "page" : null }, [
                      platform
                        ? h("span", { class: "child-ic", html: platformMark(platform) })
                        : ic
                          ? h("span", { class: "child-ic", html: lineIcon(ic) })
                          : null,
                      h("span", { class: "truncate" }, label),
                    ]),
                  );
                }),
            )
          : null,
      ]);
    };
    inner = [
      h("div", { class: "rail-top" }, [
        h("a", { href: "#/dashboard", class: "rail-brand rail-label" }, [
          h("span", { class: "rail-ic", html: lineIcon("layoutGrid") }),
          h("span", { class: "truncate" }, "Command Center"),
        ]),
        h("button", {
          type: "button",
          class: "rail-toggle",
          "aria-pressed": collapsed ? "true" : "false",
          "aria-label": collapsed ? "Pin side panel open" : "Collapse side panel",
          onclick: () => {
            if (document.body.classList.contains("drawer-open")) {
              document.body.classList.remove("drawer-open");
              return;
            }
            store.set(RAIL_KEY, collapsed ? "0" : "1");
            renderShell();
          },
          html: lineIcon(collapsed ? "panelOpen" : "panelClose"),
        }),
      ]),
      h("nav", { class: "rail-nav", "aria-label": "Dashboard sections" }, [
        h(
          "ul",
          { class: "rail-sec" },
          UTILITY.map(([href, l, ic]) => h("li", {}, railLink(href, l, ic, under(href) && !openMod, null, collapsed))),
        ),
        h("div", { class: "rail-sec" }, [
          h("p", { class: "rail-group" }, "Workspace"),
          h("div", { class: "rail-rule" }),
          h("ul", { class: "rail-mods" }, MODULES.map(modBlock)),
        ]),
      ]),
      h("div", { class: "rail-bottom" }, railLink("/settings/account", "Settings", "settings", false, "settings-link")),
    ];
  }
  rail.replaceChildren(h("div", { class: "dash-rail" }, inner));
  const titles = {
    dashboard: "Dashboard",
    agent: "Agent",
    settings: "Settings",
    content: "Content",
    web: "Web & Analytics",
  };
  const title = titles[p[0]] || "Automations";
  $("#headerTitle").textContent = title;
  $("#modePill").textContent = state.server ? "Editing on" : "From your repo";
  $("#modePill").title = state.server
    ? "tools/serve.py is running: saves land in your files"
    : "Read-only. Run python3 tools/serve.py to edit from here";
  $("#themeBtn").innerHTML = lineIcon(document.documentElement.classList.contains("dash-light") ? "moon" : "sun");
  document.title = `${title} · Command Center`;
}
function setTheme(t) {
  document.documentElement.classList.toggle("dash-light", t === "light");
  store.set(THEME_KEY, t);
  render();
}
function render() {
  parseRoute();
  const p = state.route.parts;
  let view;
  if (p[0] === "agent-teams" && p[1] && p[2] === "members") view = renderTeamDetail(p[1], "seats", p[3]);
  else if (p[0] === "agent-teams" && p[1]) view = renderTeamDetail(p[1], p[2] === "members" ? "seats" : "flow");
  else if (p[0] === "agent-teams") view = renderTeams();
  else if (p[0] === "executions") view = renderExecutionsPage();
  else if (p[0] === "automations" && p[1])
    view = renderAutomationDetail(p[1], p[2] === "executions" ? "executions" : "editor");
  else if (p[0] === "content") view = renderContent(p);
  else if (p[0] === "settings") view = renderSettings(p);
  else if (p[0] === "web") view = renderWeb(p);
  else if (p[0] === "dashboard") view = renderDashboard();
  else if (p[0] === "agent") view = renderAgent();
  else if (p[0] === "overview")
    view = renderDashboard(); // the old Overview page: its links land on the Dashboard
  else view = renderAutomations();
  renderShell();
  document.body.classList.remove("drawer-open");
  app.replaceChildren(...[].concat(view));
  app.focus({ preventScroll: true });
  if (comp) drawSheet();
}
function applyState(s) {
  if (!s) return;
  state.content = s.content || state.content;
  state.settings = s.settings || state.settings;
  state.keys = s.keys || null;
  state.web = s.web || null;
  state.payments = s.payments || null;
  state.landingPages = s.landingPages || state.landingPages;
  state.problems = s.problems || [];
  state.server = s.server || null;
}
async function boot() {
  if (store.get(THEME_KEY) === "light") document.documentElement.classList.add("dash-light");
  if (window.CC_DATA) {
    // tools/sync.py writes data/data.js, so this page opens straight from the folder (no server needed)
    state.automations = window.CC_DATA.automations || [];
    state.teams = window.CC_DATA.teams || [];
    state.executions = window.CC_DATA.executions || [];
    state.content = window.CC_DATA.content || { posts: [], research: {} };
    state.settings = window.CC_DATA.settings || {};
    state.landingPages = window.CC_DATA.landingPages || null;
  }
  state.web = window.CC_WEB || null; // tools/pull_web.py writes data/web.js; it stays on this computer
  state.payments = window.CC_PAYMENTS || null; // tools/sync.py copies payments.json to data/payments.js; both stay on this computer
  // Served by tools/serve.py? Then read the live files and turn editing on.
  if (location.protocol.startsWith("http")) {
    try {
      const res = await fetch("api/state", { cache: "no-store" });
      if (res.ok) applyState(await res.json());
    } catch {
      /* a plain static host: stay read-only */
    }
  }
  $("#themeBtn").addEventListener("click", () =>
    setTheme(document.documentElement.classList.contains("dash-light") ? "dark" : "light"),
  );
  $("#menuBtn").addEventListener("click", () => document.body.classList.toggle("drawer-open"));
  $("#drawerShade").addEventListener("click", () => document.body.classList.remove("drawer-open"));
  window.addEventListener("hashchange", render);
  if (!location.hash) history.replaceState(null, "", `${location.pathname}${location.search}#/dashboard`);
  render();
}
boot();
