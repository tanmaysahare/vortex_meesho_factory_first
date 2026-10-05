'use strict';
/* =========================================================
   Meesho console: Factory Direct programme operations.
   Every page leads with what needs attention.
   ========================================================= */
const ROLES = {
  admin: { user: 'Ananya Rao', label: 'Programme Lead', see: ['overview', 'actions', 'verify', 'suppliers', 'leads', 'settings', 'activity'], edit: true, pii: true },
  sourcing: { user: 'Kavya Sharma', label: 'Sourcing', see: ['overview', 'actions', 'suppliers', 'leads', 'settings'], edit: false, pii: true },
  verification: { user: 'Neha Mehta', label: 'Verification', see: ['overview', 'actions', 'verify', 'suppliers', 'settings'], edit: false, pii: false },
  category: { user: 'Rohit Kumar', label: 'Category', see: ['overview', 'actions', 'suppliers', 'settings'], edit: false, pii: false }
};
const SECTIONS = [['overview', 'Overview'], ['actions', 'Action items'], ['verify', 'Verification'], ['suppliers', 'Suppliers'], ['leads', 'Leads'], ['settings', 'Settings'], ['activity', 'Activity log']];
const INFO_REASONS = {
  geo: { label: 'Photo location does not match pickup address', en: 'Your factory photos were taken away from your registered pickup address. Please retake them at your factory.', hi: 'आपकी फैक्ट्री की फोटो रजिस्टर्ड पिकअप पते से दूर ली गई थीं। कृपया अपनी फैक्ट्री में दोबारा लें।' },
  blurry: { label: 'Production area photo unclear', en: 'The production area photo is not clear. Please retake it in good light.', hi: 'उत्पादन क्षेत्र की फोटो साफ़ नहीं है। कृपया अच्छी रोशनी में दोबारा लें।' },
  nomachine: { label: 'No machines visible', en: 'Production machines are not visible in your photos. Please add a photo of machines in operation.', hi: 'आपकी फोटो में उत्पादन मशीनें नहीं दिख रहीं। कृपया चलती मशीनों की फोटो जोड़ें।' }
};
const REJECT_REASONS = {
  trader: { label: 'GST shows trading, not manufacturing', en: 'Your GST registration shows trading, not manufacturing. Factory Direct is available only to manufacturers.', hi: 'आपके GST रजिस्ट्रेशन में ट्रेडिंग है, मैन्युफैक्चरिंग नहीं। फैक्ट्री डायरेक्ट सिर्फ़ निर्माताओं के लिए है।' },
  jobwork: { label: 'Fewer than 2 in-house production steps', en: 'Factory Direct requires at least 2 main production steps in your own factory.', hi: 'फैक्ट्री डायरेक्ट के लिए कम से कम 2 मुख्य उत्पादन काम आपकी अपनी फैक्ट्री में होने चाहिए।' }
};
const HEALTH_ORDER = { risk: 0, call: 1, auto: 2, ok: 3, na: 4 };
function canSee(sec) { return ROLES[DB.role].see.includes(sec); }
function maskMobile(m) { if (!m) return '-'; return ROLES[DB.role].pii ? '+91 ' + m : '+91 ' + m.slice(0, 2) + '••••••' + m.slice(-2); }
function pill(h) { return `<span class="pill p-${h.id}">${h.label}</span>`; }
function cti(k) { return ti(k, true); }
function catNameEn(c) { return CATS[c] ? CATS[c].en : c; }
function fullDate(d) { const x = new Date(START_DATE); x.setDate(x.getDate() + d - 1); return x.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
const SEV = { hi: ['High', 'p-risk'], md: ['Medium', 'p-call'], lo: ['Low', 'p-auto'] };

function consoleData() {
  const rows = allSellers().map(s => { const alerts = evalRules(s); const open = alerts.filter(a => !DB.done[a.key]).sort((a, b) => ({ hi: 0, md: 1, lo: 2 }[a.rule.sev] - { hi: 0, md: 1, lo: 2 }[b.rule.sev])); return { s, alerts, open, h: health(s, alerts) }; });
  return { rows, alerts: rows.flatMap(r => r.alerts) };
}

function renderConsole(sec) {
  if (!ROLES[DB.role]) DB.role = 'admin';
  if (!canSee(sec)) sec = 'overview';
  const d = consoleData();
  const cnt = { actions: d.alerts.filter(a => !DB.done[a.key]).length, verify: verifyItems(d).length };
  const side = SECTIONS.map(([k, l]) => canSee(k) ? `<button data-act="cnav" data-v="${k}" aria-current="${sec === k}">${l}${cnt[k] ? `<span class="cnt">${cnt[k]}</span>` : ''}</button>` : '').join('');
  const mob = SECTIONS.filter(([k]) => canSee(k)).map(([k, l]) => `<button data-act="cnav" data-v="${k}" aria-current="${sec === k}">${l}${cnt[k] ? ` (${cnt[k]})` : ''}</button>`).join('');
  const body = { overview: cOverview, actions: cActions, verify: cVerify, suppliers: cSuppliers, leads: cLeads, settings: cSettings, activity: cActivity }[sec](d);
  const r = ROLES[DB.role];
  return `<div class="c-app">
    <header class="c-top">
      <span class="logo">${IC.mark}<span>Meesho<small>Supplier Growth · Factory Direct</small></span></span>
      <span class="sp"></span>
      <span class="daypill num">${fullDate(DB.day)}</span>
      <span class="userchip"><span class="uav">${r.user.split(' ').map(x => x[0]).join('')}</span><span>${r.user}<small>${r.label}</small></span></span>
    </header>
    <nav class="c-side" aria-label="Console sections">${side}</nav>
    <div class="c-mobnav">${mob}</div>
    <main class="c-main">${body}</main>
  </div>${UI.drawer ? drawerHtml(d) : ''}`;
}
function pageHead(title, sub) { return `<div class="c-h"><div><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ''}</div></div>`; }

/* ---------- Overview ---------- */
function meFunnelReach() {
  const m = DB.me;
  if (m.stage === 'none') return -1;
  if (m.stage === 'review' || m.stage === 'live') return 7;
  return { mobile: 0, otp: 0, email: 1, gst: 2, address: 3, bank: 4, store: 5, review: 6 }[m.step] ?? 0;
}
function launchRows(d) { return d.rows.filter(r => r.s.fd && r.s.launchStart != null && DB.day - r.s.launchStart + 1 >= 1 && DB.day - r.s.launchStart + 1 <= DB.cfg.launchDays); }
function cOverview(d) {
  const open = d.alerts.filter(a => !DB.done[a.key]);
  const vq = verifyItems(d).length;
  const calls = d.rows.filter(r => r.h.id === 'call' || r.h.id === 'risk').length;
  const high = open.filter(a => a.rule.sev === 'hi').length;
  const stalled = open.filter(a => a.rule.id === 'signup').length;
  const att = (n, label, sec, filt) => `<button class="att ${n ? 'on' : ''}" data-act="cgo" data-v="${sec}${filt ? ':' + filt : ''}"><span class="an num">${n}</span><span class="al">${label}</span><span class="ag">${n ? 'Review →' : 'All clear'}</span></button>`;
  const reach = meFunnelReach();
  const fun = FUNNEL_BASE.map(([k, l, n], i) => [l, n + (reach >= i ? 1 : 0)]);
  const started = fun[0][1], submitted = fun[7][1];
  let worst = 0, worstI = 1;
  fun.forEach((r, i) => { if (i) { const drop = (fun[i - 1][1] - r[1]) / fun[i - 1][1]; if (drop > worst) { worst = drop; worstI = i; } } });
  const inL = launchRows(d), onTrack = inL.filter(r => r.h.id === 'ok' || r.h.id === 'auto');
  const grad = d.rows.filter(r => r.s.fd && r.s.launchStart != null && DB.day - r.s.launchStart + 1 > DB.cfg.launchDays);
  const gradActive = grad.filter(r => DB.day - (r.s.lastActive ?? DB.day) < DB.cfg.inactiveDays);
  const sup = inL.length ? Math.round(inL.reduce((a, r) => a + (r.s.supportMin || 0), 0) / inL.length) : 0;
  const kpi = (label, tip, val, target, good, sub) => `<div class="kpi"><span class="k">${label} ${cti(tip)}</span><span class="v">${val}</span><span class="d">${sub}</span><span class="chip ${good ? 'good' : 'bad'}" style="align-self:flex-start">${good ? 'On target' : 'Below target'} · ${target}</span></div>`;
  const comp = submitted / started * 100, ot = inL.length ? onTrack.length / inL.length * 100 : 100, ret = grad.length ? gradActive.length / grad.length * 100 : 100;
  const lrows = inL.sort((a, b) => HEALTH_ORDER[a.h.id] - HEALTH_ORDER[b.h.id]).map(r => {
    const m = sellerMetrics(r.s, r.s.launchStart, DB.day), ld = DB.day - r.s.launchStart + 1;
    const lp = m.sk.filter(x => x.p.launch), avg = lp.length ? lp.reduce((a, x) => a + x.views, 0) / lp.length : 0, exp = DB.cfg.viewsTarget * ld / DB.cfg.launchDays;
    return `<tr class="click ${r.s.isMe ? 'me' : ''}" data-act="open" data-v="${r.s.id}" tabindex="0"><td><div class="nm">${esc(r.s.name)}</div><div class="sub">Day ${ld} of ${DB.cfg.launchDays}</div></td>
      <td style="min-width:140px"><div class="row" style="gap:8px"><div class="bar2 grow"><i style="width:${Math.min(100, avg / exp * 100)}%;background:${avg < exp * 0.6 ? 'var(--bad)' : 'var(--good)'}"></i></div><span class="num xs">${pc(avg / exp)}</span></div></td>
      <td>${pill(r.h)}</td></tr>`;
  }).join('');
  return pageHead('Overview', fullDate(DB.day)) + `
  <h2 class="c-sect">Needs attention</h2>
  <section class="attgrid">
    ${att(vq, 'Applications awaiting review', 'verify')}
    ${att(calls, 'Suppliers needing a call', 'suppliers', 'call')}
    ${att(high, 'High-priority action items', 'actions', 'hi')}
    ${att(stalled, 'Stalled registrations', 'actions', 'signup')}
  </section>
  <h2 class="c-sect">Programme health</h2>
  <section class="kpis">
    ${kpi('Registration completion', 'c_completion', pc(comp / 100), `≥${TARGETS.completion}%`, comp >= TARGETS.completion, `${nf(submitted)} of ${nf(started)}, last 30 days`)}
    ${kpi('Launch suppliers on track', 'c_ontrack', inL.length ? pc(ot / 100) : '-', `≥${TARGETS.onTrack}%`, ot >= TARGETS.onTrack, `${onTrack.length} of ${inL.length} in launch period`)}
    ${kpi('Retained after launch', 'c_retained', grad.length ? pc(ret / 100) : '-', `≥${TARGETS.retained}%`, ret >= TARGETS.retained, `${gradActive.length} of ${grad.length} suppliers`)}
    ${kpi('Support minutes per supplier', 'c_support', sup, `≤${TARGETS.support}`, sup <= TARGETS.support, 'Average, launch period')}
  </section>
  <section class="grid2">
    <div class="panel"><h2>Registration funnel ${cti('c_funnel')}</h2><p class="ps">Last 30 days</p>
      ${fun.map(([l, n], i) => { const drop = i ? (fun[i - 1][1] - n) / fun[i - 1][1] : 0; return `<div class="fn"><span>${l}</span><b class="num">${nf(n)}</b><span class="drop ${i === worstI ? 'hi' : ''}">${i ? '−' + (drop * 100).toFixed(0) + '%' : ''}</span><div class="fb"><i style="width:${n / started * 100}%;${i === worstI ? 'background:var(--bad)' : ''}"></i></div></div>`; }).join('')}
      <p class="small mt12"><b class="bad">Largest drop-off:</b> ${fun[worstI][0]} (−${(worst * 100).toFixed(0)}%)</p></div>
    <div class="panel"><h2>Suppliers in launch period</h2><p class="ps">Lowest health first</p>
      ${lrows ? `<div class="tscroll"><table class="t"><thead><tr><th>Supplier</th><th>Views vs target ${cti('c_viewsto')}</th><th>Health ${cti('c_health')}</th></tr></thead><tbody>${lrows}</tbody></table></div>` : '<p class="hint">No suppliers in launch period.</p>'}</div>
  </section>`;
}

/* ---------- Action items ---------- */
function cActions(d) {
  const pf = UI.af || 'all';
  const all = d.alerts;
  const filt = a => pf === 'all' || (pf === 'hi' && a.rule.sev === 'hi') || (pf === 'signup' && a.rule.id === 'signup') || a.rule.owner === pf;
  const open = all.filter(a => !DB.done[a.key] && filt(a)).sort((a, b) => ({ hi: 0, md: 1, lo: 2 }[a.rule.sev] - { hi: 0, md: 1, lo: 2 }[b.rule.sev]));
  const done = all.filter(a => DB.done[a.key] && filt(a));
  const owners = [...new Set(RULES.map(r => r.owner))];
  return pageHead('Action items', `Raised automatically by programme rules ${cti('c_action')}`) + `
    <div class="filters">${[['all', 'All'], ['hi', 'High priority'], ...owners.map(o => [o, o])].map(([k, l]) => `<button class="fchip" data-act="af" data-v="${esc(k)}" aria-pressed="${pf === k}">${l}</button>`).join('')}</div>
    ${open.map(a => alertCard(a, false)).join('') || '<div class="panel"><div class="empty"><div class="ei">✓</div><b>No open action items</b></div></div>'}
    ${done.length ? `<details class="donebox"><summary>Resolved (${done.length})</summary>${done.map(a => alertCard(a, false)).join('')}</details>` : ''}`;
}
function alertCard(a, compact) {
  const done = DB.done[a.key], sv = SEV[a.rule.sev];
  return `<div class="alert ${done ? 'done' : ''}"><span class="sev ${a.rule.sev}"></span><div>
    <div class="row between wrap" style="gap:6px"><b>${a.rule.name}</b><span class="row" style="gap:6px"><span class="pill ${sv[1]}">${sv[0]}</span><span class="owner">${a.rule.owner}</span></span></div>
    ${compact ? '' : `<div class="small b" style="margin-top:2px">${esc(a.seller.name)}</div>`}
    <div class="sig">${esc(a.signal)}</div>
    <div class="small"><b>Recommended action:</b> ${esc(a.rule.first)}${a.rule.auto ? ` <span class="chip info">Automated nudge</span> ${cti('c_nudge')}` : ''}</div>
    <div class="act mt8">${done ? `<span class="good b small">✓ ${esc(done)}</span>` : `<button class="btn xs ${a.rule.auto ? 'soft' : 'primary'}" data-act="alertDo" data-v="${esc(a.key)}">${a.rule.auto ? 'Send nudge' : 'Assign to me'}</button><button class="btn xs ghost" data-act="alertEsc" data-v="${esc(a.key)}">Escalate</button>${compact ? '' : `<button class="btn xs ghost" data-act="open" data-v="${a.seller.id}">View supplier</button>`}`}</div></div></div>`;
}

/* ---------- Verification ---------- */
function verifyItems(d) { return d.rows.filter(r => r.s.stage === 'fd_review').map(r => ({ kind: 'fd', s: r.s })); }
function fdChecks(s) {
  const cat = CATS[s.cat], core = cat.steps.filter(x => x.core && (s.fdSteps || []).includes(x.id)).length;
  const mfr = (s.gstNature || []).some(n => /Manufactur/i.test(n));
  const noGst = !s.gstNature || !s.gstNature.length || /No GST/.test(s.gstNature.join());
  const c = [];
  c.push(noGst ? ['warn', 'No GST registration', 'Registered with Enrolment ID. Manufacturing is self-declared.'] : mfr ? ['ok', 'GST shows manufacturing', (s.gstNature || []).join(', ')] : ['bad', 'GST does not show manufacturing', (s.gstNature || []).join(', ')]);
  c.push(core >= 2 ? ['ok', `In-house production steps: ${core} of 3`, cat.steps.filter(x => (s.fdSteps || []).includes(x.id)).map(x => x.en).join(', ')] : ['bad', `In-house production steps: ${core} of 3`, 'Minimum 2 required']);
  c.push(s.geoKm != null && s.geoKm <= 1 ? ['ok', 'Photo location matches pickup address', `${s.geoKm} km from pickup address`] : ['bad', 'Photo location does not match', `${s.geoKm} km from pickup address`]);
  c.push(s.udyam ? ['ok', 'Udyam registration verified', s.udyam] : ['warn', 'Udyam not provided', 'Optional']);
  if (s.cohort === 'churned') c.push(['warn', 'Previously on Meesho', s.isMe ? 'Self-declared' : 'Stopped selling in 2025 after dispatch delays']);
  return c;
}
function needsManual(checks) { return checks.some(c => c[0] === 'bad') || checks.some(c => c[1] === 'No GST registration'); }
function suggestion(checks) {
  if (checks.some(c => c[0] === 'bad' && /GST does not/.test(c[1]))) return ['reject', 'trader'];
  if (checks.some(c => c[0] === 'bad' && /production steps/.test(c[1]))) return ['reject', 'jobwork'];
  if (checks.some(c => c[0] === 'bad' && /Photo/.test(c[1]))) return ['info', 'geo'];
  return ['approve', null];
}
function cVerify(d) {
  const items = verifyItems(d);
  const icon = k => ({ ok: '<span class="good b">✓</span>', bad: '<span class="bad b">✗</span>', warn: '<span class="warn b">!</span>' }[k]);
  const label = { approve: 'Approve', info: 'Request changes', reject: 'Reject' };
  const cards = items.map(({ s }) => {
    const checks = fdChecks(s), sug = suggestion(checks);
    const ph = s.isMe ? s.photos : { floor: 'sample:floor', stock: 'sample:stock' };
    const sel = UI.vsel[s.id] || { mode: sug[0], reason: sug[1] || (sug[0] === 'reject' ? 'trader' : 'geo') };
    UI.vsel[s.id] = sel;
    const reasons = sel.mode === 'reject' ? REJECT_REASONS : INFO_REASONS;
    const rs = reasons[sel.reason] || Object.values(reasons)[0];
    const msg = sel.mode === 'approve' ? 'Your Factory Direct application is approved. Select 3 to 5 products to start your launch period.' : rs.en;
    const waited = Math.max(0, DB.day - (s.fdSubmitted ?? DB.day));
    const failed = checks.filter(c => c[0] === 'bad').length;
    return `<div class="vq"><div>
      <div class="row between wrap"><h3>${esc(s.name)}</h3>${waited >= 2 ? `<span class="pill p-risk">Waiting ${waited} days</span>` : `<span class="pill p-na">${waited ? waited + ' day' : 'Today'}</span>`}</div>
      <p class="meta">${esc(s.city)} · ${catNameEn(s.cat)} · ${COHORTS[s.cohort]}</p>
      <div class="flabel">Automated checks · ${failed ? `<span class="bad">${failed} failed</span>` : '<span class="good">all passed</span>'}</div>
      ${checks.map(c => `<div class="acheck">${icon(c[0])}<span><b>${c[1]}</b>${/Photo/.test(c[1]) ? ' ' + cti('c_geo') : /production/.test(c[1]) ? ' ' + cti('c_core') : ''}<small>${esc(c[2])}</small></span></div>`).join('')}</div>
      <div><div class="vphotos">${['floor', 'stock', 'board'].filter(k => ph[k]).map(k => `<figure>${photoEl(ph[k], 'img')}<figcaption>${{ floor: 'Production area', stock: 'Finished goods', board: 'Name board' }[k]}</figcaption></figure>`).join('')}</div>
      <div class="flabel mt12">Decision <span class="chip mag">Recommended: ${label[sug[0]]}</span></div>
      <div class="seg" role="group" aria-label="Decision">${['approve', 'info', 'reject'].map(k => `<button data-act="vmode" data-v="${s.id}:${k}" aria-pressed="${sel.mode === k}">${label[k]}</button>`).join('')}</div>
      ${sel.mode !== 'approve' ? `<div class="vactions"><label class="sr" for="vr_${s.id}">Reason</label><select id="vr_${s.id}" data-vreason="${s.id}">${Object.entries(reasons).map(([k, r]) => `<option value="${k}" ${sel.reason === k ? 'selected' : ''}>${r.label}</option>`).join('')}</select></div>` : ''}
      <div class="preview"><b>Message to supplier</b>${esc(msg)}</div>
      <div class="vactions"><button class="btn ${sel.mode === 'approve' ? 'good' : sel.mode === 'reject' ? 'danger' : 'primary'} sm" data-act="vDecide" data-v="${s.id}">Confirm: ${label[sel.mode]}</button></div></div></div>`;
  }).join('');
  return pageHead('Verification', `Factory Direct applications needing manual review ${cti('c_manual')}`) +
    (cards || '<div class="panel"><div class="empty"><div class="ei">✓</div><b>No applications awaiting review</b></div></div>');
}

/* ---------- Suppliers ---------- */
function stageGroup(s) {
  if (s.stage === 'registering' || s.stage === 'visitor') return 'registering';
  if (['review', 'fd_review', 'fd_info', 'fd_checking'].includes(s.stage)) return 'review';
  if (s.stage === 'fd') { if (s.launchStart == null) return 'review'; const ld = DB.day - s.launchStart + 1; return ld <= DB.cfg.launchDays ? 'launch' : 'graduated'; }
  return 'regular';
}
function orders7(s) { if (!s.products || !s.products.length) return null; return sellerMetrics(s, DB.day - 6, DB.day).t.orders; }
function cSuppliers(d) {
  const f = UI.sf || 'all', hf = UI.hf || 'all';
  const rows = d.rows.filter(r => (f === 'all' || stageGroup(r.s) === f) && (hf === 'all' || r.h.id === hf || (hf === 'call' && r.h.id === 'risk'))).sort((a, b) => HEALTH_ORDER[a.h.id] - HEALTH_ORDER[b.h.id]);
  const tr = rows.map(r => {
    const s = r.s, top = r.open[0], o7 = orders7(s);
    return `<tr class="click ${s.isMe ? 'me' : ''}" data-act="open" data-v="${s.id}" tabindex="0"><td><div class="nm">${esc(s.name)}</div><div class="sub">${esc(s.city)} · ${catNameEn(s.cat)}</div></td>
      <td>${stageLabel(s)}</td><td>${pill(r.h)}</td>
      <td class="${top ? (top.rule.sev === 'hi' ? 'bad' : '') : 'muted'}" style="min-width:200px">${top ? esc(top.rule.name) : '-'}</td>
      <td class="n">${o7 == null ? '-' : nf(o7)}</td><td class="sub">${esc(s.am)}</td></tr>`;
  }).join('');
  const groups = [['all', 'All'], ['registering', 'Registering'], ['review', 'In review'], ['launch', 'Launch period'], ['graduated', 'Launch completed'], ['regular', 'Standard']];
  return pageHead('Suppliers', 'Sorted by health: suppliers needing attention appear first') + `
    <div class="filters">${groups.map(([k, l]) => `<button class="fchip" data-act="sf" data-v="${k}" aria-pressed="${f === k}">${l}</button>`).join('')}
      <label class="sr" for="hfSel">Health</label><select id="hfSel" data-hf="1"><option value="all">All health</option>${[['risk', 'At risk'], ['call', 'Needs call'], ['auto', 'Auto-nudged'], ['ok', 'Healthy'], ['na', 'Not live']].map(([k, l]) => `<option value="${k}" ${hf === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
    <div class="panel" style="padding:0"><div class="tscroll"><table class="t" style="min-width:820px"><thead><tr><th>Supplier</th><th>Stage</th><th>Health ${cti('c_health')}</th><th>Main issue ${cti('c_mainissue')}</th><th>Orders (7d)</th><th>Account manager</th></tr></thead>
    <tbody>${tr || '<tr><td colspan="6" class="center muted" style="padding:28px">No suppliers match the selected filters.</td></tr>'}</tbody></table></div></div>`;
}
function drawerHtml(d) {
  const r = d.rows.find(x => x.s.id === UI.drawer);
  if (!r) { UI.drawer = null; return ''; }
  const s = r.s, sell = s.products && s.products.length;
  const m = sell ? sellerMetrics(s) : null, money = sell ? sellerMoney(s) : null;
  const top = r.open[0];
  const skus = m ? m.sk.map(x => `<tr><td><div class="nm" style="white-space:normal">${esc(x.p.name)}</div><div class="sub">${R(x.p.price)}</div></td><td class="n ${s.fd && x.gap * 100 < DB.cfg.priceAdv ? 'bad b' : ''}">${(x.gap * 100).toFixed(1)}%</td><td class="n">${nf(x.views)}</td><td class="n">${nf(x.orders)}</td><td class="n">${x.delivered ? pc(x.retRate) : '-'}</td><td class="n ${x.stockLeft === 0 ? 'bad b' : ''}">${nf(x.stockLeft)}</td></tr>`).join('') : '';
  const acts = DB.audit.filter(a => a.what.includes(s.name)).slice(0, 5);
  return `<div class="drawer-bg" data-act="closeDrawer"></div><aside class="drawer" role="dialog" aria-modal="true" aria-label="${esc(s.name)}">
    <div class="dr-head"><div><h3>${esc(s.name)}</h3><p>${esc(s.owner)} · ${esc(s.city)}, ${esc(s.state)} · ${catNameEn(s.cat)}</p><div class="chips">${pill(r.h)}<span class="chip grey">${stageLabel(s)}</span></div></div><button class="iconbtn" data-act="closeDrawer" aria-label="Close" style="margin-left:auto">✕</button></div>
    <div class="dr-body">
      ${top ? `<div class="issuebox"><div class="row between wrap"><b>${top.rule.name}</b><span class="pill ${SEV[top.rule.sev][1]}">${SEV[top.rule.sev][0]}</span></div><p class="small mt0 mb8">${esc(top.signal)}</p><p class="small mt0"><b>Recommended action:</b> ${esc(top.rule.first)}</p>
        <div class="act">${DB.done[top.key] ? '' : `<button class="btn xs ${top.rule.auto ? 'soft' : 'primary'}" data-act="alertDo" data-v="${esc(top.key)}">${top.rule.auto ? 'Send nudge' : 'Assign to me'}</button><button class="btn xs ghost" data-act="alertEsc" data-v="${esc(top.key)}">Escalate</button>`}</div>
        ${r.open.length > 1 ? `<p class="xs muted mt8 mb0">+${r.open.length - 1} more open item${r.open.length > 2 ? 's' : ''}</p>` : ''}</div>` : `<div class="note ok"><span class="ni">✓</span><span>No open action items</span></div>`}
      ${m ? `<h4>Performance</h4>
      <div class="mgrid num"><div><span>Views ${cti('views')}</span><b>${nf(m.t.views)}</b></div><div><span>Orders</span><b>${nf(m.t.orders)}</b></div><div><span>Conversion ${cti('conv')}</span><b>${pc(m.t.conv, 1)}</b></div><div><span>Return rate ${cti('retrate')}</span><b>${m.t.delivered ? pc(m.t.retRate) : '-'}</b></div><div><span>Dispatch SLA ${cti('sla')}</span><b class="${(s.onTime ?? 100) < DB.cfg.slaPct ? 'bad' : ''}">${s.onTime ?? 100}%</b></div><div><span>Paid to supplier</span><b>${R(money.paid)}</b></div></div>
      <h4>Catalog</h4><div class="tscroll"><table class="t"><thead><tr><th>Product</th><th>Below benchmark ${cti('c_gap')}</th><th>Views</th><th>Orders</th><th>Return rate</th><th>Inventory</th></tr></thead><tbody>${skus}</tbody></table></div>` : ''}
      <h4>Profile</h4>
      <dl class="kv" style="font-size:13.5px"><dt>Segment ${cti('c_segment')}</dt><dd>${COHORTS[s.cohort]}</dd><dt>Lead source</dt><dd>${esc(s.source)}</dd><dt>Account manager</dt><dd>${esc(s.am)}</dd><dt>Mobile</dt><dd>${maskMobile(s.mobile)}</dd><dt>GST nature of business</dt><dd>${esc((s.gstNature || []).join(', ') || '-')}</dd>${s.fdRejected ? `<dt>Factory Direct</dt><dd>Rejected: ${esc(s.fdRejected)}</dd>` : ''}<dt>Support minutes ${cti('c_support')}</dt><dd>${s.supportMin ?? 0}</dd></dl>
      ${acts.length ? `<h4>Recent activity</h4>${acts.map(a => `<div class="acheck"><span class="xs muted">${dayDate(a.day)}</span><span>${esc(a.what)}<small>${esc(a.who)}</small></span></div>`).join('')}` : ''}
    </div></aside>`;
}

/* ---------- Leads ---------- */
function cLeads() {
  const f = UI.lf || 'all';
  const leads = LEADS.map(l => ({ ...l, ...(DB.leadOv[l.id] || {}) })).filter(l => f === 'all' || l.cohort === f);
  const act = l => ({ 'New': 'Send registration link', 'Contacted': 'Send registration link', 'Invite sent': 'Send reminder', 'Opened link': 'Call' }[l.stage] || 'Call');
  return pageHead('Leads', 'Manufacturers not yet registered on Meesho') + `
  <div class="filters">${[['all', 'All'], ...Object.entries(COHORTS).filter(([k]) => k !== 'unknown')].map(([k, v]) => `<button class="fchip" data-act="lf" data-v="${k}" aria-pressed="${f === k}">${v}</button>`).join('')} ${cti('c_segment')}</div>
  <div class="panel" style="padding:0"><div class="tscroll"><table class="t" style="min-width:820px"><thead><tr><th>Business</th><th>Category</th><th>Segment</th><th>Source</th><th>Owner</th><th>Status</th><th>Last contact</th><th></th></tr></thead><tbody>
  ${leads.map(l => `<tr><td><div class="nm">${esc(l.name)}</div><div class="sub">${esc(l.city)}</div></td><td>${catNameEn(l.cat)}</td><td class="sub">${COHORTS[l.cohort]}</td><td class="sub">${esc(l.source)}</td><td>${l.am}</td><td><span class="chip ${l.stage === 'New' ? 'grey' : l.stage === 'Opened link' ? 'good' : 'info'}">${l.stage}</span></td><td class="sub">${l.touch}</td><td><button class="btn xs soft" data-act="leadAct" data-v="${l.id}">${act(l)}</button></td></tr>`).join('')}
  </tbody></table></div></div>`;
}

/* ---------- Settings ---------- */
function cSettings() {
  const ed = ROLES[DB.role].edit, c = DB.cfg;
  const inp = (k, label, tip, min, max, unit) => `<div class="field"><label for="cfg_${k}">${label} ${tip ? cti(tip) : ''}</label><div class="prefix">${unit && unit.pre ? `<span>${unit.pre}</span>` : ''}<input id="cfg_${k}" class="input" type="number" min="${min}" max="${max}" data-cfg="${k}" value="${c[k]}" ${ed ? '' : 'disabled'}>${unit && unit.post ? `<span style="border-left:1px solid var(--line);border-right:0">${unit.post}</span>` : ''}</div></div>`;
  const feeInp = s => `<div class="field"><label for="fee_${s.id}">${s.en}</label><div class="prefix"><span>₹</span><input id="fee_${s.id}" class="input" type="number" min="0" max="500" data-fee="${s.id}" value="${c.fees[s.id]}" ${ed ? '' : 'disabled'}></div></div>`;
  return pageHead('Settings', ed ? 'Changes apply to all suppliers immediately and are recorded in the activity log' : 'View only. Contact the Programme Lead to change settings.') + `
  <div class="panel mb12"><h2>Programme rules</h2><p class="ps">Shown to suppliers in the app</p>
    <div class="cfg">
      ${inp('launchDays', 'Launch period', 'launch', 7, 90, { post: 'days' })}
      ${inp('viewsTarget', 'Views target per product', 'c_viewsto', 100, 10000, { post: 'views' })}
      ${inp('priceAdv', 'Factory Direct price', 'fdprice', 0, 50, { post: '% below' })}
      ${inp('slaPct', 'Dispatch SLA target', 'sla', 50, 100, { post: '%' })}
      ${inp('settleDays', 'Payment cycle', 'cycle', 1, 30, { post: 'days' })}
    </div></div>
  <div class="panel mb12"><h2>Alert thresholds</h2><p class="ps">Internal</p>
    <div class="cfg">
      ${inp('retOver', 'Return rate above category average', 'retrate', 1, 30, { post: 'pts' })}
      ${inp('inactiveDays', 'Inactive supplier after', null, 1, 60, { post: 'days' })}
    </div></div>
  <div class="panel mb12"><h2>Shipping charges ${cti('shipping')}</h2><p class="ps">Per order, by packed weight</p><div class="cfg">${SLABS.map(feeInp).join('')}</div></div>
  ${ed ? '<div class="row mb12"><button class="btn primary sm" data-act="saveCfg">Save changes</button><button class="btn ghost sm" data-act="resetCfg">Restore defaults</button></div>' : ''}
  <div class="panel"><h2>Escalation rules</h2><p class="ps">What triggers an action item and who acts on it</p><div class="tscroll"><table class="t" style="min-width:760px"><thead><tr><th>Trigger</th><th>Priority</th><th>Owner</th><th>First action</th><th>If unresolved</th></tr></thead><tbody>
    ${RULES.map(r => `<tr><td><b>${r.name}</b><div class="sub">${r.when}</div></td><td><span class="pill ${SEV[r.sev][1]}">${SEV[r.sev][0]}</span></td><td class="sub">${r.owner}</td><td>${r.auto ? '<span class="chip info">Automated</span> ' : ''}${esc(r.first)}</td><td class="sub">${esc(r.esc)}</td></tr>`).join('')}</tbody></table></div></div>`;
}
function cActivity() {
  return pageHead('Activity log', 'All decisions, setting changes and supplier messages') + `
  <div class="panel" style="padding:0"><div class="tscroll"><table class="t"><thead><tr><th>Date</th><th>Time</th><th>User</th><th>Activity</th></tr></thead><tbody>
  ${DB.audit.slice(0, 120).map(a => `<tr><td class="n">${dayDate(a.day)}</td><td class="n sub">${a.time}</td><td class="sub" style="white-space:nowrap">${esc(a.who)}</td><td>${esc(a.what)}</td></tr>`).join('')}</tbody></table></div></div>`;
}
