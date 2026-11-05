(function () {
  "use strict";

  /* ---------- storage (safe) ---------- */
  const raw = {
    get(k, d) { try { const v = localStorage.getItem("ts_" + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("ts_" + k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
    del(k) { try { localStorage.removeItem("ts_" + k); } catch (e) { /* ignore */ } },
  };
  let unlocked = {};
  try { unlocked = JSON.parse(sessionStorage.getItem("ts_unlocked") || "{}"); } catch (e) { unlocked = {}; }
  const saveUnlocked = () => { try { sessionStorage.setItem("ts_unlocked", JSON.stringify(unlocked)); } catch (e) { /* ignore */ } };
  let profile = raw.get("current", null);
  if (profile && raw.get("pin_" + profile, "") && !unlocked[profile]) profile = null;
  /* every profile has its own saved data: keys are prefixed with the profile id */
  const store = {
    get(k, d) { return raw.get(profile + "_" + k, d); },
    set(k, v) { raw.set(profile + "_" + k, v); markDirty(); },
  };
  let rates = {};
  /* Exchange rates: built-in defaults, replaced by today's live rates (fetched once a day),
     replaced by any rate the person typed in by hand (until they press "Use today's rates"). */
  const todayKey = () => new Date().toISOString().slice(0, 10);
  let live = raw.get("live_rates", null);
  const loadRates = () => { rates = Object.assign({}, RATES_DEFAULT, live ? live.rates : {}, store.get("rates", {})); };
  function refreshLiveRates() {
    if (live && live.date === todayKey()) return;
    if (typeof fetch !== "function") return;
    fetch("https://open.er-api.com/v6/latest/EGP")
      .then((r) => r.json())
      .then((j) => {
        if (!j || j.result !== "success" || !j.rates) return;
        const out = {};
        Object.keys(RATES_DEFAULT).forEach((c) => { if (j.rates[c] > 0) out[c] = Math.round((1 / j.rates[c]) * 1000) / 1000; });
        live = { date: todayKey(), updated: j.time_last_update_utc || "", rates: out };
        raw.set("live_rates", live);
        if (profile) { loadRates(); const y = window.scrollY; render(); window.scrollTo(0, y); }
      })
      .catch(() => { /* offline: keep the last rates */ });
  }
  if (profile) loadRates();
  const prof = () => PROFILES.find((p) => p.id === profile);
  /* each profile reads its own program list (dataset) */
  let DS, PROGRAMS, SECTIONS, NEEDS_TEST, DE_EXCLUDED, CHECKLIST;
  function useDataset() {
    DS = DATASETS[(prof() && prof().data) || "main"];
    const tw = typeof PROFILE_TWEAKS !== "undefined" && PROFILE_TWEAKS[profile];
    if (tw) DS = tweakDataset(DS, tw);
    PROGRAMS = DS.programs; SECTIONS = DS.sections; NEEDS_TEST = DS.needsTest; DE_EXCLUDED = DS.excluded || []; CHECKLIST = DS.checklist;
  }
  /* a profile's own notes on a shared program list (copies, the shared data is never changed) */
  function tweakText(s) {
    const tw = typeof PROFILE_TWEAKS !== "undefined" && PROFILE_TWEAKS[profile];
    if (!tw || !tw.swap || typeof s !== "string") return s;
    return tw.swap.reduce((t, [re, to]) => t.replace(re, to), s);
  }
  function tweakDataset(base, tw) {
    const deep = (v) => typeof v === "string" ? tweakText(v) : Array.isArray(v) ? v.map(deep) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, deep(x)])) : v;
    const programs = base.programs.map((p) => Object.assign(deep(p), (tw.programs || {})[p.id] || {}));
    const add = tw.checklistAdd || [];
    const checklist = base.checklist.map((g) => ({ ...g, items: [
      ...g.items.map((it) => [it[0], tweakText((tw.checklist || {})[it[0]] || it[1]), it[2]]),
      ...add.filter((a) => a[0] === g.group).map((a) => a[1]),
    ] }));
    return Object.assign({}, base, { programs, checklist, tips: tweakText(base.tips), bestNote: tw.bestNote || tweakText(base.bestNote) });
  }
  useDataset();

  /* ---------- sync across devices ----------
     Each profile has a private sync code. Everything the profile saves (ticks, statuses, notes,
     compare list, own checklist items) is copied to the cloud under that code. On another device,
     enter the same code in the profile page to get the same data. PINs are never uploaded. */
  const SYNC = { url: "https://ucmpqwtewckuvuaiyhge.supabase.co/rest/v1/rpc/", key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjbXBxd3Rld2NrdXZ1YWl5aGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzNTg3MjAsImV4cCI6MjEwODkzNDcyMH0.kz65ZlxzE8eZcpSTsuj_zDv2HrJcYxehK77NM9kGfF4" };
  let syncStatus = "idle", syncTimer = null, applyingRemote = false;
  function newCode() {
    const b = new Uint8Array(24); (window.crypto || window.msCrypto).getRandomValues(b);
    return Array.from(b, (x) => "abcdefghijkmnpqrstuvwxyz23456789"[x % 32]).join("");
  }
  const syncCode = () => { let c = raw.get("sync_" + profile, ""); if (!c) { c = newCode(); raw.set("sync_" + profile, c); } return c; };
  function rpc(fn, body) {
    return fetch(SYNC.url + fn, { method: "POST", headers: { apikey: SYNC.key, Authorization: "Bearer " + SYNC.key, "Content-Type": "application/json" }, body: JSON.stringify(body) })
      .then((r) => { if (!r.ok) throw new Error("sync " + r.status); return r.json(); });
  }
  function collect() {
    const out = {}, pre = "ts_" + profile + "_";
    try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith(pre)) out[k.slice(pre.length)] = JSON.parse(localStorage.getItem(k)); } } catch (e) { /* ignore */ }
    return out;
  }
  function applyRemote(data) {
    applyingRemote = true;
    try {
      const pre = "ts_" + profile + "_", del = [];
      for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith(pre)) del.push(k); }
      del.forEach((k) => localStorage.removeItem(k));
      Object.keys(data || {}).forEach((k) => raw.set(profile + "_" + k, data[k]));
    } catch (e) { /* ignore */ }
    applyingRemote = false;
  }
  function setSyncStatus(s) { syncStatus = s; const el = $("#syncStatus"); if (el) el.textContent = syncLabel(); const d = $("#syncDot"); if (d) d.className = "sync-dot " + s; }
  const syncLabel = () => ({ idle: "Sync on", saving: "Saving...", ok: "Synced " + (raw.get("syncAt_" + profile, "") ? new Date(raw.get("syncAt_" + profile, "")).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""), offline: "Offline: will sync later", error: "Sync problem: will retry" })[syncStatus] || "";
  function markDirty() {
    if (applyingRemote || !profile || typeof fetch !== "function") return;
    raw.set("syncDirty_" + profile, true);
    clearTimeout(syncTimer); syncTimer = setTimeout(pushNow, 1500);
  }
  function pushNow() {
    if (!profile) return;
    const pid = profile; setSyncStatus("saving");
    rpc("save_state", { p_code: syncCode(), p_data: collect() })
      .then((t) => { if (pid !== profile) return; raw.set("syncAt_" + pid, t); raw.set("syncDirty_" + pid, false); setSyncStatus("ok"); })
      .catch(() => setSyncStatus(navigator.onLine === false ? "offline" : "error"));
  }
  function pullNow(force) {
    if (!profile || typeof fetch !== "function") return Promise.resolve();
    const pid = profile;
    return rpc("get_state", { p_code: syncCode() })
      .then((res) => {
        if (pid !== profile) return;
        const dirty = raw.get("syncDirty_" + pid, false), at = raw.get("syncAt_" + pid, "");
        if (!res) { pushNow(); return; }
        if (dirty && !force) { pushNow(); return; }
        if (force || !at || new Date(res.updated_at) > new Date(at)) {
          applyRemote(res.data); raw.set("syncAt_" + pid, res.updated_at); raw.set("syncDirty_" + pid, false);
          loadRates(); const y = window.scrollY; render(); window.scrollTo(0, y);
        }
        setSyncStatus("ok");
      })
      .catch(() => setSyncStatus(navigator.onLine === false ? "offline" : "error"));
  }
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") pullNow(); });
  window.addEventListener("online", () => pullNow());

  /* ---------- helpers ---------- */
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const sum = (arr, i = 1) => arr.reduce((a, r) => a + (Number(r[i]) || 0), 0);
  const num = (n) => Number(n).toLocaleString("en-US", { maximumFractionDigits: n % 1 ? 2 : 0, minimumFractionDigits: n % 1 ? 2 : 0 });
  const money = (n, cur) => cur + " " + num(Math.round(n * 100) / 100);
  const egp = (n, cur) => (rates[cur] ? "about EGP " + num(Math.round((n * rates[cur]) / 1000) * 1000) : "");
  const byId = (id) => PROGRAMS.find((p) => p.id === id);
  const est = (flag) => (flag ? '<span class="est">est.</span>' : "");

  const today = new Date(TODAY + "T00:00:00");
  const realToday = new Date(); realToday.setHours(0, 0, 0, 0);
  const now = realToday > today ? realToday : today;
  const daysLeft = (d) => Math.round((new Date(d + "T00:00:00") - now) / 86400000);
  const fmtDate = (d) => new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const nextDeadline = (p) => {
    const fut = p.deadlines.filter((x) => x.d && daysLeft(x.d) >= 0).sort((a, b) => a.d.localeCompare(b.d));
    return fut[0] || p.deadlines.find((x) => !x.d) || null;
  };

  function calc(p) {
    const uni = sum(p.uniLines);
    const other = sum(p.other);
    const living = p.living ? p.living.perMonth * p.living.months : 0;
    const cost = uni + other + living;
    const got = p.stipend ? p.stipend.total : 0;
    const known = !p.stipend || p.stipend.total != null;
    const bring = sum(p.bring);
    return { uni, other, living, cost, got, known, net: known ? cost - (got || 0) : null, bring };
  }

  const chanceChip = (c) => {
    const cls = /^High|Medium to High/.test(c) ? "good" : /^Low$/.test(c) ? "pay" : "warn";
    return `<span class="chip ${cls}">Chance: ${esc(c)}</span>`;
  };
  const engChip = (p) => p.eng.s === "yes"
    ? '<span class="chip good">MOI accepted, no IELTS</span>'
    : p.eng.s === "ielts" ? '<span class="chip pay">IELTS / test needed</span>'
    : '<span class="chip warn">MOI: email to confirm</span>';
  /* English filter: pick one or more kinds (none picked = all) */
  const ENG_OPTS = ["MOI confirmed", "MOI (ask first)", "IELTS / test needed"];
  const engKind = (p) => (p.eng.s === "yes" ? "MOI confirmed" : p.eng.s === "ielts" ? "IELTS / test needed" : "MOI (ask first)");
  const engOk = (p) => !F.engs.length || F.engs.includes(engKind(p));
  const engBtns = () => `<button class="fbtn ${F.engs.length ? "" : "on"}" data-fclear="engs">All (${PROGRAMS.length})</button>` +
    ENG_OPTS.map((o) => `<button class="fbtn ${F.engs.includes(o) ? "on" : ""}" data-fm="engs" data-v="${esc(o)}" aria-pressed="${F.engs.includes(o)}">${F.engs.includes(o) ? "✓ " : ""}${esc(o)} (${PROGRAMS.filter((p) => engKind(p) === o).length})</button>`).join("");
  const wr = (w) => (/^=/.test(w) ? "#" + w.slice(1) + " (tied)" : /^\d+$/.test(w) ? "#" + w : w);
  const hasWorld = (p) => !!p.rank.world && /^[=\d]/.test(p.rank.world);
  const rankChips = (p) => hasWorld(p)
    ? `<span class="chip rank-chip">🌍 World ${esc(wr(p.rank.world))}</span><span class="chip rank-chip">🏅 #${esc(p.rank.country)}</span>`
    : `<span class="chip plain">🏅 ${esc(p.rank.country)}</span>`;
  const statusOf = (id) => store.get("status_" + id, "Not started");
  const STATUSES = ["Not started", "Preparing", "Applied", "Accepted", "Rejected", "Not applying"];
  /* "Applied" means submitted and waiting for the university's decision */
  const STATUS_LABEL = { Applied: "Applied, waiting for decision" };
  const statusOpts = (cur) => STATUSES.map((s) => `<option value="${s}" ${cur === s ? "selected" : ""}>${STATUS_LABEL[s] || s}</option>`).join("");

  function moneySummary(p) {
    const c = calc(p);
    let html = "";
    if (p.tuitionFree && !p.blocked) html += `<div class="mline good">✅ <b>You don't pay anything for the university.</b></div>`;
    else if (p.blocked) html += `<div class="mline good">✅ <b>No tuition.</b> Only a semester fee of ${money(p.uniLines[p.uniLines.length - 1][1] / (p.living.months / 6), "EUR")}.</div>`;
    if (p.stipend && p.stipend.total) html += `<div class="mline good">💰 <b>You get a stipend:</b> ${money(p.stipend.perYear || p.stipend.total / (p.living.months / 12), p.cur)} per year${p.stipend.perYear ? " (first year)" : ""}.</div>`;
    else if (p.stipend) html += `<div class="mline good">💰 <b>Stipend:</b> amount in your offer letter.</div>`;
    if (p.blocked) html += `<div class="mline pay">🏦 <b>Blocked account:</b> EUR 11,904 for 12 months.</div>`;
    html += `<div class="mline pay">✈️ <b>Bring from Egypt:</b> about ${money(c.bring, p.cur)} <span class="muted small">(${egp(c.bring, p.cur)})</span></div>`;
    return html;
  }

  function card(p, rankKey) {
    const nd = nextDeadline(p);
    const dl = nd ? (nd.d ? `${fmtDate(nd.d)} · ${daysLeft(nd.d)} days left` : (nd.asap ? "Rolling: apply now" : "Check the official page")) : "Closed for now";
    return `<a class="card pcard" href="#p/${p.id}">
      <div class="head"><div class="rank">${p[rankKey]}</div>
        <div><div class="uni">${p.flag} ${esc(p.uni)}</div><div class="prog">${esc(p.prog)}</div></div></div>
      <div class="chips"><span class="chip plain">${esc(p.city)}</span><span class="chip plain">${esc(p.duration)}</span>${p.field.map((f) => `<span class="chip">${f}</span>`).join("")}</div>
      <div class="chips">${rankChips(p)}</div>
      <div class="chips">${engChip(p)}${chanceChip(p.chance)}${zuseFor(p).length ? `<span class="chip good">+ DAAD ${zuseFor(p).map((z) => z.name.replace("Zuse School ", "")).join("/")}</span>` : ""}${p.country === "Germany" ? (p.direct ? '<span class="chip good">Apply directly, no uni-assist</span>' : '<span class="chip plain">Via uni-assist</span>') : ""}</div>
      ${moneySummary(p)}
      <div class="foot"><span>⏰ ${dl}</span><span>${esc(STATUS_LABEL[statusOf(p.id)] || statusOf(p.id))}</span></div>
      <div class="card-actions">${cmpBtn(p)}</div>
    </a>`;
  }

  function alertBox(msg) {
    let t = $("#toast"); if (!t) { t = document.createElement("div"); t.id = "toast"; document.body.appendChild(t); }
    t.textContent = msg; t.className = "show"; clearTimeout(alertBox.h); alertBox.h = setTimeout(() => { t.className = ""; }, 2600);
  }

  /* ---------- deadline reminders ---------- */
  const DONE_STATUSES = ["Applied", "Accepted", "Rejected", "Not applying"];
  function upcoming(days) {
    const out = [];
    PROGRAMS.forEach((p) => {
      if (DONE_STATUSES.includes(statusOf(p.id))) return;
      p.deadlines.forEach((d, i) => { if (d.d) { const n = daysLeft(d.d); if (n >= 0 && n <= days) out.push({ p, d, i, n }); } });
    });
    return out.sort((a, b) => a.n - b.n);
  }
  const icsEsc = (s) => String(s).replace(/\\/g, "\\\\").replace(/[,;]/g, (m) => "\\" + m).replace(/\n/g, "\\n");
  function icsEvent(p, d, i) {
    const ymd = d.d.replace(/-/g, "");
    const next = new Date(d.d + "T00:00:00"); next.setDate(next.getDate() + 1);
    const ymd2 = next.toISOString().slice(0, 10).replace(/-/g, "");
    const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
    return ["BEGIN:VEVENT", `UID:${p.id}-${i}-${ymd}@travelscholars`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${ymd}`, `DTEND;VALUE=DATE:${ymd2}`,
      `SUMMARY:${icsEsc("Deadline: " + p.uni + " (" + p.prog + ")")}`, `DESCRIPTION:${icsEsc(d.t + "\n" + p.link)}`, `URL:${p.link}`,
      "BEGIN:VALARM", "TRIGGER:-P7D", "ACTION:DISPLAY", `DESCRIPTION:${icsEsc("7 days left: " + p.uni)}`, "END:VALARM",
      "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", `DESCRIPTION:${icsEsc("Tomorrow: " + p.uni)}`, "END:VALARM", "END:VEVENT"].join("\r\n");
  }
  function downloadIcs(events, name) {
    const body = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Travel Scholars//EN", "CALSCALE:GREGORIAN", ...events, "END:VCALENDAR"].join("\r\n");
    const url = URL.createObjectURL(new Blob([body], { type: "text/calendar;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = name + ".ics"; document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  const calBtn = (p, i) => `<button class="cal-btn" data-ics="${p.id}|${i}" title="Add to my calendar (reminders 7 days and 1 day before)">📅 Add to calendar</button>`;
  function reminderBanner() {
    const list = upcoming(30);
    if (!list.length) return "";
    return `<div class="remind"><div class="remind-head"><b>⏰ Coming up in the next 30 days</b><button class="cal-btn" data-ics-all="1">📅 Add all deadlines to my calendar</button></div>
      ${list.map((x) => `<div class="remind-row"><a href="#p/${x.p.id}"><span class="days-pill">${x.n === 0 ? "Today" : x.n + (x.n === 1 ? " day" : " days")}</span> ${x.p.flag} <b>${esc(x.p.uni)}</b> <span class="muted small">${esc(x.d.t)}</span></a>${calBtn(x.p, x.i)}</div>`).join("")}
      <p class="small muted" style="margin:6px 0 0">Programs you marked Applied, Accepted, Rejected or Not applying are hidden here.</p></div>`;
  }

  /* ---------- compare ---------- */
  const cmpList = () => store.get("compare", []).filter((id) => byId(id));
  const cmpBtn = (p) => { const on = cmpList().includes(p.id); return `<button class="cmp-btn ${on ? "on" : ""}" data-compare="${p.id}">${on ? "✓ Comparing" : "+ Compare"}</button>`; };
  function cmpBar() {
    const l = cmpList();
    if (!l.length || (location.hash || "").startsWith("#compare")) return "";
    return `<div class="cmpbar"><span>Comparing <b>${l.length}</b> of 3: ${l.map((id) => esc(byId(id).uni.split(" (")[0])).join(", ")}</span><a class="fbtn on" href="#compare">View comparison</a><button class="fbtn" data-cmp-clear="1">Clear</button></div>`;
  }
  function pageCompare() {
    const l = cmpList().map(byId);
    if (!l.length) return `<h1>Compare programs</h1><div class="empty">Tap "+ Compare" on up to 3 program cards (All programs or Best for me), then come back here.</div>`;
    const rows = [
      ["World ranking", (p) => (p.rank.world ? esc(p.rank.world) : "Not ranked")],
      ["Ranking in country", (p) => esc(p.rank.country)],
      ["Country, city", (p) => `${p.flag} ${esc(p.country)}, ${esc(p.city)}`],
      ["Duration", (p) => esc(p.duration)],
      ["English", (p) => engChip(p) + "<div class='small'>" + esc(p.eng.t) + "</div>"],
      ["Chance of acceptance", (p) => chanceChip(p.chance) + (p.accept ? "<div class='small'>" + esc(p.accept) + "</div>" : "")],
      ["How you get the money", (p) => { const f = FUNDING[p.id]; return f ? `<span class="chip ${FUND_LABEL[f.how].cls}">${esc(FUND_LABEL[f.how].text)}</span>` : ""; }],
      ["Tuition", (p) => esc(p.tuitionLine)],
      ["Stipend", (p) => (p.stipend ? esc(p.stipend.text) : "None")],
      ["Blocked account", (p) => (p.blocked ? "EUR 11,904 for 12 months" : "Not needed")],
      ["Paid to the university (total)", (p) => `${money(calc(p).uni, p.cur)}<div class="small muted">${egp(calc(p).uni, p.cur)}</div>`],
      ["Money to bring from Egypt", (p) => `${money(calc(p).bring, p.cur)}<div class="small muted">${egp(calc(p).bring, p.cur)}</div>`],
      ["Overall from your pocket", (p) => { const c = calc(p); return c.net == null ? "Depends on offer" : c.net <= 0 ? `<span style="color:var(--good)">Covered + about ${money(-c.net, p.cur)} extra</span>` : `${money(c.net, p.cur)}<div class="small muted">${egp(c.net, p.cur)}</div>`; }],
      ["Next deadline", (p) => { const d = nextDeadline(p); return d ? esc(d.t) : "Closed for now"; }],
      ["Apply via", (p) => esc(p.applyVia)],
      ["Watch out", (p) => esc(p.watch)],
      ["My status", (p) => esc(statusOf(p.id))],
    ];
    return `<h1>Compare programs</h1>
      <p class="lead">Side by side. Remove a program with ✕, or add more from the program cards (up to 3).</p>
      <div class="card cmp-wrap"><table class="cmp"><tr><th></th>${l.map((p) => `<th><a href="#p/${p.id}">${p.flag} ${esc(p.uni)}</a><div class="small muted">${esc(p.prog)}</div><button class="del" data-compare="${p.id}" title="Remove">✕ Remove</button></th>`).join("")}</tr>
      ${rows.map(([label, f]) => `<tr><td class="rl">${label}</td>${l.map((p) => `<td>${f(p)}</td>`).join("")}</tr>`).join("")}</table></div>`;
  }

  /* ---------- pages ---------- */
  function pageHome() {
    const sorted = [...PROGRAMS].sort((a, b) => a.rankAll - b.rankAll);
    const upcoming = PROGRAMS.map((p) => ({ p, d: nextDeadline(p) })).filter((x) => x.d && x.d.d).sort((a, b) => a.d.d.localeCompare(b.d.d));
    const applied = PROGRAMS.filter((p) => ["Applied", "Accepted"].includes(statusOf(p.id))).length;
    const cp = checklistProgress();
    const sec = (key) => {
      const list = PROGRAMS.filter((p) => p.sec === key).sort((a, b) => a.rankSec - b.rankSec).slice(0, 5);
      return `<div class="sec">
        <div class="sec-head"><h2>${SECTIONS[key].icon} Top 5 in ${SECTIONS[key].name}</h2><a href="#all/${key}">See all in ${SECTIONS[key].name} →</a></div>
        <p class="muted small" style="margin:0">${SECTIONS[key].sub}</p>
        <ol class="toplist">${list.map((p) => topRow(p, "rankSec")).join("")}</ol></div>`;
    };
    return `
      ${reminderBanner()}
      <h1>${esc(prof().name)}'s master's options for 2027</h1>
      <p class="lead">${esc(DS.lead)}</p>
      <div class="stats">
        <div class="stat"><b>${PROGRAMS.filter((p) => p.eng.s !== "ielts").length}</b><span>programs with MOI (no IELTS)${PROGRAMS.some((p) => p.eng.s === "ielts") ? " + " + PROGRAMS.filter((p) => p.eng.s === "ielts").length + " more with IELTS" : ""}</span></div>
        <div class="stat"><b>${upcoming[0] ? daysLeft(upcoming[0].d.d) + " days" : "None"}</b><span>to the next deadline${upcoming[0] ? " (" + esc(upcoming[0].p.uni.split(" (")[0]) + ")" : ""}</span></div>
        <div class="stat"><b>${cp.done}/${cp.total}</b><span>checklist items done</span></div>
        <div class="stat"><b>${applied}</b><span>applications sent</span></div>
      </div>
      <div class="sec">
        <div class="sec-head"><h2>⭐ My overall top 5</h2><a href="#best">Full ranking →</a></div>
        <ol class="toplist">${sorted.slice(0, 5).map((p) => topRow(p, "rankAll")).join("")}</ol>
      </div>
      ${Object.keys(SECTIONS).map(sec).join("")}`;
  }

  function topRow(p, rk) {
    const c = calc(p);
    let right;
    if (p.stipend && p.stipend.total) right = `<span class="chip good">Stipend ${money(p.stipend.perYear || p.stipend.total / (p.living.months / 12), p.cur)}/yr</span>`;
    else if (p.stipend) right = `<span class="chip good">Funded (offer)</span>`;
    else right = `<span class="chip">Uni cost ${money(c.uni, p.cur)} total</span>`;
    return `<li><a href="#p/${p.id}"><div class="rank">${p[rk]}</div>
      <div><div class="t1">${p.flag} ${esc(p.uni)}</div><div class="t2">${esc(p.prog)}</div></div>
      <div class="right">${right}<div class="muted" style="margin-top:4px">${hasWorld(p) ? "World " + esc(wr(p.rank.world)) + " · " : ""}${chanceTxt(p)}</div></div></a></li>`;
  }
  const chanceTxt = (p) => "Chance: " + esc(p.chance);

  function pageBest() {
    const list = [...PROGRAMS].filter(engOk).sort((a, b) => a.rankAll - b.rankAll);
    return `
      <h1>Best for me, ranked</h1>
      <p class="lead">Programs that accept an MOI letter come first. Programs that need IELTS (or another English test) are marked with a red chip. Use the buttons to show only one kind.</p>
      <div class="filters"><div class="frow"><label>English</label>${engBtns()}</div></div>
      <div class="note">${esc(DS.bestNote)}</div>
      <div class="grid">${list.map((p) => card(p, "rankAll")).join("")}</div>
      <h2>🌍 Same programs by university ranking</h2>
      <p class="muted">${esc(RANK_SOURCE)}. A lower number is a higher ranked university.</p>
      <div class="card" style="overflow-x:auto"><table class="money rank-table"><tr><td><b>University</b></td><td><b>World</b></td><td><b>In its country</b></td></tr>
      ${[...PROGRAMS].filter((p, i, arr) => arr.findIndex((q) => q.uni === p.uni) === i).sort((a, b) => (a.rank.sort || 9999) - (b.rank.sort || 9999)).map((p) => `<tr><td><a href="#p/${p.id}">${p.flag} ${esc(p.uni)}</a></td><td>${p.rank.world ? esc(wr(p.rank.world)) : "Not ranked"}</td><td>${esc(p.rank.country)}</td></tr>`).join("")}
      </table></div>
      <h2>More options that need an English test or a check</h2>
      <p class="muted">If I take IELTS or Duolingo, these open up too. Most are very well funded.</p>
      ${needsTestTable(NEEDS_TEST)}`;
  }

  function needsTestTable(rows) {
    return `<div class="grid">${rows.map((r) => `<div class="card">
      <h3>${esc(r.name)}</h3>
      <div class="mline good" style="margin:6px 0">💰 ${esc(r.money)}</div>
      <div class="small"><b>English:</b> ${esc(r.rule)}</div>
      <div class="small"><b>Deadline:</b> ${esc(r.deadline)}</div>
      ${r.link ? `<div class="small" style="margin-top:6px"><a href="${esc(r.link)}" target="_blank" rel="noopener">Official page ↗</a></div>` : ""}
    </div>`).join("")}</div>`;
  }

  const F = { countries: [], field: "All", money: "All", engs: [], apply: "All", start: "All", sort: "rank", q: "" };
  /* text search: every word must appear somewhere in the program's main text */
  const norm = (t) => String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const matchQ = (q, parts) => { const hay = norm(parts.join(" ")); return norm(q).split(/\s+/).filter(Boolean).every((w) => hay.includes(w)); };
  const searchBox = (id, val, ph) => `<div class="searchbox"><input id="${id}" type="search" value="${esc(val)}" placeholder="${esc(ph)}" autocomplete="off" aria-label="Search">${val ? `<button class="fbtn" data-clearq="${id}">Clear</button>` : ""}</div>`;
  const hasPhd = () => typeof PHD !== "undefined" && (!prof().data || prof().data === "main");
  const isDirect = (p) => p.country !== "Germany" || !!p.direct;
  /* summer semester intake: programs that start in March or April 2027 */
  const SPRING = "Spring 2027 (March / April)";
  const startsSpring = (p) => /\b(March|April)\b/.test(p.intake || "");
  function pageAll(secArg) {
    if (secArg) F.countries = SECTIONS[secArg] ? [SECTIONS[secArg].name] : [];
    const regionNames = Object.values(SECTIONS).map((s) => s.name);
    const countries = [...new Set([...regionNames, ...PROGRAMS.map((p) => p.country)])];
    const secOf = (name) => Object.keys(SECTIONS).find((k) => SECTIONS[k].name === name);
    const inPlace = (p, c) => { const sk = secOf(c); return sk ? p.sec === sk || p.country === c : p.country === c; };
    const ctyBtns = `<button class="fbtn ${F.countries.length ? "" : "on"}" data-fclear="countries">All</button>` + countries.map((c) => { const on = F.countries.includes(c); return `<button class="fbtn ${on ? "on" : ""}" data-fm="countries" data-v="${esc(c)}" aria-pressed="${on}">${on ? "✓ " : ""}${esc(c)} (${PROGRAMS.filter((p) => inPlace(p, c)).length})</button>`; }).join("");
    const btns = (key, opts) => opts.map((o) => `<button class="fbtn ${F[key] === o ? "on" : ""}" data-f="${key}" data-v="${esc(o)}">${esc(o)}</button>`).join("");
    let list = PROGRAMS.filter((p) => {
      if (F.countries.length && !F.countries.some((c) => inPlace(p, c))) return false;
      if (F.field !== "All" && !p.field.includes(F.field)) return false;
      if (F.money === "Stipend" && !p.stipend) return false;
      if (F.money === "No tuition" && !p.tuitionFree) return false;
      if (F.money === "No blocked account" && p.blocked) return false;
      if (!engOk(p)) return false;
      if (F.apply !== "All" && !isDirect(p)) return false;
      if (F.start === SPRING && !startsSpring(p)) return false;
      if (F.q && !matchQ(F.q, [p.uni, p.prog, p.city, p.country, p.field.join(" "), p.degree, p.applyVia, p.chance])) return false;
      return true;
    });
    const dkey = (p) => { const d = nextDeadline(p); return d && d.d ? d.d : "9999"; };
    if (F.sort === "rank") list.sort((a, b) => a.rankAll - b.rankAll);
    if (F.sort === "deadline") list.sort((a, b) => dkey(a).localeCompare(dkey(b)));
    if (F.sort === "world") list.sort((a, b) => (a.rank.sort || 9999) - (b.rank.sort || 9999));
    if (F.sort === "bring") list.sort((a, b) => calc(a).bring * (rates[a.cur] || 1) - calc(b).bring * (rates[b.cur] || 1));
    const secs = F.countries.map(secOf).filter(Boolean);
    const showNeeds = NEEDS_TEST.filter((r) => secs.includes(r.sec));
    const picked = [F.countries.join(" + "), F.engs.join(" + ")].filter(Boolean).join(" · ");
    return `
      <h1>All programs</h1>
      <p class="lead">Tap one or more countries and one or more English options to combine them (for example Germany + Italy with MOI + IELTS). Tap again to remove. Tap any program for every detail.</p>
      ${searchBox("q", F.q, "Search programs: university, city, AI, data, statistics...")}
      <div class="filters">
        ${hasPhd() ? `<div class="frow"><label>Level</label><button class="fbtn on">Master's</button><a class="fbtn" href="#phd">Direct PhD (${PHD.length})</a></div>` : ""}
        <div class="frow"><label>Country</label>${ctyBtns}</div>
        <div class="frow"><label>Field</label>${btns("field", ["All", ...DS.fields])}</div>
        <div class="frow"><label>Money</label>${btns("money", ["All", "Stipend", "No tuition", "No blocked account"])}</div>
        <div class="frow"><label>English</label>${engBtns()}</div>
        <div class="frow"><label>Apply</label>${btns("apply", ["All", "Directly (no uni-assist)"])}</div>
        ${PROGRAMS.some(startsSpring) ? `<div class="frow"><label>Start</label>${btns("start", ["All", SPRING])}</div>` : ""}
        <div class="frow"><label>Sort by</label>
          <select id="sort"><option value="rank" ${F.sort === "rank" ? "selected" : ""}>Best for me</option><option value="deadline" ${F.sort === "deadline" ? "selected" : ""}>Nearest deadline</option><option value="bring" ${F.sort === "bring" ? "selected" : ""}>Least money to bring</option><option value="world" ${F.sort === "world" ? "selected" : ""}>Best world ranking</option></select>
          <span class="muted small" style="margin-left:6px">${list.length} program${list.length === 1 ? "" : "s"}${picked ? " · " + esc(picked) : ""}</span>${F.countries.length || F.engs.length || F.q ? ' <button class="fbtn" data-fclear="allf">Clear filters</button>' : ""}</div>
      </div>
      ${list.length ? `<div class="grid">${list.map((p) => card(p, "rankAll")).join("")}</div>` : '<div class="empty">No program matches these filters.</div>'}
      ${F.countries.includes("Germany") && DE_EXCLUDED.length ? `<h2>Checked in Germany but not suitable</h2><div class="card"><table class="money">${DE_EXCLUDED.map((r) => `<tr><td><b>${esc(r[0])}</b></td><td style="text-align:left;font-weight:400">${esc(r[1])}</td></tr>`).join("")}</table></div>` : ""}
      ${showNeeds.length ? `<h2>Funded, but needs an English test</h2>${needsTestTable(showNeeds)}` : ""}`;
  }

  /* ---------- Direct PhD (after a bachelor's) ---------- */
  const PF = { region: "All", eng: "All", checked: "All", track: "All", sort: "deadline", q: "" };
  const phdById = (id) => (typeof PHD !== "undefined" ? PHD.find((x) => x.id === id) : null);
  const PHD_ENG = { moi: ["good", "MOI letter is enough"], ask: ["warn", "May accept MOI: ask first"], test: ["pay", "IELTS / TOEFL needed"] };
  function phdList() {
    const l = PHD.filter((x) => {
      if (PF.region !== "All" && x.region !== PF.region) return false;
      if (PF.eng === "MOI letter is enough" && x.eng !== "moi") return false;
      if (PF.eng === "MOI or ask" && x.eng === "test") return false;
      if (PF.eng === "Test needed" && x.eng !== "test") return false;
      if (PF.checked === "Checked on official page" && !x.checked) return false;
      if (PF.track === "Tracking" && statusOf(x.id) === "Not started") return false;
      if (PF.q && !matchQ(PF.q, [x.uni, x.prog, x.region, x.money, x.note, x.engText])) return false;
      return true;
    });
    const dk = (x) => (x.d && daysLeft(x.d) >= 0 ? x.d : "9999");
    if (PF.sort === "deadline") l.sort((a, b) => dk(a).localeCompare(dk(b)));
    if (PF.sort === "name") l.sort((a, b) => a.uni.localeCompare(b.uni));
    if (PF.sort === "english") l.sort((a, b) => "mat".indexOf(a.eng[0]) - "mat".indexOf(b.eng[0]) || dk(a).localeCompare(dk(b)));
    return l;
  }
  function phdCard(x) {
    const e = PHD_ENG[x.eng], n = x.d ? daysLeft(x.d) : null;
    return `<div class="card pcard phd-card">
      <div class="uni">${x.flag} ${esc(x.uni)}</div><div class="prog">${esc(x.prog)}</div>
      <div class="chips"><span class="chip plain">${esc(x.region)}</span><span class="chip ${e[0]}">${e[1]}</span>${x.checked ? '<span class="chip good">✓ Checked</span>' : '<span class="chip plain">Confirm on official page</span>'}</div>
      <div class="mline good">💰 ${esc(x.money)}</div>
      <div class="small"><b>English:</b> ${esc(x.engText)}</div>
      <div class="small"><b>Deadline:</b> ${esc(x.deadline)}${n != null && n >= 0 ? ` <span class="muted">(${n} days left)</span>` : ""}</div>
      <div class="small"><b>You would start:</b> ${esc(x.det.start)}</div>
      ${x.note ? `<div class="small muted" style="margin-top:4px">${esc(x.note)}</div>` : ""}
      <div class="phd-actions"><a class="fbtn on" href="#phd/${x.id}">Details and requirements</a><a class="fbtn" href="${esc(x.link)}" target="_blank" rel="noopener">${/google\.com\/search/.test(x.link) ? "Find official page ↗" : "Official page ↗"}</a>
        <select class="status-sel" data-status="${x.id}" data-rerender="1" aria-label="My status">${statusOpts(statusOf(x.id))}</select>
        ${x.d && n >= 0 ? `<button class="cal-btn" data-phdics="${x.id}">📅</button>` : ""}</div>
    </div>`;
  }
  function pagePhdOne(x) {
    const t = x.det, e = PHD_ENG[x.eng], n = x.d ? daysLeft(x.d) : null;
    const done = t.docs.filter((_, i) => store.get(`phddoc_${x.id}_${i}`, false)).length;
    const row = (k, v) => v ? `<tr><td class="rl"><b>${k}</b></td><td>${esc(v)}</td></tr>` : "";
    const list = (a, ol) => `<${ol ? "ol" : "ul"} class="list-plain">${a.map((s) => `<li>${esc(s)}</li>`).join("")}</${ol ? "ol" : "ul"}>`;
    return `<p><a href="#phd">← All direct PhD programs</a></p>
      <h1>${x.flag} ${esc(x.uni)}</h1>
      <p class="lead" style="margin-bottom:8px">${esc(x.prog)}</p>
      <div class="chips" style="margin-bottom:12px"><span class="chip plain">${esc(x.region)}</span><span class="chip ${e[0]}">${e[1]}</span>${t.verified ? '<span class="chip good">✓ Details checked on the official page</span>' : '<span class="chip warn">Usual rules for this kind of program: confirm on the official page</span>'}</div>
      <div class="big-say good">🗓️ <div>If you are accepted, you go in: ${esc(t.start)}<br><span>Length: ${esc(t.length)}</span></div></div>
      <div class="big-say ${n != null && n >= 0 && n <= 45 ? "pay" : "warn"}">⏰ <div>Apply by: ${esc(x.deadline)}<br><span>${n != null && n >= 0 ? n + " days left" : "Check the exact date on the official page"}</span></div></div>
      <div class="phd-actions" style="margin:10px 0 16px"><a class="fbtn" href="${esc(x.link)}" target="_blank" rel="noopener">${/google\.com\/search/.test(x.link) ? "Find official page ↗" : "Official page ↗"}</a>
        <select class="status-sel" data-status="${x.id}" data-rerender="1" aria-label="My status">${statusOpts(statusOf(x.id))}</select>
        ${x.d && n >= 0 ? `<button class="cal-btn" data-phdics="${x.id}">📅 Add deadline to calendar</button>` : ""}</div>
      <h2>Key facts</h2>
      <div class="card" style="overflow-x:auto"><table class="money kv">
        ${row("Money", x.money)}${row("Application fee", t.fee)}${row("Grades needed", t.gpa)}${row("English", x.engText + (t.eng && t.eng !== x.engText ? ". " + t.eng : ""))}${row("GRE", t.gre)}${row("Notes", x.note)}
      </table></div>
      <h2>What you need to send <span class="muted small">(${done}/${t.docs.length} ready)</span></h2>
      <div class="card">${t.docs.map((d, i) => { const on = store.get(`phddoc_${x.id}_${i}`, false); return `<label class="check ${on ? "done" : ""}"><input type="checkbox" data-k="phddoc_${x.id}_${i}" ${on ? "checked" : ""}><span class="txt">${esc(d)}</span></label>`; }).join("")}</div>
      <h2>What happens after you apply</h2>
      <div class="card">${list(t.steps, true)}</div>
      <h2>If you are accepted: visa and moving</h2>
      <div class="card">${list(t.visa)}</div>
      <h2>My note</h2>
      <textarea class="notes" data-note="${x.id}" placeholder="Professors I emailed, login, what is missing...">${esc(store.get("note_" + x.id, ""))}</textarea>
      <p class="small muted">Researched ${esc(PHD_CHECKED)}. Fees, dates and visa rules change, so always confirm on the official page before paying or applying.</p>`;
  }
  function pagePhd(arg) {
    if (hasPhd() && arg && phdById(arg)) return pagePhdOne(phdById(arg));
    if (!hasPhd()) return `<h1>Direct PhD</h1><div class="empty">This list is for computer science and data. Nothing here for ${esc(prof().name)} yet.</div>`;
    const btns = (key, opts) => opts.map((o) => `<button class="fbtn ${PF[key] === o ? "on" : ""}" data-pf="${key}" data-v="${esc(o)}">${esc(o)}</button>`).join("");
    const l = phdList(), tracking = PHD.filter((x) => statusOf(x.id) !== "Not started").length;
    const cnt = (r) => PHD.filter((x) => x.region === r).length;
    return `
      <h1>Direct PhD after a bachelor's</h1>
      <p class="lead">${PHD.length} funded PhD programs in the USA, Canada, Europe and the UK that accept a bachelor's degree. Researched ${esc(PHD_CHECKED)}. "Checked" means confirmed on the official page; for the rest, check the page before you apply.</p>
      <div class="stats">
        <div class="stat"><b>${PHD.filter((x) => x.eng === "moi").length}</b><span>accept the MOI letter</span></div>
        <div class="stat"><b>${PHD.filter((x) => x.eng === "ask").length}</b><span>may accept MOI (ask)</span></div>
        <div class="stat"><b>${PHD.filter((x) => x.checked).length}</b><span>checked on the official page</span></div>
        <div class="stat"><b>${tracking}</b><span>you are tracking</span></div>
      </div>
      ${searchBox("phdq", PF.q, "Search: university, machine learning, NLP, HCI, Ireland...")}
      <div class="filters">
        <div class="frow"><label>Level</label><a class="fbtn" href="#all">Master's</a><button class="fbtn on">Direct PhD</button></div>
        <div class="frow"><label>Region</label>${btns("region", ["All", "USA", "Canada", "Europe", "UK"]).replace(/>(USA|Canada|Europe|UK)</g, (m, r) => `>${r} (${cnt(r)})<`)}</div>
        <div class="frow"><label>English</label>${btns("eng", ["All", "MOI letter is enough", "MOI or ask", "Test needed"])}</div>
        <div class="frow"><label>Info</label>${btns("checked", ["All", "Checked on official page"])}</div>
        <div class="frow"><label>Mine</label>${btns("track", ["All", "Tracking"])}</div>
        <div class="frow"><label>Sort by</label><select id="phdsort"><option value="deadline" ${PF.sort === "deadline" ? "selected" : ""}>Nearest deadline</option><option value="english" ${PF.sort === "english" ? "selected" : ""}>MOI first</option><option value="name" ${PF.sort === "name" ? "selected" : ""}>University A to Z</option></select>
          <span class="muted small" style="margin-left:6px">${l.length} program${l.length === 1 ? "" : "s"}</span></div>
      </div>
      <div class="note">A PhD application needs 2 or 3 recommendation letters, a statement of purpose and often a short research proposal. Track your referees in <a href="#apps">My applications</a>. Set a status here to start tracking a PhD.</div>
      ${l.length ? `<div class="grid">${l.map(phdCard).join("")}</div>` : '<div class="empty">No PhD program matches these filters.</div>'}`;
  }

  /* ---------- DAAD: Zuse Schools + STEM scholarship ---------- */
  const hasZuse = () => typeof ZUSE !== "undefined" && (!prof().data || prof().data === "main");
  const zuseFor = (p) => (hasZuse() ? ZUSE.filter((z) => z.progs.includes(p.id)) : []);
  function zuseCard(z) {
    const list = (a, ol) => `<${ol ? "ol" : "ul"} class="list-plain">${a.map((x) => `<li>${esc(x)}</li>`).join("")}</${ol ? "ol" : "ul"}>`;
    const done = z.docs.filter((_, i) => store.get(`zdoc_${z.id}_${i}`, false)).length;
    const mine = z.progs.map(byId).filter(Boolean);
    return `<div class="card zuse" id="${z.id}">
      <div class="app-head"><div><h3 style="margin:0">${esc(z.name)}</h3><div class="muted small">${esc(z.full)}</div></div>
        <select class="status-sel" data-status="${z.id}" data-rerender="1" aria-label="My status">${statusOpts(statusOf(z.id))}</select></div>
      <div class="mline good" style="margin:10px 0">💰 ${esc(z.money)}</div>
      <p class="small"><b>Where:</b> ${esc(z.where)}</p>
      <p class="small"><b>Who can apply:</b> ${esc(z.who)}</p>
      ${z.extra ? `<p class="small">${esc(z.extra)}</p>` : ""}
      <p class="small"><b>English:</b> ${esc(z.english)}</p>
      <div class="note" style="margin:8px 0"><b>Your fit:</b> ${esc(z.fit)}${mine.length ? `<br>Your master's that qualify: ${mine.map((p) => `<a href="#p/${p.id}">${esc(p.uni.split(" (")[0])}: ${esc(p.prog)}</a>`).join(" · ")}` : ""}</div>
      <h4>Deadlines</h4>
      ${z.deadlines.map((d) => `<div class="small">⏰ ${esc(d.t)}${d.d && daysLeft(d.d) >= 0 ? ` <span class="muted">(${daysLeft(d.d)} days left)</span>` : ""}</div>`).join("")}
      <p class="small muted">${esc(z.deadlineNote)}</p>
      <h4>What you need to send <span class="muted small">(${done}/${z.docs.length} ready)</span></h4>
      ${z.docs.map((d, i) => { const on = store.get(`zdoc_${z.id}_${i}`, false); return `<label class="check ${on ? "done" : ""}"><input type="checkbox" data-k="zdoc_${z.id}_${i}" ${on ? "checked" : ""}><span class="txt">${esc(d)}</span></label>`; }).join("")}
      <h4>How to apply</h4>${list(z.how, true)}
      ${z.phd ? `<p class="small muted">${esc(z.phd)}</p>` : ""}
      <div class="phd-actions"><a class="fbtn on" href="${esc(z.link)}" target="_blank" rel="noopener">Official page ↗</a>${z.link2 ? `<a class="fbtn" href="${esc(z.link2)}" target="_blank" rel="noopener">Underrepresented groups scholarship ↗</a>` : ""}</div>
    </div>`;
  }
  function pageDaad() {
    return `<h1>DAAD scholarships</h1>
      <p class="lead">German master's at public universities are tuition-free. These DAAD-funded scholarships also pay your living costs, so you would not need the blocked account. Researched ${hasZuse() ? esc(DAAD_CHECKED) : "October 2026"}.</p>
      ${hasZuse() ? `<h2>Konrad Zuse Schools of Excellence in AI</h2>
      <div class="note">Three AI graduate schools funded by DAAD and the German government. <b>You apply twice:</b> once to the master's at the university, and once to the Zuse School for the scholarship. They want excellent grades (your 3.76 fits), an AI focus, and in return you join their research events, summer schools and a network that leads to PhD positions.</div>
      <div class="card" style="overflow-x:auto"><table class="money kv"><tr><td><b>School</b></td><td><b>Money</b></td><td><b>Next deadline</b></td><td><b>Fits your list</b></td></tr>
        ${ZUSE.map((z) => { const nd = z.deadlines.find((d) => d.d && daysLeft(d.d) >= 0); return `<tr><td><a href="#daad/${z.id}"><b>${esc(z.name)}</b></a></td><td>${esc(z.money.split(".")[0])}</td><td>${esc(nd ? nd.t : z.deadlines[0].t)}</td><td>${z.progs.length ? z.progs.length + " of your programs" : "Needs a new program"}</td></tr>`; }).join("")}</table></div>
      <div class="apps-grid">${ZUSE.map(zuseCard).join("")}</div>` : ""}
      <h2>DAAD Study Scholarship (STEM)</h2>
      ${daadCard()}
      <p class="small muted" style="margin-top:12px">Find more English-taught programs in Germany in the <a href="https://www2.daad.de/deutschland/studienangebote/international-programmes/en/" target="_blank" rel="noopener">DAAD International Programmes database ↗</a> and more scholarships in the <a href="https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/" target="_blank" rel="noopener">DAAD scholarship database ↗</a>. Always confirm amounts and dates on the official pages.</p>`;
  }

  function pageProgram(id) {
    const p = byId(id);
    if (!p) return '<div class="empty">Program not found. <a href="#all">Back to all programs</a></div>';
    const c = calc(p);
    const yrs = p.living.months / 12;
    const docsDone = p.docs.filter((_, i) => store.get(`doc_${p.id}_${i}`, false)).length;
    const say = [];
    if (p.tuitionFree && !p.blocked) say.push(`<div class="big-say good">✅ <div>You don't pay anything for the university.<br><span>${esc(p.tuitionLine)}</span></div></div>`);
    else say.push(`<div class="big-say ${p.blocked ? "good" : "warn"}">${p.blocked ? "✅" : "ℹ️"} <div>${p.blocked ? "No tuition fees." : "Tuition"}<br><span>${esc(p.tuitionLine.replace(/^No tuition\. /, ""))}</span></div></div>`);
    if (p.stipend) say.push(`<div class="big-say good">💰 <div>You get a stipend.<br><span>${esc(p.stipend.text)}</span></div></div>`);
    else say.push(p.blocked || p.country === "Germany" ? `<div class="big-say pay">💸 <div>No stipend.<br><span>You live on your own money (the blocked account). You are allowed to work up to 20 hours a week.</span></div></div>` : `<div class="big-say pay">💸 <div>No stipend.<br><span>You need your own money for living. See "How do I get the money" below for grants you can apply for.</span></div></div>`);
    if (p.blocked) say.push(`<div class="big-say pay">🏦 <div>Blocked account needed: EUR ${num(p.blocked.total)} for ${p.blocked.months} months (EUR ${num(p.blocked.perMonth)} per month).<br><span>${esc(p.blocked.note)}</span></div></div>`);
    const zs = zuseFor(p);
    if (zs.length) say.push(`<div class="big-say good">🎓 <div>Extra DAAD scholarship possible on top: ${zs.map((z) => esc(z.name)).join(", ")}<br><span>Up to about EUR 934 to 992 per month. <a href="#daad">See the requirements in the DAAD tab</a></span></div></div>`);
    if (p.proof) say.push(`<div class="big-say warn">📄 <div>Proof of money for the visa<br><span>${esc(p.proof)}</span></div></div>`);

    let overall;
    if (c.net == null) overall = `<div class="k acc"><small>Overall for the whole program</small><b>Depends on offer</b><span class="egp">Without funding it would be about ${money(c.cost, p.cur)}</span></div>`;
    else if (c.net <= 0) overall = `<div class="k good"><small>Overall from your pocket</small><b>${money(0, p.cur)}</b><span class="egp">Your stipend covers everything and leaves about ${money(-c.net, p.cur)} extra (${egp(-c.net, p.cur)})</span></div>`;
    else overall = `<div class="k pay"><small>Overall from your pocket</small><b>${money(c.net, p.cur)}</b><span class="egp">${egp(c.net, p.cur)} for ${esc(p.duration)}</span></div>`;

    return `
      <a class="back" href="javascript:history.back()">← Back</a>
      <div class="dhead"><div class="flag">${p.flag}</div><div style="flex:1;min-width:240px">
        <div class="chips"><span class="chip">#${p.rankAll} best for me</span>${engChip(p)}${chanceChip(p.chance)}</div>
        <h1>${esc(p.prog)}</h1><div class="lead" style="margin:0">${esc(p.uni)} · ${esc(p.city)} · ${esc(p.duration)}</div></div></div>
      <div class="rankbox">
        <div><small>World ranking</small><b>${p.rank.world ? esc(wr(p.rank.world)) : "Not ranked"}</b></div>
        <div><small>Ranking in ${esc(p.country)}</small><b>${esc(p.rank.country)}</b></div>
        <div class="src">Source: ${esc(p.rank.src || RANK_SOURCE)}</div>
      </div>

      <div class="kbox">
        <div class="k"><small>Paid to the university (total)</small><b>${money(c.uni, p.cur)}</b><span class="egp">${egp(c.uni, p.cur)}</span></div>
        <div class="k good"><small>Stipend you receive (total)</small><b>${p.stipend ? (p.stipend.total ? money(p.stipend.total, p.cur) : "In offer letter") : "None"}</b><span class="egp">${p.stipend && p.stipend.total ? egp(p.stipend.total, p.cur) : ""}</span></div>
        <div class="k pay"><small>Money to bring from Egypt</small><b>${money(c.bring, p.cur)}</b><span class="egp">${egp(c.bring, p.cur)}</span></div>
        ${overall}
      </div>

      ${say.join("")}
      ${fundingBox(p)}

      <div class="two" style="margin-top:14px">
        <div class="card"><h3>💸 Money to bring from Egypt</h3><p class="muted small" style="margin-top:0">What you need ready before and when you travel.</p>
          <table class="money">${p.bring.map((r) => `<tr><td>${esc(r[0])}${est(r[2])}</td><td>${money(r[1], p.cur)}</td></tr>`).join("")}
          <tr class="total"><td>Total to have ready</td><td>${money(c.bring, p.cur)}<div class="muted small">${egp(c.bring, p.cur)}</div></td></tr></table></div>
        <div class="card"><h3>🧮 Overall cost for the whole program</h3><p class="muted small" style="margin-top:0">${esc(p.duration)}. Everything you will spend, minus what you receive.</p>
          <table class="money">
            ${p.uniLines.map((r) => `<tr><td>${esc(r[0])}</td><td>${money(r[1], p.cur)}</td></tr>`).join("")}
            ${p.other.map((r) => `<tr><td>${esc(r[0])}${est(r[2])}</td><td>${money(r[1], p.cur)}</td></tr>`).join("")}
            <tr><td>Living: ${money(p.living.perMonth, p.cur)} x ${p.living.months} months${est(p.living.est)}<div class="muted small">${esc(p.living.note)}</div></td><td>${money(c.living, p.cur)}</td></tr>
            <tr><td><b>Total you spend</b></td><td>${money(c.cost, p.cur)}</td></tr>
            <tr><td style="color:var(--good)">Minus stipend you receive</td><td style="color:var(--good)">${p.stipend ? (p.stipend.total ? "- " + money(p.stipend.total, p.cur) : "in offer") : money(0, p.cur)}</td></tr>
            <tr class="total"><td>${c.net == null ? "From your pocket" : c.net <= 0 ? "Left over for you" : "From your pocket"}</td><td>${c.net == null ? "Depends on offer" : money(Math.abs(c.net), p.cur)}<div class="muted small">${c.net == null ? "" : egp(Math.abs(c.net), p.cur)}</div></td></tr>
          </table>
          ${yrs > 1 ? `<p class="muted small">That is about ${c.net == null ? "?" : money(Math.max(c.net, 0) / yrs, p.cur)} per year from your own money.</p>` : ""}</div>
      </div>

      <div class="two" style="margin-top:14px">
        <div class="card"><h3>📅 Deadlines and how to apply</h3>
          <ul class="list-plain">${p.deadlines.map((d) => `<li><b>${esc(d.t)}</b>${d.d ? ` <span class="chip ${daysLeft(d.d) < 0 ? "plain" : daysLeft(d.d) < 45 ? "pay" : ""}">${daysLeft(d.d) < 0 ? "passed" : daysLeft(d.d) + " days left"}</span>${daysLeft(d.d) >= 0 ? " " + calBtn(p, p.deadlines.indexOf(d)) : ""}` : ""}</li>`).join("")}</ul>
          <dl class="req" style="margin-top:12px"><div><dt>Intake</dt><dd>${esc(p.intake)}</dd></div><div><dt>Apply via</dt><dd>${esc(p.applyVia)}</dd></div>
          <div><dt>Official page</dt><dd><a href="${esc(p.link)}" target="_blank" rel="noopener">Open the official page ↗</a></dd></div></dl></div>
        <div class="card"><h3>📋 Requirements</h3>
          <dl class="req"><div><dt>English</dt><dd>${esc(p.eng.t)}</dd></div>
          ${p.german ? `<div><dt>German</dt><dd>${esc(p.german)}</dd></div>` : ""}
          <div><dt>Academic</dt><dd>${esc(p.academic)}</dd></div>
          <div><dt>Chance of acceptance</dt><dd><b>${esc(p.chance)}</b>${p.accept ? ". " + esc(p.accept) : ""}</dd></div>
          <div><dt>Why it is good for me</dt><dd>${esc(p.why)}</dd></div>
          <div><dt>Watch out</dt><dd>${esc(p.watch)}</dd></div></dl></div>
      </div>

      <div class="two" style="margin-top:14px">
        <div class="card"><h3>✅ Documents for this program</h3>
          <div class="progress"><div style="width:${(docsDone / p.docs.length) * 100}%"></div></div>
          <p class="muted small" style="margin:0 0 6px">${docsDone} of ${p.docs.length} ready</p>
          ${p.docs.map((d, i) => { const k = `doc_${p.id}_${i}`; const on = store.get(k, false); return `<label class="check ${on ? "done" : ""}"><input type="checkbox" data-k="${k}" ${on ? "checked" : ""}><span class="txt">${esc(d)}</span></label>`; }).join("")}
          <p class="small muted">General papers (MOI letter, letters, CV) are also in <a href="#checklist">My checklist</a>.</p></div>
        <div class="card"><h3>📌 My application status</h3>
          <select class="status-sel" data-status="${p.id}">${statusOpts(statusOf(p.id))}</select>
          <p class="muted small">Saved in ${esc(prof().name)}'s profile and synced to your other devices.</p>
          <h3 style="margin-top:16px">📝 My notes</h3>
          <textarea class="notes" data-note="${p.id}" placeholder="Professors I emailed, login details hint, questions to ask...">${esc(store.get("note_" + p.id, ""))}</textarea></div>
      </div>
      ${stepsCard(p)}`;
  }

  function fundingBox(p) {
    const f = FUNDING[p.id];
    if (!f) return "";
    const l = FUND_LABEL[f.how];
    return `<div class="card fund-card"><h3>💰 How do I get the money? <span class="chip ${l.cls}">${esc(l.text)}</span></h3><p style="margin:6px 0 0">${esc(f.text)}</p>${p.country === "Germany" ? `<p class="small" style="margin:8px 0 0">💡 Want a monthly stipend in Germany instead of the blocked account? See <a href="#money/daad">the DAAD scholarship guide</a>.</p>` : ""}</div>`;
  }

  function stepsCard(p) {
    const steps = stepsFor(p).map((x) => ({ ...x, t: tweakText(x.t) }));
    const done = steps.filter((_, i) => store.get(`step_${p.id}_${i}`, false)).length;
    let phase = "", html = "";
    steps.forEach((s, i) => {
      if (s.phase !== phase) { phase = s.phase; html += `<div class="phase">${esc(phase)}</div>`; }
      const k = `step_${p.id}_${i}`, on = store.get(k, false);
      html += `<label class="check step ${on ? "done" : ""}"><input type="checkbox" data-k="${k}" ${on ? "checked" : ""}><span class="num">${i + 1}</span><span class="txt">${esc(s.t)}</span></label>`;
    });
    return `<div class="card" style="margin-top:14px"><h3>🧭 Step by step until you travel</h3>
      <div class="progress"><div style="width:${(done / steps.length) * 100}%"></div></div>
      <p class="muted small" style="margin:0 0 6px">${done} of ${steps.length} steps done. Tick each step when you finish it.</p>${html}</div>`;
  }

  function pageDeadlines() {
    const items = [];
    PROGRAMS.forEach((p) => p.deadlines.forEach((d) => items.push({ p, d })));
    const dated = items.filter((x) => x.d.d).sort((a, b) => a.d.d.localeCompare(b.d.d));
    const undated = items.filter((x) => !x.d.d);
    const row = (x) => {
      const dl = daysLeft(x.d.d);
      return `<a href="#p/${x.p.id}" class="${dl < 0 ? "past" : dl <= 45 ? "soon" : ""}">
        <div class="date">${fmtDate(x.d.d)}</div>
        <div><b>${x.p.flag} ${esc(x.p.uni)}</b><div class="muted small">${esc(x.p.prog)}<br>${esc(x.d.t)}</div></div>
        <div class="days">${dl < 0 ? "passed" : dl + " days"}${dl >= 0 ? `<div>${calBtn(x.p, x.p.deadlines.indexOf(x.d))}</div>` : ""}</div></a>`;
    };
    return `
      <h1>Deadlines</h1>
      <p class="lead">Sorted by date. Red means less than 45 days left. Tap 📅 to add a deadline to your phone calendar with reminders 7 days and 1 day before.</p>
      ${reminderBanner()}
      <div class="tl">${dated.map(row).join("")}</div>
      <h2>Rolling or not announced yet</h2>
      <div class="tl">${undated.map((x) => `<a href="#p/${x.p.id}"><div class="date">${x.d.asap ? "Apply now" : "Check"}</div><div><b>${x.p.flag} ${esc(x.p.uni)}</b><div class="muted small">${esc(x.d.t)}</div></div><div></div></a>`).join("")}</div>`;
  }

  function checklistProgress() {
    let total = 0, done = 0;
    CHECKLIST.forEach((g) => g.items.forEach((it) => { total++; if (store.get("chk_" + it[0], false)) done++; }));
    store.get("custom", []).forEach((it) => { total++; if (it.done) done++; });
    return { total, done };
  }

  /* ---------- My applications: what I started, what is still missing ---------- */
  const SEED = {
    mayar: {
      "hildesheim-da": { status: "Preparing", note: "Form filled in on 31 Oct 2026, not submitted yet.", miss: [
        "Fix last name to Mohamed Issa Mohamed Said", "Fix phone format to +20 1062100482", "Add school certificate date issued and mark",
        "Scan El Quds diploma and upload it", "Add English certificate date issued", "Upload CV", "Upload degree certificate and transcript",
        "Upload Graduation Statement (English proof)", "Upload additional documents (letter, certificates, course descriptions)",
        "Set password and tick data protection", "Review everything and submit"] },
      "lmu-stats": { status: "Preparing", note: "Form filled in on 31 Oct 2026, not submitted. Deadline 15 Nov 2026, 11:59 pm CET.", miss: [
        "Upload diploma", "Upload transcript", "Upload Graduation Statement (English proof)", "Upload CV and certificates",
        "Upload course descriptions", "Check German grade with the LMU conversion tool", "Review all pages and submit before 15 Nov",
        "Central LMU application (opens 2 Dec, deadline 15 Jan)"] },
    },
    rodayna: {
      "hildesheim-da": { status: "Preparing", note: "Form filled in on 31 Oct 2026 with CV, degree and transcript, Graduation Statement and additional documents uploaded. Not submitted. Deadline 15 Dec 2026 (rolling, apply early).", miss: [
        "Add street address and ZIP code", "Confirm phone and email", "Add school name, country, certificate date and mark",
        "Scan the school certificate and upload it", "Add the BloomTech report link", "Confirm start date and minimum pass marks",
        "Set password and tick data protection", "Review everything and submit"] },
      "lmu-stats": { status: "Preparing", note: "Department deadline 15 Nov 2026, 11:59 pm CET. Not filled in yet.", miss: [
        "Fill the department application", "Upload diploma and transcript", "Upload Graduation Statement (English proof)",
        "Upload CV, certificates and course descriptions", "Motivation letter showing the data science focus", "Review and submit before 15 Nov",
        "Central LMU application (opens 2 Dec, deadline 15 Jan)"] },
      "thws-ai": { status: "Preparing", note: "THWS form (version 08.10.2026) filled in on 1 Nov 2026, not signed or submitted. Non-EU: submit by 15 Nov 2026 (final 15 Dec). Needs a uni-assist VPD.", miss: [
        "High school certificate and grade transcript (official English version)", "Request uni-assist VPD now (4 to 6 weeks)", "Email mai.fiw@thws.de about the Graduation Statement as English proof",
        "Add number of BloomTech group members and the report link to the form", "Confirm the grading scale bands", "Date and sign the form",
        "Register on the Campus Portal and pay the EUR 50 fee", "Passport copy", "Upload everything and submit"] },
    },
  };
  /* each program is seeded only once per profile and never overwrites what the person changed */
  function seedApps() {
    const s = SEED[profile];
    if (!s) return;
    let done = store.get("apps_seeded_ids", null);
    if (!done) done = store.get("apps_seeded", false) ? Object.keys(s) : [];
    const todo = Object.keys(s).filter((id) => !done.includes(id));
    if (!todo.length) return;
    todo.forEach((id) => {
      done.push(id);
      if (!byId(id)) return;
      if (statusOf(id) === "Not started") raw.set(profile + "_status_" + id, s[id].status);
      if (!store.get("note_" + id, "")) raw.set(profile + "_note_" + id, s[id].note);
      if (!store.get("miss_" + id, []).length) raw.set(profile + "_miss_" + id, s[id].miss.map((t) => ({ text: t, done: false })));
    });
    store.set("apps_seeded", true); store.set("apps_seeded_ids", done);
  }
  /* one-time changes to a profile's tracker (each runs once, keyed by its id) */
  const UPDATES = {
    mayar: [{ key: "2026-11-05-hildesheim-submitted", id: "hildesheim-da", status: "Applied",
      note: "Submitted on 5 Nov 2026. Waiting for the admission decision (rolling admission, usually a few weeks). Check your email and the Hildesheim portal login." }],
  };
  function applyUpdates() {
    const list = UPDATES[profile] || [], done = store.get("updates_done", []);
    let changed = false;
    list.forEach((u) => {
      if (done.includes(u.key)) return;
      done.push(u.key); changed = true;
      if (u.status) raw.set(profile + "_status_" + u.id, u.status);
      if (u.note) { const old = store.get("note_" + u.id, ""); raw.set(profile + "_note_" + u.id, u.note + (old ? "\n\n" + old : "")); }
      const miss = store.get("miss_" + u.id, []); if (miss.length) raw.set(profile + "_miss_" + u.id, miss.map((m) => ({ ...m, done: true })));
    });
    if (changed) store.set("updates_done", done);
  }
  function pageApps() {
    seedApps(); applyUpdates();
    const started = PROGRAMS.filter((p) => statusOf(p.id) !== "Not started").sort((a, b) => STATUSES.indexOf(statusOf(a.id)) - STATUSES.indexOf(statusOf(b.id)));
    const notStarted = PROGRAMS.filter((p) => statusOf(p.id) === "Not started").sort((a, b) => a.rankAll - b.rankAll);
    const card = (p) => {
      const miss = store.get("miss_" + p.id, []), left = miss.filter((m) => !m.done).length, dl = nextDeadline(p);
      return `<div class="card app-card">
        <div class="app-head"><div><a href="#p/${p.id}"><b>${p.flag} ${esc(p.uni)}</b></a><div class="muted small">${esc(p.prog)}</div></div>
          <select class="status-sel" data-status="${p.id}" data-rerender="1">${statusOpts(statusOf(p.id))}</select></div>
        <p class="small" style="margin:6px 0">${dl && dl.d ? `⏰ ${esc(dl.t)}: <b>${fmtDate(dl.d)}</b> (${daysLeft(dl.d) + " days left"})` : dl ? `⏰ ${esc(dl.t)}` : "⏰ No upcoming deadline listed"}
          &nbsp;<span class="chip ${left ? "pay" : "good"}">${left ? left + " still missing" : "Nothing missing"}</span></p>
        <h4 style="margin:10px 0 4px">Still missing</h4>
        ${miss.map((m, i) => `<div class="check ${m.done ? "done" : ""}"><input type="checkbox" data-miss="${p.id}|${i}" ${m.done ? "checked" : ""}><span class="txt" style="flex:1">${esc(m.text)}</span><button class="del" data-missdel="${p.id}|${i}" title="Remove">✕</button></div>`).join("") || '<p class="muted small">Nothing listed yet.</p>'}
        <form class="addrow addMiss" data-id="${p.id}"><input name="t" placeholder="Add what is still missing..." maxlength="160" required><button class="fbtn on" type="submit">Add</button></form>
        ${DOC_FILES[profile] ? `<p class="small" style="margin:10px 0 0"><a href="#docs/${p.id}">📄 CV, motivation letter and records for this program</a></p>` : ""}
        <h4 style="margin:12px 0 4px">My note</h4>
        <textarea class="notes" data-note="${p.id}" placeholder="Login link, what I wrote, who I emailed...">${esc(store.get("note_" + p.id, ""))}</textarea>
      </div>`;
    };
    return `
      <h1>My applications</h1>
      <p class="lead">Every program ${esc(prof().name)} has started, with what is still missing and a note for each one. Saved in your profile and synced to your other devices.</p>
      <div class="card"><h3>➕ Start tracking a program</h3>
        <form class="addrow" id="startApp"><select name="pid" class="status-sel" style="flex:1">${notStarted.map((p) => `<option value="${p.id}">${p.flag} ${esc(p.uni)}: ${esc(p.prog)}</option>`).join("")}</select><button class="fbtn on" type="submit">Start</button></form>
        <p class="muted small" style="margin:6px 0 0">Or change the status on any program page.</p></div>
      <p><button class="fbtn" data-csv="1">⬇️ Download my applications (spreadsheet)</button></p>
      ${started.length ? `<div class="apps-grid">${started.map(card).join("")}</div>` : '<p class="muted">No applications started yet.</p>'}
      ${hasPhd() ? phdApps() : ""}
      ${refsCard()}`;
  }
  function phdApps() {
    const l = PHD.filter((x) => statusOf(x.id) !== "Not started").sort((a, b) => STATUSES.indexOf(statusOf(a.id)) - STATUSES.indexOf(statusOf(b.id)));
    return `<h2>🎓 Direct PhD I am tracking</h2>
      ${l.length ? `<div class="apps-grid">${l.map((x) => `<div class="card app-card"><div class="app-head"><div><b>${x.flag} ${esc(x.uni)}</b><div class="muted small">${esc(x.prog)}</div></div>
        <select class="status-sel" data-status="${x.id}" data-rerender="1">${statusOpts(statusOf(x.id))}</select></div>
        <p class="small" style="margin:6px 0">⏰ ${esc(x.deadline)} · <a href="${esc(x.link)}" target="_blank" rel="noopener">Official page ↗</a></p>
        <textarea class="notes" data-note="${x.id}" placeholder="Supervisors I emailed, portal login, what is missing...">${esc(store.get("note_" + x.id, ""))}</textarea></div>`).join("")}</div>`
        : '<p class="muted small">None yet. Open <a href="#phd">Direct PhD</a> and set a status on a program.</p>'}`;
  }
  /* applications in progress (master's and PhD), used by the referees tracker and the spreadsheet */
  function activeApps() {
    const m = PROGRAMS.filter((p) => statusOf(p.id) !== "Not started").map((p) => ({ id: p.id, uni: p.uni, prog: p.prog, dl: nextDeadline(p) ? nextDeadline(p).t : "", kind: "Master's" }));
    const d = hasPhd() ? PHD.filter((x) => statusOf(x.id) !== "Not started").map((x) => ({ id: x.id, uni: x.uni, prog: x.prog, dl: x.deadline, kind: "PhD" })) : [];
    const z = hasZuse() ? ZUSE.filter((x) => statusOf(x.id) !== "Not started").map((x) => ({ id: x.id, uni: x.name, prog: "DAAD scholarship", dl: (x.deadlines.find((q) => q.d && daysLeft(q.d) >= 0) || x.deadlines[0]).t, kind: "Scholarship" })) : [];
    return [...m, ...d, ...z];
  }
  const REF_ST = ["Not asked", "Asked", "Agreed", "Submitted"];
  function refsCard() {
    const refs = store.get("refs", []), apps = activeApps();
    return `<h2>✉️ Recommendation letters</h2>
      <p class="muted small">Add the people writing your letters, then mark for each application whether you asked them and whether they submitted.</p>
      <div class="apps-grid">${refs.map((r, i) => `<div class="card app-card"><div class="app-head"><div><b>${esc(r.name)}</b><div class="muted small">${esc(r.role || "")}${r.email ? " · " + esc(r.email) : ""}</div></div><button class="del" data-refdel="${i}" title="Remove">✕</button></div>
        ${apps.length ? `<table class="money ref-table">${apps.map((a) => { const v = (r.st || {})[a.id] || "Not asked"; return `<tr><td>${esc(a.uni)}<div class="muted small">${esc(a.kind)}</div></td><td><select class="status-sel" data-ref="${i}|${a.id}">${REF_ST.map((s) => `<option ${v === s ? "selected" : ""}>${s}</option>`).join("")}</select></td></tr>`; }).join("")}</table>` : '<p class="muted small">Start an application to track letters for it.</p>'}
      </div>`).join("")}</div>
      <div class="card"><form class="addrow" id="addRef"><input name="n" placeholder="Name (e.g. Dr. Soha Ahmed)" maxlength="80" required><input name="r" placeholder="Role (optional)" maxlength="80"><input name="e" type="email" placeholder="Email (optional)" maxlength="120"><button class="fbtn on" type="submit">Add referee</button></form></div>`;
  }
  function downloadCsv() {
    const q = (v) => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
    const refs = store.get("refs", []);
    const rows = [["Type", "University", "Program", "Status", "Deadline", "Still missing", "Letters submitted", "Note"]];
    activeApps().forEach((a) => {
      const miss = store.get("miss_" + a.id, []).filter((m) => !m.done).map((m) => m.text).join("; ");
      const sub = refs.filter((r) => (r.st || {})[a.id] === "Submitted").length;
      rows.push([a.kind, a.uni, a.prog, statusOf(a.id), a.dl, miss, refs.length ? sub + " of " + refs.length : "", store.get("note_" + a.id, "")]);
    });
    const url = URL.createObjectURL(new Blob(["\ufeff" + rows.map((r) => r.map(q).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = prof().name + "_applications.csv"; document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  /* ---------- My documents: saved files, CV and motivation letter per program ---------- */
  const fmtLong = (d) => d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  function printHtml(title, css, inner) {
    const w = window.open("", "_blank");
    if (!w) { alertBox("Please allow pop-ups for this site to download the PDF."); return; }
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>${css}</style></head><body>${inner}</body></html>`);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 450);
  }
  const fileTag = (p) => (p.uni.split(" (")[0] + " " + p.prog.replace(/^M\.Sc\.\s*/, "")).replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 60);
  function cvFor(p) {
    const me = CV_ME[profile];
    printHtml(`${me.name.replace(/ /g, "_")}_CV_${fileTag(p)}`, CV_CSS,
      `<h1>${me.name}</h1><div class="contact">${me.contact}</div><h2>Profile</h2><p>${esc(me.profile(docFocus(p)))}</p>${me.body}`);
  }
  const letterText = (p) => store.get("letter_" + p.id, "") || (CV_ME[profile].letter ? CV_ME[profile].letter(p) : letterDefault(p, CV_ME[profile].name));
  function letterFor(p) {
    const me = CV_ME[profile];
    const paras = letterText(p).split(/\n\s*\n/).map((x) => `<p>${esc(x.trim())}</p>`).join("");
    printHtml(`${me.name.replace(/ /g, "_")}_Motivation_Letter_${fileTag(p)}`, LETTER_CSS,
      `<div class="top"><div><b>${me.name}</b><br>${me.city || "Alexandria, Egypt"}<br>${me.email || "Myar.issa2003@gmail.com"}</div><div style="text-align:right">${fmtLong(new Date())}<br><br>Admissions Committee<br>${esc(p.prog)}<br>${esc(p.uni)}</div></div>
       <p class="subj">Motivation Letter: ${esc(p.prog)}</p>${paras}`);
  }
  function pageDocs(arg) {
    const files = DOC_FILES[profile];
    if (!files || !CV_ME[profile]) return `<h1>My documents</h1><p class="lead">No documents saved for ${esc(prof().name)} yet.</p>`;
    const fileRow = (d) => `<div class="doc-row"><div><b>${esc(d.t)}</b><div class="muted small">${esc(d.n)} (${d.kb >= 1024 ? (d.kb / 1024).toFixed(1) + " MB" : d.kb + " KB"})</div></div>
      <div class="doc-btns"><a class="fbtn" href="files/${encodeURIComponent(d.f)}" target="_blank" rel="noopener">Open</a><a class="fbtn on" href="files/${encodeURIComponent(d.f)}" download="${esc(d.fn)}">Download</a></div></div>`;
    const ids = new Set(PROGRAMS.filter((p) => statusOf(p.id) !== "Not started").map((p) => p.id));
    files.forEach((d) => { if (d.g !== "gen" && byId(d.g)) ids.add(d.g); });
    if (arg && byId(arg)) ids.add(arg);
    const progs = [...ids].map(byId).sort((a, b) => (a.id === arg ? -1 : b.id === arg ? 1 : a.rankAll - b.rankAll));
    const others = PROGRAMS.filter((p) => !ids.has(p.id)).sort((a, b) => a.rankAll - b.rankAll);
    const progCard = (p) => {
      const own = files.filter((d) => d.g === p.id);
      return `<div class="card doc-prog" id="doc-${p.id}"><h3>${p.flag} ${esc(p.uni)}<div class="muted small" style="font-weight:400">${esc(p.prog)} · ${esc(statusOf(p.id))}</div></h3>
        <div class="doc-row"><div><b>CV for this program</b><div class="muted small">Your CV with the profile line matched to ${esc(docFocus(p))}.</div></div><div class="doc-btns"><button class="fbtn on" data-gencv="${p.id}">Download PDF</button></div></div>
        <details class="doc-letter" ${store.get("letter_" + p.id, "") ? "open" : ""}><summary><b>Motivation letter for this program</b> <span class="muted small">(tap to read or edit)</span></summary>
          <textarea class="notes letter-box" data-letter="${p.id}">${esc(letterText(p))}</textarea>
          <p class="small muted" style="margin:4px 0">Edits are saved in your profile. ${store.get("letter_" + p.id, "") ? '<button class="fbtn" data-letterreset="' + p.id + '">Reset to the original text</button>' : ""}</p></details>
        <div class="doc-row"><div><b>Motivation letter PDF</b><div class="muted small">One page, dated today, addressed to this program.</div></div><div class="doc-btns"><button class="fbtn on" data-genletter="${p.id}">Download PDF</button></div></div>
        ${own.map(fileRow).join("")}</div>`;
    };
    return `
      <h1>My documents</h1>
      <p class="lead">Your general papers in one place, plus a CV, a motivation letter and the application record for each program. For a generated CV or letter, press Download PDF and choose "Save as PDF" in the print window.</p>
      <h2>General documents</h2>
      <div class="card">${files.filter((d) => d.g === "gen").map(fileRow).join("")}</div>
      <h2>Per program</h2>
      <div class="card"><form class="addrow" id="docPick"><select name="pid" class="status-sel" style="flex:1">${others.map((p) => `<option value="${p.id}">${p.flag} ${esc(p.uni)}: ${esc(p.prog)}</option>`).join("")}</select><button class="fbtn on" type="submit">Show documents</button></form></div>
      <div class="apps-grid">${progs.map(progCard).join("")}</div>`;
  }

  function pageChecklist() {
    const cp = checklistProgress();
    const apps = PROGRAMS.map((p) => ({ p, s: statusOf(p.id) }));
    return `
      <h1>My checklist</h1>
      <p class="lead">${esc(prof().name)}'s checklist. Tick each paper when it is ready. Only ${esc(prof().name)}'s profile can see or change these ticks.</p>
      <div class="card"><b>${cp.done} of ${cp.total} done</b><div class="progress"><div style="width:${(cp.done / cp.total) * 100}%"></div></div></div>
      <div class="grid" style="margin-top:14px">${CHECKLIST.map((g) => {
        const d = g.items.filter((it) => store.get("chk_" + it[0], false)).length;
        return `<div class="card"><h3>${g.icon} ${esc(g.group)} <span class="muted small">(${d}/${g.items.length})</span></h3>
          ${g.items.map((it) => { const on = store.get("chk_" + it[0], false); return `<label class="check ${on ? "done" : ""}"><input type="checkbox" data-k="chk_${it[0]}" ${on ? "checked" : ""}><span class="txt">${esc(it[1])}<span class="for">Needed for: ${esc(it[2])}</span></span></label>`; }).join("")}</div>`;
      }).join("")}
      <div class="card"><h3>➕ My own items</h3>
        ${store.get("custom", []).map((it, i) => `<div class="check ${it.done ? "done" : ""}"><input type="checkbox" data-custom="${i}" ${it.done ? "checked" : ""}><span class="txt" style="flex:1">${esc(it.text)}</span><button class="del" data-del="${i}" title="Remove">✕</button></div>`).join("") || '<p class="muted small">Add anything else you need to do.</p>'}
        <form class="addrow" id="addCustom"><input name="t" placeholder="e.g. Translate birth certificate" maxlength="160" required><button class="fbtn on" type="submit">Add</button></form>
      </div></div>
      <h2>My applications</h2>
      <div class="card"><table class="money">${apps.map((a) => `<tr><td><a href="#p/${a.p.id}">${a.p.flag} ${esc(a.p.uni)}</a><div class="muted small">${esc(a.p.prog)}</div></td><td><select class="status-sel" data-status="${a.p.id}">${statusOpts(a.s)}</select></td></tr>`).join("")}</table></div>
      <h2>Tips for the letters</h2>
      <div class="grid">
${DS.tips}
      </div>`;
  }

  function daadCard() {
    return `<details class="card daad" id="daad" ${(location.hash || "").includes("daad") ? "open" : ""}><summary><h3 style="display:inline">🇩🇪 Do I need a DAAD scholarship? (tap to open)</h3></summary>
      <h4>The short answer</h4>
      <ul class="list-plain">
        <li><b>No, you do not need DAAD to study in Germany.</b> The German programs on this site have no tuition, so admission alone is enough. You live on your own blocked account money (EUR 11,904 per year).</li>
        <li><b>DAAD is useful if you want Germany to pay your living costs.</b> If you win, DAAD pays about <b>EUR 992 per month</b> plus health insurance, a travel allowance and a yearly study allowance (about EUR 460), and the DAAD award letter replaces the blocked account for the visa.</li>
        <li>It does <b>not</b> pay tuition, so it only works with tuition-free programs (all the German ones here).</li>
      </ul>
      <h4>Which DAAD scholarship fits you</h4>
      <ul class="list-plain">
        <li><b>DAAD Study Scholarships for STEM Disciplines</b> (master's in mathematics, computer science, natural sciences or engineering). This fits CS / AI / Data (Mayar and Rodayna) and natural sciences like microbiology and ecology (Aya).</li>
        <li>It is for students from developing and emerging countries: open the DAAD scholarship database, choose Egypt as your country and check this program is listed for you.</li>
        <li><b>EPOS</b> (development-related master's) needs at least 2 years of work experience, so it is not for fresh graduates. Aya could look at it later, once she has 2 years at VOIS.</li>
        <li>The general "all disciplines" DAAD study scholarships in Egypt mostly target arts, music and architecture, so for CS and science use the STEM one.</li>
      </ul>
      <h4>Rules you must meet</h4>
      <ul class="list-plain">
        <li>Bachelor's finished by the deadline and not older than 6 years; no master's degree yet.</li>
        <li>Above-average grades (your GPA is fine) and you have not lived in Germany for more than 15 months.</li>
        <li><b>A language certificate is required for DAAD (at least B1, e.g. IELTS or TOEFL), even if the university accepts your MOI letter.</b> So for DAAD you need IELTS.</li>
        <li>The master's must be full-time, on campus, tuition-free, at a state university, and start in the <b>winter semester (October)</b>. You must not have started it already.</li>
      </ul>
      <h4>Timing (important)</h4>
      <ul class="list-plain">
        <li>The portal opens around <b>June</b> and closes around <b>early September</b> (last time: 3 September 2026), for master's starting in <b>October of the next year</b>. Decisions come around February.</li>
        <li>So the round for October 2027 is already closed. Your options: <b>(A)</b> start in 2027 with the blocked account (no DAAD), or <b>(B)</b> apply to DAAD between June and September 2027 for an October 2028 start.</li>
        <li>You cannot get the STEM scholarship for a master's you already started in Germany, so choose before you go.</li>
      </ul>
      <h4>Step by step (for option B)</h4>
      <ol class="list-plain">
        <li>Check on the DAAD scholarship database that Egypt is eligible for "Study Scholarships for STEM Disciplines".</li>
        <li>Take IELTS (aim for 6.5 or higher so universities accept it too).</li>
        <li>Choose up to 5 tuition-free STEM master's starting in October (for example Passau, TU Darmstadt, TU Dortmund, Hildesheim, Bremen).</li>
        <li>Apply to those universities on their own deadlines (you can send the admission letter to DAAD later, before funding starts).</li>
        <li>In June, register on the DAAD portal and download the recommendation form; ask a professor to fill it.</li>
        <li>Prepare: CV in table form (max 3 pages), motivation letter (1 to 3 pages, why these programs and your plans), transcripts, degree, IELTS, passport, the preferred programs form.</li>
        <li>Submit before the early September deadline (do not wait for the last day).</li>
        <li>If shortlisted, do the online interview with a committee of professors.</li>
        <li>Get the decision (around February), then send your admission letter.</li>
        <li>Use the DAAD award letter for the German visa instead of a blocked account.</li>
      </ol>
      <p class="small muted">Very competitive (one guide estimates about 10% success for Egyptian applicants). The DAAD office in Cairo (Zamalek) can answer questions.</p>
    </details>`;
  }

  function pageMoney() {
    return `
      <h1>Money guide</h1>
      <p class="lead">How the money works in each country, in simple words. EGP amounts use today's exchange rates, updated automatically every day. You can still type your bank's rate below.</p>
      ${daadCard()}
      <div class="card" style="margin-top:14px"><h3>Exchange rates (EGP for 1 unit)</h3>
        <p class="small" style="margin-top:0">${live ? `✅ Live rates for ${esc(live.date)}, updated automatically every day.` : "Showing approximate rates. Live rates load automatically when you are online."}${Object.keys(store.get("rates", {})).length ? " You changed some rates by hand; those are used instead." : ""}</p>
        <div class="rates">${Object.keys(RATES_DEFAULT).map((c) => `<label>${c}<input type="number" step="0.001" data-rate="${c}" value="${rates[c]}"></label>`).join("")}</div>
        <p class="small muted"><button class="fbtn" id="resetRates">Use today's rates</button> Source: open.er-api.com (market rates; your bank's rate may differ slightly).</p></div>
      <div class="grid" style="margin-top:14px">
${DS.moneyCards}
      </div>
      <h2>Compare: money to bring and overall cost</h2>
      <div class="card" style="overflow-x:auto"><table class="money"><tr><td><b>Program</b></td><td><b>Bring from Egypt</b></td><td><b>Overall from pocket</b></td></tr>
        ${[...PROGRAMS].sort((a, b) => a.rankAll - b.rankAll).map((p) => { const c = calc(p); return `<tr><td><a href="#p/${p.id}">${p.flag} ${esc(p.uni)}</a></td><td>${egp(c.bring, p.cur).replace("about ", "")}</td><td>${c.net == null ? "Depends on offer" : c.net <= 0 ? '<span style="color:var(--good)">Covered + extra</span>' : egp(c.net, p.cur).replace("about ", "")}</td></tr>`; }).join("")}
      </table><p class="small muted">In EGP using the rates above. Germany includes the full blocked account as money to bring.</p></div>`;
  }

  function pageProfiles(askPin) {
    if (askPin) {
      const p = PROFILES.find((x) => x.id === askPin);
      return `<div class="profiles"><h1>Hi ${esc(p.name)} 👋</h1><p class="lead">Enter your PIN to open your part.</p>
        <form id="pinForm" data-pid="${p.id}" class="addrow" style="max-width:320px;margin:0 auto"><input name="pin" type="password" inputmode="numeric" maxlength="8" placeholder="PIN" autofocus required><button class="fbtn on" type="submit">Open</button></form>
        <p id="pinErr" class="small" style="color:var(--pay)"></p>
        <p><a href="#" data-back="1">← Choose another profile</a></p></div>`;
    }
    return `<div class="profiles">
      <h1>Who is checking?</h1>
      <p class="lead">Each person has a separate part. Ticks, statuses, notes and your own checklist items in one profile never change the other.</p>
      <div class="pgrid">${PROFILES.map((p) => `<button class="pbtn" data-pick="${p.id}" style="--pc:${p.color}">
        <span class="avatar">${esc(p.name[0])}</span><b>${esc(p.name)}</b>
        <span class="small muted">${raw.get("pin_" + p.id, "") ? "🔒 PIN protected" : "No PIN yet"}</span></button>`).join("")}</div>
      <p class="small muted">Data is saved in this browser. Set a PIN inside your profile so the other person cannot open your part on a shared device.</p></div>`;
  }

  function pageSettings() {
    const has = !!raw.get("pin_" + profile, "");
    return `<h1>${esc(prof().name)}'s profile</h1>
      <div class="card" style="max-width:520px"><h3>🔒 PIN</h3>
        <p class="muted small">${has ? "Your profile is protected. Change or remove the PIN below." : "Add a PIN so only you can open and edit your part."}</p>
        <form id="setPin" class="addrow"><input name="pin" type="password" inputmode="numeric" minlength="4" maxlength="8" placeholder="New PIN (4 to 8 digits)" pattern="[0-9]{4,8}" required><button class="fbtn on" type="submit">Save PIN</button></form>
        ${has ? '<p><button class="fbtn" id="removePin">Remove PIN</button></p>' : ""}
        <p id="pinMsg" class="small" style="color:var(--good)"></p></div>
      <div class="card" style="max-width:520px;margin-top:14px"><h3>☁️ Sync across my devices</h3>
        <p class="small"><span id="syncDot" class="sync-dot ${syncStatus}"></span> <span id="syncStatus">${syncLabel()}</span></p>
        <p class="small muted">Your ticks, statuses, notes and compare list are saved online under this private code. Keep it secret: anyone with the code can see your progress.</p>
        <p><b>Your sync code:</b> <code class="code" id="myCode">${esc(syncCode())}</code> <button class="fbtn" data-copy-code="1">Copy</button></p>
        <p class="small"><b>On your other device:</b> open this site, choose ${esc(prof().name)}, open this page, and paste the code below.</p>
        <form id="linkCode" class="addrow"><input name="code" placeholder="Paste the code from your other device" minlength="20" maxlength="64" required><button class="fbtn on" type="submit">Link</button></form>
        <p id="linkMsg" class="small"></p></div>
      <div class="card" style="max-width:520px;margin-top:14px"><h3>👥 Switch profile</h3><p><button class="fbtn on" data-switch="1">Switch to another profile</button></p></div>`;
  }

  /* Light / dark mode: follows the device unless the person picks one */
  const THEMES = { auto: "🌓", light: "☀️", dark: "🌙" };
  const themeLabel = { auto: "Theme: same as device", light: "Theme: light", dark: "Theme: dark" };
  let theme = raw.get("theme", "auto");
  function applyTheme() {
    if (theme === "auto") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", theme);
  }
  applyTheme();
  const themeBtn = () => `<button class="theme-btn" data-theme-toggle="1" title="${themeLabel[theme]} (tap to change)" aria-label="${themeLabel[theme]}">${THEMES[theme]}</button>`;

  function topActions() {
    const el = $("#topActions");
    if (!el) return;
    if (!profile) { el.innerHTML = themeBtn(); return; }
    const cp = checklistProgress();
    el.innerHTML = `${themeBtn()}<a class="cl-btn" href="#checklist">✅<span class="cl-word" style="background:none;padding:0;font-size:inherit"> My checklist</span> <span>${cp.done}/${cp.total}</span></a>
      <a class="who" href="#profile" style="--pc:${prof().color}" title="Profile"><span class="avatar sm">${esc(prof().name[0])}</span><span class="who-name">${esc(prof().name)}</span><span class="sync-dot ${syncStatus}" title="${esc(syncLabel())}"></span></a>`;
  }

  /* ---------- router ---------- */
  function render() {
    document.body.classList.toggle("no-profile", !profile);
    if (!profile) { $("#app").innerHTML = pageProfiles(pendingPin); topActions(); return; }
    seedApps(); applyUpdates();
    const h = (location.hash || "#home").slice(1);
    const [page, arg] = h.split("/");
    let html, tab = page;
    if (page === "best") html = pageBest();
    else if (page === "all") html = pageAll(arg);
    else if (page === "deadlines") html = pageDeadlines();
    else if (page === "checklist") html = pageChecklist();
    else if (page === "apps") html = pageApps();
    else if (page === "phd") html = pagePhd(arg);
    else if (page === "daad") html = pageDaad();
    else if (page === "docs") { html = pageDocs(arg); tab = "docs"; }
    else if (page === "money") html = pageMoney();
    else if (page === "profile") html = pageSettings();
    else if (page === "compare") html = pageCompare();
    else if (page === "p") { html = pageProgram(arg); tab = "all"; }
    else { html = pageHome(); tab = "home"; }
    $("#app").innerHTML = html + cmpBar();
    if (page === "docs" && arg) { const el = document.getElementById("doc-" + arg); if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 50); }
    if (page === "daad" && arg) { const el = document.getElementById(arg); if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 50); }
    if (page === "money" && arg === "daad") { const el = $("#daad"); if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 50); }
    document.querySelectorAll("#tabs a").forEach((a) => { a.classList.toggle("on", a.dataset.tab === tab); if (a.dataset.tab === "phd") a.hidden = !hasPhd(); });
    topActions();
  }

  let pendingPin = null;
  function enter(pid) {
    profile = pid; raw.set("current", pid); loadRates(); useDataset(); pendingPin = null; Object.assign(F, { countries: [], field: "All", money: "All", engs: [], apply: "All", start: "All", q: "" }); Object.assign(PF, { region: "All", eng: "All", checked: "All", track: "All", q: "" });
    if (location.hash !== "#home") location.hash = "#home"; render(); window.scrollTo(0, 0);
    pullNow();
  }
  document.addEventListener("submit", (e) => {
    const f = e.target; e.preventDefault();
    if (f.id === "pinForm") {
      const pid = f.dataset.pid;
      if (f.pin.value === raw.get("pin_" + pid, "")) { unlocked[pid] = true; saveUnlocked(); enter(pid); }
      else { $("#pinErr").textContent = "Wrong PIN, try again."; f.pin.value = ""; }
    } else if (f.id === "setPin") {
      raw.set("pin_" + profile, f.pin.value); unlocked[profile] = true; saveUnlocked(); render(); $("#pinMsg").textContent = "PIN saved.";
    } else if (f.id === "linkCode") {
      const c = f.code.value.trim().toLowerCase();
      if (c.length < 20) return;
      raw.set("sync_" + profile, c); raw.set("syncAt_" + profile, ""); raw.set("syncDirty_" + profile, false);
      $("#linkMsg").textContent = "Linking...";
      pullNow(true).then(() => { const m = $("#linkMsg"); if (m) m.textContent = "✅ Linked. This device now shows the same data."; });
    } else if (f.classList.contains("addMiss")) {
      const t = f.t.value.trim(), id = f.dataset.id; if (!t) return;
      const list = store.get("miss_" + id, []); list.push({ text: t, done: false }); store.set("miss_" + id, list);
      const y = window.scrollY; render(); window.scrollTo(0, y);
      const inp = document.querySelector(`.addMiss[data-id="${id}"] input`); if (inp) inp.focus();
    } else if (f.id === "docPick") {
      location.hash = "#docs/" + f.elements.pid.value;
    } else if (f.id === "startApp") {
      const id = f.elements.pid.value; if (!id) return;
      store.set("status_" + id, "Preparing"); render();
    } else if (f.id === "addRef") {
      const n = f.n.value.trim(); if (!n) return;
      const list = store.get("refs", []); list.push({ name: n, role: f.r.value.trim(), email: f.e.value.trim(), st: {} }); store.set("refs", list);
      const y = window.scrollY; render(); window.scrollTo(0, y);
    } else if (f.id === "addCustom") {
      const t = f.t.value.trim(); if (!t) return;
      const list = store.get("custom", []); list.push({ text: t, done: false }); store.set("custom", list); render();
      const inp = $("#addCustom input"); if (inp) inp.focus();
    }
  });
  function liveSearch(el, obj) {
    obj.q = el.value; const id = el.id, pos = el.selectionStart;
    if (id === "q" && location.hash.startsWith("#all/")) history.replaceState(null, "", "#all");
    const y = window.scrollY; render(); window.scrollTo(0, y);
    const n = document.getElementById(id); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (err) { /* ignore */ } }
  }
  let qTimer = null;
  document.addEventListener("input", (e) => {
    if (e.target.id === "q" || e.target.id === "phdq") { const el = e.target, obj = el.id === "q" ? F : PF; clearTimeout(qTimer); qTimer = setTimeout(() => liveSearch(el, obj), 180); return; }
    if (e.target.dataset.note) store.set("note_" + e.target.dataset.note, e.target.value);
    if (e.target.dataset.letter) store.set("letter_" + e.target.dataset.letter, e.target.value);
  });
  document.addEventListener("click", (e) => {
    const cb = e.target.closest("[data-compare]");
    if (cb) {
      e.preventDefault(); e.stopPropagation();
      let l = cmpList(); const id = cb.dataset.compare;
      if (l.includes(id)) l = l.filter((x) => x !== id);
      else if (l.length >= 3) { alertBox("You can compare up to 3 programs. Remove one first."); return; }
      else l.push(id);
      store.set("compare", l); const y = window.scrollY; render(); window.scrollTo(0, y); return;
    }
    if (e.target.closest("[data-cmp-clear]")) { store.set("compare", []); const y = window.scrollY; render(); window.scrollTo(0, y); return; }
    const ic = e.target.closest("[data-ics]");
    if (ic) { e.preventDefault(); e.stopPropagation(); const [id, i] = ic.dataset.ics.split("|"); const p = byId(id); downloadIcs([icsEvent(p, p.deadlines[+i], +i)], "deadline-" + id); return; }
    if (e.target.closest("[data-ics-all]")) {
      e.preventDefault();
      const ev = [];
      PROGRAMS.forEach((p) => { if (DONE_STATUSES.includes(statusOf(p.id))) return; p.deadlines.forEach((d, i) => { if (d.d && daysLeft(d.d) >= 0) ev.push(icsEvent(p, d, i)); }); });
      downloadIcs(ev, "all-deadlines"); return;
    }
    const cq = e.target.closest("[data-clearq]"); if (cq) { (cq.dataset.clearq === "q" ? F : PF).q = ""; render(); return; }
    const pf = e.target.closest("[data-pf]"); if (pf) { PF[pf.dataset.pf] = pf.dataset.v; const y = window.scrollY; render(); window.scrollTo(0, y); return; }
    const pi = e.target.closest("[data-phdics]");
    if (pi) { const x = phdById(pi.dataset.phdics); if (x) downloadIcs([icsEvent({ id: x.id, uni: x.uni, prog: x.prog, link: x.link }, { d: x.d, t: "PhD deadline: " + x.deadline }, 0)], "deadline-" + x.id); return; }
    if (e.target.closest("[data-csv]")) { downloadCsv(); return; }
    const rd = e.target.closest("[data-refdel]"); if (rd) { const list = store.get("refs", []); list.splice(+rd.dataset.refdel, 1); store.set("refs", list); const y = window.scrollY; render(); window.scrollTo(0, y); return; }
    if (e.target.closest("[data-theme-toggle]")) { theme = theme === "auto" ? "light" : theme === "light" ? "dark" : "auto"; raw.set("theme", theme); applyTheme(); topActions(); return; }
    const pick = e.target.closest("[data-pick]");
    if (pick) { const pid = pick.dataset.pick; if (raw.get("pin_" + pid, "") && !unlocked[pid]) { pendingPin = pid; render(); } else enter(pid); return; }
    if (e.target.closest("[data-back]")) { e.preventDefault(); pendingPin = null; render(); return; }
    if (e.target.closest("[data-switch]")) { delete unlocked[profile]; saveUnlocked(); profile = null; raw.del("current"); render(); window.scrollTo(0, 0); return; }
    if (e.target.closest("[data-copy-code]")) { try { navigator.clipboard.writeText(syncCode()); alertBox("Sync code copied"); } catch (err) { alertBox(syncCode()); } return; }
    if (e.target.id === "removePin") { raw.del("pin_" + profile); render(); return; }
    const gcv = e.target.closest("[data-gencv]"); if (gcv) { cvFor(byId(gcv.dataset.gencv)); return; }
    const glt = e.target.closest("[data-genletter]"); if (glt) { letterFor(byId(glt.dataset.genletter)); return; }
    const lrs = e.target.closest("[data-letterreset]"); if (lrs) { store.set("letter_" + lrs.dataset.letterreset, ""); const y = window.scrollY; render(); window.scrollTo(0, y); return; }
    const md = e.target.closest("[data-missdel]");
    if (md) { const [id, i] = md.dataset.missdel.split("|"); const list = store.get("miss_" + id, []); list.splice(+i, 1); store.set("miss_" + id, list); const y = window.scrollY; render(); window.scrollTo(0, y); return; }
    const del = e.target.closest("[data-del]");
    if (del) { const list = store.get("custom", []); list.splice(+del.dataset.del, 1); store.set("custom", list); render(); return; }
    const fm = e.target.closest("[data-fm]");
    if (fm) { const k = fm.dataset.fm, v = fm.dataset.v; F[k] = F[k].includes(v) ? F[k].filter((x) => x !== v) : [...F[k], v]; if (location.hash.startsWith("#all/")) history.replaceState(null, "", "#all"); const y = window.scrollY; render(); window.scrollTo(0, y); return; }
    const fc = e.target.closest("[data-fclear]");
    if (fc) { const k = fc.dataset.fclear; if (k === "allf") Object.assign(F, { countries: [], engs: [], q: "" }); else F[k] = []; if (location.hash.startsWith("#all/")) history.replaceState(null, "", "#all"); const y = window.scrollY; render(); window.scrollTo(0, y); return; }
    const b = e.target.closest("[data-f]");
    if (b) { F[b.dataset.f] = b.dataset.v; if (location.hash.startsWith("#all/")) { history.replaceState(null, "", "#all"); } render(); return; }
    if (e.target.id === "resetRates") { store.set("rates", {}); loadRates(); render(); return; }
  });
  document.addEventListener("change", (e) => {
    const t = e.target;
    if (t.dataset.custom) { const list = store.get("custom", []); list[+t.dataset.custom].done = t.checked; store.set("custom", list); const y = window.scrollY; render(); window.scrollTo(0, y); }
    else if (t.dataset.k) { store.set(t.dataset.k, t.checked); const y = window.scrollY; render(); window.scrollTo(0, y); }
    else if (t.dataset.miss) { const [id, i] = t.dataset.miss.split("|"); const list = store.get("miss_" + id, []); if (list[+i]) list[+i].done = t.checked; store.set("miss_" + id, list); const y = window.scrollY; render(); window.scrollTo(0, y); }
    else if (t.dataset.status) { store.set("status_" + t.dataset.status, t.value); if (t.dataset.rerender) { const y = window.scrollY; render(); window.scrollTo(0, y); } }
    else if (t.id === "sort") { F.sort = t.value; render(); }
    else if (t.id === "phdsort") { PF.sort = t.value; render(); }
    else if (t.dataset.ref) { const [i, id] = t.dataset.ref.split("|"); const list = store.get("refs", []); if (list[+i]) { list[+i].st = list[+i].st || {}; list[+i].st[id] = t.value; store.set("refs", list); } }
    else if (t.dataset.rate) { const v = parseFloat(t.value); if (v > 0) { const m = store.get("rates", {}); m[t.dataset.rate] = v; store.set("rates", m); loadRates(); const y = window.scrollY; render(); window.scrollTo(0, y); } }
  });
  refreshLiveRates();
  if (profile) pullNow();
  window.addEventListener("hashchange", () => { render(); window.scrollTo(0, 0); });
  render();
})();
