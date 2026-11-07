// My Business: who you serve, what you sell and who else they could pick, read from the business files
// (brand/icp.md and brand/icps/, brand/personas/, brand/friction-points.md, brand/offer.md and brand/offers/,
// brand/contrarian-take.md, knowledge/competitors/, business.md). tools/sync.py puts them in data.js; with
// tools/serve.py running, every page edits them in place: only the value you change moves, the file keeps its
// At a Glance lines, its sections and _Not filled in yet._ markers, and ## Updates gets a dated line.
// Voice stays in brand/voice.md and never shows here.

const BIZ_TABS = [["", "Overview"], ["icps", "ICPs"], ["buyers", "Buyers"], ["friction", "Friction Points"], ["offers", "Offers"], ["competitors", "Competitors"]];
// The lesson that fills each file. A file's own "**Filled by:** ... (X lesson)" line wins when it has one.
const BIZ_LESSON = { icp: "Lock In Your ICP", contrarian: "Contrarian Take", friction: "Solve 5 Friction Points", offer: "Build Your Offer", persona: "Write To Your Buyer Personas", business: "Brain-Dump Your Business" };
const WHERE_ANSWERED = ["the offer", "the landing page", "content", "a sales call"];
const biz = () => state.business || {};
const gv = (doc, label) => { if (!doc) return ""; const g = (doc.glance || []).find((x) => x.label.toLowerCase() === label.toLowerCase() || x.key.toLowerCase() === label.toLowerCase()); return g ? g.value : ""; };
const sec = (doc, title) => (doc && (doc.sections || []).find((s) => s.title.toLowerCase() === title.toLowerCase())) || null;
const secBody = (doc, title) => { const s = sec(doc, title); return s ? s.body : ""; };
const fieldOf = (doc, title, key) => { const s = sec(doc, title); const f = s && s.fields.find((x) => x.key.toLowerCase() === key.toLowerCase()); return f ? f.value : ""; };
const lessonFor = (kind, doc) => (doc && doc.lessons && doc.lessons[0]) || BIZ_LESSON[kind] || "";
const docName = (doc, prefix) => { const t = (doc && doc.title) || ""; return prefix && t.toLowerCase().startsWith(prefix.toLowerCase() + ":") ? t.slice(prefix.length + 1).trim() : t; };
const bizDoc = (kind, slug) => { const list = { icp: biz().icps, offer: biz().offers, persona: biz().personas, competitor: biz().competitors }[kind] || []; return list.find((d) => d.slug === slug) || null; };
const filledCount = (doc) => { const ss = (doc.sections || []).filter((s) => s.title !== "Updates" && s.title !== "What Changed"); return [ss.filter((s) => s.body).length, ss.length]; };
const isUnsolved = (v) => /^unsolved\b/i.test((v || "").trim());
const initials = (name) => (name || "?").replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
const listLines = (text) => (text || "").split("\n").map((l) => l.replace(/^\s*([-*]|\d+[.)])\s+/, "").trim()).filter(Boolean);

// Long text stays short: three lines and a "more" that opens the rest.
function clamp(text, n = 3) {
  if (!text) return null;
  const p = h("p", { class: "biz-clamp", style: `-webkit-line-clamp:${n}` }, text);
  if (text.length < 140 && !text.includes("\n")) return p;
  const more = h("button", { type: "button", class: "biz-more", onclick: (e) => { e.preventDefault(); e.stopPropagation(); const open = p.classList.toggle("open"); more.textContent = open ? "less" : "more"; } }, "more");
  return h("div", {}, [p, more]);
}
function missing(kind, doc, what) {
  const lesson = lessonFor(kind, doc);
  return h("p", { class: "biz-missing" }, [svgIcon("info"), `${what || "Not filled in yet"}. ${lesson ? `The ${lesson} lesson fills it` : "Fill it in"}${state.server ? ", or type it in here." : "."}`]);
}

function bizHeader(tab, sub) {
  return h("div", { class: "module-head" }, h("div", { class: "dash-gutter" }, [
    h("div", { class: "module-head-inner" }, h("div", {}, [h("p", { class: "eyebrow" }, "My Business"), h("h1", {}, sub || "Your Business"), h("p", { class: "lede" }, "Who you serve, what you sell, and who else they could pick. Straight from your files.")])),
    h("nav", { class: "tabs", "aria-label": "My Business sections" }, BIZ_TABS.map(([k, l]) => h("a", { class: "tab", href: `#/business${k ? "/" + k : ""}`, "aria-current": (tab || "") === k ? "page" : null }, l)))
  ]));
}

