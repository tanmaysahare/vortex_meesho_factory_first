'use strict';
/* =========================================================
   Router, events, actions, demo controls.
   ========================================================= */
const UI = {
  f: {}, err: {}, formKey: null, calc: { cat: 'home', type: 'cushion', price: '229', cost: '' },
  gstRes: null, eidRes: null, bankRes: null, storeChecking: false, otpAt: 0, otpTries: 0,
  period: null, otab: null, pedit: null, lsel: null, rec: false, sheet: false,
  drawer: null, vsel: {}, lf: 'all', sf: 'all', hf: 'all', af: 'all', cfgDraft: {}, lastRoute: ''
};
const root = document.getElementById('root');

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg; el.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove('show'), 2600);
}
function route() { return (location.hash || '#/').replace(/^#\/?/, '').split('/'); }

function render() {
  const [a, b] = route();
  const key = a + '/' + (b || '');
  let html;
  hideTip();
  runAutoChecks();
  try {
    if (a === 'console') { html = renderConsole(b || 'overview'); document.title = 'Meesho · Factory Direct'; }
    else {
      document.title = 'Meesho Supplier';
      switch (a) {
        case '': html = scrLanding(); break;
        case 'signup': html = scrSignup(); break;
        case 'home': html = scrHome(); break;
        case 'orders': html = scrOrders(); break;
        case 'products': html = b === 'new' ? scrAddProduct() : scrProducts(); break;
        case 'product': html = scrProduct(b); break;
        case 'earnings': html = scrEarnings(); break;
        case 'help': html = scrHelp(); break;
        case 'fd': html = scrFd(); break;
        case 'launch': html = scrLaunch(); break;
        default: location.hash = '#/'; return;
      }
    }
  } catch (e) {
    console.error(e);
    html = `<div class="pad"><div class="note no"><span class="ni">!</span><span><b>Something went wrong. Please try again.</b><br><button class="btn ghost sm mt8" data-act="nav" data-v="#/">Go to home</button></span></div></div>`;
  }
  if (html === '') return; // screen redirected; hashchange renders again
  root.innerHTML = html + (DB.demo ? `<button class="demopill ${a === 'console' ? 'con' : ''}" data-act="demo" aria-label="Demo controls">Demo</button>` : '') + (UI.sheet ? demoSheet() : '');
  document.documentElement.lang = DB.lang === 'hi' ? 'hi' : 'en';
  if (UI.lastRoute !== key) { window.scrollTo(0, 0); UI.lastRoute = key; }
}
function rerenderKeepFocus() {
  const a = document.activeElement, id = a && a.id, pos = a && a.selectionStart;
  const y = window.scrollY;
  render();
  window.scrollTo(0, y);
  if (id) { const n = document.getElementById(id); if (n) { n.focus(); try { if (pos != null) n.setSelectionRange(pos, pos); } catch (e) { } } }
}
function commit() { save(); render(); }

/* ---------- "i" definitions popover ---------- */
function hideTip() { const p = document.getElementById('tipPop'); if (p && !p.hidden) { p.hidden = true; p.dataset.k = ''; } }
function showTip(k, el, en) {
  const g = GLOSS[k], p = document.getElementById('tipPop'); if (!g || !p) return;
  if (!p.hidden && p.dataset.k === k) { hideTip(); return; }
  const d = g.d();
  p.innerHTML = `<b>${esc(en ? g.t[0] : L(g.t[0], g.t[1]))}</b><span>${esc(en ? d[0] : L(d[0], d[1]))}</span>`;
  p.hidden = false; p.dataset.k = k;
  const r = el.getBoundingClientRect(), w = Math.min(280, window.innerWidth - 24);
  p.style.width = w + 'px';
  const left = Math.max(12, Math.min(r.left + r.width / 2 - w / 2, window.innerWidth - w - 12));
  p.style.left = left + 'px';
  const h = p.offsetHeight || 80;
  p.style.top = (r.bottom + 8 + h > window.innerHeight ? Math.max(8, r.top - h - 8) : r.bottom + 8) + 'px';
}

/* ---------- Automated checks (account and Factory Direct) ---------- */
function runAutoChecks() {
  const m = DB.me, now = Date.now();
  if (m.stage === 'review' && m.reviewStartedMs && now - m.reviewStartedMs > 3500) {
    approveAccount('System'); save();
  }
  if (m.stage === 'live' && m.fd.status === 'checking' && m.fd.checkStartedMs && now - m.fd.checkStartedMs > 3000) {
    const checks = fdChecks(meSeller());
    if (!needsManual(checks)) {
      m.fd.status = 'approved'; m.fd.decidedDay = DB.day; m.fd.reason = null;
      notify(`Factory Direct application approved. Select 3 to 5 products to start your launch period.`, `फैक्ट्री डायरेक्ट आवेदन मंज़ूर। लॉन्च अवधि शुरू करने के लिए 3 से 5 प्रोडक्ट चुनें।`, 'good');
      audit('System', `Auto-approved Factory Direct for ${m.store} (all automated checks passed)`);
    } else {
      m.fd.status = 'review';
      const failed = checks.filter(c => c[0] === 'bad').map(c => c[1]).join('; ') || 'No GST registration';
      audit('System', `Sent Factory Direct application from ${m.store} to manual review (${failed})`);
    }
    save();
  }
}
setInterval(() => {
  const m = DB.me;
  if ((m.stage === 'review' && m.reviewStartedMs) || m.fd.status === 'checking') { const before = m.stage + m.fd.status; runAutoChecks(); if (m.stage + m.fd.status !== before) render(); }
}, 1000);

/* ---------- Demo controls (hidden unless ?demo=1 or Ctrl+Shift+D) ---------- */
function demoFillable() {
  const [a, b] = route();
  if (a === 'signup') return true;
  if (a === 'products' && b === 'new') return true;
  if (a === 'fd' && ['draft', 'none', 'info'].includes(DB.me.fd.status)) return true;
  if (a === 'launch') return true;
  return false;
}
function demoSheet() {
  const P = (k, t, d) => `<button data-act="preset" data-v="${k}">${t}<small>${d}</small></button>`;
  const onGst = route()[0] === 'signup' && DB.me.step === 'gst';
  return `<div class="scrim" data-act="closeSheet"><div class="sheet" role="dialog" aria-modal="true" aria-label="Demo controls" data-stop="1">
    <div class="sh-h"><h3>Demo controls</h3><button class="iconbtn" data-act="closeSheet" aria-label="Close">✕</button></div>
    ${demoFillable() ? `<button class="btn primary block mb12" data-act="demoFill">Fill this screen with sample data</button>` : ''}
    ${onGst ? `<div class="flabel">Sample GSTIN</div><div class="chips mb12">${GST_SAMPLES.map(s => `<button class="chip grey" data-act="demoGst" data-v="${s.key}">${s.label.en}</button>`).join('')}</div>` : ''}
    <div class="flabel">Supplier state</div>
    <div class="presets mb12">
      ${P('fresh', 'New visitor', 'Landing page')}
      ${P('live', 'Account live', 'Factory Direct not applied')}
      ${P('fdreview', 'Manual review', 'Application in verification queue')}
      ${P('launch', 'Launch period, day 14', 'Orders and payments flowing')}
      ${P('grad', 'Launch completed', 'Standard supplier')}
    </div>
    <div class="flabel">Console user</div>
    <select class="input mb12" data-role="1" aria-label="Console user">${Object.entries(ROLES).map(([k, r]) => `<option value="${k}" ${DB.role === k ? 'selected' : ''}>${r.user} · ${r.label}</option>`).join('')}</select>
    <div class="flabel">Date <span class="muted">(moves time for every supplier)</span></div>
    <div class="dayctl mb12"><button class="iconbtn" data-act="dayStep" data-v="-1" aria-label="Previous day">−</button><input type="range" min="1" max="90" value="${DB.day}" data-day="1" aria-label="Programme day"><button class="iconbtn" data-act="dayStep" data-v="1" aria-label="Next day">+</button><b class="num" id="dayLbl" style="min-width:64px;text-align:right">${dayDate(DB.day)}</b></div>
    <div class="row wrap mb12"><button class="btn soft sm" data-act="dayStep" data-v="7">+1 week</button><span class="hint mt0">${DB.me.launchStart != null ? 'Launch period: day ' + (DB.day - DB.me.launchStart + 1) + ' of ' + DB.cfg.launchDays : ''}</span></div>
    <div class="row wrap"><a class="btn ghost sm" href="#/" data-act="closeSheet">Supplier app</a><a class="btn ghost sm" href="#/console" data-act="closeSheet">Meesho console</a><button class="btn ghost sm" data-act="lang" data-v="${DB.lang === 'en' ? 'hi' : 'en'}">${DB.lang === 'en' ? 'हिंदी' : 'English'}</button><button class="btn danger sm" data-act="resetAll">Reset everything</button></div>
  </div></div>`;
}

/* ---------- Helpers for actions ---------- */
function setErr(e) { UI.err = e; return Object.keys(e).length === 0; }
function goStep(step) { const m = DB.me; m.step = step; m.stepSince = DB.day; touch(); UI.formKey = null; save(); render(); }
function approveAccount(who) {
  const m = DB.me; if (m.stage !== 'review') return;
  m.stage = 'live'; m.liveDay = DB.day; m.reviewStartedMs = null; touch();
  notify('Your supplier account is live. Add products to start selling.', 'आपका सप्लायर अकाउंट चालू है। बेचना शुरू करने के लिए प्रोडक्ट जोड़ें।', 'good');
  audit(who, `${who === 'System' ? 'Auto-approved' : 'Approved'} supplier account for ${m.store}${who === 'System' ? ' (GST, bank and address checks passed)' : ''}`);
}
function decideFd(id, mode, reasonKey, who) {
  const rs = mode === 'reject' ? REJECT_REASONS[reasonKey] : mode === 'info' ? INFO_REASONS[reasonKey] : null;
  const verb = { approve: 'Approved', info: 'Requested changes on', reject: 'Rejected' }[mode];
  let name;
  if (id === 'me') {
    const fd = DB.me.fd; name = DB.me.store;
    fd.decidedDay = DB.day;
    if (mode === 'approve') { fd.status = 'approved'; fd.reason = null; notify('Factory Direct application approved. Select 3 to 5 products to start your launch period.', 'फैक्ट्री डायरेक्ट आवेदन मंज़ूर। लॉन्च अवधि शुरू करने के लिए 3 से 5 प्रोडक्ट चुनें।', 'good'); }
    else if (mode === 'info') { fd.status = 'info'; fd.step = 2; fd.reason = { en: rs.en, hi: rs.hi }; notify('Factory Direct: ' + rs.en, 'फैक्ट्री डायरेक्ट: ' + rs.hi, 'warn'); }
    else { fd.status = 'rejected'; fd.reason = { en: rs.en, hi: rs.hi }; notify('Factory Direct: ' + rs.en, 'फैक्ट्री डायरेक्ट: ' + rs.hi, 'warn'); }
  } else {
    const sd = SEEDS.find(x => x.id === id); name = sd.name;
    DB.seedOv[id] = mode === 'approve' ? { stage: 'fd', launchStart: null } : mode === 'info' ? { stage: 'fd_info' } : { stage: 'regular', fdRejected: rs.label };
  }
  audit(who, `${verb} Factory Direct for ${name}${rs ? ' (' + rs.label + ')' : ''}`);
  delete UI.vsel[id];
}
function findMyProduct(id) { return DB.me.products.find(p => p.id === id); }
function readPhoto(file, max, cb) {
  if (!file) return;
  if (!/^image\//.test(file.type)) { toast(L('Please choose a photo', 'कृपया फोटो चुनें')); return; }
  const fr = new FileReader();
  fr.onload = () => {
    const img = new Image();
    img.onload = () => {
      const sc = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas'); c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      cb(c.toDataURL('image/jpeg', 0.72));
    };
    img.onerror = () => toast(L('Could not read this photo. Try another.', 'यह फोटो नहीं खुली। दूसरी आज़माएँ।'));
    img.src = fr.result;
  };
  fr.readAsDataURL(file);
}

/* ---------- Actions ---------- */
const A = {
  nav: v => { if (location.hash === v) render(); else location.hash = v; },
  lang: v => { DB.lang = v; commit(); },
  toast: v => toast(v),
  tip: (v, el) => showTip(v, el, el.dataset.en === '1'),
  demo: () => { UI.sheet = true; render(); },
  closeSheet: () => { UI.sheet = false; render(); },
  demoFill: () => { UI.sheet = false; demoFill(); },
  demoGst: v => { UI.sheet = false; UI.f.gstMode = 'gst'; render(); A.gstSample(v); },
  cgo: v => { const [sec, f] = v.split(':'); if (sec === 'suppliers') { UI.sf = 'all'; UI.hf = f || 'all'; } if (sec === 'actions') UI.af = f || 'all'; A.cnav(sec); },
  preset: v => {
    const map = { fresh: 'fresh', review: 'review', live: 'live', fdreview: 'fdreview', launch: 'launch', grad: 'grad' };
    applyPreset(map[v]); UI.formKey = null; UI.period = null; UI.otab = null; UI.lsel = null; UI.sheet = false; UI.drawer = null;
    save();
    const h = v === 'fresh' ? '#/' : v === 'fdreview' ? '#/fd' : '#/home';
    if (location.hash.startsWith('#/console')) render(); else A.nav(h);
  },
  dayStep: v => { DB.day = clamp(DB.day + +v, 1, 90); commit(); },
  resetAll: () => { if (!confirm('Reset all data in the supplier app and console?')) return; const demo = DB.demo; resetAll(); DB.demo = demo; UI.sheet = false; UI.formKey = null; UI.drawer = null; UI.vsel = {}; save(); A.nav('#/'); },

  /* sign-up */
  startSignup: () => { const m = DB.me; if (m.stage === 'none') { m.stage = 'signup'; m.step = 'mobile'; m.stepSince = DB.day; } touch(); save(); A.nav('#/signup'); },
  restartSignup: () => { if (!confirm(L('Clear your saved details and start again?', 'सेव जानकारी हटाकर फिर से शुरू करें?'))) return; DB.me = freshMe(); UI.formKey = null; A.startSignup(); },
  suBack: v => goStep(v || 'mobile'),
  suGoto: v => goStep(v),
  sendOtp: () => {
    const mob = (UI.f.mobile || '').replace(/\D/g, '');
    if (!setErr(V.mobile(mob) ? {} : { mobile: L('Enter a valid 10-digit Indian mobile number', 'सही 10 अंकों का भारतीय मोबाइल नंबर डालें') })) return render();
    DB.me.mobile = mob; UI.f.otp = ''; DB.me.step = 'otp'; UI.formKey = 'otp'; touch(); save();
    sendOtpCode();
    render();
  },
  resendOtp: () => { UI.err = {}; UI.f.otp = ''; sendOtpCode(); render(); },
  verifyOtp: () => {
    const otp = (UI.f.otp || '').trim();
    if (otp && otp === UI.otpCode) { DB.me.otpOk = true; UI.otpAuto = false; return goStep('email'); }
    UI.otpTries = (UI.otpTries || 0) + 1;
    const left = 3 - UI.otpTries;
    setErr({ otp: otp.length !== 6 ? L('Enter all 6 digits', 'सभी 6 अंक डालें') : left > 0 ? L(`Incorrect OTP. ${left} attempt${left > 1 ? 's' : ''} left.`, `गलत OTP। ${left} कोशिश बाकी।`) : L('Too many attempts. Request a new OTP.', 'बहुत ज़्यादा कोशिशें। नया OTP मँगाएँ।') });
    render();
  },
  suEmail: () => {
    const e = (UI.f.email || '').trim(), pw = UI.f.pw || '', err = {};
    if (!V.email(e)) err.email = L('Enter a valid email address', 'सही ईमेल पता डालें');
    if (!(DB.me.pwSet && !pw) && !/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(pw)) err.pw = L('Use at least 8 characters, with a letter and a number', 'कम से कम 8 अक्षर, जिसमें एक अक्षर और एक अंक हो');
    if (!setErr(err)) return render();
    DB.me.email = e; DB.me.pwSet = true; UI.f.pw = ''; // the password itself is never stored
    goStep('gst');
  },
  gstMode: v => { UI.f.gstMode = v; UI.err = {}; render(); },
  gstSample: v => { const s = GST_SAMPLES.find(x => x.key === v); UI.f.gstin = s.gstin; UI.gstRes = null; A.verifyGst(); },
  verifyGst: () => {
    const g = (UI.f.gstin || '').trim().toUpperCase(); UI.f.gstin = g;
    let e = null;
    if (g.length !== 15) e = L('A GSTIN has 15 characters. You entered ' + g.length + '.', 'GSTIN में 15 अक्षर होते हैं। आपने ' + g.length + ' डाले।');
    else if (!V.gstinFormat(g)) e = L('This does not look like a GSTIN. Format: 2 digits, PAN, 1 digit, Z, 1 character.', 'यह GSTIN जैसा नहीं दिखता। फ़ॉर्मेट: 2 अंक, PAN, 1 अंक, Z, 1 अक्षर।');
    else if (!GST_STATES[g.slice(0, 2)]) e = L('The first 2 digits are not a valid state code.', 'पहले 2 अंक सही राज्य कोड नहीं हैं।');
    else if (!V.gstin(g)) e = L('The last character does not match. Check the GSTIN for a typo.', 'आखिरी अक्षर मेल नहीं खाता। GSTIN में गलती जाँचें।');
    if (!setErr(e ? { gstin: e } : {})) { UI.gstRes = null; return render(); }
    UI.gstRes = 'loading'; render();
    gstLookup(g).then(r => { if (UI.f.gstin !== g || UI.formKey !== 'gst') return; UI.gstRes = r; render(); });
  },
  suGst: () => {
    const r = UI.gstRes, m = DB.me; if (!r || !r.legal || r.status !== 'Active') return;
    if (m.gstin !== r.gstin) { m.addr = null; m.bank = null; }
    m.gstMode = 'gst'; m.gstin = r.gstin; m.gst = { gstin: r.gstin, legal: r.legal, trade: r.trade, status: r.status, type: r.type, nature: r.nature, state: r.state, pan: r.pan, addr: r.addr };
    m.eid = ''; m.pan = ''; m.makesSelf = null;
    goStep('address');
  },
  makeEid: () => {
    const f = UI.f; f.pan = (f.pan || '').toUpperCase().trim();
    const e = {};
    if (!V.pan(f.pan)) e.pan = L('Enter a valid PAN, like ABCPK1234F', 'सही PAN डालें, जैसे ABCPK1234F');
    if (!V.name(f.panName || '')) e.panName = L('Enter the name exactly as on your PAN', 'PAN पर लिखा नाम ही डालें');
    if (!f.eidState) e.eidState = L('Choose your state', 'अपना राज्य चुनें');
    if (!setErr(e)) return render();
    UI.eidRes = 'loading'; render();
    const code = Object.keys(GST_STATES).find(k => GST_STATES[k] === f.eidState) || '00';
    fakeCall('EID' + code + String(h32(f.pan) % 1e10).padStart(10, '0'), 900).then(id => { UI.eidRes = id; render(); });
  },
  makesSelf: v => { UI.f.makesSelf = v === 'yes'; render(); },
  suEid: () => {
    const f = UI.f, m = DB.me;
    if (m.eidState !== f.eidState) m.addr = null;
    m.gstMode = 'eid'; m.gst = null; m.gstin = ''; m.pan = f.pan; m.panName = f.panName.trim(); m.eidState = f.eidState; m.eid = UI.eidRes; m.makesSelf = f.makesSelf ?? null;
    m.bank = null;
    goStep('address');
  },
  suAddress: () => {
    const f = UI.f, st = regState(), e = {};
    if ((f.line1 || '').trim().length < 3) e.line1 = L('Enter building, plot or shop number', 'बिल्डिंग, प्लॉट या दुकान नंबर डालें');
    if ((f.line2 || '').trim().length < 3) e.line2 = L('Enter street and area', 'गली और इलाका डालें');
    if ((f.city || '').trim().length < 2) e.city = L('Enter city', 'शहर डालें');
    if (!V.pin(f.pin || '')) e.pin = L('Enter a 6-digit pincode', '6 अंकों का पिनकोड डालें');
    else if (pinStates(f.pin) && !pinStates(f.pin).includes(st)) e.pin = L(`This pincode is in ${pinStates(f.pin).join(' or ')}. Pickup address must be in ${st}, the same as your registration.`, `यह पिनकोड ${pinStates(f.pin).join(' या ')} का है। पिकअप पता ${st} में होना चाहिए।`);
    if (!setErr(e)) return render();
    DB.me.addr = { line1: f.line1.trim(), line2: f.line2.trim(), line3: (f.line3 || '').trim(), city: f.city.trim(), pin: f.pin, state: st };
    goStep('bank');
  },
  verifyBank: () => {
    const f = UI.f, e = {};
    f.acc = (f.acc || '').replace(/\s/g, ''); f.acc2 = (f.acc2 || '').replace(/\s/g, ''); f.ifsc = (f.ifsc || '').toUpperCase().trim();
    if (!V.acc(f.acc)) e.acc = L('Enter a valid account number (9 to 18 digits)', 'सही खाता नंबर डालें (9 से 18 अंक)');
    else if (f.acc !== f.acc2) e.acc2 = L('Account numbers do not match', 'खाता नंबर मेल नहीं खाते');
    if (!V.ifsc(f.ifsc)) e.ifsc = L('Enter a valid 11-character IFSC', 'सही 11 अक्षरों का IFSC डालें');
    else if (!ifscLookup(f.ifsc)) e.ifsc = L('IFSC not found. Check your cheque book or passbook.', 'IFSC नहीं मिला। चेकबुक या पासबुक देखें।');
    if (!setErr(e)) return render();
    UI.bankRes = 'loading'; render();
    const exp = bankName();
    pennyDrop(f.acc, exp).then(r => {
      if (UI.formKey !== 'bank') return;
      UI.bankRes = r;
      if (r.ok) { const i = ifscLookup(f.ifsc); DB.me.bank = { acc: f.acc, ifsc: f.ifsc, bankName: i.bank, branch: i.branch, holder: r.holder, verified: true }; save(); }
      render();
    });
  },
  suBank: () => { if (DB.me.bank && DB.me.bank.verified) goStep('store'); },
  suStore: () => {
    const f = UI.f, e = {};
    if (!V.store(f.store || '')) e.store = L('Use 3 to 40 letters, numbers or spaces', '3 से 40 अक्षर, अंक या स्पेस डालें');
    if (!V.name(f.name || '')) e.name = L('Enter your full name', 'अपना पूरा नाम डालें');
    if (!setErr(e)) return render();
    UI.storeChecking = true; render();
    storeAvailable(f.store).then(ok => {
      UI.storeChecking = false;
      if (!ok) { setErr({ store: L(`"${f.store.trim()}" is not available. Try "${f.store.trim()} ${(DB.me.addr && DB.me.addr.city) || ''}".`, `"${f.store.trim()}" उपलब्ध नहीं है। "${f.store.trim()} ${(DB.me.addr && DB.me.addr.city) || ''}" आज़माएँ।`) }); return render(); }
      DB.me.store = f.store.trim().replace(/\s+/g, ' '); DB.me.name = f.name.trim(); goStep('review');
    });
  },
  suSubmit: () => {
    if (!setErr(UI.f.agree ? {} : { agree: L('Please accept the terms to continue', 'आगे बढ़ने के लिए शर्तें स्वीकार करें') })) return render();
    const m = DB.me;
    m.agree = true; m.stage = 'review'; m.submittedDay = DB.day; m.reviewStartedMs = Date.now(); touch();
    notify('Registration submitted.', 'रजिस्ट्रेशन जमा हुआ।');
    audit('Supplier', `${m.store} submitted supplier registration (${m.gstMode === 'gst' ? 'GSTIN' : 'Enrolment ID'})`);
    UI.formKey = null; save(); A.nav('#/home');
  },

  /* home, orders, products */
  period: v => { UI.period = v; render(); },
  summarySeen: () => { DB.me.summarySeen = true; commit(); },
  otab: v => { UI.otab = v; render(); },
  accept: v => { DB.me.rts[v] = 'rts'; touch(); commit(); toast(L('Order accepted. Moved to Ready to Ship.', 'ऑर्डर स्वीकार। भेजने को तैयार में भेजा गया।')); },
  acceptAll: () => { const s = meSeller(); s.products.forEach(p => simProduct(s, p).orders.forEach(o => { if (orderStatus(o, DB.day, DB.me.rts) === 'pending') DB.me.rts[o.id] = 'rts'; })); touch(); commit(); UI.otab = 'rts'; render(); toast(L('All orders accepted', 'सभी ऑर्डर स्वीकार')); },
  chk: v => { DB.me.chk[v] = !DB.me.chk[v]; commit(); },
  label: () => toast(L('Shipping label downloaded', 'शिपिंग लेबल डाउनलोड हुआ')),
  packed: v => { DB.me.rts[v] = 'packed'; touch(); commit(); toast(L('Marked as packed', 'पैक मार्क हुआ')); },
  savePrice: () => {
    const id = route()[1], p = findMyProduct(id); if (!p) return;
    const v = Math.round(+UI.pedit.price);
    if (!(v >= 30 && v <= 20000)) return toast(L('Enter a price between ₹30 and ₹20,000', '₹30 से ₹20,000 के बीच कीमत डालें'));
    if (v === p.price) return toast(L('Price unchanged', 'कीमत वही है'));
    if (!p.priceLog) p.priceLog = [[-9999, p.price]];
    // today's orders were placed at the old price, so the new price starts tomorrow
    p.priceLog = p.priceLog.filter(x => x[0] !== DB.day + 1); p.priceLog.push([DB.day + 1, v]);
    audit('Supplier', `${DB.me.store} changed price of "${p.name}" from ₹${p.price} to ₹${v}`);
    p.price = v; touch(); commit(); toast(L('Price updated', 'कीमत अपडेट हुई'));
  },
  addStock: () => A.addStockN(UI.pedit.add),
  addStockN: v => {
    const id = route()[1], p = findMyProduct(id); const n = Math.round(+v);
    if (!p || !(n >= 1 && n <= 5000)) return toast(L('Enter 1 to 5,000 units', '1 से 5,000 यूनिट डालें'));
    (p.stockAdds = p.stockAdds || []).push([DB.day, n]); UI.pedit.add = '';
    audit('Supplier', `${DB.me.store} added ${n} units of "${p.name}"`);
    touch(); commit(); toast(L(`${n} units added to inventory`, `इन्वेंटरी में ${n} यूनिट जोड़े`));
  },
  saveProduct: () => {
    const f = UI.f, e = {}, price = Math.round(+f.price), mrp = f.mrp === '' ? null : Math.round(+f.mrp), stock = Math.round(+f.stock), cost = f.cost === '' ? null : Math.round(+f.cost);
    if (!f.photo) e.photo = L('Add a product image', 'प्रोडक्ट फोटो जोड़ें');
    const nm = (f.name || '').trim();
    if (nm.length < 10) e.name = L('Product name must have at least 10 characters', 'प्रोडक्ट के नाम में कम से कम 10 अक्षर होने चाहिए');
    else if (+f.packOf > 1 && !new RegExp('pack of ' + f.packOf, 'i').test(nm)) e.name = L(`Product name must include "pack of ${f.packOf}"`, `प्रोडक्ट के नाम में "pack of ${f.packOf}" होना चाहिए`);
    else if (+f.packOf === 1 && /pack of [2-9]/i.test(nm)) e.name = L('Product name mentions a pack, but Pack of is 1', 'नाम में पैक लिखा है, पर पैक में 1 चुना है');
    if (!(price >= 30 && price <= 20000)) e.price = L('Enter a price between ₹30 and ₹20,000', '₹30 से ₹20,000 के बीच कीमत डालें');
    if (mrp !== null && !(mrp >= price)) e.mrp = L('MRP cannot be lower than the selling price', 'MRP बिक्री कीमत से कम नहीं हो सकता');
    if (!(stock >= 1 && stock <= 10000)) e.stock = L('Enter 1 to 10,000 units', '1 से 10,000 यूनिट डालें');
    if (!setErr(e)) { render(); const first = document.querySelector('.err,.errtxt'); if (first && first.scrollIntoView) first.scrollIntoView({ block: 'center' }); return; }
    const id = 'p' + Date.now().toString(36);
    DB.me.products.push({ id, cat: f.cat, type: f.type, name: nm, packOf: +f.packOf, size: f.size, material: f.material, colour: f.colour, price, mrp, slab: f.slab, stock, cost, photo: f.photo, launch: false, liveDay: DB.day });
    audit('Supplier', `${DB.me.store} listed "${nm}" at ₹${price}`);
    UI.formKey = null; touch(); save();
    toast(L('QC approved. Product is live.', 'QC मंज़ूर। प्रोडक्ट चालू है।'));
    A.nav(location.hash.includes('launch') ? '#/launch' : (DB.me.fd.status === 'approved' && DB.me.launchStart == null ? '#/launch' : '#/product/' + id));
  },

  /* Factory Direct */
  fdCat: v => { const fd = DB.me.fd; if (fd.cat !== v) fd.steps = {}; fd.cat = v; UI.err = {}; commit(); },
  fdStep: v => { const fd = DB.me.fd; fd.steps[v] = !fd.steps[v]; UI.err = {}; commit(); },
  fdWhere: v => { const fd = DB.me.fd; fd.sellsWhere = fd.sellsWhere === v ? null : v; commit(); },
  fdNext1: () => { const fd = DB.me.fd; if (!Object.values(fd.steps).some(Boolean)) { setErr({ fdsteps: L('Select at least one step', 'कम से कम एक काम चुनें') }); return render(); } fd.step = 2; UI.err = {}; touch(); commit(); },
  fdBack: () => { DB.me.fd.step = Math.max(1, DB.me.fd.step - 1); UI.err = {}; commit(); },
  fdNext2: () => { const ph = DB.me.fd.photos; if (!ph.floor || !ph.stock) { setErr({ photos: L('Add the production area and finished goods photos', 'उत्पादन क्षेत्र और तैयार माल की फोटो जोड़ें') }); return render(); } DB.me.fd.step = 3; UI.err = {}; commit(); },
  fdSubmit: () => {
    const fd = DB.me.fd; fd.udyam = (fd.udyam || '').trim().toUpperCase();
    if (fd.udyam && !V.udyam(fd.udyam)) { setErr({ udyam: L('Enter a valid Udyam number (UDYAM-XX-00-0000000) or leave it blank', 'सही उद्यम नंबर (UDYAM-XX-00-0000000) डालें या खाली छोड़ें') }); return render(); }
    // automated checks run once the account is live
    fd.status = 'checking'; fd.checkStartedMs = Date.now(); fd.submittedDay = DB.day; fd.reason = null; UI.err = {}; touch();
    notify('Factory Direct application submitted.', 'फैक्ट्री डायरेक्ट आवेदन जमा हुआ।');
    audit('Supplier', `${DB.me.store || 'New supplier'} applied for Factory Direct (${CATS[fd.cat].en})`);
    commit();
  },
  fdRestart: () => { const f = freshMe().fd; f.status = 'draft'; DB.me.fd = f; commit(); },
  lsel: v => { UI.lsel = UI.lsel || {}; const n = Object.values(UI.lsel).filter(Boolean).length; if (!UI.lsel[v] && n >= 5) return toast(L('You can select up to 5 products', 'आप ज़्यादा से ज़्यादा 5 प्रोडक्ट चुन सकते हैं')); UI.lsel[v] = !UI.lsel[v]; render(); },
  startLaunch: () => {
    const sel = UI.lsel || {}, ids = Object.keys(sel).filter(k => sel[k]);
    if (ids.length < 3 || ids.length > 5) return;
    const m = DB.me; m.launchStart = DB.day; m.summarySeen = false;
    m.products.forEach(p => { p.launch = ids.includes(p.id); });
    notify('Your launch period has started.', 'आपकी लॉन्च अवधि शुरू हो गई है।', 'good');
    audit('Supplier', `${m.store} started launch period with ${ids.length} products`);
    UI.lsel = null; UI.period = 'launch'; touch(); save(); A.nav('#/home');
  },
  voice: () => { if (UI.rec) toast(L('Voice note sent', 'वॉइस नोट भेजा गया')); UI.rec = !UI.rec; render(); },
  logout: () => { toast(L('Logged out', 'लॉग आउट हो गए')); A.nav('#/'); },

  /* console */
  cnav: v => { UI.drawer = null; A.nav('#/console/' + v); },
  open: v => { UI.drawer = v; render(); setTimeout(() => { const b = document.querySelector('.drawer .iconbtn'); if (b) b.focus(); }, 0); },
  closeDrawer: () => { UI.drawer = null; render(); },
  lf: v => { UI.lf = v; render(); },
  sf: v => { UI.sf = v; render(); },
  af: v => { UI.af = v; render(); },
  leadAct: v => {
    const l = { ...LEADS.find(x => x.id === v), ...(DB.leadOv[v] || {}) };
    const next = { 'New': 'Invite sent', 'Contacted': 'Invite sent', 'Invite sent': 'Invite sent', 'Opened link': 'Contacted' }[l.stage] || l.stage;
    const what = { 'New': 'Sent registration link on WhatsApp to', 'Contacted': 'Sent registration link on WhatsApp to', 'Invite sent': 'Sent a reminder to', 'Opened link': 'Logged a call with' }[l.stage] || 'Called';
    DB.leadOv[v] = { stage: next, touch: 'Today' };
    audit(roleName(), `${what} ${l.name}`); commit(); toast(`${what} ${l.name}`);
  },
  vmode: v => { const [id, mode] = v.split(':'); const cur = UI.vsel[id] || {}; UI.vsel[id] = { mode, reason: mode === 'reject' ? (REJECT_REASONS[cur.reason] ? cur.reason : 'trader') : (INFO_REASONS[cur.reason] ? cur.reason : 'geo') }; render(); },
  vDecide: v => { const sel = UI.vsel[v] || { mode: 'approve' }; decideFd(v, sel.mode, sel.reason, roleName()); commit(); toast('Decision sent to supplier'); },
  alertDo: v => {
    const a = consoleData().alerts.find(x => x.key === v); if (!a) return;
    DB.done[v] = a.rule.auto ? `Nudge sent on ${dayDate(DB.day)}` : `Assigned to ${ROLES[DB.role].user} on ${dayDate(DB.day)}`;
    if (a.seller.isMe && a.rule.auto) {
      const msg = { conv: ['Low conversion on a product. Review its price against the benchmark and improve images.', 'एक प्रोडक्ट पर कन्वर्ज़न कम है। बेंचमार्क से कीमत मिलाएँ और फोटो बेहतर करें।'], returns: ['Your return rate is above the category average. See return reasons on each product.', 'आपकी वापसी दर कैटेगरी औसत से ज़्यादा है। हर प्रोडक्ट पर वापसी के कारण देखें।'], price: ['Factory Direct tag paused on a product. Update its price to restore the tag.', 'एक प्रोडक्ट पर फैक्ट्री डायरेक्ट टैग रुका है। टैग वापस पाने के लिए कीमत बदलें।'], stock: ['A product is out of stock. Add inventory to continue selling.', 'एक प्रोडक्ट का स्टॉक खत्म है। बेचना जारी रखने के लिए इन्वेंटरी जोड़ें।'], inactive: ['You have pending updates in your supplier account.', 'आपके सप्लायर अकाउंट में नए अपडेट हैं।'] }[a.rule.id];
      if (msg) notify(msg[0], msg[1], 'warn');
    }
    audit(a.rule.auto ? 'System' : roleName(), `${a.rule.auto ? 'Nudge sent' : 'Assigned'}: ${a.rule.name} for ${a.seller.name}`);
    commit();
  },
  alertEsc: v => { const a = consoleData().alerts.find(x => x.key === v); if (!a) return; DB.done[v] = `Escalated: ${a.rule.esc}`; audit(roleName(), `Escalated "${a.rule.name}" for ${a.seller.name}`); commit(); },
  saveCfg: () => {
    if (!ROLES[DB.role].edit) return;
    const lim = { launchDays: [7, 90], viewsTarget: [100, 10000], priceAdv: [0, 50], retOver: [1, 30], slaPct: [50, 100], settleDays: [1, 30], inactiveDays: [1, 60] };
    const changes = [];
    for (const [k, v] of Object.entries(UI.cfgDraft)) {
      const n = Math.round(+v);
      if (k.startsWith('fee:')) { const s = k.slice(4); if (n >= 0 && n <= 500 && n !== DB.cfg.fees[s]) { changes.push(`shipping charge ${SLABS.find(x => x.id === s).en} ₹${DB.cfg.fees[s]} → ₹${n}`); DB.cfg.fees[s] = n; } continue; }
      if (!lim[k] || !(n >= lim[k][0] && n <= lim[k][1])) { toast(`${CFG_LABELS[k] || k}: enter ${lim[k][0]} to ${lim[k][1]}`); return; }
      if (n !== DB.cfg[k]) { changes.push(`${CFG_LABELS[k] || k} ${DB.cfg[k]} → ${n}`); DB.cfg[k] = n; }
    }
    UI.cfgDraft = {};
    if (!changes.length) return toast('No changes to save');
    audit(roleName(), 'Updated settings: ' + changes.join(', '));
    commit(); toast('Settings saved');
  },
  resetCfg: () => { if (!ROLES[DB.role].edit) return; DB.cfg = JSON.parse(JSON.stringify(CFG_DEFAULT)); UI.cfgDraft = {}; audit(roleName(), 'Restored default settings'); commit(); toast('Defaults restored'); }
};

const CFG_LABELS = { launchDays: 'Launch period', viewsTarget: 'Views target', priceAdv: 'Factory Direct price gap', retOver: 'Return threshold', slaPct: 'Dispatch SLA', settleDays: 'Payment cycle', inactiveDays: 'Inactive after' };

/* ---------- OTP: the code is read from the SMS automatically (Android SMS autofill) ---------- */
function sendOtpCode() {
  UI.otpCode = String(100000 + Math.floor(Math.random() * 900000));
  UI.otpAt = Date.now(); UI.otpTries = 0; UI.otpAuto = false;
  toast(L('OTP sent', 'OTP भेजा गया'));
  const code = UI.otpCode;
  setTimeout(() => {
    if (route()[0] !== 'signup' || DB.me.step !== 'otp' || UI.otpCode !== code || UI.f.otp) return;
    UI.f.otp = code; UI.otpAuto = true; UI.err = {}; rerenderKeepFocus();
  }, 1400);
}

/* ---------- Demo: fill the current screen with sample data ---------- */
function demoFill() {
  const [a, b] = route(), f = UI.f, m = DB.me;
  if (a === 'signup') {
    const st = m.step;
    if (st === 'mobile') { f.mobile = '9812345678'; return A.sendOtp(); }
    if (st === 'otp') { f.otp = UI.otpCode; return A.verifyOtp(); }
    if (st === 'email') { f.email = 'rakesh@sutradhar.in'; f.pw = 'Factory2026'; return A.suEmail(); }
    if (st === 'gst') { if (UI.gstRes && UI.gstRes.legal && UI.gstRes.status === 'Active') return A.suGst(); f.gstMode = 'gst'; render(); return A.gstSample('mfr'); }
    if (st === 'address') return A.suAddress();
    if (st === 'bank') { if (UI.bankRes && UI.bankRes.ok) return A.suBank(); f.acc = f.acc2 = '50100234567812'; f.ifsc = 'HDFC0001234'; return A.verifyBank(); }
    if (st === 'store') { f.store = f.store || 'Sutradhar Home Textiles'; f.name = f.name || 'Rakesh Malik'; return A.suStore(); }
    if (st === 'review') { f.agree = true; return A.suSubmit(); }
  }
  if (a === 'products' && b === 'new') {
    const n = m.products.length, cat = f.cat, types = CATS[cat].types, t = types[n % types.length];
    Object.assign(f, { type: t.id, size: t.sizes[0], slab: t.slab, packOf: 1, colour: COLOURS[n % COLOURS.length], photo: 'sw' + (1 + n % 8), nameTouched: false, stock: '60', mrp: String(Math.round(t.base * 2)) });
    f.price = String(Math.floor(similarMedian(cat, t.id, 1) * 0.88)); f.cost = String(Math.round(+f.price * 0.55));
    UI.err = {}; return render();
  }
  if (a === 'fd') {
    const fd = m.fd;
    if (fd.step === 1) { fd.cat = fd.cat || m.products[0]?.cat || 'home'; CATS[fd.cat].steps.forEach(s => { if (s.id !== CATS[fd.cat].steps[1].id) fd.steps[s.id] = true; }); fd.sellsWhere = fd.sellsWhere || 'b2b'; save(); return A.fdNext1(); }
    if (fd.step === 2) { fd.photos.floor = 'sample:floor'; fd.photos.stock = 'sample:stock'; fd.geoKm = 0.3; save(); return A.fdNext2(); }
    if (fd.step === 3) { fd.udyam = fd.udyam || 'UDYAM-HR-06-0034567'; save(); return render(); }
  }
  if (a === 'launch') { UI.lsel = {}; m.products.slice(0, 3).forEach(p => UI.lsel[p.id] = true); return render(); }
}

/* ---------- Event wiring ---------- */
document.addEventListener('click', e => {
  if (!e.target.closest('.idot') && !e.target.closest('#tipPop')) hideTip();
  const el = e.target.closest('[data-act]');
  if (!el) return;
  // clicks inside the sheet should not close it through the scrim
  if (el.classList.contains('scrim') && e.target.closest('[data-stop]')) return;
  if (el.disabled) return;
  const act = el.dataset.act;
  if (el.tagName === 'A' && act === 'closeSheet') { UI.sheet = false; if (location.hash === el.getAttribute('href') || (!location.hash && el.getAttribute('href') === '#/')) { e.preventDefault(); render(); } return; }
  const fn = A[act]; if (!fn) return;
  e.preventDefault();
  fn(el.dataset.v, el);
});
document.addEventListener('input', e => {
  const t = e.target, d = t.dataset;
  if (d.f) {
    let v = t.type === 'checkbox' ? t.checked : t.value;
    if (d.upper && typeof v === 'string') { const pos = t.selectionStart; v = v.toUpperCase(); t.value = v; try { t.setSelectionRange(pos, pos); } catch (x) { } }
    UI.f[d.f] = v;
    if (d.touch) UI.f[d.touch] = true;
    if (UI.err[d.f]) { UI.err[d.f] = null; t.classList.remove('err'); const p = t.closest('.prefix'); if (p) p.classList.remove('err'); }
    if (d.f === 'gstin' && UI.gstRes && UI.gstRes !== 'loading') { UI.gstRes = null; rerenderKeepFocus(); return; }
    if (d.bank && UI.bankRes && UI.bankRes !== 'loading') { UI.bankRes = null; rerenderKeepFocus(); return; }
    if (d.live === 'pin') { const el = document.getElementById('pinMsg'); if (el) { const st = regState(); const ok = V.pin(v) && (!pinStates(v) || pinStates(v).includes(st)); el.innerHTML = V.pin(v) && !ok ? `<p class="errtxt">${L('This pincode is in ' + pinStates(v).join(' or ') + ', not ' + st + '.', 'यह पिनकोड ' + pinStates(v).join(' या ') + ' का है, ' + st + ' का नहीं।')}</p>` : ok ? `<p class="oktxt">✓ ${L('Pickup available at this pincode', 'इस पिनकोड पर पिकअप उपलब्ध है')}</p>` : ''; } }
    if (d.live === 'ifsc') { const el = document.getElementById('ifscInfo'); if (el) { const i = V.ifsc(v) ? ifscLookup(v) : null; el.innerHTML = i ? `<p class="oktxt">✓ ${esc(i.bank)}, ${esc(i.branch)}</p>` : v.length === 11 ? `<p class="errtxt">${L('IFSC not found', 'IFSC नहीं मिला')}</p>` : ''; } }
    if (d.live === 'price') { const el = document.getElementById('pp'); if (el) el.innerHTML = pricePreview(); }
    if (d.f === 'name' && UI.formKey === 'addp') { /* keep user title */ }
    return;
  }
  if (d.calc) { UI.calc[d.calc] = t.value; const o = document.getElementById('calcOut'); if (o) o.innerHTML = calcOut(); return; }
  if (d.pe) { UI.pedit[d.pe] = t.value; return; }
  if (d.fdf) { let v = t.value; if (d.upper) { const pos = t.selectionStart; v = v.toUpperCase(); t.value = v; try { t.setSelectionRange(pos, pos); } catch (x) { } } DB.me.fd[d.fdf] = v; save(); return; }
  if (d.cfg) { UI.cfgDraft[d.cfg] = t.value; return; }
  if (d.fee) { UI.cfgDraft['fee:' + d.fee] = t.value; return; }
  if (d.day) { DB.day = +t.value; const l = document.getElementById('dayLbl'); if (l) l.textContent = dayDate(DB.day); return; }
});
document.addEventListener('change', e => {
  const t = e.target, d = t.dataset;
  if (d.photo) {
    const file = t.files && t.files[0];
    if (d.photo === 'product') readPhoto(file, 360, url => { UI.f.photo = url; UI.err.photo = null; rerenderKeepFocus(); });
    else { const slot = d.photo.split(':')[1]; readPhoto(file, 480, url => { DB.me.fd.photos[slot] = url; DB.me.fd.geoKm = 0.3; UI.err = {}; save(); rerenderKeepFocus(); }); }
    return;
  }
  if (d.f && d.rerender) {
    const f = UI.f;
    f[d.f] = t.value;
    if (d.f === 'cat') { const c = CATS[f.cat]; f.type = c.types[0].id; f.material = c.materials[0]; }
    if (d.f === 'cat' || d.f === 'type') { const ty = typeOf(f.cat, f.type); f.size = ty.sizes[0]; f.slab = ty.slab; }
    rerenderKeepFocus(); return;
  }
  if (d.f && t.tagName === 'SELECT') { UI.f[d.f] = t.value; if (d.live === 'price') { const el = document.getElementById('pp'); if (el) el.innerHTML = pricePreview(); } return; }
  if (d.calc === 'cat') { UI.calc.cat = t.value; UI.calc.type = CATS[t.value].types[0].id; rerenderKeepFocus(); return; }
  if (d.calc) { UI.calc[d.calc] = t.value; const o = document.getElementById('calcOut'); if (o) o.innerHTML = calcOut(); return; }
  if (d.role) { DB.role = t.value; UI.drawer = null; UI.sheet = false; commit(); return; }
  if (d.hf) { UI.hf = t.value; render(); return; }
  if (d.vreason) { UI.vsel[d.vreason] = { ...(UI.vsel[d.vreason] || {}), reason: t.value }; render(); return; }
  if (d.day) { save(); render(); return; }
});
document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) { e.preventDefault(); DB.demo = !DB.demo; UI.sheet = DB.demo; commit(); return; }
  if (e.key === 'Escape') { if (document.getElementById('tipPop') && !document.getElementById('tipPop').hidden) { hideTip(); return; } if (UI.sheet) { UI.sheet = false; render(); } else if (UI.drawer) { UI.drawer = null; render(); } return; }
  if (e.key === 'Enter') {
    const t = e.target;
    if (t.matches && t.matches('tr[data-act="open"]')) { A.open(t.dataset.v); return; }
    if (t.tagName === 'INPUT' && t.closest('.su')) { const b = [...t.closest('.su').querySelectorAll('button.btn.primary, button.btn.ghost[data-act^="verify"]')].find(x => !x.disabled && x.dataset.act); if (b) { e.preventDefault(); b.click(); } }
  }
});
window.addEventListener('hashchange', () => { UI.sheet = false; render(); });
window.addEventListener('storage', e => { if (e.key === STORE_KEY) { load(); render(); } });
window.addEventListener('scroll', hideTip, { passive: true });
window.addEventListener('resize', hideTip);
// OTP resend countdown without re-rendering the form
setInterval(() => {
  if (route()[0] !== 'signup' || DB.me.step !== 'otp') return;
  const el = document.getElementById('otpTimer'); if (!el) return;
  const left = Math.max(0, 30 - Math.floor((Date.now() - (UI.otpAt || 0)) / 1000));
  if (left > 0) el.textContent = L(`Resend OTP in ${left}s`, `${left} सेकंड में दोबारा भेजें`);
  else if (!el.querySelector('button')) el.innerHTML = `<button class="linkbtn" data-act="resendOtp">${L('Resend OTP', 'OTP दोबारा भेजें')}</button>`;
}, 1000);

load();
if (DB.me.stage === 'signup' && DB.me.step === 'otp') DB.me.step = 'mobile'; // OTP does not survive a reload
// Links such as ?demo=1&preset=launch&lang=hi#/home open the demo at a chosen state (for QR codes)
(function bootParams() {
  const q = new URLSearchParams(location.search);
  if (!q.has('preset') && !q.has('lang') && !q.has('reset') && !q.has('demo')) return;
  if (q.has('reset')) { const demo = DB.demo; resetAll(); DB.demo = demo; }
  if (q.has('demo')) DB.demo = q.get('demo') !== '0';
  if (q.get('lang') === 'hi' || q.get('lang') === 'en') DB.lang = q.get('lang');
  const p = q.get('preset');
  if (['fresh', 'review', 'live', 'fdreview', 'launch', 'grad'].includes(p)) applyPreset(p);
  save();
  try { history.replaceState(null, '', location.pathname + (location.hash || '#/')); } catch (e) { }
})();
render();
