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
    set(k, v) { raw.set(profile + "_" + k, v); },
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
    PROGRAMS = DS.programs; SECTIONS = DS.sections; NEEDS_TEST = DS.needsTest; DE_EXCLUDED = DS.excluded || []; CHECKLIST = DS.checklist;
  }
  useDataset();

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
  const ENG_OPTS = ["All", "MOI (no IELTS)", "MOI confirmed", "IELTS / test needed"];
  const engOk = (p) => F.eng === "All" || (F.eng === "MOI (no IELTS)" && p.eng.s !== "ielts") || (F.eng === "MOI confirmed" && p.eng.s === "yes") || (F.eng === "IELTS / test needed" && p.eng.s === "ielts");
  const engBtns = () => ENG_OPTS.map((o) => `<button class="fbtn ${F.eng === o ? "on" : ""}" data-f="eng" data-v="${esc(o)}">${esc(o)}</button>`).join("");
  const wr = (w) => (/^=/.test(w) ? "#" + w.slice(1) + " (tied)" : /^\d+$/.test(w) ? "#" + w : w);
  const hasWorld = (p) => !!p.rank.world && /^[=\d]/.test(p.rank.world);
  const rankChips = (p) => hasWorld(p)
    ? `<span class="chip rank-chip">🌍 World ${esc(wr(p.rank.world))}</span><span class="chip rank-chip">🏅 #${esc(p.rank.country)}</span>`
    : `<span class="chip plain">🏅 ${esc(p.rank.country)}</span>`;
  const statusOf = (id) => store.get("status_" + id, "Not started");
  const STATUSES = ["Not started", "Preparing", "Applied", "Accepted", "Rejected", "Not applying"];

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
      <div class="chips">${engChip(p)}${chanceChip(p.chance)}${p.country === "Germany" ? (p.direct ? '<span class="chip good">Apply directly, no uni-assist</span>' : '<span class="chip plain">Via uni-assist</span>') : ""}</div>
      ${moneySummary(p)}
      <div class="foot"><span>⏰ ${dl}</span><span>${esc(statusOf(p.id))}</span></div>
    </a>`;
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

  const F = { country: "All", field: "All", money: "All", eng: "All", apply: "All", sort: "rank" };
  const isDirect = (p) => p.country !== "Germany" || !!p.direct;
  function pageAll(secArg) {
    if (secArg) {
      F.country = SECTIONS[secArg] ? SECTIONS[secArg].name : "All";
    }
    const regionNames = Object.values(SECTIONS).map((s) => s.name);
    const countries = [...new Set(["All", ...regionNames, ...PROGRAMS.map((p) => p.country)])];
    const secOf = (name) => Object.keys(SECTIONS).find((k) => SECTIONS[k].name === name);
    const btns = (key, opts) => opts.map((o) => `<button class="fbtn ${F[key] === o ? "on" : ""}" data-f="${key}" data-v="${esc(o)}">${esc(o)}</button>`).join("");
    let list = PROGRAMS.filter((p) => {
      const sk = secOf(F.country);
      if (sk) { if (p.sec !== sk && p.country !== F.country) return false; }
      else if (F.country !== "All" && p.country !== F.country) return false;
      if (F.field !== "All" && !p.field.includes(F.field)) return false;
      if (F.money === "Stipend" && !p.stipend) return false;
      if (F.money === "No tuition" && !p.tuitionFree) return false;
      if (F.money === "No blocked account" && p.blocked) return false;
      if (!engOk(p)) return false;
      if (F.apply !== "All" && !isDirect(p)) return false;
      return true;
    });
    const dkey = (p) => { const d = nextDeadline(p); return d && d.d ? d.d : "9999"; };
    if (F.sort === "rank") list.sort((a, b) => a.rankAll - b.rankAll);
    if (F.sort === "deadline") list.sort((a, b) => dkey(a).localeCompare(dkey(b)));
    if (F.sort === "world") list.sort((a, b) => (a.rank.sort || 9999) - (b.rank.sort || 9999));
    if (F.sort === "bring") list.sort((a, b) => calc(a).bring * (rates[a.cur] || 1) - calc(b).bring * (rates[b.cur] || 1));
    const showNeeds = secOf(F.country) ? NEEDS_TEST.filter((r) => r.sec === secOf(F.country)) : [];
    return `
      <h1>All programs</h1>
      <p class="lead">Choose a country or region, then narrow it down. Tap any program for every detail.</p>
      <div class="filters">
        <div class="frow"><label>Country</label>${btns("country", countries)}</div>
        <div class="frow"><label>Field</label>${btns("field", ["All", ...DS.fields])}</div>
        <div class="frow"><label>Money</label>${btns("money", ["All", "Stipend", "No tuition", "No blocked account"])}</div>
        <div class="frow"><label>English</label>${engBtns()}</div>
        <div class="frow"><label>Apply</label>${btns("apply", ["All", "Directly (no uni-assist)"])}</div>
        <div class="frow"><label>Sort by</label>
          <select id="sort"><option value="rank" ${F.sort === "rank" ? "selected" : ""}>Best for me</option><option value="deadline" ${F.sort === "deadline" ? "selected" : ""}>Nearest deadline</option><option value="bring" ${F.sort === "bring" ? "selected" : ""}>Least money to bring</option><option value="world" ${F.sort === "world" ? "selected" : ""}>Best world ranking</option></select>
          <span class="muted small" style="margin-left:6px">${list.length} program${list.length === 1 ? "" : "s"}</span></div>
      </div>
      ${list.length ? `<div class="grid">${list.map((p) => card(p, "rankAll")).join("")}</div>` : '<div class="empty">No program matches these filters.</div>'}
      ${F.country === "Germany" && DE_EXCLUDED.length ? `<h2>Checked in Germany but not suitable</h2><div class="card"><table class="money">${DE_EXCLUDED.map((r) => `<tr><td><b>${esc(r[0])}</b></td><td style="text-align:left;font-weight:400">${esc(r[1])}</td></tr>`).join("")}</table></div>` : ""}
      ${showNeeds.length ? `<h2>Funded, but needs an English test</h2>${needsTestTable(showNeeds)}` : ""}`;
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
    else say.push(`<div class="big-say pay">💸 <div>No stipend.<br><span>You live on your own money (the blocked account). You are allowed to work up to 20 hours a week.</span></div></div>`);
    if (p.blocked) say.push(`<div class="big-say pay">🏦 <div>Blocked account needed: EUR ${num(p.blocked.total)} for ${p.blocked.months} months (EUR ${num(p.blocked.perMonth)} per month).<br><span>${esc(p.blocked.note)}</span></div></div>`);
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
        <div class="src">Source: ${esc(RANK_SOURCE)}</div>
      </div>

      <div class="kbox">
        <div class="k"><small>Paid to the university (total)</small><b>${money(c.uni, p.cur)}</b><span class="egp">${egp(c.uni, p.cur)}</span></div>
        <div class="k good"><small>Stipend you receive (total)</small><b>${p.stipend ? (p.stipend.total ? money(p.stipend.total, p.cur) : "In offer letter") : "None"}</b><span class="egp">${p.stipend && p.stipend.total ? egp(p.stipend.total, p.cur) : ""}</span></div>
        <div class="k pay"><small>Money to bring from Egypt</small><b>${money(c.bring, p.cur)}</b><span class="egp">${egp(c.bring, p.cur)}</span></div>
        ${overall}
      </div>

      ${say.join("")}

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
          <ul class="list-plain">${p.deadlines.map((d) => `<li><b>${esc(d.t)}</b>${d.d ? ` <span class="chip ${daysLeft(d.d) < 0 ? "plain" : daysLeft(d.d) < 45 ? "pay" : ""}">${daysLeft(d.d) < 0 ? "passed" : daysLeft(d.d) + " days left"}</span>` : ""}</li>`).join("")}</ul>
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
          <select class="status-sel" data-status="${p.id}">${STATUSES.map((s) => `<option ${statusOf(p.id) === s ? "selected" : ""}>${s}</option>`).join("")}</select>
          <p class="muted small">Saved in ${esc(prof().name)}'s profile on this device.</p>
          <h3 style="margin-top:16px">📝 My notes</h3>
          <textarea class="notes" data-note="${p.id}" placeholder="Professors I emailed, login details hint, questions to ask...">${esc(store.get("note_" + p.id, ""))}</textarea></div>
      </div>`;
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
        <div class="days">${dl < 0 ? "passed" : dl + " days"}</div></a>`;
    };
    return `
      <h1>Deadlines</h1>
      <p class="lead">Sorted by date. Red means less than 45 days left. Start the papers that take longest first: MOI letter, recommendation letters, uni-assist VPD.</p>
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
      <div class="card"><table class="money">${apps.map((a) => `<tr><td><a href="#p/${a.p.id}">${a.p.flag} ${esc(a.p.uni)}</a><div class="muted small">${esc(a.p.prog)}</div></td><td><select class="status-sel" data-status="${a.p.id}">${STATUSES.map((s) => `<option ${a.s === s ? "selected" : ""}>${s}</option>`).join("")}</select></td></tr>`).join("")}</table></div>
      <h2>Tips for the letters</h2>
      <div class="grid">