function renderBusiness(p) {
  const tab = p[1] || "", slug = p[2];
  if (!state.business) return [bizHeader(tab), h("div", { class: "dash-container" }, emptyState("alert", "No business files yet", "Run <code>python3 tools/sync.py</code> to read them in."))];
  const pages = {
    "": () => [bizHeader("", "Your Business"), bizOverview()],
    icps: () => slug ? [bizHeader("icps", "ICPs"), docEditor("icp", bizDoc("icp", slug), "#/business/icps")] : [bizHeader("icps", "ICPs"), icpList()],
    buyers: () => slug ? [bizHeader("buyers", "Buyers"), docEditor("persona", bizDoc("persona", slug), "#/business/buyers")] : [bizHeader("buyers", "Buyers"), buyerList()],
    friction: () => [bizHeader("friction", "Friction Points"), frictionPage()],
    offers: () => [bizHeader("offers", "Offers"), offerBuilder(slug || "main")],
    competitors: () => slug ? [bizHeader("competitors", "Competitors"), docEditor("competitor", bizDoc("competitor", slug), "#/business/competitors")] : [bizHeader("competitors", "Competitors"), competitorList()],
    contrarian: () => [bizHeader("", "Contrarian Take"), docEditor("contrarian", biz().contrarian, "#/business")]
  };
  return (pages[tab] || (() => [bizHeader(""), notFound("That page doesn't exist")]))();
}

// ---------- Overview: the bento ----------
function tile(href, cls2, eyebrow, body, foot) {
  return h("a", { href, class: cls("glass biz-tile", cls2) }, [h("div", { class: "row biz-tile-top" }, [h("p", { class: "overline" }, eyebrow), h("span", { class: "biz-arrow", html: lineIcon("arrowUpRight") })]), h("div", { class: "biz-tile-body" }, body), foot ? h("div", { class: "biz-tile-foot tiny-sub" }, foot) : null]);
}
function bizOverview() {
  const b = biz(), icp = (b.icps || []).find((d) => d.main) || null, offer = (b.offers || []).find((d) => d.main) || null, ct = b.contrarian, fr = b.friction;
  const oneLiner = gv(icp, "One liner"), person = gv(icp, "The one person"), problem = gv(icp, "Their biggest problem"), want = gv(icp, "What they want instead");
  const extraIcps = (b.icps || []).filter((d) => !d.main).length;
  const frictions = [1, 2, 3, 4, 5].map((n) => ({ n, say: fieldOf(fr, `Friction ${n}`, "What they say") || gv(fr, `Friction ${n}`), answer: fieldOf(fr, `Friction ${n}`, "Our answer") }));
  const scanned = (b.competitors || []).length, named = ((b.business || {}).competitorNames || []);
  const notScanned = named.filter((n) => !(b.competitors || []).some((c) => c.slug === slugifyName(n) || docName(c).toLowerCase() === n.toLowerCase())).length;
  return h("div", { class: "dash-container" }, h("div", { class: "bento" }, [
    tile("#/business/icps/main", "span4 hero", "Who you serve", [
      oneLiner ? h("p", { class: "biz-big" }, oneLiner) : missing("icp", icp, "Your one-liner isn't filled in yet"),
      person ? h("div", { class: "biz-kv" }, [h("span", { class: "tiny-sub" }, "The one person"), clamp(person, 2)]) : null
    ], `${1 + extraIcps} ICP${extraIcps ? "s" : ""}${extraIcps ? ` · main + ${extraIcps} more` : ""}`),
    tile("#/business/offers/main", "span2 offer", "Your offer", gv(offer, "The offer") || gv(offer, "Name")
      ? [h("p", { class: "biz-offer-name" }, gv(offer, "Name") || gv(offer, "The offer")), gv(offer, "Name") ? clamp(gv(offer, "The offer"), 2) : null,
        h("div", { class: "row wrap gap2 mt3" }, [gv(offer, "Price") ? h("span", { class: "biz-price" }, gv(offer, "Price")) : null, gv(offer, "Timeline") ? h("span", { class: "chip" }, gv(offer, "Timeline")) : null, gv(offer, "Guarantee") ? h("span", { class: "chip accent-chip" }, [svgIcon("checkCircle"), "Guarantee"]) : null])]
      : [missing("offer", offer, "No offer yet")], `${(b.offers || []).length || 0} offer${(b.offers || []).length === 1 ? "" : "s"} · open the builder`),
    tile("#/business/icps/main", "span3", "Their problem → what they want", h("div", { class: "biz-two" }, [
      h("div", {}, [h("p", { class: "tiny-sub" }, "Their biggest problem"), problem ? clamp(problem, 3) : h("p", { class: "muted-sub" }, "Not filled in yet")]),
      h("div", {}, [h("p", { class: "tiny-sub" }, "What they want instead"), want ? clamp(want, 3) : h("p", { class: "muted-sub" }, "Not filled in yet")])])),
    tile("#/business/contrarian", "span3", "Your contrarian take", gv(ct, "The lead take")
      ? [h("p", { class: "biz-quote" }, `“${gv(ct, "The lead take")}”`), gv(ct, "The enemy") ? h("p", { class: "tiny-sub mt2" }, ["The enemy: ", h("span", { class: "fg" }, gv(ct, "The enemy"))]) : null]
      : [missing("contrarian", ct, "No lead take yet")]),
    tile("#/business/friction", "span4", "The five friction points", h("div", { class: "biz-chips" }, frictions.map((f) => h("span", { class: cls("biz-fchip", !f.say ? "blank" : isUnsolved(f.answer) || !f.answer ? "unsolved" : "solved"), title: f.say || "Not filled in yet" }, [h("b", {}, f.n), h("span", { class: "truncate" }, f.say || "not filled in"), f.say ? h("em", {}, isUnsolved(f.answer) || !f.answer ? "UNSOLVED" : "solved") : null]))),
      `${frictions.filter((f) => f.say && f.answer && !isUnsolved(f.answer)).length} of 5 answered`),
    tile("#/business/buyers", "span2", "Your buyers", (b.personas || []).length
      ? h("ul", { class: "biz-people" }, b.personas.slice(0, 4).map((pp) => h("li", {}, [h("span", { class: "id-avatar" }, initials(pp.title)), h("span", { class: "min0" }, [h("span", { class: "fg truncate block" }, pp.title), h("span", { class: "tiny-sub truncate block" }, gv(pp, "What they want") || gv(pp, "Who"))])])))
      : [missing("persona", null, "No buyer personas yet")], `${(b.personas || []).length} persona${(b.personas || []).length === 1 ? "" : "s"}`),
    tile("#/business/competitors", "span2", "Competitors", [h("p", { class: "biz-num" }, String(scanned)), h("p", { class: "tiny-sub" }, `scanned${notScanned ? ` · ${notScanned} named in business.md, not scanned yet` : ""}`)],
      scanned ? (b.competitors || []).slice(0, 3).map((c) => docName(c)).join(" · ") : "Ask your AI: scan my competitors"),
    tile("#/business/icps", "span2", "ICPs", [h("p", { class: "biz-num" }, String((b.icps || []).length)), h("p", { class: "tiny-sub" }, extraIcps ? "your main ICP plus the other groups you sell to" : "your main ICP. Add another for a second kind of buyer.")])
  ]));
}
const slugifyName = (n) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// ---------- saving ----------
async function bizSave(path, changes, msg) {
  const r = await api("/api/business/save", { path, changes });
  if (r) { toast(msg || `Saved to ${path}.`); render(); }
  return r;
}
async function bizNew(kind, name, base) {
  const r = await api("/api/business/new", { kind, name });
  if (r) { toast(`Made ${r.path}.`); location.hash = `${base}/${r.path.split("/").pop().replace(/\.md$/, "")}`; }
}
function newCard(kind, label, base) {
  const inp = h("input", { class: "field", placeholder: `Name it (e.g. ${{ icp: "Agency owners", persona: "Mia, the busy gift buyer", competitor: "Northside Candle Co.", offer: "Starter kit" }[kind]})`, maxlength: "80", readonly: state.server ? null : "" });
  return h("div", { class: "glass biz-card new" }, [h("p", { class: "b fg m0 row gap15" }, [svgIcon("plus", "accent"), label]),
    h("p", { class: "tiny-sub" }, state.server ? "Copies the template, names it, and opens it here." : "Start the server to add one: python3 tools/serve.py"),
    h("div", { class: "row gap2 mt3" }, [inp, h("button", { type: "button", class: "btn-outline", disabled: state.server ? null : "", onclick: () => { if (!inp.value.trim()) return toast("Give it a name first."); bizNew(kind, inp.value.trim(), base); } }, "Add")])]);
}

