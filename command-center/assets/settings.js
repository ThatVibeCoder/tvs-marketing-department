// Settings: Account, Workspace, Brands, Connected Accounts, Posting Cadence, Developer.
// Plain settings save to command-center/settings.json. API keys save to the .env file at the top of
// the repo (skipped by every save) and never come back to this page: it only ever learns set / not set.

const SETTINGS_SECTIONS = [
  { slug: "account", label: "Account", icon: "user" },
  { slug: "workspace", label: "Workspace", icon: "box" },
  { slug: "brands", label: "Brands", icon: "layers" },
  { slug: "accounts", label: "Connected Accounts", icon: "radio" },
  { slug: "cadence", label: "Posting Cadence", icon: "calendarClock" },
  { slug: "agents", label: "AI Agents", icon: "sparkle" },
  { slug: "developer", label: "Developer", icon: "terminal" }
];
const POSTERS = [
  { id: "manual", label: "I post it myself", desc: "post-content gets each post ready on its platform and you press send. Nothing to connect. The default." },
  { id: "blotato", label: "Blotato", desc: "An auto-poster: connect your social accounts inside Blotato once, and post-content can hand each approved post to it." },
  { id: "metricool", label: "Metricool", desc: "A planner with an API (on its Advanced plan): post-content can schedule approved posts into it." },
  { id: "ayrshare", label: "Ayrshare", desc: "A posting API for every network at once. post-content can send approved posts through it." },
  { id: "api", label: "My own platform keys", desc: "Your own developer keys for each platform. The most setup, the most control." }
];
const PROVIDERS = [
  { id: "blotato", name: "Blotato", kind: "poster", url: "https://my.blotato.com/settings", urlLabel: "my.blotato.com → Settings",
    steps: ["Sign in to Blotato and connect the social accounts you post to.", "Open Settings, then API, and generate an API key.", "Paste it below and press Save. It goes into .env, nowhere else."], keys: [["BLOTATO_API_KEY", "API key"]] },
  { id: "metricool", name: "Metricool", kind: "poster", url: "https://app.metricool.com/", urlLabel: "app.metricool.com",
    steps: ["API access comes with Metricool's Advanced plan. Check your plan first.", "In Metricool, open your account settings, then API, and copy your user token.", "Your user id and blog id are in the address bar of any Metricool page (userId= and blogId=)."], keys: [["METRICOOL_USER_TOKEN", "User token"], ["METRICOOL_USER_ID", "User id"], ["METRICOOL_BLOG_ID", "Blog id"]] },
  { id: "ayrshare", name: "Ayrshare", kind: "poster", url: "https://app.ayrshare.com/", urlLabel: "app.ayrshare.com",
    steps: ["Sign in to Ayrshare and link your social accounts.", "Open the API Key page and copy your key.", "Paste it below and press Save."], keys: [["AYRSHARE_API_KEY", "API key"]] },
  { id: "meta", name: "Instagram + Threads (Meta)", kind: "api", url: "https://developers.facebook.com/apps", urlLabel: "developers.facebook.com/apps",
    steps: ["Create an app, then add the Instagram and Threads APIs to it.", "Your Instagram account has to be a professional (business or creator) account.", "Generate a long-lived access token for each and paste them below."], keys: [["META_ACCESS_TOKEN", "Instagram access token"], ["INSTAGRAM_ACCOUNT_ID", "Instagram account id"], ["THREADS_ACCESS_TOKEN", "Threads access token"]] },
  { id: "x", name: "X (Twitter)", kind: "api", url: "https://developer.x.com/en/portal/dashboard", urlLabel: "developer.x.com",
    steps: ["Create a project and an app in the developer portal.", "Set the app's permissions to read and write.", "Under Keys and tokens, copy all four values."], keys: [["X_API_KEY", "API key"], ["X_API_SECRET", "API secret"], ["X_ACCESS_TOKEN", "Access token"], ["X_ACCESS_SECRET", "Access secret"]] },
  { id: "linkedin", name: "LinkedIn", kind: "api", url: "https://www.linkedin.com/developers/apps", urlLabel: "linkedin.com/developers/apps",
    steps: ["Create an app tied to your page or profile.", "Request the Share on LinkedIn product.", "Generate an access token with the posting permission and paste it below."], keys: [["LINKEDIN_ACCESS_TOKEN", "Access token"]] },
  { id: "youtube", name: "YouTube", kind: "api", url: "https://console.cloud.google.com/apis/credentials", urlLabel: "Google Cloud → Credentials",
    steps: ["Turn on the YouTube Data API v3 in a Google Cloud project.", "Create an OAuth client (desktop app).", "Paste its client id and secret below. The first upload asks you to sign in once."], keys: [["YOUTUBE_CLIENT_ID", "Client id"], ["YOUTUBE_CLIENT_SECRET", "Client secret"]] },
  { id: "tiktok", name: "TikTok", kind: "api", url: "https://developers.tiktok.com/apps", urlLabel: "developers.tiktok.com/apps",
    steps: ["Create an app and add the Content Posting API to it.", "TikTok reviews the app before it can post publicly.", "Paste the client key and secret below."], keys: [["TIKTOK_CLIENT_KEY", "Client key"], ["TIKTOK_CLIENT_SECRET", "Client secret"]] }
];
const COMMON_TZ = ["America/New_York", "America/Chicago", "America/Denver", "America/Phoenix", "America/Los_Angeles", "America/Anchorage", "Pacific/Honolulu", "America/Toronto", "America/Vancouver", "America/Mexico_City", "America/Sao_Paulo", "Europe/London", "Europe/Dublin", "Europe/Paris", "Europe/Berlin", "Europe/Madrid", "Europe/Amsterdam", "Africa/Johannesburg", "Asia/Dubai", "Asia/Kolkata", "Asia/Singapore", "Asia/Tokyo", "Australia/Sydney", "Pacific/Auckland"];
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

