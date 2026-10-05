'use strict';
/* =========================================================
   Supplier app (mobile first). Registration follows Meesho's
   supplier registration. Factory Direct is optional and comes
   after registration. Text is bilingual through L(en, hi).
   ========================================================= */
const L = (en, hi) => (DB.lang === 'hi' && hi ? hi : en);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const R = n => (n < 0 ? '−₹' : '₹') + Math.round(Math.abs(n)).toLocaleString('en-IN');
const pc = (x, d = 0) => (x * 100).toFixed(d) + '%';
const nf = n => Math.round(n).toLocaleString('en-IN');

/* "i" button that opens a short definition. en=true forces English (console). */
function ti(k, en) {
  const g = GLOSS[k]; if (!g) return '';
  const term = en ? g.t[0] : L(g.t[0], g.t[1]);
  return `<button type="button" class="idot" data-act="tip" data-v="${k}"${en ? ' data-en="1"' : ''} aria-label="${esc((en ? 'What is ' : L('What is ', 'क्या है: ')) + term)}">i</button>`;
}

const IC = {
  back: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
  orders: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>',
  products: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
  earnings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h11M7 9h11M7 4c5 0 7 2 7 5s-2 5-7 5h-1l8 7"/></svg>',
  help: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  cam: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
  dl: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>',
  phone: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>',
  chat: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.4A8.5 8.5 0 1 1 21 11.5z"/></svg>',
  mic: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4"/></svg>',
  lock: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
  mark: '<svg width="28" height="28" viewBox="0 0 30 30" aria-hidden="true"><rect width="30" height="30" rx="8" fill="#FF9D00"/><rect x="7" y="16" width="7" height="7" rx="1.5" fill="#580A46"/><rect x="16" y="16" width="7" height="7" rx="1.5" fill="#580A46"/><rect x="11.5" y="7" width="7" height="7" rx="1.5" fill="#9F2089"/></svg>'
};

function thumb(p, cls = '') {
  const ph = p && p.photo;
  if (ph && String(ph).startsWith('data:')) return `<img class="thumb ${cls}" src="${ph}" alt="">`;
  return `<span class="thumb ${cls} ${esc(ph || 'sw8')}" aria-hidden="true"></span>`;
}
/* Drawn stand-ins used when demo data supplies factory photos */
const SAMPLE_PH = {
  floor: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120"><rect width="160" height="120" fill="#cfc3b4"/><rect y="78" width="160" height="42" fill="#7d6d5d"/><rect x="0" y="10" width="160" height="6" fill="#b3a593"/>' + [0, 1, 2].map(i => `<g transform="translate(${10 + i * 50} 40)"><rect width="42" height="44" rx="3" fill="#56606b"/><rect x="4" y="4" width="34" height="10" fill="#8a96a3"/>${[0, 1, 2, 3].map(j => `<circle cx="${8 + j * 9}" cy="24" r="3.5" fill="${['#e0563b', '#2f5ba5', '#f2b33d', '#3a9b6f'][j]}"/>`).join('')}<rect x="4" y="32" width="34" height="3" fill="#e8e1d6"/><rect x="6" y="44" width="4" height="10" fill="#3c434a"/><rect x="32" y="44" width="4" height="10" fill="#3c434a"/></g>`).join('') + '</svg>',
  stock: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120"><rect width="160" height="120" fill="#e9e1d4"/>' + [0, 1, 2].map(r => `<rect x="8" y="${36 + r * 30}" width="144" height="4" fill="#8b6f4e"/>` + [0, 1, 2, 3, 4, 5].map(c => `<rect x="${12 + c * 23}" y="${18 + r * 30}" width="20" height="18" rx="2" fill="${['#2f5ba5', '#d7961a', '#b4533a', '#1f7a6b', '#9f2089', '#e8eef9'][(c + r) % 6]}"/><rect x="${12 + c * 23}" y="${24 + r * 30}" width="20" height="2" fill="#fff" opacity=".6"/>`).join('')).join('') + '</svg>',
  board: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120"><rect width="160" height="120" fill="#a9c4d8"/><rect y="70" width="160" height="50" fill="#b9b0a3"/><rect x="18" y="44" width="124" height="60" fill="#e6ddd0"/><rect x="26" y="22" width="108" height="26" rx="3" fill="#580a46"/><text x="80" y="39" font-family="sans-serif" font-size="10" font-weight="700" fill="#fff" text-anchor="middle">FACTORY · UNIT 1</text><rect x="66" y="70" width="28" height="34" fill="#6d5a47"/></svg>'
};
function photoEl(v, cls = 'img') {
  if (v && String(v).startsWith('data:')) return `<img class="${cls}" src="${v}" alt="">`;
  const k = String(v || '').replace('sample:', '');
  return `<img class="${cls}" src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(SAMPLE_PH[k] || SAMPLE_PH.floor)}" alt="">`;
}
function catName(c) { return c ? L(CATS[c].en, CATS[c].hi) : ''; }
function typeName(c, t) { const x = typeOf(c, t); return L(x.en, x.hi); }
function me() { return DB.me; }
function meS() { return meSeller(); }
function launchDay() { const m = me(); return m.launchStart == null ? null : DB.day - m.launchStart + 1; }
function inLaunch() { const ld = launchDay(); return me().fd.status === 'approved' && ld != null && ld >= 1 && ld <= DB.cfg.launchDays; }
function launchDone() { const ld = launchDay(); return me().fd.status === 'approved' && ld != null && ld > DB.cfg.launchDays; }
function isManufacturer() { const m = me(); return (m.gst && m.gst.nature.some(n => /Manufactur/i.test(n))) || m.makesSelf === true; }

/* ---------- Shell ---------- */
function shell(inner, o = {}) {
  const nav = o.nav ? bottomNav(o.nav) : '';
  const bar = o.bar === false ? '' : appBar(o);
  return `<div class="s-wrap"><div class="s-app">
    ${bar}
    <main class="s-main ${o.nav ? 'has-nav' : ''}" id="smain">${inner}</main>
    ${nav}
  </div></div>`;
}
function langToggle() {
  return `<span class="lang" role="group" aria-label="Language"><button data-act="lang" data-v="en" aria-pressed="${DB.lang === 'en'}">EN</button><button data-act="lang" data-v="hi" aria-pressed="${DB.lang === 'hi'}">हिं</button></span>`;
}
function appBar(o) {
  const back = o.back ? `<button class="iconbtn" data-act="${o.backAct || 'nav'}" data-v="${esc(o.back)}" aria-label="${L('Back', 'पीछे')}">${IC.back}</button>` : '';
  const title = o.title ? `<div class="ttl">${o.title}${o.sub ? `<small>${o.sub}</small>` : ''}</div>` : `<div class="ttl"><span class="logo">${IC.mark}<span>Meesho <small>${L('Supplier', 'सप्लायर')}</small></span></span></div>`;
  return `<header class="appbar ${o.dark ? 'dark' : ''}">${back}${title}${langToggle()}</header>`;
}
function bottomNav(cur) {
  const pend = pendingCount();
  const it = (k, en, hi) => `<button data-act="nav" data-v="#/${k}" aria-current="${cur === k}">${IC[k]}${L(en, hi)}${k === 'orders' && pend ? `<span class="dotn">${pend}</span>` : ''}</button>`;
  return `<nav class="bnav" aria-label="${L('App sections', 'ऐप सेक्शन')}">${it('home', 'Home', 'होम')}${it('orders', 'Orders', 'ऑर्डर')}${it('products', 'Catalog', 'कैटलॉग')}${it('earnings', 'Earnings', 'कमाई')}${it('help', 'Help', 'मदद')}</nav>`;
}
function pendingCount() {
  if (me().stage !== 'live' || !me().products.length) return 0;
  const s = meS(); let n = 0;
  s.products.forEach(p => simProduct(s, p).orders.forEach(o => { if (orderStatus(o, DB.day, me().rts) === 'pending') n++; }));
  return n;
}

/* ============ LANDING ============ */
function scrLanding() {
  const m = me();
  let cta = `<button class="btn primary block" data-act="startSignup">${L('Start selling', 'बेचना शुरू करें')}</button>`;
  let resume = `<div class="resume">${L('Documents needed: GSTIN or PAN, and a bank account.', 'ज़रूरी दस्तावेज़: GSTIN या PAN, और बैंक खाता।')}</div>`;
  if (m.stage === 'signup') {
    const idx = Math.max(1, stepIndex(m.step));
    cta = `<button class="btn primary block" data-act="nav" data-v="#/signup">${L('Continue registration', 'रजिस्ट्रेशन जारी रखें')} · ${L('step', 'चरण')} ${idx} ${L('of', '/')} 5</button>`;
    resume = `<div class="resume"><button class="linkbtn" style="color:#fff" data-act="restartSignup">${L('Start a new registration', 'नया रजिस्ट्रेशन शुरू करें')}</button></div>`;
  } else if (m.stage === 'review' || m.stage === 'live') {
    cta = `<button class="btn primary block" data-act="nav" data-v="#/home">${L('Go to my account', 'मेरे अकाउंट पर जाएँ')}</button>`; resume = '';
  }
  return shell(`
  <section class="hero">
    <h1>${L('Sell online to crores of customers across India', 'पूरे भारत के करोड़ों ग्राहकों को ऑनलाइन बेचें')}</h1>
    <p>${L('0% commission. Payment 7 days after delivery. Register in 5 minutes.', '0% कमीशन। डिलीवरी के 7 दिन बाद पेमेंट। 5 मिनट में रजिस्टर करें।')}</p>
    ${cta}${resume}
  </section>
  <div class="pad">
    <div class="benefits">
      <div class="benefit"><div class="bv">0%</div><div class="bl">${L('Commission', 'कमीशन')}</div></div>
      <div class="benefit"><div class="bv">${L('7-day', '7 दिन')}</div><div class="bl">${L('Payments, including cash on delivery', 'में पेमेंट, कैश ऑन डिलीवरी सहित')}</div></div>
      <div class="benefit"><div class="bv">${L('Zero', 'शून्य')}</div><div class="bl">${L('Penalty on cancellations', 'रद्द ऑर्डर पर जुर्माना')}</div></div>
      <div class="benefit"><div class="bv">28,000+</div><div class="bl">${L('Pincodes served', 'पिनकोड तक डिलीवरी')}</div></div>
    </div>

    <div class="fdband mt16">
      <span class="chip fd">Factory Direct</span>
      <h2>${L('Manufacture your own products? Join Factory Direct.', 'अपने प्रोडक्ट खुद बनाते हैं? फैक्ट्री डायरेक्ट से जुड़ें।')}</h2>
      <ul class="ticks">
        <li><span class="ck">✓</span><span>${L(`<b>${DB.cfg.launchDays}-day launch period</b> with extra visibility for your products`, `आपके प्रोडक्ट के लिए ज़्यादा पहुँच के साथ <b>${DB.cfg.launchDays} दिन की लॉन्च अवधि</b>`)} ${ti('launch')}</span></li>
        <li><span class="ck">✓</span><span>${L('<b>Factory Direct tag</b> on products priced below the benchmark', 'बेंचमार्क से कम कीमत वाले प्रोडक्ट पर <b>फैक्ट्री डायरेक्ट टैग</b>')} ${ti('fdprice')}</span></li>
        <li><span class="ck">✓</span><span>${L('<b>Daily views, orders and earnings</b> for every product', 'हर प्रोडक्ट के <b>रोज़ के व्यू, ऑर्डर और कमाई</b>')}</span></li>
        <li><span class="ck">✓</span><span>${L('<b>Dedicated account manager</b> during the launch period', 'लॉन्च अवधि में <b>समर्पित अकाउंट मैनेजर</b>')}</span></li>
      </ul>
      <p class="hint">${L('Register as a supplier, then apply for Factory Direct in 3 steps.', 'सप्लायर रजिस्ट्रेशन करें, फिर 3 चरणों में फैक्ट्री डायरेक्ट के लिए आवेदन करें।')}</p>
    </div>

    <div class="card">
      <h3>${L('Estimate your earnings', 'अपनी कमाई का अनुमान लगाएँ')}</h3>
      ${calcForm()}
      <div id="calcOut">${calcOut()}</div>
    </div>

    <div class="card">
      <h3>${L('Registration steps', 'रजिस्ट्रेशन के चरण')}</h3>
      <ol class="howsteps">
        <li><span><b>${L('Mobile number and email', 'मोबाइल नंबर और ईमेल')}</b></span></li>
        <li><span><b>${L('GSTIN or Enrolment ID', 'GSTIN या एनरोलमेंट ID')}</b> ${ti('eid')}</span></li>
        <li><span><b>${L('Pickup address', 'पिकअप पता')}</b></span></li>
        <li><span><b>${L('Bank details', 'बैंक की जानकारी')}</b></span></li>
        <li><span><b>${L('Store details', 'स्टोर की जानकारी')}</b></span></li>
      </ol>
    </div>
  </div>
  <div class="footer">© Meesho · ${L('Supplier Terms of Use', 'सप्लायर उपयोग की शर्तें')} · ${L('Privacy Policy', 'गोपनीयता नीति')}</div>`, { bar: true });
}
function calcForm() {
  const f = UI.calc;
  const types = CATS[f.cat].types;
  return `<div class="field"><label for="c_cat">${L('Category', 'कैटेगरी')}</label><select id="c_cat" class="input" data-calc="cat">${Object.keys(CATS).map(k => `<option value="${k}" ${f.cat === k ? 'selected' : ''}>${catName(k)}</option>`).join('')}</select></div>
    <div class="field"><label for="c_type">${L('Product type', 'प्रोडक्ट का प्रकार')}</label><select id="c_type" class="input" data-calc="type">${types.map(t => `<option value="${t.id}" ${f.type === t.id ? 'selected' : ''}>${L(t.en, t.hi)}</option>`).join('')}</select></div>
    <div class="row" style="gap:10px;align-items:flex-start">
      <div class="field grow"><label for="c_price">${L('Selling price', 'बिक्री कीमत')}</label><div class="prefix"><span>₹</span><input id="c_price" class="input" inputmode="numeric" data-calc="price" value="${esc(f.price)}"></div></div>
      <div class="field grow"><label for="c_cost">${L('Cost to make & pack', 'बनाने और पैक की लागत')} <span class="opt">${L('(optional)', '(वैकल्पिक)')}</span></label><div class="prefix"><span>₹</span><input id="c_cost" class="input" inputmode="numeric" data-calc="cost" value="${esc(f.cost)}"></div></div>
    </div>`;
}
function calcOut() {
  const f = UI.calc, t = typeOf(f.cat, f.type), price = +f.price || 0, cost = +f.cost || 0, fe = fee(t.slab);
  const [lo, hi] = similarBand(f.cat, f.type, 1), tgt = fdTarget(f.cat, f.type, 1);
  if (price <= 0) return `<p class="errtxt">${L('Enter a selling price.', 'बिक्री कीमत डालें।')}</p>`;
  const net = price - fe, prof = net - cost;
  return `<div class="calcout num">
    <div class="lrow"><span class="l">${L('Selling price', 'बिक्री कीमत')}</span><span class="v">${R(price)}</span></div>
    <div class="lrow"><span class="l">${L('Commission', 'कमीशन')}</span><span class="v">₹0</span></div>
    <div class="lrow"><span class="l">${L('Shipping charge', 'शिपिंग शुल्क')} ${ti('shipping')}<small>${L(SLABS.find(s => s.id === t.slab).en, SLABS.find(s => s.id === t.slab).hi)}</small></span><span class="v">−${R(fe)}</span></div>
    <div class="lrow ${cost ? '' : 'total'}"><span class="l">${L('Payout per order', 'प्रति ऑर्डर भुगतान')} ${ti('payout')}</span><span class="v">${R(net)}</span></div>
    ${cost ? `<div class="lrow total ${prof < 0 ? 'neg' : ''}"><span class="l">${L('Profit per order', 'प्रति ऑर्डर मुनाफ़ा')}</span><span class="v">${R(prof)}</span></div>` : ''}
    <div class="lrow"><span class="l">${L('Benchmark price', 'बेंचमार्क कीमत')} ${ti('benchmark')}</span><span class="v">${R(lo)} – ${R(hi)}</span></div>
    <div class="lrow"><span class="l">${L('Factory Direct price', 'फैक्ट्री डायरेक्ट कीमत')} ${ti('fdprice')}</span><span class="v">${R(tgt)} ${L('or less', 'या कम')}</span></div>
  </div>`;
}