${DS.tips}
      </div>`;
  }

  function pageMoney() {
    return `
      <h1>Money guide</h1>
      <p class="lead">How the money works in each country, in simple words. EGP amounts use today's exchange rates, updated automatically every day. You can still type your bank's rate below.</p>
      <div class="card"><h3>Exchange rates (EGP for 1 unit)</h3>
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
    el.innerHTML = `${themeBtn()}<a class="cl-btn" href="#checklist">✅ My checklist <span>${cp.done}/${cp.total}</span></a>
      <a class="who" href="#profile" style="--pc:${prof().color}" title="Profile"><span class="avatar sm">${esc(prof().name[0])}</span><span class="who-name">${esc(prof().name)}</span></a>`;
  }

  /* ---------- router ---------- */
  function render() {
    document.body.classList.toggle("no-profile", !profile);
    if (!profile) { $("#app").innerHTML = pageProfiles(pendingPin); topActions(); return; }
    const h = (location.hash || "#home").slice(1);
    const [page, arg] = h.split("/");
    let html, tab = page;
    if (page === "best") html = pageBest();
    else if (page === "all") html = pageAll(arg);
    else if (page === "deadlines") html = pageDeadlines();
    else if (page === "checklist") html = pageChecklist();
    else if (page === "money") html = pageMoney();
    else if (page === "profile") html = pageSettings();
    else if (page === "p") { html = pageProgram(arg); tab = "all"; }
    else { html = pageHome(); tab = "home"; }
    $("#app").innerHTML = html;
    document.querySelectorAll("#tabs a").forEach((a) => a.classList.toggle("on", a.dataset.tab === tab));
    topActions();
  }

  let pendingPin = null;
  function enter(pid) {
    profile = pid; raw.set("current", pid); loadRates(); useDataset(); pendingPin = null; Object.assign(F, { country: "All", field: "All", money: "All", eng: "All", apply: "All" });
    if (location.hash !== "#home") location.hash = "#home"; render(); window.scrollTo(0, 0);
  }
  document.addEventListener("submit", (e) => {
    const f = e.target; e.preventDefault();
    if (f.id === "pinForm") {
      const pid = f.dataset.pid;
      if (f.pin.value === raw.get("pin_" + pid, "")) { unlocked[pid] = true; saveUnlocked(); enter(pid); }
      else { $("#pinErr").textContent = "Wrong PIN, try again."; f.pin.value = ""; }
    } else if (f.id === "setPin") {
      raw.set("pin_" + profile, f.pin.value); unlocked[profile] = true; saveUnlocked(); render(); $("#pinMsg").textContent = "PIN saved.";
    } else if (f.id === "addCustom") {
      const t = f.t.value.trim(); if (!t) return;
      const list = store.get("custom", []); list.push({ text: t, done: false }); store.set("custom", list); render();
      const inp = $("#addCustom input"); if (inp) inp.focus();
    }
  });
  document.addEventListener("input", (e) => {
    if (e.target.dataset.note) store.set("note_" + e.target.dataset.note, e.target.value);
  });
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-theme-toggle]")) { theme = theme === "auto" ? "light" : theme === "light" ? "dark" : "auto"; raw.set("theme", theme); applyTheme(); topActions(); return; }
    const pick = e.target.closest("[data-pick]");
    if (pick) { const pid = pick.dataset.pick; if (raw.get("pin_" + pid, "") && !unlocked[pid]) { pendingPin = pid; render(); } else enter(pid); return; }
    if (e.target.closest("[data-back]")) { e.preventDefault(); pendingPin = null; render(); return; }
    if (e.target.closest("[data-switch]")) { delete unlocked[profile]; saveUnlocked(); profile = null; raw.del("current"); render(); window.scrollTo(0, 0); return; }
    if (e.target.id === "removePin") { raw.del("pin_" + profile); render(); return; }
    const del = e.target.closest("[data-del]");
    if (del) { const list = store.get("custom", []); list.splice(+del.dataset.del, 1); store.set("custom", list); render(); return; }
    const b = e.target.closest("[data-f]");
    if (b) { F[b.dataset.f] = b.dataset.v; if (location.hash.startsWith("#all/")) { history.replaceState(null, "", "#all"); } render(); return; }
    if (e.target.id === "resetRates") { store.set("rates", {}); loadRates(); render(); return; }
  });
  document.addEventListener("change", (e) => {
    const t = e.target;
    if (t.dataset.custom) { const list = store.get("custom", []); list[+t.dataset.custom].done = t.checked; store.set("custom", list); const y = window.scrollY; render(); window.scrollTo(0, y); }
    else if (t.dataset.k) { store.set(t.dataset.k, t.checked); const y = window.scrollY; render(); window.scrollTo(0, y); }
    else if (t.dataset.status) { store.set("status_" + t.dataset.status, t.value); }
    else if (t.id === "sort") { F.sort = t.value; render(); }
    else if (t.dataset.rate) { const v = parseFloat(t.value); if (v > 0) { const m = store.get("rates", {}); m[t.dataset.rate] = v; store.set("rates", m); loadRates(); const y = window.scrollY; render(); window.scrollTo(0, y); } }
  });
  refreshLiveRates();
  window.addEventListener("hashchange", () => { render(); window.scrollTo(0, 0); });
  render();
})();