async function saveSettings(patch, msg) {
  const r = await api("/api/settings", patch);
  if (r) { toast(msg || "Saved to command-center/settings.json."); render(); }
}
function settingsPane(title, description, children) {
  return h("div", { class: "dash-container" }, [h("div", { class: "mb8" }, [h("h1", { class: "h1-2xl" }, title), description ? h("p", { class: "lede" }, description) : null]), readOnlyNote(), h("div", { class: "settings-stack" }, children)]);
}
function settingsSection(id, title, description, children) {
  return h("section", { id, class: "glass rounded-xl set-section" }, [title ? h("div", { class: "set-section-head" }, [h("p", { class: "set-title" }, title), description ? h("p", { class: "set-desc" }, description) : null]) : null, h("div", { class: "set-body" }, children)]);
}
function settingRow(label, value, hint) { return h("div", { class: "set-row" }, [h("span", { class: "set-label" }, label), h("div", { class: "right-al" }, [h("span", { class: "set-value" }, value), hint ? h("p", { class: "set-hint" }, hint) : null])]); }
function presenceDot(on) { return h("span", { class: cls("presence", on && "on"), "aria-hidden": "true" }); }
function fieldInput(attrs) { return h("input", { class: "field", ...attrs, readonly: state.server ? null : "" }); }
function saveBtn(onclick, label = "Save") { return h("button", { type: "button", class: "btn-outline save-btn", disabled: state.server ? null : "", onclick }, [svgIcon("checkMark", "accent"), label]); }