/* ============ REGISTRATION ============ */
function stepIndex(step) { return { mobile: 1, otp: 1, email: 1, gst: 2, address: 3, bank: 4, store: 5, review: 5 }[step] || 1; }
function suPrev(step) { return { otp: 'mobile', email: 'mobile', gst: 'email', address: 'gst', bank: 'address', store: 'bank', review: 'store' }[step]; }
function scrSignup() {
  const m = me();
  if (m.stage === 'review' || m.stage === 'live') { location.hash = '#/home'; return ''; }
  if (m.stage === 'none') { m.stage = 'signup'; m.step = 'mobile'; m.stepSince = DB.day; save(); }
  const step = m.step;
  initForm(step);
  const idx = stepIndex(step);
  const names = [L('Account', 'अकाउंट'), L('Tax details', 'टैक्स जानकारी'), L('Pickup address', 'पिकअप पता'), L('Bank details', 'बैंक जानकारी'), L('Store details', 'स्टोर जानकारी')];
  const body = { mobile: suMobile, otp: suMobile, email: suEmail, gst: suGst, address: suAddress, bank: suBank, store: suStore, review: suReview }[step]();
  const back = suPrev(step);
  return shell(`<div class="stepbar">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= idx ? 'on' : ''}"></i>`).join('')}</div>
    <div class="stepname">${L('Step', 'चरण')} ${idx} ${L('of', '/')} 5 · ${names[idx - 1]}</div>
    <div class="pad su">${body}</div>`, { back: back ? back : '#/', backAct: back ? 'suBack' : 'nav', title: L('Supplier registration', 'सप्लायर रजिस्ट्रेशन') });
}
function initForm(key) {
  if (UI.formKey === key) return;
  UI.formKey = key; UI.err = {}; const m = me();
  const f = UI.f = {};
  if (key === 'mobile' || key === 'otp') { f.mobile = m.mobile; f.otp = ''; }
  if (key === 'email') { f.email = m.email; f.pw = ''; }
  if (key === 'gst') { f.gstMode = m.gstMode; f.gstin = m.gstin; f.pan = m.pan; f.panName = m.panName; f.eidState = m.eidState; f.makesSelf = m.makesSelf; UI.gstRes = m.gst ? m.gst : null; UI.eidRes = m.eid || null; }
  if (key === 'address') {
    const a = m.addr || (m.gst ? { ...m.gst.addr, line3: '' } : { line1: '', line2: '', line3: '', city: '', pin: '' });
    Object.assign(f, { line1: a.line1, line2: a.line2, line3: a.line3 || '', city: a.city, pin: a.pin });
  }
  if (key === 'bank') { const b = m.bank || {}; Object.assign(f, { acc: b.acc || '', acc2: b.acc || '', ifsc: b.ifsc || '' }); UI.bankRes = b.verified ? { ok: true, holder: b.holder } : null; }
  if (key === 'store') { f.store = m.store || (m.gst ? m.gst.trade : ''); f.name = m.name || (m.gst && m.gst.type === 'Proprietorship' ? m.gst.legal : m.panName || ''); }
  if (key === 'review') { f.agree = m.agree; }
}
function errOf(k) { return UI.err[k] ? `<p class="errtxt" role="alert">${UI.err[k]}</p>` : ''; }
function suMobile() {
  const m = me(), f = UI.f;
  if (m.step === 'mobile') {
    return `<h2>${L('Enter your mobile number', 'अपना मोबाइल नंबर डालें')}</h2>
      <p class="lead">${L('This number will be used to log in to your supplier account.', 'इसी नंबर से आप अपने सप्लायर अकाउंट में लॉगिन करेंगे।')}</p>
      <div class="field"><label for="f_mobile">${L('Mobile number', 'मोबाइल नंबर')}</label>
        <div class="prefix ${UI.err.mobile ? 'err' : ''}"><span>+91</span><input id="f_mobile" class="input" type="tel" inputmode="numeric" maxlength="10" autocomplete="tel-national" data-f="mobile" value="${esc(f.mobile)}"></div>
        ${errOf('mobile')}</div>
      <button class="btn primary block" data-act="sendOtp">${L('Send OTP', 'OTP भेजें')}</button>`;
  }
  const left = Math.max(0, 30 - Math.floor((Date.now() - (UI.otpAt || 0)) / 1000));
  const locked = (UI.otpTries || 0) >= 3;
  return `<h2>${L('Verify your mobile number', 'मोबाइल नंबर वेरिफ़ाई करें')}</h2>
    <p class="lead">${L('Enter the 6-digit OTP sent to', '6 अंकों का OTP डालें जो भेजा गया')} +91 ${esc(m.mobile.slice(0, 5))} ${esc(m.mobile.slice(5))} · <button class="linkbtn" data-act="suBack" data-v="mobile">${L('Change', 'बदलें')}</button></p>
    <div class="field"><label for="f_otp">OTP</label>
      <input id="f_otp" class="input otp ${UI.err.otp ? 'err' : ''}" inputmode="numeric" autocomplete="one-time-code" maxlength="6" data-f="otp" value="${esc(f.otp)}" ${locked ? 'disabled' : ''}>
      ${UI.otpAuto && f.otp ? `<p class="oktxt">✓ ${L('Auto-filled from SMS', 'SMS से अपने आप भरा गया')}</p>` : ''}
      ${errOf('otp')}</div>
    <button class="btn primary block" data-act="verifyOtp" ${locked ? 'disabled' : ''}>${L('Verify', 'वेरिफ़ाई करें')}</button>
    <p class="hint center mt12" id="otpTimer">${left > 0 ? L(`Resend OTP in ${left}s`, `${left} सेकंड में दोबारा भेजें`) : `<button class="linkbtn" data-act="resendOtp">${L('Resend OTP', 'OTP दोबारा भेजें')}</button>`}</p>`;
}
function suEmail() {
  const f = UI.f, set = me().pwSet;
  return `<h2>${L('Create your account', 'अपना अकाउंट बनाएँ')}</h2>
    <p class="lead">${L('Order and payment updates are also sent to this email.', 'ऑर्डर और पेमेंट की जानकारी इस ईमेल पर भी भेजी जाती है।')}</p>
    <div class="field"><label for="f_email">${L('Business email', 'बिज़नेस ईमेल')}</label><input id="f_email" class="input ${UI.err.email ? 'err' : ''}" type="email" autocomplete="email" data-f="email" value="${esc(f.email)}">${errOf('email')}</div>
    <div class="field"><label for="f_pw">${L('Password', 'पासवर्ड')}</label><input id="f_pw" class="input ${UI.err.pw ? 'err' : ''}" type="password" autocomplete="new-password" data-f="pw" value="${esc(f.pw)}" placeholder="${set ? '••••••••' : ''}">${errOf('pw') || `<p class="hint">${L('At least 8 characters, with a letter and a number.', 'कम से कम 8 अक्षर, जिसमें एक अक्षर और एक अंक हो।')}</p>`}</div>
    <button class="btn primary block" data-act="suEmail">${L('Continue', 'आगे बढ़ें')}</button>`;
}
function suGst() {
  const f = UI.f;
  const q = `<h2>${L('Do you have a GSTIN?', 'क्या आपके पास GSTIN है?')} ${ti('gstin')}</h2>
    <div class="choice two mb12 mt12">
      <button class="opt-card" data-act="gstMode" data-v="gst" aria-pressed="${f.gstMode === 'gst'}"><span class="tickbox">${f.gstMode === 'gst' ? '✓' : ''}</span><span><b>${L('Yes', 'हाँ')}</b><small>${L('Enter GSTIN', 'GSTIN डालें')}</small></span></button>
      <button class="opt-card" data-act="gstMode" data-v="eid" aria-pressed="${f.gstMode === 'eid'}"><span class="tickbox">${f.gstMode === 'eid' ? '✓' : ''}</span><span><b>${L('No', 'नहीं')}</b><small>${L('Get Enrolment ID', 'एनरोलमेंट ID बनाएँ')}</small></span></button>
    </div>`;
  if (f.gstMode === 'gst') {
    const r = UI.gstRes;
    let res = '';
    if (r === 'loading') res = `<div class="note plain"><span class="spin"></span><span>${L('Verifying with the GST portal…', 'GST पोर्टल से वेरिफ़ाई हो रहा है…')}</span></div>`;
    else if (r && r.status === 'Cancelled') res = `<div class="note no"><span class="ni">!</span><span><b>${L('This GSTIN is cancelled.', 'यह GSTIN रद्द है।')}</b><br>${L('Enter an active GSTIN, or select "No" to register with an Enrolment ID.', 'सक्रिय GSTIN डालें, या "नहीं" चुनकर एनरोलमेंट ID से रजिस्टर करें।')}</span></div>`;
    else if (r && r.legal) {
      res = `<div class="verified"><div class="vh">✓ ${L('GSTIN verified', 'GSTIN वेरिफ़ाई हुआ')}</div>
        <dl class="kv"><dt>${L('Legal name', 'कानूनी नाम')}</dt><dd>${esc(r.legal)}</dd><dt>${L('Trade name', 'व्यापार नाम')}</dt><dd>${esc(r.trade)}</dd><dt>${L('Constitution', 'संरचना')}</dt><dd>${esc(r.type)}</dd><dt>${L('State', 'राज्य')}</dt><dd>${esc(r.state)}</dd><dt>${L('Nature of business', 'व्यवसाय की प्रकृति')} ${ti('nature')}</dt><dd>${r.nature.map(esc).join(', ')}</dd></dl>
      </div>`;
    }
    return q + `<div class="field"><label for="f_gstin">GSTIN</label>
      <div class="row"><input id="f_gstin" class="input grow ${UI.err.gstin ? 'err' : ''}" maxlength="15" autocapitalize="characters" autocomplete="off" spellcheck="false" data-f="gstin" data-upper="1" value="${esc(f.gstin)}"><button class="btn ghost sm" data-act="verifyGst" style="min-height:48px">${L('Verify', 'वेरिफ़ाई')}</button></div>
      ${errOf('gstin')}</div>
      ${res}
      <button class="btn primary block mt16" data-act="suGst" ${r && r.legal && r.status === 'Active' ? '' : 'disabled'}>${L('Continue', 'आगे बढ़ें')}</button>`;
  }
  if (f.gstMode === 'eid') {
    const e = UI.eidRes;
    return q + `<div class="note info mb12"><span class="ni">i</span><span>${L('With an Enrolment ID, orders are delivered only within your registered state.', 'एनरोलमेंट ID के साथ ऑर्डर सिर्फ़ आपके रजिस्टर्ड राज्य में डिलीवर होते हैं।')}</span></div>
      <div class="field"><label for="f_pan">${L('PAN', 'PAN')}</label><input id="f_pan" class="input ${UI.err.pan ? 'err' : ''}" maxlength="10" autocapitalize="characters" spellcheck="false" data-f="pan" data-upper="1" value="${esc(f.pan)}" ${e ? 'readonly' : ''}>${errOf('pan')}</div>
      <div class="field"><label for="f_panName">${L('Name as on PAN', 'PAN पर लिखा नाम')}</label><input id="f_panName" class="input ${UI.err.panName ? 'err' : ''}" data-f="panName" value="${esc(f.panName)}" ${e ? 'readonly' : ''}>${errOf('panName')}</div>
      <div class="field"><label for="f_eidState">${L('State', 'राज्य')}</label><select id="f_eidState" class="input ${UI.err.eidState ? 'err' : ''}" data-f="eidState" ${e ? 'disabled' : ''}><option value="">${L('Select state', 'राज्य चुनें')}</option>${STATE_LIST.map(s => `<option ${f.eidState === s ? 'selected' : ''}>${s}</option>`).join('')}</select>${errOf('eidState')}</div>
      ${e === 'loading' ? `<div class="note plain"><span class="spin"></span><span>${L('Generating Enrolment ID…', 'एनरोलमेंट ID बन रही है…')}</span></div>` : e ? `<div class="verified"><div class="vh">✓ ${L('Enrolment ID generated', 'एनरोलमेंट ID बन गई')}</div><dl class="kv"><dt>${L('Enrolment ID', 'एनरोलमेंट ID')}</dt><dd>${esc(e)}</dd></dl></div>
        <div class="card mt12"><h4>${L('Do you manufacture the products you sell?', 'क्या आप अपने बेचे जाने वाले प्रोडक्ट खुद बनाते हैं?')}</h4>
        <div class="choice two mt8"><button class="opt-card" data-act="makesSelf" data-v="yes" aria-pressed="${f.makesSelf === true}"><span class="tickbox">${f.makesSelf === true ? '✓' : ''}</span><b>${L('Yes', 'हाँ')}</b></button><button class="opt-card" data-act="makesSelf" data-v="no" aria-pressed="${f.makesSelf === false}"><span class="tickbox">${f.makesSelf === false ? '✓' : ''}</span><b>${L('No', 'नहीं')}</b></button></div></div>
        <button class="btn primary block mt12" data-act="suEid">${L('Continue', 'आगे बढ़ें')}</button>`
      : `<button class="btn primary block" data-act="makeEid">${L('Generate Enrolment ID', 'एनरोलमेंट ID बनाएँ')}</button>`}`;
  }
  return q;
}
function regState() { const m = me(); return m.gst ? m.gst.state : m.eidState; }
function suAddress() {
  const f = UI.f, st = regState();
  const pinOk = V.pin(f.pin) && (!pinStates(f.pin) || pinStates(f.pin).includes(st));
  return `<h2>${L('Pickup address', 'पिकअप पता')} ${ti('pickup')}</h2>
    <p class="lead">${me().gst ? L('Pre-filled from your GST registration. Edit if orders should be picked up from another address in the same state.', 'आपके GST रजिस्ट्रेशन से भरा गया। अगर उसी राज्य के किसी दूसरे पते से पिकअप होना है तो बदलें।') : L('Orders will be picked up from this address.', 'ऑर्डर इसी पते से पिकअप होंगे।')}</p>
    <div class="field"><label for="a1">${L('Building, plot or shop number', 'बिल्डिंग, प्लॉट या दुकान नंबर')}</label><input id="a1" class="input ${UI.err.line1 ? 'err' : ''}" data-f="line1" value="${esc(f.line1)}" autocomplete="address-line1">${errOf('line1')}</div>
    <div class="field"><label for="a2">${L('Street and area', 'गली और इलाका')}</label><input id="a2" class="input ${UI.err.line2 ? 'err' : ''}" data-f="line2" value="${esc(f.line2)}" autocomplete="address-line2">${errOf('line2')}</div>
    <div class="field"><label for="a3">${L('Landmark', 'लैंडमार्क')} <span class="opt">${L('(optional)', '(वैकल्पिक)')}</span></label><input id="a3" class="input" data-f="line3" value="${esc(f.line3)}"></div>
    <div class="row" style="gap:10px;align-items:flex-start">
      <div class="field grow"><label for="a4">${L('Pincode', 'पिनकोड')}</label><input id="a4" class="input ${UI.err.pin ? 'err' : ''}" inputmode="numeric" maxlength="6" data-f="pin" data-live="pin" value="${esc(f.pin)}" autocomplete="postal-code"></div>
      <div class="field grow"><label for="a5">${L('City', 'शहर')}</label><input id="a5" class="input ${UI.err.city ? 'err' : ''}" data-f="city" value="${esc(f.city)}" autocomplete="address-level2"></div>
    </div>
    <div id="pinMsg">${UI.err.pin ? errOf('pin') : pinOk ? `<p class="oktxt">✓ ${L('Pickup available at this pincode', 'इस पिनकोड पर पिकअप उपलब्ध है')}</p>` : ''}</div>
    <div class="field mt12"><label for="a6">${L('State', 'राज्य')}</label><input id="a6" class="input locked" value="${esc(st)}" readonly></div>
    <button class="btn primary block" data-act="suAddress">${L('Continue', 'आगे बढ़ें')}</button>`;
}
function bankName() { const m = me(); return (m.gst && m.gst.legal) || m.panName; }
function suBank() {
  const f = UI.f, r = UI.bankRes;
  const info = V.ifsc(f.ifsc) ? ifscLookup(f.ifsc) : null;
  let res = '';
  if (r === 'loading') res = `<div class="note plain"><span class="spin"></span><span>${L('Verifying bank account…', 'बैंक खाता वेरिफ़ाई हो रहा है…')}</span></div>`;
  else if (r && r.ok) res = `<div class="verified"><div class="vh">✓ ${L('Bank account verified', 'बैंक खाता वेरिफ़ाई हुआ')}</div><dl class="kv"><dt>${L('Account holder', 'खाताधारक')}</dt><dd>${esc(r.holder)}</dd><dt>${L('Bank', 'बैंक')}</dt><dd>${esc(info ? info.bank : '')}</dd></dl></div>`;
  else if (r && !r.ok) res = `<div class="note no"><span class="ni">!</span><span><b>${L('Account holder name does not match', 'खाताधारक का नाम मेल नहीं खाता')}</b><br>${L(`The account is registered to "${esc(r.holder)}". Add an account in the name of "${esc(bankName())}".`, `यह खाता "${esc(r.holder)}" के नाम पर है। "${esc(bankName())}" के नाम वाला खाता डालें।`)}</span></div>`;
  return `<h2>${L('Bank details', 'बैंक की जानकारी')}</h2>
    <p class="lead">${L('Payments for your orders are credited to this account.', 'आपके ऑर्डर का पेमेंट इसी खाते में आता है।')}</p>
    <div class="field"><label for="b1">${L('Account number', 'खाता नंबर')}</label><input id="b1" class="input ${UI.err.acc ? 'err' : ''}" inputmode="numeric" maxlength="18" autocomplete="off" data-f="acc" data-bank="1" value="${esc(f.acc)}">${errOf('acc')}</div>
    <div class="field"><label for="b2">${L('Confirm account number', 'खाता नंबर की पुष्टि करें')}</label><input id="b2" class="input ${UI.err.acc2 ? 'err' : ''}" inputmode="numeric" maxlength="18" autocomplete="off" data-f="acc2" data-bank="1" value="${esc(f.acc2)}">${errOf('acc2')}</div>
    <div class="field"><label for="b3">IFSC ${ti('ifsc')}</label><input id="b3" class="input ${UI.err.ifsc ? 'err' : ''}" maxlength="11" autocapitalize="characters" spellcheck="false" data-f="ifsc" data-upper="1" data-live="ifsc" data-bank="1" value="${esc(f.ifsc)}">
      <div id="ifscInfo">${UI.err.ifsc ? errOf('ifsc') : info ? `<p class="oktxt">✓ ${esc(info.bank)}, ${esc(info.branch)}</p>` : ''}</div></div>
    <p class="hint">${L('Account holder name must match', 'खाताधारक का नाम मेल खाना चाहिए')}: <b>${esc(bankName())}</b></p>
    ${res}
    ${r && r.ok ? `<button class="btn primary block mt16" data-act="suBank">${L('Continue', 'आगे बढ़ें')}</button>` : `<button class="btn primary block mt16" data-act="verifyBank" ${r === 'loading' ? 'disabled' : ''}>${L('Verify bank account', 'बैंक खाता वेरिफ़ाई करें')}</button><p class="hint center mt8">${L('Verified by a ₹1 deposit', '₹1 जमा करके वेरिफ़ाई होता है')} ${ti('bankcheck')}</p>`}`;
}
function suStore() {
  const f = UI.f;
  return `<h2>${L('Store details', 'स्टोर की जानकारी')}</h2>
    <p class="lead">${L('Customers see your store name on all your products.', 'ग्राहक आपके सभी प्रोडक्ट पर स्टोर का नाम देखते हैं।')}</p>
    <div class="field"><label for="s1">${L('Store name', 'स्टोर का नाम')}</label><input id="s1" class="input ${UI.err.store ? 'err' : ''}" maxlength="40" data-f="store" value="${esc(f.store)}">${UI.storeChecking ? `<p class="hint"><span class="spin" style="width:12px;height:12px;vertical-align:-2px"></span> ${L('Checking availability…', 'उपलब्धता जाँची जा रही है…')}</p>` : errOf('store')}</div>
    <div class="field"><label for="s2">${L('Your full name', 'आपका पूरा नाम')}</label><input id="s2" class="input ${UI.err.name ? 'err' : ''}" data-f="name" value="${esc(f.name)}" autocomplete="name">${errOf('name')}</div>
    <button class="btn primary block" data-act="suStore" ${UI.storeChecking ? 'disabled' : ''}>${L('Continue', 'आगे बढ़ें')}</button>`;
}
function suReview() {
  const m = me(), f = UI.f;
  const sec = (title, step, body) => `<div class="review-sec"><div class="rh"><b>${title}</b><button class="linkbtn" data-act="suGoto" data-v="${step}">${L('Edit', 'बदलें')}</button></div>${body}</div>`;
  const a = m.addr || {};
  return `<h2>${L('Review and submit', 'जाँचें और जमा करें')}</h2>
    <div class="card mt12">
      ${sec(L('Account', 'अकाउंट'), 'mobile', `<p>+91 ${esc(m.mobile)}</p><p class="small muted">${esc(m.email)}</p>`)}
      ${sec(m.gstMode === 'gst' ? 'GSTIN' : L('Enrolment ID', 'एनरोलमेंट ID'), 'gst', m.gstMode === 'gst' ? `<p>${esc(m.gstin)}</p><p class="small muted">${esc(m.gst.legal)} · ${esc(m.gst.state)}</p>` : `<p>${esc(m.eid)}</p><p class="small muted">PAN ${esc(m.pan)} · ${esc(m.eidState)}</p>`)}
      ${sec(L('Pickup address', 'पिकअप पता'), 'address', `<p>${esc([a.line1, a.line2, a.line3].filter(Boolean).join(', '))}</p><p class="small muted">${esc(a.city)} ${esc(a.pin)}, ${esc(regState())}</p>`)}
      ${sec(L('Bank', 'बैंक'), 'bank', `<p>${esc(m.bank.bankName)} ····${esc(m.bank.acc.slice(-4))}</p><p class="small muted">${esc(m.bank.holder)} · IFSC ${esc(m.bank.ifsc)}</p>`)}
      ${sec(L('Store', 'स्टोर'), 'store', `<p>${esc(m.store)}</p><p class="small muted">${esc(m.name)}</p>`)}
    </div>
    <label class="check mb12"><input type="checkbox" data-f="agree" ${f.agree ? 'checked' : ''}><span>${L('I agree to the Supplier Terms of Use and confirm that these details are correct.', 'मैं सप्लायर उपयोग की शर्तों से सहमत हूँ और पुष्टि करता हूँ कि यह जानकारी सही है।')}</span></label>
    ${errOf('agree')}
    <button class="btn primary block" data-act="suSubmit">${L('Submit', 'जमा करें')}</button>`;
}

/* ============ HOME ============ */
function scrHome() {
  const m = me();
  if (m.stage === 'none' || m.stage === 'signup') { location.hash = m.stage === 'signup' ? '#/signup' : '#/'; return ''; }
  const first = (m.name || m.store || '').split(' ')[0];
  let head = `<div class="hhead"><h2>${L('Namaste', 'नमस्ते')}${first ? ', ' + esc(first) : ''}</h2><div class="sub">${esc(m.store)}${m.fd.status === 'approved' ? ' · <span class="chip fd" style="vertical-align:1px">Factory Direct</span>' : ''}</div>`;
  if (inLaunch()) {
    const ld = launchDay(), s = meS(), mm = sellerMetrics(s, m.launchStart, DB.day);
    const lp = mm.sk.filter(x => x.p.launch);
    const avgV = lp.length ? Math.round(lp.reduce((a, x) => a + x.views, 0) / lp.length) : 0;
    head += `<div class="launchbar"><div class="row between"><span>${L('Launch period', 'लॉन्च अवधि')} · ${L('day', 'दिन')} ${ld}/${DB.cfg.launchDays}</span><span class="num">${nf(avgV)} / ${nf(DB.cfg.viewsTarget)} ${L('views', 'व्यू')}</span></div><div class="pbar"><i style="width:${Math.min(100, ld / DB.cfg.launchDays * 100)}%"></i></div></div>`;
  } else if (launchDone()) head += `<span class="chip good">✓ ${L('Launch period completed', 'लॉन्च अवधि पूरी')}</span>`;
  head += '</div>';
  const body = m.stage === 'review' ? homeReview() : homeLive();
  return shell(head + `<div class="pad">${body}</div>`, { nav: 'home', dark: true });
}
function notesBlock(n = 3) {
  const ns = me().notes.slice(0, n);
  if (!ns.length) return '';
  return `<div class="sect">${L('Notifications', 'सूचनाएँ')}</div><div class="notes">${ns.map(x => `<div class="notice ${x.read ? '' : 'new'}"><span>${x.kind === 'good' ? '✅' : x.kind === 'warn' ? '⚠️' : '🔔'}</span><span>${esc(L(x.en, x.hi))}<small>${dayDate(x.day)}</small></span></div>`).join('')}</div>`;
}
function homeReview() {
  const m = me();
  return `<div class="card"><h3>${L('Verifying your details', 'आपकी जानकारी वेरिफ़ाई हो रही है')}</h3>
      <ul class="timeline mt12">
        <li class="done"><span class="dot">✓</span><span><b>${L('Registration submitted', 'रजिस्ट्रेशन जमा हुआ')}</b><small>${dayDate(m.submittedDay ?? DB.day)}</small></span></li>
        <li class="now"><span class="dot"><span class="spin" style="width:12px;height:12px"></span></span><span><b>${L('GST, bank and address checks', 'GST, बैंक और पते की जाँच')}</b><small>${L('This usually takes a few minutes.', 'आमतौर पर कुछ मिनट लगते हैं।')}</small></span></li>
        <li><span class="dot">3</span><span><b>${L('Account live', 'अकाउंट चालू')}</b><small>${L('Add products and start receiving orders', 'प्रोडक्ट जोड़ें और ऑर्डर पाना शुरू करें')}</small></span></li>
      </ul></div>
    ${fdActionCard(true)}
    ${notesBlock()}`;
}
function fdActionCard(inReview) {
  const m = me(), st = m.fd.status;
  if (st === 'approved' || st === 'rejected') return '';
  if (st === 'review' || st === 'checking') return `<button class="action fd" data-act="nav" data-v="#/fd"><span class="ai">🏭</span><span><b>${L('Factory Direct application under review', 'फैक्ट्री डायरेक्ट आवेदन समीक्षा में')}</b><small>${st === 'checking' ? L('Running automated checks…', 'ऑटोमैटिक जाँच चल रही है…') : L('Our team will respond within 2 working days.', 'हमारी टीम 2 कामकाजी दिन में जवाब देगी।')}</small></span><span class="go">›</span></button>`;
  if (st === 'info') return `<button class="action urgent" data-act="nav" data-v="#/fd"><span class="ai">📷</span><span><b>${L('Action required: Factory Direct application', 'कार्रवाई ज़रूरी: फैक्ट्री डायरेक्ट आवेदन')}</b><small>${esc(L(m.fd.reason?.en || '', m.fd.reason?.hi))}</small></span><span class="go">›</span></button>`;
  if (!isManufacturer() && m.makesSelf !== null) return '';
  const done = st === 'draft' ? m.fd.step - 1 : 0;
  return `<button class="action fd" data-act="nav" data-v="#/fd"><span class="ai">🏭</span><span><b>${isManufacturer() ? L('You are eligible to apply for Factory Direct', 'आप फैक्ट्री डायरेक्ट के लिए आवेदन कर सकते हैं') : L('Manufacture your own products?', 'अपने प्रोडक्ट खुद बनाते हैं?')}</b><small>${L(`Get a ${DB.cfg.launchDays}-day launch period with extra visibility. 3 steps${done ? `, ${done} completed` : ''}.`, `ज़्यादा पहुँच के साथ ${DB.cfg.launchDays} दिन की लॉन्च अवधि पाएँ। 3 चरण${done ? `, ${done} पूरे` : ''}।`)}</small></span><span class="go">›</span></button>`;
}
function homeLive() {
  const m = me(), s = meS();
  let out = '';
  if (launchDone() && !m.summarySeen) out += launchSummary(s);
  const acts = [];
  const pend = pendingCount();
  if (pend) acts.push(`<button class="action urgent" data-act="nav" data-v="#/orders"><span class="ai">📦</span><span><b>${L(`${pend} pending order${pend > 1 ? 's' : ''}`, `${pend} ऑर्डर बाकी`)}</b><small>${L('Accept and pack before 6 PM for today\'s pickup.', 'आज के पिकअप के लिए शाम 6 बजे से पहले स्वीकार करें और पैक करें।')}</small></span><span class="go">›</span></button>`);
  if (m.products.length) {
    const mm = sellerMetrics(s);
    mm.sk.filter(x => x.stockLeft === 0).forEach(x => acts.push(`<button class="action urgent" data-act="nav" data-v="#/product/${x.p.id}"><span class="ai">⚠️</span><span><b>${L('Out of stock', 'स्टॉक खत्म')}: ${esc(x.p.name)}</b><small>${L('Product is hidden from customers until inventory is added.', 'इन्वेंटरी जोड़ने तक प्रोडक्ट ग्राहकों को नहीं दिखेगा।')}</small></span><span class="go">›</span></button>`));
  }
  const fdc = fdActionCard(false); if (fdc) acts.push(fdc);
  if (m.fd.status === 'approved' && m.launchStart == null) acts.push(`<button class="action fd" data-act="nav" data-v="#/launch"><span class="ai">🚀</span><span><b>${L('Start your launch period', 'अपनी लॉन्च अवधि शुरू करें')}</b><small>${L('Select 3 to 5 products.', '3 से 5 प्रोडक्ट चुनें।')}</small></span><span class="go">›</span></button>`);
  if (!m.products.length) acts.push(`<button class="action" data-act="nav" data-v="#/products/new"><span class="ai">➕</span><span><b>${L('Add your first product', 'अपना पहला प्रोडक्ट जोड़ें')}</b><small>${L('Products go live after a quality check.', 'क्वालिटी जाँच के बाद प्रोडक्ट चालू होते हैं।')}</small></span><span class="go">›</span></button>`);
  if (acts.length) out += `<div class="sect">${L('Action required', 'ज़रूरी कार्रवाई')}</div>` + acts.join('');
  if (m.products.length) out += homeStats(s);
  out += notesBlock();
  return out;
}
function periodRange() {
  const m = me(), D = DB.day;
  const per = UI.period || (m.launchStart != null ? 'launch' : 'all');
  if (per === 'launch' && m.launchStart != null) return { per, from: m.launchStart, to: Math.min(D, m.launchStart + DB.cfg.launchDays - 1) };
  if (per === '7d') return { per, from: D - 6, to: D };
  return { per: 'all', from: -999, to: D };
}
function homeStats(s) {
  const m = me(), pr = periodRange();
  const mm = sellerMetrics(s, pr.from, pr.to);
  const money = sellerMoney(s);
  const seg = `<div class="seg mb12" role="group" aria-label="${L('Period', 'अवधि')}">
    ${m.launchStart != null ? `<button data-act="period" data-v="launch" aria-pressed="${pr.per === 'launch'}">${L('Launch period', 'लॉन्च अवधि')}</button>` : ''}
    <button data-act="period" data-v="7d" aria-pressed="${pr.per === '7d'}">${L('Last 7 days', 'पिछले 7 दिन')}</button>
    <button data-act="period" data-v="all" aria-pressed="${pr.per === 'all'}">${L('All time', 'अब तक')}</button></div>`;
  const t = mm.t;
  const tiles = `<div class="tiles num">
    <div class="tile"><div class="k">${L('Views', 'व्यू')} ${ti('views')}</div><div class="v">${nf(t.views)}</div></div>
    <div class="tile"><div class="k">${L('Orders', 'ऑर्डर')}</div><div class="v">${nf(t.orders)}</div></div>
    <div class="tile"><div class="k">${L('Conversion', 'कन्वर्ज़न')} ${ti('conv')}</div><div class="v">${pc(t.conv, 1)}</div></div>
    <div class="tile"><div class="k">${L('Delivered', 'डिलीवर')}</div><div class="v">${nf(t.delivered)}</div></div>
    <div class="tile"><div class="k">${L('Return rate', 'वापसी दर')} ${ti('retrate')}</div><div class="v">${pc(t.retRate)}</div><div class="d">${nf(t.returned)} ${t.returned === 1 ? L('return', 'वापसी') : L('returns', 'वापसी')}</div></div>
    <div class="tile"><div class="k">RTO ${ti('rto')}</div><div class="v">${nf(t.rto)}</div></div>
    <div class="tile wide"><div class="row between"><span><span class="k">${L('Earnings', 'कमाई')}</span><div class="v">${R(money.paid)}</div></span><span style="text-align:right"><span class="k">${L('Upcoming', 'आने वाला')} ${ti('upcoming')}</span><div class="v" style="font-size:16px">${R(money.upcoming)}</div></span></div></div>
  </div>`;
  const chart = trendChart(mm.sk.map(x => x.r), pr.from, pr.to);
  const skus = mm.sk.map(x => skuCard(x, s)).join('');
  return `<div class="sect">${L('Performance', 'प्रदर्शन')}</div>${seg}${tiles}
    <div class="card mt12"><div class="row between mb8"><b class="small">${L('Daily views and orders', 'रोज़ के व्यू और ऑर्डर')}</b><span class="legend"><span><i style="background:var(--lilac);border:1px solid var(--magenta)"></i>${L('Views', 'व्यू')}</span><span><i style="background:var(--aam)"></i>${L('Orders', 'ऑर्डर')}</span></span></div>${chart}</div>
    <div class="sect">${L('Product performance', 'प्रोडक्ट प्रदर्शन')}<button class="btn ghost xs" data-act="nav" data-v="#/products/new">+ ${L('Add product', 'प्रोडक्ट जोड़ें')}</button></div>${skus}`;
}
function trendChart(rs, from, to) {
  const D = DB.day; const f = Math.max(from, D - 29), t = Math.min(to, D);
  const days = []; for (let d = f; d <= t; d++) days.push(d);
  if (!days.length) return `<p class="hint">${L('No data for this period.', 'इस अवधि का कोई डेटा नहीं।')}</p>`;
  const v = days.map(d => rs.reduce((a, r) => a + ((r.vDays.find(x => x.d === d) || {}).v || 0), 0));
  const o = days.map(d => rs.reduce((a, r) => a + ((r.vDays.find(x => x.d === d) || {}).n || 0), 0));
  const W = 320, H = 110, bw = W / days.length, mv = Math.max(1, ...v), mo = Math.max(1, ...o);
  const bars = v.map((x, i) => `<rect x="${(i * bw + 1).toFixed(1)}" y="${(H - 16 - x / mv * (H - 26)).toFixed(1)}" width="${Math.max(1, bw - 2).toFixed(1)}" height="${(x / mv * (H - 26)).toFixed(1)}" rx="1.5" fill="var(--lilac)" stroke="var(--magenta)" stroke-width=".6"><title>${dayDate(days[i])}: ${x} ${L('views', 'व्यू')}, ${o[i]} ${L('orders', 'ऑर्डर')}</title></rect>`).join('');
  const dots = o.map((x, i) => x ? `<circle cx="${(i * bw + bw / 2).toFixed(1)}" cy="${(H - 16 - x / mo * (H - 30)).toFixed(1)}" r="${Math.min(4, 2 + x)}" fill="var(--aam)"/>` : '').join('');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${L('Daily views and orders', 'रोज़ के व्यू और ऑर्डर')}">${bars}${dots}<text x="0" y="${H - 2}" font-size="9" fill="var(--muted)">${dayDate(days[0])}</text><text x="${W}" y="${H - 2}" font-size="9" fill="var(--muted)" text-anchor="end">${dayDate(days[days.length - 1])}</text><text x="0" y="9" font-size="9" fill="var(--muted)">${L('Peak', 'अधिकतम')}: ${mv} ${L('views', 'व्यू')}</text></svg>`;
}
/* One recommendation per product, in priority order */
function skuTip(x, s) {
  const m = me(), p = x.p, cat = CATS[p.cat];
  if (x.stockLeft === 0) return { c: 'bad', t: L('Out of stock. Add inventory to continue selling.', 'स्टॉक खत्म। बेचना जारी रखने के लिए इन्वेंटरी जोड़ें।') };
  if (m.fd.status === 'approved' && p.launch && x.gap * 100 < DB.cfg.priceAdv) return { c: 'bad', t: L(`Factory Direct tag paused. Price must be ${R(fdTarget(p.cat, p.type, p.packOf))} or less.`, `फैक्ट्री डायरेक्ट टैग रुका। कीमत ${R(fdTarget(p.cat, p.type, p.packOf))} या कम होनी चाहिए।`) };
  const rets = x.r.orders.filter(o => o.out === 'ret' && o.day + 4 + o.rq <= DB.day && o.reason !== 'mind');
  if (x.delivered >= 5 && x.retRate > cat.rr + DB.cfg.retOver / 100 && rets.length) {
    const cnt = {}; rets.forEach(o => cnt[o.reason] = (cnt[o.reason] || 0) + 1);
    const top = cat.reasons.find(r => r.id === Object.entries(cnt).sort((a, b) => b[1] - a[1])[0][0]);
    if (top) return { c: 'warn', t: L(`High return rate. Top reason: "${top.en}". ${top.fixEn}`, `वापसी दर ज़्यादा। मुख्य कारण: "${top.hi}"। ${top.fixHi}`) };
  }
  if (x.views >= 250 && x.conv < cat.conv * 0.5) { const [lo, hi] = similarBand(p.cat, p.type, p.packOf); return { c: 'warn', t: L(`Low conversion. Benchmark price is ${R(lo)} to ${R(hi)}. Review price and images.`, `कन्वर्ज़न कम। बेंचमार्क कीमत ${R(lo)} से ${R(hi)} है। कीमत और फोटो देखें।`) }; }
  if (x.stockLeft <= 5) return { c: 'warn', t: L(`Low inventory: ${x.stockLeft} units left.`, `कम इन्वेंटरी: ${x.stockLeft} यूनिट बचे।`) };
  if (inLaunch() && p.launch) return { c: 'good', t: L('Receiving launch period visibility.', 'लॉन्च अवधि की अतिरिक्त पहुँच मिल रही है।') };
  return { c: 'good', t: L('Performing well.', 'अच्छा प्रदर्शन।') };
}
function skuCard(x, s) {
  const p = x.p, tip = skuTip(x, s);
  return `<button class="sku" data-act="nav" data-v="#/product/${p.id}">
    <div class="top">${thumb(p)}<div style="min-width:0"><div class="nm">${esc(p.name)}</div><div class="pr num">${R(p.price)}${p.launch && me().fd.status === 'approved' && x.gap * 100 >= DB.cfg.priceAdv ? ' · <span class="chip fd" style="padding:1px 6px;font-size:10.5px">Factory Direct</span>' : ''}</div></div><span class="go" style="color:var(--muted);font-size:20px">›</span></div>
    <div class="mets num"><div><b>${nf(x.views)}</b><span>${L('Views', 'व्यू')}</span></div><div><b>${nf(x.orders)}</b><span>${L('Orders', 'ऑर्डर')}</span></div><div><b>${pc(x.conv, 1)}</b><span>${L('Conv.', 'कन्वर्ज़न')}</span></div><div><b>${nf(x.returned)}</b><span>${L('Returns', 'वापसी')}</span></div><div><b>${nf(x.stockLeft)}</b><span>${L('Stock', 'स्टॉक')}</span></div></div>
    <div class="tip ${tip.c}">${tip.c === 'good' ? '✓' : '!'} ${tip.t}</div></button>`;
}
function launchSummary(s) {
  const m = me(), L0 = m.launchStart, L1 = m.launchStart + DB.cfg.launchDays - 1;
  const mm = sellerMetrics(s, L0, L1), money = sellerMoney(s);
  const recs = mm.sk.filter(x => x.p.launch).map(x => { const t = skuTip(x, s); return `<div><b>${esc(x.p.name)}</b>${nf(x.views)} ${L('views', 'व्यू')} · ${nf(x.orders)} ${L('orders', 'ऑर्डर')} · ${t.t}</div>`; }).join('');
  return `<div class="summary"><h3>${L('Launch period completed', 'लॉन्च अवधि पूरी')}</h3>
    <p>${L(`Your products now continue with standard visibility. The Factory Direct tag remains on products priced at least ${DB.cfg.priceAdv}% below the benchmark.`, `अब आपके प्रोडक्ट सामान्य पहुँच के साथ जारी रहेंगे। फैक्ट्री डायरेक्ट टैग उन प्रोडक्ट पर रहेगा जिनकी कीमत बेंचमार्क से कम से कम ${DB.cfg.priceAdv}% कम है।`)}</p>
    <div class="sg num"><div><b>${nf(mm.t.views)}</b><span>${L('Views', 'व्यू')}</span></div><div><b>${nf(mm.t.orders)}</b><span>${L('Orders', 'ऑर्डर')}</span></div><div><b>${R(money.paid + money.upcoming)}</b><span>${L('Earnings', 'कमाई')}</span></div></div>
    <div class="recs">${recs}</div>
    <button class="btn block sm" data-act="summarySeen">${L('Done', 'ठीक है')}</button></div>`;
}