// ---------- one file, every field: the editor ICPs, buyers, competitors and the contrarian take open into ----------
function autoGrow(t) { requestAnimationFrame(() => { t.style.height = "auto"; t.style.height = `${t.scrollHeight + 2}px`; }); }
function area(value, attrs = {}) { const t = h("textarea", { class: "field biz-area", rows: "2", readonly: state.server ? null : "", ...attrs }, value || ""); t.addEventListener("input", () => autoGrow(t)); autoGrow(t); return t; }
function docEditor(kind, doc, back) {
  if (!doc) return h("div", { class: "dash-container" }, emptyState("alert", "That file isn't there", `It may have been renamed. <a class="accent-link" href="${back}">Back</a>`));
  const inputs = { glance: {}, sections: {}, fields: {} };
  const name = docName(doc, { icp: "ICP", offer: "Offer" }[kind]);
  const titleIn = kind === "persona" || kind === "competitor" || (kind === "icp" && !doc.main) ? h("input", { class: "field biz-title-in", value: name, readonly: state.server ? null : "", "aria-label": "Name" }) : null;
  const glanceBox = (doc.glance || []).length ? h("div", { class: "glass biz-sec" }, [h("p", { class: "overline" }, "At a glance"),
    h("div", { class: "biz-grid2 mt3" }, doc.glance.map((g) => { const i = h("input", { class: "field", value: g.value, placeholder: g.hint || "Not filled in yet", readonly: state.server ? null : "" }); inputs.glance[g.key] = [i, g.value]; return h("label", { class: "pf-field" }, [h("span", { class: "pf-label" }, g.label), i]); }))]) : null;
  const personas = biz().personas || [];
  const secs = (doc.sections || []).filter((s) => !["Updates", "What Changed"].includes(s.title)).map((s) => {
    if (s.fields.length) {
      return h("div", { class: "glass biz-sec" }, [h("p", { class: "b fg m0" }, s.title), s.guide ? h("p", { class: "tiny-sub mt1" }, s.guide.replace(/^_|_$/g, "")) : null,
        h("div", { class: "biz-grid2 mt3" }, s.fields.map((f) => {
          inputs.fields[s.title] = inputs.fields[s.title] || {};
          if (f.key === "Personas" && personas.length) {
            const chosen = new Set(f.value.split(/\s*;\s*/).filter(Boolean)); // persona names have commas in them, so the list uses semicolons
            const hidden = { value: f.value };
            inputs.fields[s.title][f.key] = [hidden, f.value];
            return h("div", { class: "pf-field span2" }, [h("span", { class: "pf-label" }, "Personas"), h("div", { class: "row wrap gap2" }, personas.map((pp) => {
              const b = h("button", { type: "button", class: cls("chip-link", chosen.has(pp.title) && "active"), disabled: state.server ? null : "", onclick: () => { chosen.has(pp.title) ? chosen.delete(pp.title) : chosen.add(pp.title); b.classList.toggle("active"); hidden.value = [...chosen].join("; "); } }, pp.title);
              return b;
            }))]);
          }
          const i = h("input", { class: "field", value: f.value, placeholder: "—", readonly: state.server ? null : "" });
          inputs.fields[s.title][f.key] = [i, f.value];
          return h("label", { class: "pf-field" }, [h("span", { class: "pf-label" }, f.key), i]);
        }))]);
    }
    const t = area(s.body, { placeholder: "Not filled in yet", "aria-label": s.title });
    inputs.sections[s.title] = [t, s.body];
    return h("details", { class: "glass biz-sec", open: s.body || state.server ? "" : null }, [h("summary", { class: "row" }, [h("span", { class: "b fg" }, s.title), s.body ? h("span", { class: "status-pill ok ml-auto" }, "filled") : h("span", { class: "status-pill ml-auto" }, "empty")]),
      s.guide ? h("p", { class: "tiny-sub mt1" }, s.guide) : null, h("div", { class: "mt2" }, t)]);
  });
  const save = () => {
    const ch = {};
    const pick = (grp) => { const out = {}; for (const [k, [el, was]] of Object.entries(inputs[grp])) if (el.value.trim() !== (was || "").trim()) out[k] = el.value.trim(); return out; };
    const gl = pick("glance"), ss = pick("sections"), fs = {};
    for (const [t, m] of Object.entries(inputs.fields)) { const o = {}; for (const [k, [el, was]] of Object.entries(m)) if ((el.value || "").trim() !== (was || "").trim()) o[k] = el.value.trim(); if (Object.keys(o).length) fs[t] = o; }
    if (Object.keys(gl).length) ch.glance = gl; if (Object.keys(ss).length) ch.sections = ss; if (Object.keys(fs).length) ch.fields = fs;
    if (titleIn && titleIn.value.trim() && titleIn.value.trim() !== name) ch.title = kind === "icp" ? `ICP: ${titleIn.value.trim()}` : titleIn.value.trim();
    if (!Object.keys(ch).length) return toast("Nothing changed.");
    bizSave(doc.path, ch);
  };
  const [done, total] = filledCount(doc);
  return h("div", { class: "dash-container biz-editor" }, [
    h("div", { class: "row wrap gap3 biz-ed-head" }, [h("a", { href: back, class: "sec-link row gap15" }, [svgIcon("arrowLeft"), "Back"]),
      h("div", { class: "min0 flex1" }, [titleIn || h("h2", { class: "h1-2xl" }, doc.main && kind === "icp" ? "Main ICP" : name), h("p", { class: "tiny-sub mt1" }, [h("code", {}, doc.path), ` · ${done} of ${total} filled`, lessonFor(kind, doc) ? ` · filled by the ${lessonFor(kind, doc)} lesson` : ""])]),
      h("button", { type: "button", class: "btn-primary", disabled: state.server ? null : "", onclick: save }, [svgIcon("checkMark"), "Save"])]),
    readOnlyNote(), done === 0 ? missing(kind, doc, "Nothing in this file yet") : null, glanceBox, ...secs,
    h("p", { class: "tiny-sub mt4" }, "Saving changes only what you edited and adds a dated line to the file's Updates. Your voice stays in brand/voice.md.")
  ]);
}

