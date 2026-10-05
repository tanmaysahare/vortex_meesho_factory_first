'use strict';
/* =========================================================
   App state, persistence (localStorage), presets, audit log.
   One browser = one shared state, so the seller app and the
   console in two tabs stay in sync.
   ========================================================= */
let DB;

function freshMe() {
  return {
    stage: 'none',            // none | signup | review | live
    step: 'mobile', stepSince: null,
    mobile: '', otpOk: false, email: '',
    gstMode: null, gstin: '', gst: null,
    pan: '', panName: '', eidState: '', eid: '', makesSelf: null,
    addr: null, bank: null, store: '', name: '', agree: false,
    submittedDay: null, liveDay: null, reviewStartedMs: null, pwSet: false,
    // fd.status: none | draft | checking (automated checks) | review (manual) | info | approved | rejected
    fd: { status: 'none', step: 1, cat: null, steps: {}, sellsWhere: null, photos: {}, udyam: '', geoKm: 0.3, submittedDay: null, checkStartedMs: null, reason: null, decidedDay: null },
    products: [], launchStart: null,
    rts: {}, chk: {}, summarySeen: false,
    notes: [], lastActive: null
  };
}
function freshDB() {
  return {
    v: 3, day: 30, lang: 'en', role: 'admin', demo: false,
    cfg: JSON.parse(JSON.stringify(CFG_DEFAULT)),
    me: freshMe(),
    seedOv: {}, leadOv: {}, done: {}, audit: seedAudit()
  };
}
function seedAudit() {
  return [
    { day: 29, time: '17:42', who: 'Kavya Sharma (Sourcing)', what: 'Sent registration link to Patel Polymers on WhatsApp' },
    { day: 29, time: '15:10', who: 'System', what: 'Inventory reminder sent to Ganesh Plasto: 3 products out of stock' },
    { day: 28, time: '11:05', who: 'Neha Mehta (Verification)', what: 'Rejected Factory Direct for Shiv Shakti Traders (GST shows trading, not manufacturing)' },
    { day: 26, time: '10:30', who: 'System', what: 'Auto-approved Factory Direct for Laxmi Moulders (all automated checks passed)' },
    { day: 24, time: '09:15', who: 'Ananya Rao (Programme Lead)', what: 'Changed views target per product from 800 to 1,000' }
  ];
}
function load() {
  try { DB = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch (e) { DB = null; }
  if (!DB || DB.v !== 3) DB = freshDB();
  DB.cfg = Object.assign(JSON.parse(JSON.stringify(CFG_DEFAULT)), DB.cfg || {});
  DB.me = Object.assign(freshMe(), DB.me || {});
  DB.me.fd = Object.assign(freshMe().fd, DB.me.fd || {});
}
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(DB)); }
  catch (e) {
    // storage full (usually photos): keep the app working, drop photo data
    try { Object.keys(DB.me.fd.photos).forEach(k => { if (String(DB.me.fd.photos[k]).startsWith('data:')) DB.me.fd.photos[k] = 'sample:' + k; }); localStorage.setItem(STORE_KEY, JSON.stringify(DB)); } catch (e2) { /* ignore */ }
  }
}
function audit(who, what) {
  const t = new Date();
  DB.audit.unshift({ day: DB.day, time: String(t.getHours()).padStart(2, '0') + ':' + String(t.getMinutes()).padStart(2, '0'), who, what });
  DB.audit = DB.audit.slice(0, 300);
}
function notify(en, hi, kind = 'info') { DB.me.notes.unshift({ day: DB.day, en, hi, kind, read: false }); DB.me.notes = DB.me.notes.slice(0, 30); }
function touch() { DB.me.lastActive = DB.day; }
function dayDate(d) { const x = new Date(START_DATE); x.setDate(x.getDate() + d - 1); return x.toLocaleDateString(DB.lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short' }); }
function roleName() { return { admin: 'Ananya Rao (Programme Lead)', sourcing: 'Kavya Sharma (Sourcing)', verification: 'Neha Mehta (Verification)', category: 'Rohit Kumar (Category)' }[DB.role] || 'Ananya Rao (Programme Lead)'; }

/* ---------- The demo seller as a console record ---------- */
function meCohort() { return { b2b: 'offline', online: 'online', meesho: 'churned' }[DB.me.fd.sellsWhere] || 'unknown'; }
function meSeller() {
  const m = DB.me;
  let stage = 'visitor';
  if (m.stage === 'signup') stage = 'registering';
  else if (m.stage === 'review') stage = 'review';
  else if (m.stage === 'live') {
    stage = { review: 'fd_review', checking: 'fd_checking', info: 'fd_info', approved: 'fd' }[m.fd.status] || 'regular';
  }
  const g = m.gst;
  return {
    id: 'me', isMe: true,
    name: m.store || (g && g.trade) || (m.stage === 'none' ? 'Visitor' : 'New registration · +91 ' + (m.mobile || '-')),
    owner: m.name || (g && g.legal) || m.panName || '-',
    city: (m.addr && m.addr.city) || (g && g.addr.city) || '-',
    state: (g && g.state) || m.eidState || '-',
    cat: m.fd.cat || (m.products[0] && m.products[0].cat) || 'home',
    cohort: meCohort(), source: 'Self-registered', am: 'Kavya', mobile: m.mobile,
    stage, signupStep: m.step, stuckSince: m.stepSince,
    fdSubmitted: m.fd.submittedDay, fdStatus: m.fd.status,
    gstNature: g ? g.nature : (m.makesSelf ? ['No GST: self-declared manufacturer'] : (m.eid ? ['No GST'] : [])),
    gstStatus: g ? g.status : null, gstin: m.gstin, eid: m.eid,
    fdSteps: Object.keys(m.fd.steps).filter(k => m.fd.steps[k]), udyam: m.fd.udyam, geoKm: m.fd.geoKm ?? 0.3, photos: m.fd.photos,
    fd: m.fd.status === 'approved', launchStart: m.launchStart,
    products: m.products, onTime: meOnTime(), lastActive: DB.day /* the person using the app is active */, supportMin: 12,
    bank: m.bank, addr: m.addr
  };
}
function meOnTime() { return 100; }

function seedSeller(sd) {
  const ov = DB.seedOv[sd.id] || {};
  const s = { ...sd, ...ov };
  s.fd = s.stage === 'fd';
  s.lastActive = DB.day - (sd.idle || 0); // sample sellers keep their idle gap as the clock moves
  s.products = (sd.products || []).map(p => ({ ...p, cat: sd.cat, slab: typeOf(sd.cat, p.type).slab, liveDay: sd.launchStart ?? sd.liveFrom ?? 1 }));
  return s;
}
function allSellers() {
  const list = SEEDS.map(seedSeller);
  if (DB.me.stage !== 'none') list.unshift(meSeller());
  return list;
}
function stageLabel(s) {
  const L = DB.cfg.launchDays;
  switch (s.stage) {
    case 'visitor': return 'Visitor';
    case 'registering': return 'Registering · ' + (STEP_NAMES[s.signupStep] || s.signupStep);
    case 'review': return 'Account verification';
    case 'fd_checking': return 'Automated checks running';
    case 'fd_review': return 'Manual review';
    case 'fd_info': return 'Changes requested';
    case 'regular': return s.fdRejected ? 'Standard supplier (FD rejected)' : 'Standard supplier';
    case 'fd': {
      if (s.launchStart == null) return 'Approved · launch not started';
      const ld = DB.day - s.launchStart + 1;
      if (ld < 1) return 'Launch scheduled';
      return ld <= L ? `Launch · day ${ld}/${L}` : 'Launch completed';
    }
  }
  return s.stage;
}

/* ---------- Presets for the demo ---------- */
function sampleIdentity() {
  const g = GST_SAMPLES[0];
  const me = freshMe();
  Object.assign(me, {
    mobile: '9812345678', otpOk: true, email: 'rakesh@sutradhar.in', gstMode: 'gst', gstin: g.gstin,
    gst: { ...g, state: GST_STATES[g.gstin.slice(0, 2)], pan: g.gstin.slice(2, 12) },
    addr: { ...g.addr, line3: '', state: 'Haryana' },
    bank: { acc: '50100234567812', ifsc: 'HDFC0001234', bankName: 'HDFC Bank', branch: 'Industrial Area', holder: g.legal, verified: true },
    store: 'Sutradhar Home Textiles', name: 'Rakesh Malik', agree: true, step: 'review'
  });
  return me;
}
function sampleProducts(liveDay) {
  return [
    { id: 'p1', cat: 'home', type: 'cushion', name: 'Cotton cushion covers 16 × 16 in, geometric, pack of 2', packOf: 2, size: '16 × 16 in', material: 'Cotton', colour: 'Blue', price: 229, mrp: 499, slab: 's1', stock: 80, cost: 118, photo: 'sw1', launch: true, liveDay },
    { id: 'p2', cat: 'home', type: 'runner', name: 'Handloom table runner 13 × 72 in, mustard stripe', packOf: 1, size: '13 × 72 in', material: 'Cotton', colour: 'Mustard', price: 175, mrp: 399, slab: 's1', stock: 60, cost: 92, photo: 'sw2', launch: true, liveDay },
    { id: 'p3', cat: 'home', type: 'bedsheet', name: 'Cotton double bedsheet with 2 pillow covers, block print', packOf: 1, size: '90 × 100 in', material: 'Cotton', colour: 'Maroon', price: 445, mrp: 999, slab: 's2', stock: 50, cost: 290, photo: 'sw3', launch: true, liveDay }
  ];
}
function applyPreset(k) {
  const keepLang = DB.lang;
  if (k === 'fresh') { DB.me = freshMe(); }
  else {
    const me = sampleIdentity();
    me.stage = 'review'; me.submittedDay = DB.day - 1; me.lastActive = DB.day;
    if (k !== 'review') {
      me.stage = 'live'; me.liveDay = DB.day - 1;
      if (k !== 'live') {
        // a manual-review case: photos taken away from the pickup address
        me.fd = { ...freshMe().fd, status: 'review', cat: 'home', steps: { weave: true, dye: false, stitch: true, pack: true }, sellsWhere: 'b2b', photos: { floor: 'sample:floor', stock: 'sample:stock' }, udyam: 'UDYAM-HR-06-0034567', geoKm: 9.4, submittedDay: DB.day - 1, step: 3 };
        if (k === 'launch' || k === 'grad') {
          const ls = k === 'launch' ? DB.day - 13 : DB.day - DB.cfg.launchDays - 5;
          me.fd.status = 'approved'; me.fd.geoKm = 0.3; me.fd.decidedDay = ls - 1; me.liveDay = ls - 3; me.submittedDay = ls - 5;
          me.launchStart = ls; me.products = sampleProducts(ls);
          me.notes = [{ day: ls, en: 'Your launch period has started.', hi: 'आपकी लॉन्च अवधि शुरू हो गई है।', kind: 'good', read: true }, { day: ls - 1, en: 'Factory Direct application approved.', hi: 'फैक्ट्री डायरेक्ट आवेदन मंज़ूर।', kind: 'good', read: true }];
        }
      }
    }
    DB.me = me;
  }
  DB.lang = keepLang;
}
function resetAll() { const lang = DB.lang; DB = freshDB(); DB.lang = lang; }