/* ============ ORDERS ============ */
function scrOrders() {
  if (!requireLive()) return '';
  const m = me(), s = meS(), D = DB.day;
  const all = [];
  s.products.forEach(p => simProduct(s, p).orders.forEach(o => all.push({ o, p, st: orderStatus(o, D, m.rts) })));
  all.sort((a, b) => b.o.day - a.o.day);
  const groups = {
    pending: all.filter(x => x.st === 'pending'),
    rts: all.filter(x => x.st === 'rts' || x.st === 'packed'),
    transit: all.filter(x => x.st === 'transit'),
    delivered: all.filter(x => x.st === 'delivered'),
    returns: all.filter(x => ['ret_transit', 'returned', 'rto_transit', 'rto'].includes(x.st))
  };
  const tab = UI.otab || (groups.pending.length ? 'pending' : groups.rts.length ? 'rts' : 'transit');
  const names = { pending: L('Pending', 'बाकी'), rts: L('Ready to Ship', 'भेजने को तैयार'), transit: L('Shipped', 'भेजे गए'), delivered: L('Delivered', 'डिलीवर'), returns: L('Returns & RTO', 'वापसी और RTO') };
  const tabs = `<div class="tabs" role="tablist">${Object.keys(groups).map(k => `<button role="tab" data-act="otab" data-v="${k}" aria-pressed="${tab === k}">${names[k]}<span class="c">${groups[k].length}</span></button>`).join('')}</div>`;
  const list = groups[tab].slice(0, 40);
  let body = '';
  if (tab === 'returns') body += `<p class="hint mt0 mb12">${L('Customer returns and RTO orders', 'ग्राहक वापसी और RTO ऑर्डर')} ${ti('returns')} ${ti('rto')}</p>`;
  if (!all.length) body += `<div class="empty"><div class="ei">📦</div><b>${L('No orders yet', 'अभी कोई ऑर्डर नहीं')}</b></div>`;
  else if (!list.length) body += `<div class="empty"><div class="ei">✓</div><b>${L('No orders in this tab', 'इस टैब में कोई ऑर्डर नहीं')}</b></div>`;
  else {
    if (tab === 'pending' && list.length > 1) body += `<button class="btn soft block sm mb12" data-act="acceptAll">${L(`Accept all (${list.length})`, `सभी स्वीकार करें (${list.length})`)}</button>`;
    body += list.map(x => orderCard(x)).join('');
  }
  return shell(`${tabs}<div class="pad" style="padding-top:8px">${body}</div>`, { nav: 'orders', title: L('Orders', 'ऑर्डर'), sub: dayDate(D) });
}
function orderCard({ o, p, st }) {
  const D = DB.day, m = me(), cat = CATS[p.cat];
  const top = `<div class="top">${thumb(p, 'sm')}<div style="min-width:0"><b>${esc(p.name)}</b><small>${L('Order ID', 'ऑर्डर ID')} ${o.id} · ${L('Qty', 'मात्रा')} 1 · ${R(o.price ?? p.price)}</small></div></div>`;
  const meta = (a, b) => `<div class="meta"><span>${a}</span><span>${b}</span></div>`;
  if (st === 'pending') return `<div class="order">${top}${meta(L('Ordered today', 'आज ऑर्डर हुआ'), L('Deliver to', 'डिलीवरी') + ': ' + esc(o.city))}<button class="btn primary block sm" data-act="accept" data-v="${o.id}">${L('Accept', 'स्वीकार करें')}</button></div>`;
  if (st === 'rts' || st === 'packed') {
    const packed = st === 'packed';
    const checks = cat.packChecks.map((c, i) => { const on = packed || m.chk[o.id + ':' + i]; return `<button data-act="chk" data-v="${o.id}:${i}" aria-pressed="${!!on}" ${packed ? 'disabled' : ''}><span class="bx">${on ? '✓' : ''}</span>${L(c.en, c.hi)}</button>`; }).join('');
    const all = cat.packChecks.every((c, i) => m.chk[o.id + ':' + i]);
    return `<div class="order">${top}${meta(L('Pickup today by 7 PM', 'आज शाम 7 बजे तक पिकअप'), esc(o.city))}
      <p class="xs b muted mt0 mb0">${L('Packing checklist', 'पैकिंग चेकलिस्ट')}</p><div class="cl">${checks}</div>
      ${packed ? `<span class="chip good">✓ ${L('Packed · awaiting pickup', 'पैक हुआ · पिकअप का इंतज़ार')}</span>` : `<div class="row"><button class="btn ghost sm" data-act="label" data-v="${o.id}">${IC.dl}${L('Label', 'लेबल')}</button><button class="btn primary sm grow" data-act="packed" data-v="${o.id}" ${all ? '' : 'disabled'}>${L('Confirm packed', 'पैक होने की पुष्टि करें')}</button></div>`}</div>`;
  }
  if (st === 'transit') return `<div class="order">${top}${meta(L('Shipped', 'भेजा गया') + ' ' + dayDate(o.day + 1), L('Expected delivery', 'संभावित डिलीवरी') + ' ' + dayDate(o.day + 4))}</div>`;
  if (st === 'delivered') { const pd = o.day + 4 + DB.cfg.settleDays; return `<div class="order">${top}${meta(L('Delivered', 'डिलीवर हुआ') + ' ' + dayDate(o.day + 4), pd <= D ? `<span class="good b">${L('Paid', 'भुगतान हुआ')} ${dayDate(pd)}</span>` : L('Payment on', 'पेमेंट') + ' ' + dayDate(pd))}</div>`; }
  const r = cat.reasons.find(x => x.id === o.reason);
  if (st === 'ret_transit' || st === 'returned') return `<div class="order">${top}${meta(`<span class="bad b">${L('Customer return', 'ग्राहक वापसी')}</span>`, st === 'returned' ? L('Received', 'मिला') + ' ' + dayDate(o.day + 11) : L('Expected', 'संभावित') + ' ' + dayDate(o.day + 11))}<div class="note warn"><span class="ni">↩</span><span><b>${L('Reason', 'कारण')}: ${esc(L(r ? r.en : '', r ? r.hi : ''))}</b><br>${esc(L(r ? r.fixEn : '', r ? r.fixHi : ''))}</span></div></div>`;
  return `<div class="order">${top}${meta(`<span class="warn b">RTO</span>`, st === 'rto' ? L('Received', 'मिला') + ' ' + dayDate(o.day + 9) : L('In transit to you', 'आपकी ओर रास्ते में'))}<p class="hint mt0">${L('Customer unavailable or cash on delivery refused. No charge to you.', 'ग्राहक नहीं मिला या कैश ऑन डिलीवरी मना किया। आपसे कोई शुल्क नहीं।')}</p></div>`;
}
function requireLive() {
  const m = me();
  if (m.stage === 'none' || m.stage === 'signup') { location.hash = '#/'; return false; }
  return true;
}