// ---------- ICPs and buyers ----------
function icpList() {
  const list = biz().icps || [];
  return h("div", { class: "dash-container" }, [
    h("div", { class: "biz-cards" }, [...list.map((d) => { const [done, total] = filledCount(d); return h("a", { href: `#/business/icps/${d.slug}`, class: "glass biz-card" }, [
      h("div", { class: "row gap2" }, [h("span", { class: "b fg" }, d.main ? "Main ICP" : docName(d, "ICP")), d.main ? h("span", { class: "status-pill ok" }, "main") : null, h("span", { class: "tiny-sub ml-auto" }, `${done}/${total}`)]),
      gv(d, "One liner") ? clamp(gv(d, "One liner"), 3) : missing("icp", d, "No one-liner yet"),
      gv(d, "The one person") ? h("p", { class: "tiny-sub mt2" }, ["The one person: ", h("span", { class: "fg" }, gv(d, "The one person"))]) : null,
      h("div", { class: "dash-track mt3" }, h("div", { class: "dash-fill", style: `width:${Math.max(3, (done / Math.max(1, total)) * 100)}%` }))]); }),
      newCard("icp", "Another ICP", "#/business/icps")]),
    h("p", { class: "tiny-sub mt4" }, "brand/icp.md is your main ICP, the one every writer and page reads first. Another kind of buyer gets its own file in brand/icps/, in the same shape.")
  ]);
}
function buyerList() {
  const list = biz().personas || [];
  return h("div", { class: "dash-container" }, [
    list.length ? null : missing("persona", null, "No buyer personas yet"),
    h("div", { class: "biz-cards" }, [...list.map((d) => h("a", { href: `#/business/buyers/${d.slug}`, class: "glass biz-card" }, [
      h("div", { class: "row gap2" }, [h("span", { class: "id-avatar" }, initials(d.title)), h("span", { class: "b fg truncate" }, d.title)]),
      ...[["Who", "Who"], ["What they want", "Wants"], ["What stops them", "Stopped by"], ["Where they hang out", "Hangs out"]].map(([k, l]) => h("div", { class: "biz-kv mt2" }, [h("span", { class: "tiny-sub" }, l), gv(d, k) ? clamp(gv(d, k), 2) : h("span", { class: "muted-sub" }, "—")]))])),
      newCard("persona", "A new buyer", "#/business/buyers")])
  ]);
}