function renderAccountSettings() {
  const a = settings().account || {};
  const name = fieldInput({ value: a.name || "", placeholder: "Your name", maxlength: "120" }), role = fieldInput({ value: a.role || "Owner", placeholder: "Owner", maxlength: "80" });
  return settingsPane("Account", "Who runs this department. It shows in the sidebar of Settings.", [
    settingsSection("account", null, null, [
      h("div", { class: "row gap3" }, [h("span", { class: "id-avatar lg" }, ((a.name || "Y").trim()[0] || "Y").toUpperCase()), h("div", { class: "min0" }, [h("p", { class: "set-value b" }, a.name || "Your name"), h("p", { class: "set-hint" }, a.role || "Owner")])]),
      h("div", { class: "form-grid mt4" }, [h("label", { class: "pf-field" }, [h("span", { class: "pf-label" }, "Your name"), name]), h("label", { class: "pf-field" }, [h("span", { class: "pf-label" }, "Role"), role])]),
      h("div", { class: "mt3" }, saveBtn(() => saveSettings({ account: { name: name.value.trim(), role: role.value.trim() || "Owner" } }))),
      h("div", { class: "mt4" }, [settingRow("Theme", isDarkTheme() ? "Dark" : "Light", "Switch it with the sun and moon button in the top bar. It's remembered on this computer."), settingRow("Where this is saved", h("code", {}, "command-center/settings.json"), "This file is saved to GitHub with the rest of your repo, so keep anything private out of it.")])
    ])
  ]);
}
function renderWorkspaceSettings() {
  const w = settings().workspace || {};
  const nameIn = fieldInput({ value: w.name || "", placeholder: "Your Department", maxlength: "120" });
  const tz = w.timezone || "America/New_York";
  const tzSel = h("select", { class: "field", disabled: state.server ? null : "" }, [...new Set([tz, ...COMMON_TZ])].map((z) => { const o = h("option", { value: z }, z); if (z === tz) o.selected = true; return o; }));
  return settingsPane("Workspace", "The department as a whole: its name and the timezone every post time is in.", [
    settingsSection("workspace", null, null, [
      h("div", { class: "form-grid" }, [h("label", { class: "pf-field" }, [h("span", { class: "pf-label" }, "Workspace name"), nameIn]), h("label", { class: "pf-field" }, [h("span", { class: "pf-label" }, "Timezone"), tzSel])]),
      h("p", { class: "set-hint mt2" }, "Every date and time in your post files, the calendar and your posting cadence is in this timezone."),
      h("div", { class: "mt3" }, saveBtn(() => saveSettings({ workspace: { ...w, name: nameIn.value.trim() || "Your Department", timezone: tzSel.value } }))),
      h("div", { class: "mt4" }, [settingRow("Agent teams", `${state.teams.length}`, "Rebuilt from departments/ by tools/sync.py."), settingRow("Posts", `${posts().length} files`, POSTS_HOME + "/")])
    ])
  ]);
}
function renderBrandSettings() {
  const s = settings(), brands = (s.brands || []).map((b) => ({ ...b }));
  const active = brands.find((b) => b.active) || brands[0];
  const nameIn = fieldInput({ placeholder: "Brand name", maxlength: "80" }), handleIn = fieldInput({ placeholder: "@handle", maxlength: "80" });
  const cats = [...(s.skoolCategories || [])];
  const catIn = fieldInput({ placeholder: "Add a category, exactly as it reads in your community", maxlength: "60" });
  return settingsPane("Brands", active ? `Active brand "${active.name}". Its name and handle are what every preview shows.` : "Add a brand to get started.", [
    settingsSection("brands", null, null, [
      brands.length ? h("ul", { class: "brand-pills" }, brands.map((b, i) => h("li", { class: cls("brand-pill", b === active && "on") }, [
        h("button", { type: "button", class: "brand-pick", disabled: state.server ? null : "", title: "Make this the active brand", onclick: () => saveSettings({ brands: brands.map((x, j) => ({ ...x, active: j === i })) }, `${b.name} is the active brand.`) }, [b === active ? svgIcon("checkMark", "accent") : null, b.name, h("span", { class: "tiny-sub" }, b.handle || "")]),
        brands.length > 1 ? h("button", { type: "button", class: "pill-x", "aria-label": `Remove ${b.name}`, disabled: state.server ? null : "", onclick: () => { const rest = brands.filter((_, j) => j !== i); if (!rest.some((x) => x.active)) rest[0].active = true; saveSettings({ brands: rest }); }, html: lineIcon("x") }) : null
      ]))) : h("p", { class: "set-hint mb6" }, "No brands yet. Add one below to get started."),
      h("p", { class: "overline mt6 mb3" }, "Add or rename a brand"),
      h("div", { class: "form-grid three" }, [nameIn, handleIn, saveBtn(() => {
        const name = nameIn.value.trim(); if (!name) return toast("Give the brand a name first.");
        const id = slug(name), existing = brands.find((b) => b.id === id);
        if (existing) Object.assign(existing, { name, handle: handleIn.value.trim() || existing.handle }); else brands.push({ id, name, handle: handleIn.value.trim(), active: !brands.length });
        saveSettings({ brands });
      }, "Add")]),
      h("p", { class: "set-hint mt2" }, "Same name as one you have renames its handle. One brand is active at a time.")
    ]),
    settingsSection("skool-categories", "Skool categories", "The categories in your Skool community, word for word. The Skool editor offers exactly these, because a post with the wrong category won't go up.", [
      h("ul", { class: "brand-pills" }, cats.map((c, i) => h("li", { class: "brand-pill" }, [h("span", { class: "brand-pick static" }, c), h("button", { type: "button", class: "pill-x", "aria-label": `Remove ${c}`, disabled: state.server ? null : "", onclick: () => saveSettings({ skoolCategories: cats.filter((_, j) => j !== i) }) , html: lineIcon("x") })]))),
      h("div", { class: "form-grid two mt3" }, [catIn, saveBtn(() => { const v = catIn.value.trim(); if (v && !cats.includes(v)) saveSettings({ skoolCategories: [...cats, v] }); }, "Add")])
    ])
  ]);
}
function keyField(name, label) {
  const on = !!(state.keys || {})[name];
  const inp = h("input", { class: "field mono", type: "password", autocomplete: "off", spellcheck: "false", placeholder: on ? "Saved. Paste a new one to replace it" : `Paste your ${label.toLowerCase()}`, readonly: state.server ? null : "", "aria-label": `${label} (${name})` });
  const save = async (value) => { const r = await api("/api/keys", { name, value }); if (r) { toast(value ? `${name} saved to .env.` : `${name} removed from .env.`); render(); } };
  return h("div", { class: "key-row" }, [
    h("div", { class: "key-name" }, [presenceDot(on), h("code", {}, name), h("span", { class: "tiny-sub" }, state.server ? (on ? "set" : "unset") : "")]),
    h("div", { class: "key-input" }, [inp, h("button", { type: "button", class: "btn-outline save-btn", disabled: state.server ? null : "", onclick: () => { const v = inp.value.trim(); if (!v) return toast("Paste the key first."); save(v); } }, [svgIcon("key", "accent"), "Save"]),
      on ? h("button", { type: "button", class: "icon-btn danger-hover", "aria-label": `Remove ${name}`, title: "Remove it from .env", onclick: () => save(""), html: lineIcon("trash") }) : null])
  ]);
}
function providerCard(p) {
  const known = !!state.server, set = p.keys.filter(([k]) => (state.keys || {})[k]).length, connected = known && set === p.keys.length;
  const d = h("details", { class: "glass rounded-xl provider", open: openProviders.has(p.id) ? "" : null, ontoggle: () => { if (d.open) openProviders.add(p.id); else openProviders.delete(p.id); } }, [
    h("summary", { class: "provider-sum" }, [h("span", { class: "provider-name" }, p.name),
      !known ? h("span", { class: "status-pill" }, "start the server to check") : connected ? h("span", { class: "status-pill ok" }, "connected") : set ? h("span", { class: "status-pill warn" }, `${set} of ${p.keys.length} saved`) : h("span", { class: "status-pill" }, "not connected"),
      h("span", { class: "chev-rot ml-auto", html: lineIcon("chevronRight") })]),
    h("div", { class: "provider-body" }, [
      h("a", { class: "accent-link row gap15", href: p.url, target: "_blank", rel: "noreferrer" }, [svgIcon("external"), `Get your key: ${p.urlLabel}`]),
      h("ol", { class: "steps" }, p.steps.map((s) => h("li", {}, s))),
      ...p.keys.map(([k, l]) => keyField(k, l))
    ])
  ]);
  return d;
}
const openProviders = new Set();
function renderConnectedAccounts() {
  const s = settings(), poster = s.poster || "manual", accts = s.accounts || {};
  const handleInputs = {};
  return settingsPane("Connected Accounts", "Your accounts on each platform, and how approved posts get out the door. Posting always runs through the post-content skill; nothing here posts on its own.", [
    settingsSection("poster", "How your posts go out", "Pick one. You can change it any time.", [
      h("div", { class: "poster-grid" }, POSTERS.map((p) => h("button", { type: "button", class: cls("poster-opt", poster === p.id && "on"), "aria-pressed": poster === p.id ? "true" : "false", disabled: state.server ? null : "", onclick: () => saveSettings({ poster: p.id }, `Posts now go out: ${p.label}.`) }, [h("span", { class: "row gap15 b" }, [poster === p.id ? svgIcon("checkCircle", "accent") : svgIcon("plug", "muted"), p.label]), h("span", { class: "set-hint" }, p.desc)]))),
      h("p", { class: "set-hint mt3" }, "Keys you save below go into the .env file at the top of your repo. Saving to GitHub skips that file, and this page never shows a key again, only whether it's set. post-content uses them on your computer, and only for posts you approved.")
    ]),
    settingsSection("auto-posters", "Auto-posters", "Connect one, and post-content can hand it your approved posts.", PROVIDERS.filter((p) => p.kind === "poster").map(providerCard)),
    settingsSection("platform-keys", "Your own platform keys", "Only if you picked “My own platform keys” above. Each platform's own developer keys.", PROVIDERS.filter((p) => p.kind === "api").map(providerCard)),
    settingsSection("handles", "Your accounts", "The handle each platform's preview shows, and which connection posts there.", [
      ...PLATFORM_ORDER.map((pl) => {
        const a = accts[pl] || {}, hIn = fieldInput({ value: a.handle || "", placeholder: `Your ${PLATFORM_LABEL[pl]} handle (e.g. @yourhandle)`, maxlength: "120" });
        const via = h("select", { class: "field", disabled: state.server ? null : "" }, POSTERS.map((p) => { const o = h("option", { value: p.id }, p.id === "manual" ? "I post it myself" : p.label); if ((a.connectedVia || "manual") === p.id) o.selected = true; return o; }));
        handleInputs[pl] = [hIn, via];
        return h("div", { class: "acct-row" }, [h("div", { class: "row gap2 mb2" }, [markIcon(pl), h("span", { class: "set-value b" }, PLATFORM_LABEL[pl]), a.handle ? h("span", { class: "status-pill ok" }, "set up") : h("span", { class: "status-pill" }, "not set up")]),
          h("div", { class: "form-grid three" }, [hIn, via, saveBtn(() => saveSettings({ accounts: { ...accts, [pl]: { handle: hIn.value.trim(), connectedVia: via.value } } }, `${PLATFORM_LABEL[pl]} saved.`))])]);
      })
    ])
  ]);
}
function renderCadenceSettings() {
  const s = settings(), cadence = [...(s.cadence || [])].sort((a, b) => (a.platform + a.weekday + a.time).localeCompare(b.platform + b.weekday + b.time));
  const plSel = h("select", { class: "field" }, PLATFORM_ORDER.map((p) => h("option", { value: p }, PLATFORM_LABEL[p])));
  const daySel = h("select", { class: "field" }, DAY_NAMES.map((d, i) => { const o = h("option", { value: i }, d); if (i === 1) o.selected = true; return o; }));
  const hourSel = h("select", { class: "field" }, Array.from({ length: 24 }, (_, hr) => { const o = h("option", { value: hr }, fmtTime(`${pad2(hr)}:00`).replace(":00", "")); if (hr === 9) o.selected = true; return o; }));
  const minSel = h("select", { class: "field" }, [0, 15, 30, 45].map((m) => h("option", { value: m }, `:${pad2(m)}`)));
  [plSel, daySel, hourSel, minSel].forEach((x) => { if (!state.server) x.disabled = true; });
  const byPlatform = PLATFORM_ORDER.map((p) => [p, cadence.filter((c) => c.platform === p)]).filter(([, l]) => l.length);
  const posterLabel = (POSTERS.find((p) => p.id === (s.poster || "manual")) || POSTERS[0]).label;
  return settingsPane("Posting Cadence", `Your recurring weekly posting times, in ${tzName()}. They show as open slots on the calendar, and approving a draft with no date books the next free one.`, [
    settingsSection("posting-cadence", null, null, [
      byPlatform.length ? h("div", { class: "space-y-4 mb4" }, byPlatform.map(([p, list]) => h("div", {}, [h("p", { class: "tiny-sub mb15 row gap15" }, [markIcon(p, "tiny"), `${PLATFORM_LABEL[p]}${handleFor(p) ? ` (${handleFor(p)})` : ""}`]),
        h("ul", { class: "slot-pills" }, list.map((c) => h("li", { class: "slot-pill" }, [h("span", {}, `${DAY_NAMES[c.weekday].slice(0, 3)} ${fmtTime(c.time)}`), h("button", { type: "button", class: "pill-x", disabled: state.server ? null : "", "aria-label": `Remove ${DAY_NAMES[c.weekday]} ${fmtTime(c.time)} slot`, onclick: () => saveSettings({ cadence: (s.cadence || []).filter((x) => !(x.platform === c.platform && +x.weekday === +c.weekday && x.time === c.time)) }, "Slot removed."), html: lineIcon("trash") })])))])))
        : h("p", { class: "set-hint mb4" }, "No posting times yet. Add a few below."),
      h("div", { class: "cadence-add" }, [plSel, daySel, hourSel, minSel, h("button", { type: "button", class: "btn-outline save-btn", disabled: state.server ? null : "", onclick: () => {
        const slot = { platform: plSel.value, weekday: +daySel.value, time: `${pad2(+hourSel.value)}:${pad2(+minSel.value)}` };
        if ((s.cadence || []).some((x) => x.platform === slot.platform && +x.weekday === slot.weekday && x.time === slot.time)) return toast("That slot is already there.");
        saveSettings({ cadence: [...(s.cadence || []), slot] }, "Slot added.");
      } }, [svgIcon("plus", "accent"), "Add time"])]),
      h("p", { class: "set-hint mt3" }, "Start with what you'll really keep up: the hours in Where You Show Up in brand/channels.md. One post per platform per day is plenty."),
      h("div", { class: "set-row mt4 col" }, [h("div", { class: "row gap2" }, [h("span", { class: "set-label" }, "How posts go out"), presenceDot(s.poster && s.poster !== "manual"), h("span", { class: "set-value b" }, posterLabel)]),
        h("p", { class: "set-hint" }, s.poster && s.poster !== "manual" ? "post-content hands each approved post to this connection at its time. You still approve every one." : "post-content gets each approved post ready on its platform at its time, and you press send."),
        h("p", { class: "set-hint" }, ["Change it under ", h("a", { href: "#/settings/accounts", class: "accent-link" }, "Connected Accounts"), "."])])
    ])
  ]);
}
function renderDeveloperSettings() {
  const srv = state.server, keys = state.keys || {};
  const fact = (l, v, hint) => settingRow(l, v, hint);
  const group = (title, rows) => h("div", {}, [h("p", { class: "overline mb2" }, title), ...rows]);
  return settingsPane("Developer", "How this Command Center is put together, for you or your AI. Presence only: no key value ever reaches this page.", [
    settingsSection("developer", null, null, [h("div", { class: "space-y-6" }, [
      group("Build & runtime", [
        fact("Mode", srv ? "Editing on (tools/serve.py)" : "Read-only (opened from the folder)", srv ? `Python ${srv.python} · serving ${srv.root}/` : "Run python3 tools/serve.py to turn editing on."),
        fact("Template version", (srv && srv.version) || "see VERSION", "The VERSION file at the top of the repo; CHANGELOG.md says what's newer."),
        fact("Data", "command-center/data/", "Rebuilt by tools/sync.py from your folders. Never edited by hand.")
      ]),
      group("Where things live", [
        fact("Posts", h("code", {}, POSTS_HOME + "/"), "One file per post; the README there shows the shape."),
        fact("Settings", h("code", {}, "command-center/settings.json"), "Saved to GitHub with your repo. Nothing secret."),
        fact("Keys", h("code", {}, ".env"), srv ? (srv.envFile ? "Present. Skipped by every save." : "Not made yet. Saving your first key makes it.") : "Skipped by every save.")
      ]),
      group("Commands", [
        fact("Rebuild the picture", h("code", {}, "python3 tools/sync.py"), "Windows: py tools/sync.py. Add --check to change nothing and fail if anything is out of date."),
        fact("Turn editing on", h("code", {}, "python3 tools/serve.py"), "Serves on http://localhost:8765 only. --port 9000 to change it, --open to open the browser."),
        fact("Pull website numbers", h("code", {}, "python3 tools/pull_web.py"), "Google Analytics and Search Console, read-only. --test only checks the connection. Saved to command-center/data/web.json, which never leaves this computer."),
        fact("Run the tests", h("code", {}, "python3 -m unittest discover tests"), "Each test runs on a temporary copy, never your files.")
      ]),
      group("Endpoints (tools/serve.py)", [["GET", "/api/state", "posts, research, settings, key presence"], ["POST", "/api/posts", "create a post file"], ["POST", "/api/posts/<id>", "save fields of one post"], ["POST", "/api/posts/<id>/duplicate", "copy a post as a new draft"], ["POST", "/api/settings", "write settings.json"], ["POST", "/api/keys", "set or remove one key in .env"], ["POST", "/api/web/test", "check the Google connection"], ["POST", "/api/web/pull", "pull the website numbers"]].map(([m, p, d]) => h("div", { class: "kv-row" }, [h("code", { class: "mono-sm" }, `${m} ${p}`), h("span", { class: "tiny-sub" }, d)]))),
      group(`Environment · ${srv ? `${Object.values(keys).filter(Boolean).length} set / ${Object.keys(keys).length} tracked` : "start the server to check"}`, srv ? Object.keys(keys).map((k) => h("div", { class: "kv-row" }, [h("div", { class: "row gap2 min0" }, [presenceDot(keys[k]), h("code", { class: "mono-sm truncate" }, k)]), h("span", { class: "tiny-sub b" }, keys[k] ? "set" : "unset")])) : [h("p", { class: "set-hint" }, "Key names and whether each is set show here when tools/serve.py is running.")]),
      state.problems && state.problems.length ? group("Post files that need a fix", state.problems.map((p) => h("p", { class: "set-hint danger" }, p))) : null
    ])])
  ]);
}
// The coding agents this department runs on. AGENTS.md is the one rules file; tools/sync.py writes each
// agent's pointer and command folder from it. Every one of these signs in with its own account: no key here.
const AI_AGENTS = [
  { id: "claude", name: "Claude Code", by: "Anthropic", install: "https://docs.anthropic.com/en/docs/claude-code/overview", open: "claude", summon: "/example-team",
    files: ["CLAUDE.md (points at AGENTS.md)", ".claude/skills/ (every team, workflow and skill)"], note: "Also in the Claude desktop app and VS Code: open this folder there." },
  { id: "codex", name: "Codex", by: "OpenAI", install: "https://developers.openai.com/codex/cli", open: "codex", summon: "$example-team",
    files: ["AGENTS.md (read directly)", ".agents/skills/ (every team, workflow and skill)"], note: "Or pick a skill from Codex's /skills menu." },
  { id: "gemini", name: "Gemini CLI", by: "Google", install: "https://geminicli.com/docs/", open: "gemini", summon: "/example-team",
    files: ["GEMINI.md (imports AGENTS.md)", ".gemini/commands/ (every team, workflow and skill as a / command)"], note: "Signing in with a Google account is enough; an API key is optional and goes in your terminal, not here." },
  { id: "cursor", name: "Cursor", by: "Anysphere", install: "https://cursor.com/downloads", open: "cursor .", summon: "/example-team",
    files: ["AGENTS.md (read directly)", ".cursor/rules/agents.mdc (always on, points at AGENTS.md)", ".cursor/commands/ (every team, workflow and skill as a / command)"], note: "Or open the folder from Cursor's File menu, then use the chat in Agent mode." },
  { id: "grok", name: "Grok Build", by: "xAI", install: "https://x.ai/", open: "grok", summon: "say \"run my example team\"",
    files: ["AGENTS.md (read directly)"], note: "Early beta. It reads AGENTS.md; it has no command folder we could confirm, so ask for a team in plain words. Install: curl -fsSL https://x.ai/cli/install.sh | bash (Mac, Linux) or irm https://x.ai/cli/install.ps1 | iex (Windows PowerShell). Run grok inspect to see what it picked up." }
];
function renderAgentSettings() {
  const found = (state.settings && window.CC_DATA && window.CC_DATA.agents) || (state.agents) || {};
  return settingsPane("AI Agents", "Your agent teams run on whichever AI you like. AGENTS.md holds the rules once, and tools/sync.py sets up each agent below from it. Open this folder in one, sign in with your own account, and summon a team.", [
    ...AI_AGENTS.map((a) => settingsSection(`agent-${a.id}`, null, null, [
      h("div", { class: "row gap2 wrap" }, [h("span", { class: "set-value b" }, a.name), h("span", { class: "tiny-sub" }, a.by), found[a.id] ? h("span", { class: "status-pill ok" }, "set up in this folder") : h("span", { class: "status-pill warn" }, "run sync to set it up"), h("a", { class: "accent-link row gap15 ml-auto", href: a.install, target: "_blank", rel: "noreferrer" }, [svgIcon("external"), "Install"])]),
      h("div", { class: "agent-grid mt3" }, [
        h("div", {}, [h("p", { class: "overline mb15" }, "Open your department"), h("p", { class: "set-hint" }, "In a terminal, inside this folder:"), h("code", { class: "agent-cmd" }, a.open)]),
        h("div", {}, [h("p", { class: "overline mb15" }, "Summon a team"), h("p", { class: "set-hint" }, "For example the Example Team (every team you add works the same way):"), h("code", { class: "agent-cmd" }, a.summon)])
      ]),
      h("p", { class: "overline mt4 mb15" }, "What's in this folder for it"),
      h("ul", { class: "agent-files" }, a.files.map((f) => h("li", {}, h("code", {}, f)))),
      h("p", { class: "set-hint mt2" }, a.note),
      h("p", { class: "set-hint" }, "No key to paste here: it signs in with your own account the first time it opens.")
    ])),
    settingsSection("agent-other", "Any other agent", null, [h("p", { class: "set-hint" }, "Point it at AGENTS.md (most agents read it on their own) and ask for a team by name, like \"run my content team\". Every team's steps live in its team.md, so any agent that reads files can follow them.")])
  ]);
}
function renderSettings(parts) {
  switch (parts[1] || "account") {
    case "account": return renderAccountSettings();
    case "workspace": return renderWorkspaceSettings();
    case "brands": return renderBrandSettings();
    case "accounts": return renderConnectedAccounts();
    case "cadence": return renderCadenceSettings();
    case "developer": return renderDeveloperSettings();
    case "agents": return renderAgentSettings();
    default: return notFound("That settings page doesn't exist");
  }
}