/* ============ CATALOG ============ */
function scrProducts() {
  if (!requireLive()) return '';
  const m = me();
  if (m.stage === 'review') return shell(`<div class="pad"><div class="empty"><div class="ei">⏳</div><b>${L('Available once your account is live', 'अकाउंट चालू होने पर उपलब्ध')}</b></div></div>`, { nav: 'products', title: L('Catalog', 'कैटलॉग') });
  const s = meS(), mm = sellerMetrics(s);
  const rows = mm.sk.map(x => `<button class="sku" data-act="nav" data-v="#/product/${x.p.id}"><div class="top">${thumb(x.p)}<div style="min-width:0"><div class="nm">${esc(x.p.name)}</div><div class="pr num">${R(x.p.price)} · ${L('Inventory', 'इन्वेंटरी')} ${nf(x.stockLeft)}</div>
    <div class="chips mt8">${x.stockLeft === 0 ? `<span class="chip bad">${L('Out of stock', 'स्टॉक खत्म')}</span>` : `<span class="chip good">${L('Live', 'चालू')}</span>`}${m.fd.status === 'approved' ? (x.gap * 100 >= DB.cfg.priceAdv ? `<span class="chip fd">Factory Direct</span>` : `<span class="chip warn">${L('Tag paused', 'टैग रुका')}</span>`) : ''}${x.p.launch && inLaunch() ? `<span class="chip mag">${L('Launch period', 'लॉन्च अवधि')}</span>` : ''}</div></div><span style="color:var(--muted);font-size:20px">›</span></div></button>`).join('');
  return shell(`<div class="pad">
    <button class="btn primary block mb12" data-act="nav" data-v="#/products/new">+ ${L('Add product', 'प्रोडक्ट जोड़ें')}</button>
    ${rows || `<div class="empty"><div class="ei">🧺</div><b>${L('No products yet', 'अभी कोई प्रोडक्ट नहीं')}</b></div>`}
  </div>`, { nav: 'products', title: L('Catalog', 'कैटलॉग'), sub: m.products.length ? `${m.products.length} ${L('products', 'प्रोडक्ट')}` : '' });
}
function scrProduct(id) {
  if (!requireLive()) return '';
  const m = me(), p = m.products.find(x => x.id === id);
  if (!p) return shell(`<div class="pad"><div class="empty"><b>${L('Product not found', 'प्रोडक्ट नहीं मिला')}</b><button class="btn ghost sm mt12" data-act="nav" data-v="#/products">${L('Back to catalog', 'कैटलॉग पर वापस')}</button></div></div>`, { nav: 'products', back: '#/products', title: L('Product', 'प्रोडक्ट') });
  const s = meS(), mm = sellerMetrics(s), x = mm.sk.find(k => k.p.id === id);
  const [lo, hi] = similarBand(p.cat, p.type, p.packOf), tgt = fdTarget(p.cat, p.type, p.packOf), fe = fee(p.slab);
  const cat = CATS[p.cat];
  const cnt = {}; x.r.orders.forEach(o => { if (o.out === 'ret' && o.day + 4 + o.rq <= DB.day) cnt[o.reason] = (cnt[o.reason] || 0) + 1; });
  const reasons = Object.entries(cnt).sort((a, b) => b[1] - a[1]).map(([k, n]) => { const r = cat.reasons.find(z => z.id === k); return `<div class="prow"><span><b class="small">${esc(L(r.en, r.hi))}</b><small>${esc(L(r.fixEn, r.fixHi))}</small></span><span class="amt">${n}</span></div>`; }).join('');
  const tip = skuTip(x, s);
  const f = UI.pedit && UI.pedit.id === id ? UI.pedit : (UI.pedit = { id, price: String(p.price), add: '' });
  return shell(`<div class="pad">
    ${thumb(p, 'lg')}
    <h2 style="margin:12px 0 4px;font-size:18px;line-height:1.25">${esc(p.name)}</h2>
    <div class="chips mb12">${x.stockLeft === 0 ? `<span class="chip bad">${L('Out of stock', 'स्टॉक खत्म')}</span>` : `<span class="chip good">${L('Live', 'चालू')}</span>`}${m.fd.status === 'approved' && x.gap * 100 >= DB.cfg.priceAdv ? '<span class="chip fd">Factory Direct</span>' : ''}<span class="chip grey">${esc(typeName(p.cat, p.type))}${p.packOf > 1 ? ' · ' + L('pack of', 'पैक') + ' ' + p.packOf : ''}</span></div>
    <div class="note ${tip.c === 'good' ? 'ok' : tip.c === 'bad' ? 'no' : 'warn'} mb12"><span class="ni">${tip.c === 'good' ? '✓' : '!'}</span><span>${tip.t}</span></div>
    <div class="tiles num mb12">
      <div class="tile"><div class="k">${L('Views', 'व्यू')} ${ti('views')}</div><div class="v">${nf(x.views)}</div></div>
      <div class="tile"><div class="k">${L('Orders', 'ऑर्डर')}</div><div class="v">${nf(x.orders)}</div><div class="d">${pc(x.conv, 1)} ${L('conv.', 'कन्वर्ज़न')}</div></div>
      <div class="tile"><div class="k">${L('Return rate', 'वापसी दर')} ${ti('retrate')}</div><div class="v">${pc(x.retRate)}</div><div class="d">${L('Category', 'कैटेगरी')} ${pc(cat.rr)}</div></div>
    </div>
    <div class="card"><div class="row between mb8"><b class="small">${L('Last 30 days', 'पिछले 30 दिन')}</b><span class="legend"><span><i style="background:var(--lilac);border:1px solid var(--magenta)"></i>${L('Views', 'व्यू')}</span><span><i style="background:var(--aam)"></i>${L('Orders', 'ऑर्डर')}</span></span></div>${trendChart([x.r], -999, DB.day)}</div>
    <div class="card"><h3>${L('Pricing', 'कीमत')}</h3>
      <div class="lrow"><span>${L('Selling price', 'बिक्री कीमत')}</span><span class="v">${R(p.price)}</span></div>
      <div class="lrow"><span>${L('Benchmark price', 'बेंचमार्क कीमत')} ${ti('benchmark')}</span><span class="v">${R(lo)} – ${R(hi)}</span></div>
      <div class="lrow"><span>${L('Factory Direct price', 'फैक्ट्री डायरेक्ट कीमत')} ${ti('fdprice')}</span><span class="v">${R(tgt)} ${L('or less', 'या कम')}</span></div>
      <div class="lrow"><span>${L('Payout per order', 'प्रति ऑर्डर भुगतान')} ${ti('payout')}<small>${R(p.price)} − ${R(fe)} ${L('shipping', 'शिपिंग')}</small></span><span class="v">${R(p.price - fe)}</span></div>
      ${p.cost ? `<div class="lrow"><span>${L('Profit per order', 'प्रति ऑर्डर मुनाफ़ा')} ${ti('profit')}<small>${L('Cost', 'लागत')} ${R(p.cost)}</small></span><span class="v ${p.price - fe - p.cost < 0 ? 'bad' : 'good'}">${R(p.price - fe - p.cost)}</span></div>` : ''}
      <div class="field mt12"><label for="pe1">${L('Update price', 'कीमत बदलें')}</label><div class="row"><div class="prefix grow"><span>₹</span><input id="pe1" class="input" inputmode="numeric" data-pe="price" value="${esc(f.price)}"></div><button class="btn ghost sm" data-act="savePrice" style="min-height:48px">${L('Save', 'सेव')}</button></div><p class="hint">${L('Applies to orders from tomorrow.', 'कल से आने वाले ऑर्डर पर लागू।')}</p></div>
    </div>
    <div class="card"><h3>${L('Inventory', 'इन्वेंटरी')} ${ti('inventory')}</h3>
      <div class="lrow"><span>${L('Available units', 'उपलब्ध यूनिट')}</span><span class="v">${nf(x.stockLeft)}</span></div>
      <div class="field mt8"><label for="pe2">${L('Add units', 'यूनिट जोड़ें')}</label><div class="row"><input id="pe2" class="input grow" inputmode="numeric" data-pe="add" value="${esc(f.add)}"><button class="btn ghost sm" data-act="addStock" style="min-height:48px">${L('Add', 'जोड़ें')}</button></div></div>
      <div class="chips">${[10, 20, 50].map(n => `<button class="chip grey" data-act="addStockN" data-v="${n}">+${n}</button>`).join('')}</div>
    </div>
    <div class="card"><h3>${L('Return reasons', 'वापसी के कारण')}</h3>${reasons || `<p class="hint mt0">${L('No returns.', 'कोई वापसी नहीं।')}</p>`}</div>
  </div>`, { nav: 'products', back: '#/products', title: L('Product details', 'प्रोडक्ट विवरण') });
}
function scrAddProduct() {
  if (!requireLive()) return '';
  const m = me();
  if (m.stage !== 'live') { location.hash = '#/products'; return ''; }
  if (UI.formKey !== 'addp') {
    UI.formKey = 'addp'; UI.err = {};
    const cat = m.fd.cat || 'home', t = CATS[cat].types[0];
    UI.f = { cat, type: t.id, size: t.sizes[0], material: CATS[cat].materials[0], colour: COLOURS[0], packOf: 1, name: '', nameTouched: false, price: '', mrp: '', slab: t.slab, stock: '30', cost: '', photo: null };
  }
  const f = UI.f, cat = CATS[f.cat], t = typeOf(f.cat, f.type);
  if (!f.nameTouched) f.name = autoName(f);
  return shell(`<div class="pad">
    <div class="field"><span class="flabel">${L('Product image', 'प्रोडक्ट फोटो')}</span>
      <div class="row" style="align-items:stretch">
        ${f.photo ? (f.photo.startsWith('data:') ? `<img class="thumb" style="width:84px;height:84px" src="${f.photo}" alt="">` : `<span class="thumb ${f.photo}" style="width:84px;height:84px"></span>`) : `<span class="thumb" style="width:84px;height:84px;display:grid;place-items:center;border:2px dashed ${UI.err.photo ? 'var(--bad)' : 'var(--line)'}">${IC.cam}</span>`}
        <div class="grow" style="display:grid;gap:6px;align-content:center">
          <span class="btn ghost sm filebtn">${IC.cam} ${f.photo ? L('Change image', 'फोटो बदलें') : L('Take or upload image', 'फोटो लें या अपलोड करें')}<input type="file" accept="image/*" capture="environment" data-photo="product" aria-label="${L('Product image', 'प्रोडक्ट फोटो')}"></span>
        </div></div>
      ${errOf('photo')}<p class="hint">${L('Plain background, daylight, full product visible.', 'सादा बैकग्राउंड, दिन की रोशनी, पूरा प्रोडक्ट दिखे।')}</p></div>
    <div class="field"><label for="ap_cat">${L('Category', 'कैटेगरी')}</label><select id="ap_cat" class="input" data-f="cat" data-rerender="1" ${m.fd.cat ? 'disabled' : ''}>${Object.keys(CATS).map(k => `<option value="${k}" ${f.cat === k ? 'selected' : ''}>${catName(k)}</option>`).join('')}</select></div>
    <div class="field"><label for="ap_type">${L('Product type', 'प्रोडक्ट का प्रकार')}</label><select id="ap_type" class="input" data-f="type" data-rerender="1">${cat.types.map(x => `<option value="${x.id}" ${f.type === x.id ? 'selected' : ''}>${L(x.en, x.hi)}</option>`).join('')}</select></div>
    <div class="row" style="gap:10px;align-items:flex-start">
      <div class="field grow"><label for="ap_size">${L('Size', 'साइज़')}</label><select id="ap_size" class="input" data-f="size" data-rerender="1">${t.sizes.map(x => `<option ${f.size === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
      <div class="field grow"><label for="ap_mat">${L('Material', 'मटीरियल')}</label><select id="ap_mat" class="input" data-f="material" data-rerender="1">${cat.materials.map(x => `<option ${f.material === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
    </div>
    <div class="row" style="gap:10px;align-items:flex-start">
      <div class="field grow"><label for="ap_col">${L('Colour', 'रंग')}</label><select id="ap_col" class="input" data-f="colour" data-rerender="1">${COLOURS.map(x => `<option ${f.colour === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
      <div class="field grow"><label for="ap_pack">${L('Pack of', 'पैक में')}</label><select id="ap_pack" class="input" data-f="packOf" data-rerender="1">${[1, 2, 3, 4, 5, 6].map(x => `<option ${+f.packOf === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
    </div>
    <div class="field"><label for="ap_name">${L('Product name', 'प्रोडक्ट का नाम')}</label><input id="ap_name" class="input ${UI.err.name ? 'err' : ''}" maxlength="100" data-f="name" data-touch="nameTouched" value="${esc(f.name)}">${errOf('name')}</div>
    <div class="row" style="gap:10px;align-items:flex-start">
      <div class="field grow"><label for="ap_price">${L('Selling price', 'बिक्री कीमत')}</label><div class="prefix ${UI.err.price ? 'err' : ''}"><span>₹</span><input id="ap_price" class="input" inputmode="numeric" data-f="price" data-live="price" value="${esc(f.price)}"></div>${errOf('price')}</div>
      <div class="field grow"><label for="ap_mrp">MRP ${ti('mrp')} <span class="opt">${L('(optional)', '(वैकल्पिक)')}</span></label><div class="prefix ${UI.err.mrp ? 'err' : ''}"><span>₹</span><input id="ap_mrp" class="input" inputmode="numeric" data-f="mrp" value="${esc(f.mrp)}"></div>${errOf('mrp')}</div>
    </div>
    <div id="pp">${pricePreview()}</div>
    <div class="row mt12" style="gap:10px;align-items:flex-start">
      <div class="field grow"><label for="ap_stock">${L('Inventory', 'इन्वेंटरी')} ${ti('inventory')}</label><input id="ap_stock" class="input ${UI.err.stock ? 'err' : ''}" inputmode="numeric" data-f="stock" value="${esc(f.stock)}">${errOf('stock')}</div>
      <div class="field grow"><label for="ap_slab">${L('Packed weight', 'पैक्ड वज़न')} ${ti('weight')}</label><select id="ap_slab" class="input" data-f="slab" data-live="price">${SLABS.map(x => `<option value="${x.id}" ${f.slab === x.id ? 'selected' : ''}>${L(x.en, x.hi)}</option>`).join('')}</select></div>
    </div>
    <div class="field"><label for="ap_cost">${L('Cost to make and pack', 'बनाने और पैक करने की लागत')} ${ti('profit')} <span class="opt">${L('(optional)', '(वैकल्पिक)')}</span></label><div class="prefix"><span>₹</span><input id="ap_cost" class="input" inputmode="numeric" data-f="cost" data-live="price" value="${esc(f.cost)}"></div></div>
    <div class="row" style="gap:10px">
      <div class="field grow"><label for="ap_hsn">${L('HSN code', 'HSN कोड')} ${ti('hsn')}</label><input id="ap_hsn" class="input locked" value="${cat.hsn}" readonly></div>
      <div class="field grow"><label for="ap_gst">${L('GST rate', 'GST दर')}</label><input id="ap_gst" class="input locked" value="${cat.gst}" readonly></div>
    </div>
  </div>
  <div class="stickyfoot"><button class="btn primary block" data-act="saveProduct">${L('Submit for QC', 'QC के लिए जमा करें')}</button></div>`, { nav: 'products', back: '#/products', title: L('Add product', 'प्रोडक्ट जोड़ें') });
}
function autoName(f) {
  const t = typeOf(f.cat, f.type);
  return `${f.material} ${t.en.toLowerCase()} ${f.size}, ${f.colour.toLowerCase()}${+f.packOf > 1 ? ', pack of ' + f.packOf : ''}`.replace(/^./, c => c.toUpperCase());
}
function pricePreview() {
  const f = UI.f; if (!f || !f.cat) return '';
  const [lo, hi] = similarBand(f.cat, f.type, +f.packOf), tgt = fdTarget(f.cat, f.type, +f.packOf), fe = fee(f.slab), price = +f.price;
  const fdOn = ['approved', 'review', 'checking'].includes(me().fd.status);
  return `<div class="calcout num">
    <div class="lrow"><span>${L('Benchmark price', 'बेंचमार्क कीमत')} ${ti('benchmark')}</span><span class="v">${R(lo)} – ${R(hi)}</span></div>
    ${fdOn ? `<div class="lrow"><span>${L('Factory Direct price', 'फैक्ट्री डायरेक्ट कीमत')} ${ti('fdprice')}</span><span class="v ${price > 0 ? (price <= tgt ? 'good' : 'bad') : ''}">${R(tgt)} ${L('or less', 'या कम')}</span></div>` : ''}
    ${price > 0 ? `<div class="lrow"><span>${L('Payout per order', 'प्रति ऑर्डर भुगतान')} ${ti('payout')}<small>${L('Shipping charge', 'शिपिंग शुल्क')} ${R(fe)}</small></span><span class="v">${R(price - fe)}</span></div>` : ''}
    ${price > 0 && +f.cost ? `<div class="lrow"><span>${L('Profit per order', 'प्रति ऑर्डर मुनाफ़ा')}</span><span class="v ${price - fe - f.cost < 0 ? 'bad' : 'good'}">${R(price - fe - f.cost)}</span></div>` : ''}
  </div>`;
}

/* ============ EARNINGS ============ */
function scrEarnings() {
  if (!requireLive()) return '';
  const m = me();
  if (m.stage === 'review' || !m.products.length) return shell(`<div class="pad"><div class="empty"><div class="ei">₹</div><b>${L('No earnings yet', 'अभी कोई कमाई नहीं')}</b>${L('Payments are credited 7 days after delivery.', 'डिलीवरी के 7 दिन बाद पेमेंट आता है।')}</div>${m.bank ? `<div class="card"><div class="lrow"><span>${L('Bank account', 'बैंक खाता')}</span><span class="v">${esc(m.bank.bankName)} ····${esc(m.bank.acc.slice(-4))}</span></div></div>` : ''}</div>`, { nav: 'earnings', title: L('Earnings', 'कमाई') });
  const s = meS(), mo = sellerMoney(s), D = DB.day;
  const next = mo.next;
  const upcomingList = mo.list.filter(x => x.day > D).sort((a, b) => a.day - b.day);
  const paidList = mo.list.filter(x => x.day <= D);
  const row = x => `<div class="prow"><span><b class="small">${dayDate(x.day)}</b><small>${x.n ? x.n + ' ' + L('orders', 'ऑर्डर') : ''}${x.n && x.r ? ' · ' : ''}${x.r ? x.r + ' ' + L('returns', 'वापसी') : ''}</small></span><span class="amt ${x.amt < 0 ? 'bad' : ''}">${R(x.amt)}<small class="${x.day <= D ? 'good' : ''}">${x.day <= D ? L('Paid', 'भुगतान हुआ') : L('Scheduled', 'तय')}</small></span></div>`;
  const per = mo.perSku.map(x => `<div class="prow"><span class="row" style="gap:8px">${thumb(x.p, 'sm')}<span style="min-width:0"><b class="small">${esc(x.p.name)}</b><small>${R(x.net)} ${L('payout per order', 'प्रति ऑर्डर भुगतान')}</small></span></span><span class="amt">${R(x.paid + x.upcoming)}</span></div>`).join('');
  const prof = mo.perSku.filter(x => x.profit !== null);
  return shell(`<div class="pad">
    <div class="paycard num"><div class="k">${L('Next payment', 'अगला पेमेंट')}</div><div class="v">${next ? R(next.amt) : '₹0'}</div><small>${next ? dayDate(next.day) + ' · ' + esc(m.bank.bankName) + ' ····' + esc(m.bank.acc.slice(-4)) : L('No payment scheduled', 'कोई पेमेंट तय नहीं')}</small></div>
    <div class="tiles num mb12">
      <div class="tile"><div class="k">${L('Paid', 'मिला')}</div><div class="v">${R(mo.paid)}</div></div>
      <div class="tile"><div class="k">${L('Upcoming', 'आने वाला')} ${ti('upcoming')}</div><div class="v">${R(mo.upcoming)}</div></div>
      <div class="tile"><div class="k">${L('Return charges', 'वापसी शुल्क')} ${ti('reverse')}</div><div class="v">${R(mo.retFees)}</div></div>
    </div>
    <div class="card"><h3>${L('Payout rules', 'भुगतान के नियम')}</h3>
      <div class="lrow"><span>${L('Delivered order', 'डिलीवर ऑर्डर')}</span><span class="v">${L('Price − shipping', 'कीमत − शिपिंग')}</span></div>
      <div class="lrow"><span>${L('Commission', 'कमीशन')}</span><span class="v">₹0</span></div>
      <div class="lrow"><span>${L('Customer return', 'ग्राहक वापसी')} ${ti('reverse')}</span><span class="v">− ${L('return shipping', 'वापसी शिपिंग')}</span></div>
      <div class="lrow"><span>RTO ${ti('rto')}</span><span class="v">₹0</span></div>
      <div class="lrow"><span>${L('Payment cycle', 'पेमेंट साइकिल')} ${ti('cycle')}</span><span class="v">${L(`${DB.cfg.settleDays} days after delivery`, `डिलीवरी के ${DB.cfg.settleDays} दिन बाद`)}</span></div></div>
    <div class="card"><h3>${L('Earnings by product', 'प्रोडक्ट के अनुसार कमाई')}</h3>${per}</div>
    ${prof.length ? `<div class="card"><h3>${L('Profit', 'मुनाफ़ा')} ${ti('profit')} <span class="lock">${IC.lock}</span></h3>${prof.map(x => `<div class="prow"><span><b class="small">${esc(x.p.name)}</b><small>${R(x.perOrderProfit)} ${L('per order', 'प्रति ऑर्डर')}</small></span><span class="amt ${x.profit < 0 ? 'bad' : 'good'}">${R(x.profit)}</span></div>`).join('')}</div>` : ''}
    ${upcomingList.length ? `<div class="card"><h3>${L('Upcoming payments', 'आने वाले पेमेंट')}</h3>${upcomingList.slice(0, 7).map(row).join('')}</div>` : ''}
    <div class="card"><h3>${L('Payment history', 'पेमेंट इतिहास')}</h3>${paidList.slice(0, 10).map(row).join('') || `<p class="hint mt0">${L('No payments yet.', 'अभी कोई पेमेंट नहीं।')}</p>`}</div>
  </div>`, { nav: 'earnings', title: L('Earnings', 'कमाई') });
}

/* ============ HELP ============ */
function scrHelp() {
  if (!requireLive()) return '';
  const m = me(), fd = m.fd.status === 'approved' && (inLaunch() || m.launchStart == null);
  const faqs = [
    [L('When will I receive payment?', 'पेमेंट कब मिलेगा?'), L(`${DB.cfg.settleDays} days after an order is delivered, directly to your bank account. This includes cash on delivery orders.`, `ऑर्डर डिलीवर होने के ${DB.cfg.settleDays} दिन बाद, सीधे आपके बैंक खाते में। कैश ऑन डिलीवरी ऑर्डर भी।`)],
    [L('What happens when a customer returns an order?', 'ग्राहक ऑर्डर लौटाए तो क्या होता है?'), L('The product is returned to your pickup address and added back to your inventory. A return shipping charge applies.', 'प्रोडक्ट आपके पिकअप पते पर लौटता है और इन्वेंटरी में वापस जुड़ता है। वापसी शिपिंग शुल्क लगता है।')],
    [L('What is RTO?', 'RTO क्या है?'), L('An order that could not be delivered, for example because the customer was unavailable. It comes back to you with no charge.', 'ऐसा ऑर्डर जो डिलीवर नहीं हो सका, जैसे ग्राहक नहीं मिला। यह बिना शुल्क आपके पास लौटता है।')],
    [L('What happens after the launch period?', 'लॉन्च अवधि के बाद क्या होता है?'), L(`Your products continue with standard visibility. The Factory Direct tag stays on products priced at least ${DB.cfg.priceAdv}% below the benchmark price.`, `आपके प्रोडक्ट सामान्य पहुँच के साथ जारी रहते हैं। फैक्ट्री डायरेक्ट टैग उन प्रोडक्ट पर रहता है जिनकी कीमत बेंचमार्क से कम से कम ${DB.cfg.priceAdv}% कम है।`)],
    [L('Are orders guaranteed during the launch period?', 'क्या लॉन्च अवधि में ऑर्डर की गारंटी है?'), L('No. Meesho targets a number of views for each product. Orders depend on price, images and reviews.', 'नहीं। Meesho हर प्रोडक्ट के व्यू का लक्ष्य रखता है। ऑर्डर कीमत, फोटो और रिव्यू पर निर्भर करते हैं।')],
    [L('Who can see my cost price?', 'मेरी लागत कौन देख सकता है?'), L('Only you. Meesho does not see the cost you enter.', 'सिर्फ़ आप। आपकी डाली लागत Meesho नहीं देखता।')]
  ];
  return shell(`<div class="pad">
    <div class="card"><div class="contact"><div class="avatar">${fd ? 'PN' : 'MS'}</div><div><b style="font-size:16px">${fd ? 'Priya Nair' : L('Supplier Support', 'सप्लायर सपोर्ट')}</b><div class="hint mt0">${fd ? L('Account Manager, Factory Direct', 'अकाउंट मैनेजर, फैक्ट्री डायरेक्ट') : L('Available for all suppliers', 'सभी सप्लायर के लिए')}</div><div class="hint mt0">${L('Mon to Sat, 9 AM to 7 PM', 'सोम से शनि, सुबह 9 से शाम 7')}</div></div></div>
      <div class="row"><button class="btn ghost sm grow" data-act="toast" data-v="${esc(L('Connecting your call…', 'कॉल जोड़ी जा रही है…'))}">${IC.phone}${L('Call', 'कॉल')}</button><button class="btn ghost sm grow" data-act="toast" data-v="${esc(L('Opening WhatsApp…', 'WhatsApp खुल रहा है…'))}">${IC.chat}WhatsApp</button></div>
      <button class="btn ${UI.rec ? 'rec' : 'ghost'} sm block mt8" data-act="voice">${UI.rec ? `<span class="recdot"></span>${L('Recording · tap to send', 'रिकॉर्ड हो रहा है · भेजने के लिए टैप करें')}` : IC.mic + L('Send a voice note', 'वॉइस नोट भेजें')}</button></div>
    <div class="card"><h3>${L('FAQs', 'आम सवाल')}</h3>${faqs.map(([q, a]) => `<details class="faq"><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>
    <div class="card"><h3>${L('Account details', 'अकाउंट की जानकारी')}</h3>
      <div class="lrow"><span>${L('Store', 'स्टोर')}</span><span class="v">${esc(m.store)}</span></div>
      <div class="lrow"><span>${m.gstMode === 'gst' ? 'GSTIN' : L('Enrolment ID', 'एनरोलमेंट ID')}</span><span class="v">${esc(m.gstMode === 'gst' ? m.gstin : m.eid)}</span></div>
      <div class="lrow"><span>${L('Pickup address', 'पिकअप पता')}</span><span class="v">${esc(m.addr ? m.addr.city + ' ' + m.addr.pin : '')}</span></div>
      <div class="lrow"><span>${L('Bank account', 'बैंक खाता')}</span><span class="v">${m.bank ? esc(m.bank.bankName) + ' ····' + esc(m.bank.acc.slice(-4)) : ''}</span></div>
      <button class="btn ghost sm block mt8" data-act="logout">${L('Log out', 'लॉग आउट')}</button></div>
  </div>`, { nav: 'help', title: L('Help', 'मदद') });
}

/* ============ FACTORY DIRECT ============ */
function scrFd() {
  if (!requireLive()) return '';
  const m = me(), fd = m.fd;
  const bar = { back: '#/home', title: 'Factory Direct', nav: 'home' };
  if (fd.status === 'checking') return shell(`<div class="pad"><div class="card"><h3>${L('Checking your application', 'आपका आवेदन जाँचा जा रहा है')}</h3>
      <ul class="timeline mt12">
        <li class="done"><span class="dot">✓</span><span><b>${L('GST nature of business', 'GST में व्यवसाय की प्रकृति')}</b></span></li>
        <li class="now"><span class="dot"><span class="spin" style="width:12px;height:12px"></span></span><span><b>${L('Factory photos and location', 'फैक्ट्री फोटो और लोकेशन')}</b></span></li>
        <li><span class="dot">3</span><span><b>${L('In-house production steps', 'फैक्ट्री में होने वाले काम')}</b></span></li></ul></div></div>`, bar);
  if (fd.status === 'review') return shell(`<div class="pad"><div class="card"><h3>${L('Application under review', 'आवेदन समीक्षा में है')}</h3>
      <ul class="timeline mt12"><li class="done"><span class="dot">✓</span><span><b>${L('Submitted', 'जमा हुआ')}</b><small>${dayDate(fd.submittedDay ?? DB.day)}</small></span></li>
      <li class="now"><span class="dot">2</span><span><b>${L('Review by Meesho team', 'Meesho टीम द्वारा समीक्षा')}</b><small>${L('Within 2 working days. We may call you.', '2 कामकाजी दिन में। हम आपको कॉल कर सकते हैं।')}</small></span></li>
      <li><span class="dot">3</span><span><b>${L('Start launch period', 'लॉन्च अवधि शुरू करें')}</b></span></li></ul></div>
      ${fdWhat()}</div>`, bar);
  if (fd.status === 'rejected') return shell(`<div class="pad"><div class="card"><h3>${L('Application not approved', 'आवेदन मंज़ूर नहीं हुआ')}</h3><p class="small">${esc(L(fd.reason?.en || '', fd.reason?.hi))}</p><p class="hint">${L('You can continue selling as a supplier.', 'आप सप्लायर के रूप में बेचना जारी रख सकते हैं।')}</p><button class="btn ghost sm block mt8" data-act="fdRestart">${L('Apply again', 'दोबारा आवेदन करें')}</button></div></div>`, bar);
  if (fd.status === 'approved') { location.hash = m.launchStart == null ? '#/launch' : '#/home'; return ''; }
  if (fd.status === 'none') { fd.status = 'draft'; fd.step = 1; save(); }
  const st = fd.step;
  const stepbar = `<div class="stepbar" style="grid-template-columns:repeat(3,1fr);padding:0 0 10px">${[1, 2, 3].map(i => `<i class="${i <= st ? 'on' : ''}"></i>`).join('')}</div><p class="xs muted b mt0">${L('Step', 'चरण')} ${st} ${L('of', '/')} 3</p>`;
  let body = '';
  if (fd.status === 'info') body += `<div class="note warn mb12"><span class="ni">!</span><span><b>${L('Action required', 'कार्रवाई ज़रूरी')}</b><br>${esc(L(fd.reason?.en || '', fd.reason?.hi))}</span></div>`;
  if (st === 1) {
    const cat = fd.cat;
    body += `<h2 style="margin:0 0 12px;font-size:20px">${L('What do you manufacture?', 'आप क्या बनाते हैं?')}</h2>
      <div class="choice mb12">${Object.keys(CATS).map(k => `<button class="opt-card" data-act="fdCat" data-v="${k}" aria-pressed="${cat === k}"><span class="ic">${CATS[k].icon}</span><span class="grow"><b>${catName(k)}</b><small>${CATS[k].types.map(t => L(t.en, t.hi)).join(', ')}</small></span><span class="tickbox">${cat === k ? '✓' : ''}</span></button>`).join('')}</div>
      ${cat ? `<div class="card"><h4>${L('In-house production steps', 'फैक्ट्री में होने वाले काम')} ${ti('coresteps')}</h4><p class="hint mt0 mb8">${L('Select all that apply.', 'जो लागू हों सब चुनें।')}</p>
        <div class="choice">${CATS[cat].steps.map(s => `<button class="opt-card" data-act="fdStep" data-v="${s.id}" aria-pressed="${!!fd.steps[s.id]}"><span class="tickbox">${fd.steps[s.id] ? '✓' : ''}</span><b style="font-size:14px">${L(s.en, s.hi)}</b></button>`).join('')}</div>${errOf('fdsteps')}</div>
        <div class="card"><h4>${L('Where do you sell today?', 'आज आप कहाँ बेचते हैं?')}</h4>
        <div class="chips">${[['b2b', L('B2B buyers only', 'सिर्फ़ B2B खरीदार')], ['online', L('Other online platforms', 'दूसरे ऑनलाइन प्लेटफ़ॉर्म')], ['meesho', L('Previously on Meesho', 'पहले Meesho पर')]].map(([k, l]) => `<button class="chip ${fd.sellsWhere === k ? 'sel' : 'grey'}" data-act="fdWhere" data-v="${k}">${l}</button>`).join('')}</div></div>` : ''}
      <button class="btn primary block mt12" data-act="fdNext1" ${cat ? '' : 'disabled'}>${L('Continue', 'आगे बढ़ें')}</button>`;
  } else if (st === 2) {
    const slot = (k, en, hi, sen, shi, req) => { const v = fd.photos[k]; return `<div class="pslot ${v ? 'done' : ''}" ${UI.err.photos && req && !v ? 'style="border-color:var(--bad)"' : ''}>${v ? photoEl(v, 'img') : `<span style="font-size:26px">📷</span>`}<b>${L(en, hi)}${req ? '' : ` <span class="opt xs">${L('(optional)', '(वैकल्पिक)')}</span>`}</b><small>${L(sen, shi)}</small>
      <div class="pbtns"><span class="btn ${v ? 'ghost' : 'soft'} xs filebtn">${v ? L('Retake', 'दोबारा लें') : L('Take photo', 'फोटो लें')}<input type="file" accept="image/*" capture="environment" data-photo="fd:${k}" aria-label="${L(en, hi)}"></span></div></div>`; };
    body += `<h2 style="margin:0 0 6px;font-size:20px">${L('Factory photos', 'फैक्ट्री की फोटो')}</h2><p class="hint mt0 mb12">${L('Take these photos at your factory. Photo location is matched with your pickup address.', 'ये फोटो अपनी फैक्ट्री में लें। फोटो की लोकेशन आपके पिकअप पते से मिलाई जाती है।')}</p>
      <div class="photos">${slot('floor', 'Production area', 'उत्पादन क्षेत्र', 'Machines in operation', 'चलती मशीनें', true)}${slot('stock', 'Finished goods', 'तैयार माल', 'Ready stock', 'तैयार स्टॉक', true)}${slot('board', 'Factory name board', 'फैक्ट्री का बोर्ड', 'Outside view', 'बाहर से', false)}</div>
      ${UI.err.photos ? `<p class="errtxt">${UI.err.photos}</p>` : ''}
      <div class="row mt16"><button class="btn ghost" data-act="fdBack">${L('Back', 'पीछे')}</button><button class="btn primary grow" data-act="fdNext2">${L('Continue', 'आगे बढ़ें')}</button></div>`;
  } else {
    const cat = CATS[fd.cat];
    body += `<h2 style="margin:0 0 12px;font-size:20px">${L('Review and submit', 'जाँचें और जमा करें')}</h2>
      <div class="field"><label for="udy">${L('Udyam registration number', 'उद्यम रजिस्ट्रेशन नंबर')} ${ti('udyam')} <span class="opt">${L('(optional)', '(वैकल्पिक)')}</span></label><input id="udy" class="input ${UI.err.udyam ? 'err' : ''}" maxlength="19" autocapitalize="characters" data-fdf="udyam" data-upper="1" value="${esc(fd.udyam)}" placeholder="UDYAM-XX-00-0000000">${errOf('udyam')}</div>
      <div class="card"><h4>${L('Application summary', 'आवेदन सारांश')}</h4>
        <div class="lrow"><span>${L('Category', 'कैटेगरी')}</span><span class="v">${catName(fd.cat)}</span></div>
        <div class="lrow"><span>${L('In-house steps', 'फैक्ट्री में काम')}</span><span class="v" style="white-space:normal;text-align:right">${cat.steps.filter(s => fd.steps[s.id]).map(s => L(s.en, s.hi)).join(', ')}</span></div>
        <div class="lrow"><span>${L('Photos', 'फोटो')}</span><span class="v">${Object.keys(fd.photos).length}</span></div>
        <div class="lrow"><span>${m.gst ? 'GSTIN' : L('Enrolment ID', 'एनरोलमेंट ID')}</span><span class="v">${esc(m.gst ? m.gstin : m.eid)}</span></div></div>
      ${fdWhat()}
      <div class="row mt12"><button class="btn ghost" data-act="fdBack">${L('Back', 'पीछे')}</button><button class="btn primary grow" data-act="fdSubmit">${L('Submit application', 'आवेदन जमा करें')}</button></div>`;
  }
  return shell(`<div class="pad">${stepbar}${body}</div>`, bar);
}
function fdWhat() {
  return `<div class="card"><h4>${L('Programme benefits', 'प्रोग्राम के फ़ायदे')} ${ti('fd')}</h4><ul class="ticks">
    <li><span class="ck">✓</span><span>${L(`${DB.cfg.launchDays}-day launch period, targeting ${nf(DB.cfg.viewsTarget)} views per product`, `${DB.cfg.launchDays} दिन की लॉन्च अवधि, हर प्रोडक्ट के ${nf(DB.cfg.viewsTarget)} व्यू का लक्ष्य`)} ${ti('launch')}</span></li>
    <li><span class="ck">✓</span><span>${L('Factory Direct tag on eligible products', 'योग्य प्रोडक्ट पर फैक्ट्री डायरेक्ट टैग')} ${ti('fdprice')}</span></li>
    <li><span class="ck">✓</span><span>${L('Dedicated account manager during the launch period', 'लॉन्च अवधि में समर्पित अकाउंट मैनेजर')}</span></li>
    <li><span class="ck">✓</span><span>${L('No lock-in. Continue as a regular supplier after the launch period.', 'कोई बंधन नहीं। लॉन्च अवधि के बाद आम सप्लायर की तरह जारी रखें।')}</span></li></ul></div>`;
}
function scrLaunch() {
  if (!requireLive()) return '';
  const m = me();
  if (m.fd.status !== 'approved') { location.hash = '#/fd'; return ''; }
  if (m.launchStart != null) { location.hash = '#/home'; return ''; }
  if (!UI.lsel) UI.lsel = {};
  const n = Object.values(UI.lsel).filter(Boolean).length;
  const ok = n >= 3 && n <= 5;
  const rows = m.products.map(p => { const on = !!UI.lsel[p.id]; const med = similarMedian(p.cat, p.type, p.packOf); const gap = (med - p.price) / med; return `<button class="opt-card" data-act="lsel" data-v="${p.id}" aria-pressed="${on}">${thumb(p, 'sm')}<span class="grow"><b style="font-size:14px">${esc(p.name)}</b><small>${R(p.price)} · ${L('Inventory', 'इन्वेंटरी')} ${p.stock}${gap * 100 < DB.cfg.priceAdv ? ` · <span class="warn b">${L('Above Factory Direct price', 'फैक्ट्री डायरेक्ट कीमत से ऊपर')}</span>` : ''}</small></span><span class="tickbox">${on ? '✓' : ''}</span></button>`; }).join('');
  return shell(`<div class="pad">
    <div class="note ok mb12"><span class="ni">✓</span><span><b>${L('Factory Direct application approved', 'फैक्ट्री डायरेक्ट आवेदन मंज़ूर')}</b></span></div>
    <h2 style="margin:0 0 6px;font-size:20px">${L('Select products for your launch period', 'लॉन्च अवधि के लिए प्रोडक्ट चुनें')} ${ti('launch')}</h2>
    <p class="hint mt0 mb12">${L('Select 3 to 5 products', '3 से 5 प्रोडक्ट चुनें')} · ${L('Selected', 'चुने गए')}: <b>${n}</b></p>
    <div class="choice mb12">${rows}</div>
    ${m.products.length < 3 ? `<div class="note info mb12"><span class="ni">i</span><span>${L(`Add at least ${3 - m.products.length} more product${3 - m.products.length > 1 ? 's' : ''}.`, `कम से कम ${3 - m.products.length} और प्रोडक्ट जोड़ें।`)}</span></div>` : ''}
    <button class="btn ghost block mb12" data-act="nav" data-v="#/products/new">+ ${L('Add product', 'प्रोडक्ट जोड़ें')}</button>
    <div class="card"><h4>${L('During the launch period', 'लॉन्च अवधि के दौरान')}</h4><ul class="ticks">
      <li><span class="ck">✓</span><span>${L(`Meesho targets ${nf(DB.cfg.viewsTarget)} views per selected product over ${DB.cfg.launchDays} days.`, `Meesho ${DB.cfg.launchDays} दिनों में हर चुने प्रोडक्ट के ${nf(DB.cfg.viewsTarget)} व्यू का लक्ष्य रखता है।`)}</span></li>
      <li><span class="ck">✓</span><span>${L(`Keep dispatch SLA at ${DB.cfg.slaPct}% or above.`, `डिस्पैच SLA ${DB.cfg.slaPct}% या ज़्यादा रखें।`)} ${ti('sla')}</span></li>
      <li><span class="ck">✓</span><span>${L('Track views, orders and earnings daily on Home.', 'होम पर रोज़ व्यू, ऑर्डर और कमाई देखें।')}</span></li></ul></div>
  </div><div class="stickyfoot"><button class="btn primary block" data-act="startLaunch" ${ok ? '' : 'disabled'}>${L('Start launch period', 'लॉन्च अवधि शुरू करें')}</button></div>`, { back: '#/home', title: L('Launch period', 'लॉन्च अवधि'), nav: 'home' });
}