// ---------- friction points ----------
function frictionPage() {
  const fr = biz().friction;
  if (!fr) return h("div", { class: "dash-container" }, emptyState("alert", "brand/friction-points.md is missing", "Get it back from the template, then run the Solve 5 Friction Points lesson."));
  const any = [1, 2, 3, 4, 5].some((n) => fieldOf(fr, `Friction ${n}`, "What they say"));
  return h("div", { class: "dash-container" }, [readOnlyNote(), any ? null : missing("friction", fr, "No friction points yet"), h("div", { class: "biz-frictions" }, [1, 2, 3, 4, 5].map((n) => {
    const t = `Friction ${n}`, say = fieldOf(fr, t, "What they say"), ans = fieldOf(fr, t, "Our answer"), where = fieldOf(fr, t, "Where it gets answered");
    const sayIn = area(say, { placeholder: "The doubt, in the buyer's own words" }), ansIn = area(ans, { placeholder: "Your honest answer, or UNSOLVED" });
    const whereIn = h("input", { class: "field", value: where, placeholder: "the offer, the landing page, content or a sales call", list: "biz-where", readonly: state.server ? null : "" });
    const pill = h("span", { class: cls("biz-fchip static", !say ? "blank" : isUnsolved(ans) || !ans ? "unsolved" : "solved") }, !say ? "empty" : isUnsolved(ans) || !ans ? "UNSOLVED" : "solved");
    return h("div", { class: "glass biz-friction" }, [
      h("div", { class: "row gap2" }, [h("span", { class: "biz-fnum" }, n), h("span", { class: "b fg" }, say ? preview(say, 80) : "Not filled in yet"), h("span", { class: "ml-auto" }, pill)]),
      h("div", { class: "biz-grid3 mt3" }, [h("label", { class: "pf-field" }, [h("span", { class: "pf-label" }, "What they say"), sayIn]),
        h("label", { class: "pf-field" }, [h("span", { class: "pf-label row" }, ["Our answer", h("button", { type: "button", class: "biz-link ml-auto", disabled: state.server ? null : "", onclick: () => { ansIn.value = "UNSOLVED: " + ansIn.value.replace(/^unsolved:?\s*/i, ""); autoGrow(ansIn); } }, "mark UNSOLVED")]), ansIn]),
        h("label", { class: "pf-field" }, [h("span", { class: "pf-label" }, "Where it gets answered"), whereIn])]),
      h("div", { class: "row mt3" }, [h("span", { class: "tiny-sub" }, "An honest gap is allowed. A made-up answer isn't."), h("button", { type: "button", class: "btn-outline ml-auto", disabled: state.server ? null : "", onclick: () => {
        const f = {}; if (sayIn.value.trim() !== say) f["What they say"] = sayIn.value.trim(); if (ansIn.value.trim() !== ans) f["Our answer"] = ansIn.value.trim(); if (whereIn.value.trim() !== where) f["Where it gets answered"] = whereIn.value.trim();
        if (!Object.keys(f).length) return toast("Nothing changed.");
        const ch = { fields: { [t]: f } }; if (f["What they say"] !== undefined) ch.glance = { [t]: f["What they say"] };
        bizSave(fr.path, ch, `Friction ${n} saved.`);
      } }, [svgIcon("checkMark", "accent"), "Save"])])
    ]);
  })), h("datalist", { id: "biz-where" }, WHERE_ANSWERED.map((w) => h("option", { value: w })))]);
}

// ---------- offers: the builder ----------
function offerModel(doc) {
  const fr = biz().friction;
  return {
    name: gv(doc, "Name") || (doc.main ? "" : docName(doc, "Offer")), offer: gv(doc, "The offer") || secBody(doc, "The Offer"), price: gv(doc, "Price"), timeline: gv(doc, "Timeline"),
    guarantee: gv(doc, "Guarantee"), headline: gv(doc, "The headline") || secBody(doc, "The Headline"), promise: secBody(doc, "The Promise"),
    get: listLines(secBody(doc, "What They Get")), steps: listLines(secBody(doc, "How It Works")), ifNot: secBody(doc, "What Happens If It Does Not Work"),
    friction: [...new Set(((secBody(doc, "Friction It Answers") || "").match(/friction\s*(\d)/gi) || []).map((m) => +m.replace(/\D/g, "")))],
    frictionSay: (n) => fieldOf(fr, `Friction ${n}`, "What they say") || gv(fr, `Friction ${n}`)
  };
}
function offerPreview(m) {
  const fr = (n) => m.frictionSay(n);
  return h("div", { class: "glass offer-prev" }, [
    h("p", { class: "eyebrow" }, m.name || "Your offer"),
    h("h2", { class: "offer-h" }, m.headline || "Your headline goes here"),
    m.offer ? h("p", { class: "offer-sub" }, m.offer) : h("p", { class: "offer-sub muted-sub" }, "What you sell, in one sentence a stranger understands."),
    m.promise ? h("p", { class: "offer-promise" }, [svgIcon("checkCircle", "accent"), m.promise]) : null,
    h("div", { class: "offer-price-row" }, [h("div", {}, [h("p", { class: "tiny-sub" }, "Price"), h("p", { class: "offer-price" }, m.price || "—")]), h("div", {}, [h("p", { class: "tiny-sub" }, "Timeline"), h("p", { class: "offer-time" }, m.timeline || "—")]),
      h("span", { class: "btn-primary offer-cta" }, "Get started")]),
    m.get.length ? h("div", { class: "mt5" }, [h("p", { class: "overline" }, "What you get"), h("ul", { class: "offer-get" }, m.get.map((g) => h("li", {}, [svgIcon("checkMark", "accent"), g])))]) : null,
    m.steps.length ? h("div", { class: "mt5" }, [h("p", { class: "overline" }, "How it works"), h("ol", { class: "offer-steps" }, m.steps.map((s, i) => h("li", {}, [h("span", { class: "offer-step-n" }, i + 1), h("span", {}, s)])))]) : null,
    m.guarantee || m.ifNot ? h("div", { class: "offer-guarantee mt5" }, [svgIcon("shield", "accent"), h("div", {}, [h("p", { class: "b fg m0" }, m.guarantee || "If it doesn't work"), m.ifNot ? h("p", { class: "tiny-sub mt1" }, m.ifNot) : null])]) : null,
    m.friction.length ? h("div", { class: "mt5" }, [h("p", { class: "overline" }, "The doubts it answers"), h("div", { class: "row wrap gap2 mt2" }, m.friction.map((n) => h("span", { class: "chip" }, [h("b", {}, n), " ", fr(n) ? preview(fr(n), 48) : `Friction ${n}`])))]) : null
  ]);
}
function listEditor(items, placeholder, onChange, numbered) {
  const wrap = h("div", { class: "biz-list" });
  const draw = () => {
    wrap.replaceChildren(...items.map((v, i) => h("div", { class: "row gap2" }, [h("span", { class: "biz-list-n" }, numbered ? `${i + 1}.` : "•"),
      h("input", { class: "field", value: v, placeholder, readonly: state.server ? null : "", oninput: (e) => { items[i] = e.target.value; onChange(); } }),
      h("button", { type: "button", class: "icon-btn danger-hover", "aria-label": "Remove", disabled: state.server ? null : "", onclick: () => { items.splice(i, 1); draw(); onChange(); }, html: lineIcon("x") })])),
    h("button", { type: "button", class: "biz-link", disabled: state.server ? null : "", onclick: () => { items.push(""); draw(); onChange(); wrap.querySelectorAll("input")[items.length - 1]?.focus(); } }, `+ add ${numbered ? "a step" : "a line"}`));
  };
  draw();
  return wrap;
}
function offerBuilder(slug) {
  const offers = biz().offers || [], doc = offers.find((d) => d.slug === slug) || offers.find((d) => d.main);
  const pickers = h("div", { class: "row wrap gap2 mb4" }, [...offers.map((d) => h("a", { href: `#/business/offers/${d.slug}`, class: cls("chip-link", doc && d.slug === doc.slug && "active") }, d.main ? (gv(d, "Name") || "Main offer") : docName(d, "Offer"))),
    h("a", { href: "#/business/offers/new", class: cls("chip-link dashed-link", slug === "new" && "active") }, "+ New offer")]);
  if (slug === "new") return h("div", { class: "dash-container" }, [pickers, h("div", { class: "biz-cards" }, newCard("offer", "Another offer", "#/business/offers"))]);
  if (!doc) return h("div", { class: "dash-container" }, [pickers, emptyState("alert", "brand/offer.md is missing", "Get it back from the template, then run the Build Your Offer lesson.")]);
  const m = offerModel(doc), was = JSON.parse(JSON.stringify({ ...m, frictionSay: undefined }));
  const prevBox = h("div", { class: "offer-prev-wrap" }, offerPreview(m));
  const redraw = () => prevBox.replaceChildren(offerPreview(m));
  const input = (key, label, placeholder, long) => {
    const el = long ? area(m[key], { placeholder }) : h("input", { class: "field", value: m[key], placeholder, readonly: state.server ? null : "" });
    el.addEventListener("input", () => { m[key] = el.value; redraw(); });
    return h("label", { class: "pf-field" }, [h("span", { class: "pf-label" }, label), el]);
  };
  const fr = biz().friction;
  const frPick = h("div", { class: "row wrap gap2" }, [1, 2, 3, 4, 5].map((n) => {
    const say = m.frictionSay(n);
    const b = h("button", { type: "button", class: cls("chip-link", m.friction.includes(n) && "active"), title: say || "Not filled in yet", disabled: state.server ? null : "", onclick: () => { m.friction = m.friction.includes(n) ? m.friction.filter((x) => x !== n) : [...m.friction, n].sort(); b.classList.toggle("active"); redraw(); } }, [h("b", {}, n), " ", say ? preview(say, 34) : "not filled in"]);
    return b;
  }));
  const save = () => {
    const ch = { glance: {}, sections: {} };
    const set = (k, glanceKey, sectionTitle, fmt) => {
      const v = Array.isArray(m[k]) ? m[k] : (m[k] || "").trim(), old = was[k];
      if (JSON.stringify(v) === JSON.stringify(old)) return;
      if (glanceKey) ch.glance[glanceKey] = Array.isArray(v) ? v.join(", ") : v;
      // the longer section follows the one-liner only while it's empty or was the same text, so a fuller answer is never overwritten
      if (sectionTitle && (!secBody(doc, sectionTitle) || secBody(doc, sectionTitle).trim() === (Array.isArray(old) ? "" : old).trim() || !glanceKey)) ch.sections[sectionTitle] = fmt ? fmt(v) : v;
    };
    set("name", "Name"); set("offer", "The offer", "The Offer"); set("price", "Price", "What It Costs"); set("timeline", "Timeline", "Timeline"); set("guarantee", "Guarantee");
    set("headline", "The headline", "The Headline"); set("promise", null, "The Promise"); set("ifNot", null, "What Happens If It Does Not Work");
    set("get", null, "What They Get", (v) => v.filter((x) => x.trim()).map((x) => `- ${x.trim()}`).join("\n"));
    set("steps", null, "How It Works", (v) => v.filter((x) => x.trim()).map((x, i) => `${i + 1}. ${x.trim()}`).join("\n"));
    set("friction", null, "Friction It Answers", (v) => v.map((n) => `- Friction ${n}: ${m.frictionSay(n) || "answered by this offer"}`).join("\n"));
    if (!doc.main && m.name.trim() && m.name.trim() !== was.name) ch.title = `Offer: ${m.name.trim()}`;
    if (!Object.keys(ch.glance).length) delete ch.glance; if (!Object.keys(ch.sections).length) delete ch.sections;
    if (!Object.keys(ch).length) return toast("Nothing changed.");
    bizSave(doc.path, ch, `Saved to ${doc.path}.`);
  };
  const empty = !m.offer && !m.headline && !m.price;
  return h("div", { class: "dash-container" }, [pickers, readOnlyNote(), empty ? missing("offer", doc, "This offer is empty") : null,
    h("div", { class: "offer-builder" }, [
      h("div", { class: "glass offer-form" }, [
        h("div", { class: "row" }, [h("p", { class: "overline" }, doc.main ? "Main offer · brand/offer.md" : doc.path), h("button", { type: "button", class: "btn-primary ml-auto", disabled: state.server ? null : "", onclick: save }, [svgIcon("checkMark"), "Save"])]),
        h("div", { class: "biz-grid2 mt4" }, [input("name", "Name", "Starter kit"), input("price", "Price", "$497, or 3 × $175"), input("timeline", "Timeline", "Live in 14 days"), input("guarantee", "Guarantee", "Your money back if…")]),
        h("div", { class: "space-y-3 mt3" }, [input("headline", "Headline", "The line the page leads with", true), input("offer", "The offer, in one sentence", "What you sell, in a sentence a stranger understands", true), input("promise", "The promise", "The result they get, and by when", true)]),
        h("p", { class: "pf-label mt4" }, "What they get"), listEditor(m.get, "One thing that's included", redraw),
        h("p", { class: "pf-label mt4" }, "How it works"), listEditor(m.steps, "A step, from yes to done", redraw, true),
        h("div", { class: "mt4" }, input("ifNot", "What happens if it doesn't work", "The guarantee in full, or the honest answer", true)),
        h("p", { class: "pf-label mt4" }, "The friction points it answers"), fr ? frPick : h("p", { class: "tiny-sub" }, "brand/friction-points.md is missing."),
        h("p", { class: "tiny-sub mt4" }, "Saving writes the At a Glance lines and the matching sections. The landing page and every skill read brand/offer.md, so your main offer lives there.")
      ]),
      prevBox
    ])
  ]);
}

// ---------- competitors ----------
function competitorList() {
  const b = biz(), list = b.competitors || [], names = ((b.business || {}).competitorNames || []);
  const scannedNames = new Set(list.flatMap((c) => [c.slug, docName(c).toLowerCase()]));
  const waiting = names.filter((n) => !scannedNames.has(slugifyName(n)) && !scannedNames.has(n.toLowerCase()));
  return h("div", { class: "dash-container" }, [
    h("div", { class: "glass biz-callout row gap3" }, [svgIcon("search", "accent"), h("div", { class: "min0" }, [h("p", { class: "b fg m0" }, "Ask your AI: scan my competitors"),
      h("p", { class: "tiny-sub mt1" }, "The Research Team's Researcher looks at each competitor's website and finds where they post most and how often, then writes one file each in knowledge/competitors/. Add the Research Team first if it isn't in your department. No paid tools.")])]),
    h("div", { class: "biz-cards mt5" }, [
      ...list.map((d) => h("a", { href: `#/business/competitors/${d.slug}`, class: "glass biz-card" }, [
        h("div", { class: "row gap2" }, [h("span", { class: "id-avatar" }, initials(docName(d))), h("span", { class: "b fg truncate" }, docName(d)), gv(d, "Tier") ? h("span", { class: "chip ml-auto" }, gv(d, "Tier").split(/[\s(]/)[0]) : null]),
        gv(d, "Website") ? h("p", { class: "tiny-sub mt2 truncate" }, gv(d, "Website")) : null,
        gv(d, "What they lead with") ? clamp(`“${gv(d, "What they lead with")}”`, 2) : null,
        gv(d, "Main platforms") ? h("div", { class: "row wrap gap15 mt3" }, gv(d, "Main platforms").split(/,\s*|\s·\s/).slice(0, 5).map((pl) => h("span", { class: "chip" }, pl))) : h("p", { class: "muted-sub mt3" }, "Platforms not scanned yet"),
        gv(d, "How often they post") ? h("p", { class: "tiny-sub mt2" }, ["Posts: ", h("span", { class: "fg" }, gv(d, "How often they post"))]) : null])),
      ...waiting.map((n) => h("div", { class: "glass biz-card waiting" }, [h("div", { class: "row gap2" }, [h("span", { class: "id-avatar" }, initials(n)), h("span", { class: "b fg truncate" }, n), h("span", { class: "chip dashed ml-auto" }, "not scanned")]), h("p", { class: "tiny-sub mt2" }, "Named in business.md under Who Else They Could Pick."),
        state.server ? h("button", { type: "button", class: "biz-link mt3", onclick: () => bizNew("competitor", n, "#/business/competitors") }, "+ start its file") : null])),
      newCard("competitor", "Add a competitor", "#/business/competitors")]),
    !list.length && !waiting.length ? missing("business", null, "No competitors named yet") : null
  ]);
}
