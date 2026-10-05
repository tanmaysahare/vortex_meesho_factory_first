'use strict';
/* =========================================================
   Deterministic simulation of views, orders, returns and
   payments. The seller app and the console both read from
   here, so their numbers always agree.
   Timeline for one order placed on day c:
     c      placed (seller accepts and packs)
     c+1    picked up
     c+4    delivered (or marked not delivered, RTO)
     c+4+k  return requested (k = 1..6) for returned orders
     c+9    RTO parcel back with the seller
     c+11   return window closed, payment released (delivery + 7)
   ========================================================= */

function typeOf(cat, type) { return CATS[cat].types.find(t => t.id === type) || CATS[cat].types[0]; }
function similarMedian(cat, type, packOf) { const t = typeOf(cat, type); return Math.round(t.base * (1 + 0.85 * ((packOf || 1) - 1))); }
function similarBand(cat, type, packOf) { const m = similarMedian(cat, type, packOf); return [Math.round(m * 0.82), Math.round(m * 1.24), m]; }
function fdTarget(cat, type, packOf) { return Math.floor(similarMedian(cat, type, packOf) * (1 - DB.cfg.priceAdv / 100)); }
function fee(slab) { return DB.cfg.fees[slab] ?? 65; }

/* Price and stock changes apply from the day they are made, so history never rewrites itself */
function priceAt(p, d) { let v = p.priceLog ? p.priceLog[0][1] : p.price; if (p.priceLog) for (const [dd, pp] of p.priceLog) if (dd <= d) v = pp; return v; }
function stockAt(p, d) { let v = p.stock; if (p.stockAdds) for (const [dd, n] of p.stockAdds) if (dd <= d) v += n; return v; }

const _simCache = new Map();
function simKey(s, p) { return [s.id, p.id, p.price, p.stock, p.launch, p.liveDay, s.launchStart, s.fd, DB.day, DB.cfg.launchDays, DB.cfg.viewsTarget, s.viewMul, s.rrAdd, JSON.stringify(p.priceLog || 0), JSON.stringify(p.stockAdds || 0), p.type, p.packOf].join('|'); }

/* s: seller {id, cat, fd, launchStart, viewMul, convMul, rrAdd, bias}; p: product */
function simProduct(s, p) {
  const key = simKey(s, p);
  if (_simCache.has(key)) return _simCache.get(key);
  const D = DB.day, L = DB.cfg.launchDays, per = DB.cfg.viewsTarget / L;
  const cat = CATS[p.cat || s.cat];
  const seed = h32(s.id + '|' + p.id);
  const med = similarMedian(p.cat || s.cat, p.type, p.packOf);
  const convFor = price => cat.conv * (s.convMul || 1) * clamp(1 + ((med - price) / med - 0.05) * 6, 0.25, 2.2);
  const gap = (med - p.price) / med;
  const conv = convFor(p.price);
  const rr = Math.min(0.6, cat.rr + (s.rrAdd || 0));
  const frac = rnd(seed, 777);
  const orders = [], vDays = [];
  let cumV = 0, cumE = 0, expPrev = 0, lost = 0;
  const start = p.liveDay ?? s.launchStart ?? D;
  for (let d = start; d <= D; d++) {
    const inL = p.launch && s.fd && s.launchStart != null && d >= s.launchStart && d < s.launchStart + L;
    let base;
    if (inL) base = per * 1.3 * Math.min(1, 0.55 + 0.25 * (d - s.launchStart));
    else base = per * (s.fd ? 0.55 : 0.35);
    const v = Math.max(0, Math.round(base * (s.viewMul || 1) * (0.7 + 0.6 * rnd(seed, d))));
    cumV += v;
    const price = priceAt(p, d);
    cumE += v * convFor(price);
    const exp = Math.floor(cumE + frac);
    let n = exp - expPrev; expPrev = exp;
    const back = orders.filter(o => (o.out === 'ret' && o.day + 11 <= d) || (o.out === 'rto' && o.day + 9 <= d)).length;
    const avail = stockAt(p, d) - orders.length + back;
    if (n > avail) { lost += n - Math.max(0, avail); n = Math.max(0, avail); }
    for (let k = 0; k < n; k++) {
      const i = orders.length, u = rnd(seed, 5000 + i);
      let out = 'kept', reason = null;
      if (u < rr) {
        out = 'ret';
        const rs = cat.reasons;
        reason = (s.bias && rnd(seed, 7000 + i) < 0.65) ? s.bias : rs[Math.floor(rnd(seed, 8000 + i) * rs.length)].id;
      } else if (u < rr + RTO_RATE) out = 'rto';
      orders.push({ id: 'MS' + (40000000 + (h32(seed + ':' + i) % 9999999)), sku: p.id, day: d, price, out, reason, rq: 1 + Math.floor(rnd(seed, 9000 + i) * 6), city: BUYER_CITIES[h32('c' + seed + i) % BUYER_CITIES.length] });
    }
    vDays.push({ d, v, n });
  }
  const back = orders.filter(o => (o.out === 'ret' && o.day + 11 <= D) || (o.out === 'rto' && o.day + 9 <= D)).length;
  const res = { p, med, gap, conv, rr, views: cumV, vDays, orders, lost, stockLeft: Math.max(0, stockAt(p, D) - orders.length + back) };
  _simCache.set(key, res);
  if (_simCache.size > 600) _simCache.clear();
  return res;
}
const BUYER_CITIES = ['Lucknow, UP', 'Patna, Bihar', 'Indore, MP', 'Nagpur, Maharashtra', 'Guwahati, Assam', 'Ranchi, Jharkhand', 'Bhopal, MP', 'Jodhpur, Rajasthan', 'Varanasi, UP', 'Cuttack, Odisha', 'Madurai, TN', 'Hubli, Karnataka', 'Siliguri, WB', 'Raipur, CG', 'Agra, UP', 'Vijayawada, AP'];

function orderStatus(o, D, rts) {
  const a = D - o.day;
  if (a < 0) return 'future';
  if (a === 0) return rts && rts[o.id] ? (rts[o.id] === 'packed' ? 'packed' : 'rts') : 'pending';
  if (a < 4) return 'transit';
  if (o.out === 'rto') return a < 9 ? 'rto_transit' : 'rto';
  if (o.out === 'ret') { if (a < 4 + o.rq) return 'delivered'; return a < 11 ? 'ret_transit' : 'returned'; }
  return 'delivered';
}

/* Aggregate metrics for a seller over a window [from, to] of days (inclusive) */
function sellerMetrics(s, from = -999, to = DB.day) {
  const D = DB.day;
  const sk = (s.products || []).map(p => {
    const r = simProduct(s, p);
    const inWin = o => o.day >= from && o.day <= to;
    const os = r.orders.filter(inWin);
    const views = r.vDays.filter(x => x.d >= from && x.d <= to).reduce((a, x) => a + x.v, 0);
    const delivered = os.filter(o => o.out !== 'rto' && o.day + 4 <= D).length;
    const returned = os.filter(o => o.out === 'ret' && o.day + 4 + o.rq <= D).length;
    const rto = os.filter(o => o.out === 'rto' && o.day + 4 <= D).length;
    const kept = os.filter(o => o.out === 'kept' && o.day + 11 <= D).length;
    return { p, r, views, orders: os.length, delivered, returned, rto, kept, conv: views ? os.length / views : 0, retRate: delivered ? returned / delivered : 0, gap: r.gap, stockLeft: r.stockLeft, lost: r.lost };
  });
  const t = sk.reduce((a, x) => { a.views += x.views; a.orders += x.orders; a.delivered += x.delivered; a.returned += x.returned; a.rto += x.rto; a.kept += x.kept; return a; }, { views: 0, orders: 0, delivered: 0, returned: 0, rto: 0, kept: 0 });
  t.conv = t.views ? t.orders / t.views : 0;
  t.retRate = t.delivered ? t.returned / t.delivered : 0;
  const ld = s.launchStart != null ? D - s.launchStart + 1 : null;
  return { sk, t, ld, inLaunch: !!(s.fd && ld != null && ld >= 1 && ld <= DB.cfg.launchDays) };
}

/* Payments: a delivered order is paid on delivery + settleDays; a return deducts the return delivery charge */
function sellerMoney(s) {
  const D = DB.day, sd = DB.cfg.settleDays;
  let paid = 0, upcoming = 0, retFees = 0, profit = 0, profitKnown = true;
  const pays = {};
  const add = (day, amt, isRet) => { const x = pays[day] || (pays[day] = { day, amt: 0, n: 0, r: 0 }); x.amt += amt; isRet ? x.r++ : x.n++; };
  const perSku = [];
  (s.products || []).forEach(p => {
    const r = simProduct(s, p), f = fee(p.slab || typeOf(p.cat || s.cat, p.type).slab);
    let sp = 0, sup = 0, sprof = 0;
    r.orders.forEach(o => {
      const del = o.day + 4, payDay = del + sd;
      if (o.out === 'rto' || del > D) return;
      const retNow = o.out === 'ret' && D >= del + o.rq;
      if (!retNow) {
        const net = (o.price ?? p.price) - f;
        if (payDay <= D) { paid += net; sp += net; add(payDay, net); if (p.cost) sprof += net - p.cost; }
        else { upcoming += net; sup += net; add(payDay, net); }
      } else {
        const payD = o.day + 11;
        if (payD <= D) { paid -= f; sp -= f; retFees += f; add(payD, -f, true); if (p.cost) sprof -= f; }
        else { upcoming -= f; sup -= f; add(payD, -f, true); }
      }
    });
    if (!p.cost) profitKnown = false;
    profit += sprof;
    perSku.push({ p, fee: f, net: p.price - f, paid: sp, upcoming: sup, profit: p.cost ? sprof : null, perOrderProfit: p.cost ? p.price - f - p.cost : null });
  });
  const list = Object.values(pays).sort((a, b) => b.day - a.day);
  const next = list.filter(x => x.day > D).sort((a, b) => a.day - b.day)[0] || null;
  return { paid, upcoming, retFees, profit, profitKnown, list, next, perSku };
}

/* ---------- Rules: when Meesho steps in ----------
   Each rule has an owner, an automatic first action and an escalation.
   The seller sees a plain tip, never the internal rule name. */
const RULES = [
  { id: 'views', owner: 'Category', sev: 'md', auto: false, name: 'Low launch views', when: 'From launch day 7, below 60% of target to date', first: 'Increase visibility for this product in feed and search.', esc: 'Category lead reviews ranking' },
  { id: 'conv', owner: 'Category', sev: 'md', auto: true, name: 'Low conversion', when: 'From launch day 10, 300+ views, below half the category rate', first: 'Send pricing and image recommendations to the supplier.', esc: 'Call after 7 days without improvement' },
  { id: 'returns', owner: 'Quality', sev: 'hi', auto: true, name: 'High return rate', when: '10+ delivered orders, above category average plus threshold', first: 'Send top return reason and recommended fix to the supplier.', esc: 'Quality call after 7 days' },
  { id: 'sla', owner: 'Supplier Ops', sev: 'hi', auto: false, name: 'Dispatch SLA breach', when: 'Weekly, below SLA target', first: 'Call the supplier to resolve dispatch delays.', esc: 'Pause new orders below 85%' },
  { id: 'price', owner: 'Category', sev: 'hi', auto: true, name: 'Price above Factory Direct limit', when: 'Price gap below the Factory Direct requirement', first: 'Notify supplier that the Factory Direct tag is paused on this product.', esc: 'Category call to review costs' },
  { id: 'stock', owner: 'Supplier Ops', sev: 'md', auto: true, name: 'Out of stock', when: 'Inventory reaches zero', first: 'Send inventory reminder to the supplier.', esc: 'Call after 5 days out of stock' },
  { id: 'inactive', owner: 'Supplier Ops', sev: 'md', auto: true, name: 'Inactive supplier', when: 'No app activity for the set number of days', first: 'Send re-engagement message to the supplier.', esc: 'Call after 14 days' },
  { id: 'signup', owner: 'Sourcing', sev: 'lo', auto: true, name: 'Registration stalled', when: '2+ days on the same step', first: 'Send registration resume link on WhatsApp.', esc: 'Sourcing call to assist' },
  { id: 'review', owner: 'Verification', sev: 'md', auto: false, name: 'Review overdue', when: 'Application waiting more than 2 days', first: 'Complete manual review of the application.', esc: 'Team lead reassigns' }
];
const STEP_NAMES = { mobile: 'mobile number', otp: 'OTP', email: 'email', gst: 'GST details', address: 'pickup address', bank: 'bank details', store: 'store details', review: 'final review' };
function evalRules(s) {
  const out = [], D = DB.day, c = DB.cfg;
  const add = (id, signal, extra = {}) => { const r = RULES.find(x => x.id === id); out.push({ key: s.id + ':' + id + (extra.sku ? ':' + extra.sku : ''), rule: r, seller: s, signal, ...extra }); };
  if (s.stage === 'registering') { const stuck = D - (s.stuckSince ?? D); if (stuck >= 2) add('signup', `Stuck on the ${STEP_NAMES[s.signupStep] || s.signupStep} step for ${stuck} days.`); return out; }
  if (s.stage === 'fd_review') { const w = D - (s.fdSubmitted ?? D); if (w >= 2) add('review', `Application waiting ${w} days.`); return out; }
  if (!s.products || !s.products.length) return out;
  const m = sellerMetrics(s);
  if (m.inLaunch && m.ld >= 7) {
    const exp = c.viewsTarget * (m.ld / c.launchDays);
    m.sk.forEach(x => { if (x.p.launch && x.views < exp * 0.6) add('views', `${x.p.name}: ${x.views} views by launch day ${m.ld}, expected about ${Math.round(exp)}.`, { sku: x.p.id }); });
  }
  if (m.ld != null && m.ld >= 10) m.sk.forEach(x => { const cc = CATS[x.p.cat || s.cat].conv; if (x.views >= 300 && x.conv < cc * 0.5) add('conv', `${x.p.name}: ${(x.conv * 100).toFixed(1)}% conversion vs ${(cc * 100).toFixed(1)}% category average.`, { sku: x.p.id }); });
  if (m.t.delivered >= 10) { const ca = CATS[s.cat].rr; if (m.t.retRate > ca + c.retOver / 100) { const top = topReason(m); add('returns', `Returns ${(m.t.retRate * 100).toFixed(0)}% vs ${(ca * 100).toFixed(0)}% category average.${top ? ' Top reason: ' + top.toLowerCase() + '.' : ''}`); } }
  if ((s.onTime ?? 100) < c.slaPct) add('sla', `Dispatch SLA ${s.onTime}% vs ${c.slaPct}% target.`);
  if (s.fd) m.sk.forEach(x => { if (x.p.launch && x.gap * 100 < c.priceAdv) add('price', `${x.p.name}: ${(x.gap * 100).toFixed(1)}% below benchmark, requires ${c.priceAdv}%.`, { sku: x.p.id }); });
  m.sk.forEach(x => { if (x.stockLeft === 0) add('stock', `${x.p.name} is out of stock.${x.lost ? ' About ' + x.lost + ' orders missed.' : ''}`, { sku: x.p.id }); });
  const idle = D - (s.lastActive ?? D);
  if (idle >= c.inactiveDays) add('inactive', `No app activity for ${idle} days.`);
  // one action item per supplier and rule: merge product-level alerts
  const merged = [];
  out.forEach(a => {
    const k = s.id + ':' + a.rule.id, ex = merged.find(x => x.key === k);
    if (!ex) merged.push({ ...a, key: k, skus: a.sku ? [a.sku] : [], parts: [a.signal] });
    else { ex.skus.push(a.sku); ex.parts.push(a.signal); }
  });
  merged.forEach(a => { if (a.parts.length > 1) a.signal = `${a.parts.length} products affected. ` + a.parts.join(' '); });
  return merged;
}
function topReason(m) {
  const cnt = {};
  m.sk.forEach(x => x.r.orders.forEach(o => { if (o.out === 'ret' && o.day + 4 + o.rq <= DB.day && o.reason !== 'mind') cnt[o.reason] = (cnt[o.reason] || 0) + 1; }));
  const k = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0];
  if (!k) return null;
  const r = Object.values(CATS).flatMap(c => c.reasons).find(x => x.id === k[0]);
  return r ? r.en : null;
}
/* Health bucket from alerts: nothing / automatic only / needs a person / at risk */
function health(s, alerts) {
  const open = alerts.filter(a => !DB.done[a.key]);
  if (['registering', 'fd_review', 'fd_info', 'fd_checking', 'review', 'visitor'].includes(s.stage) || !s.products || !s.products.length) return { id: 'na', label: 'Not live' };
  if (open.some(a => a.rule.id === 'price' || (a.rule.id === 'inactive' && DB.day - (s.lastActive ?? DB.day) >= 14))) return { id: 'risk', label: 'At risk' };
  if (open.some(a => !a.rule.auto)) return { id: 'call', label: 'Needs call' };
  if (open.length) return { id: 'auto', label: 'Auto-nudged' };
  return { id: 'ok', label: 'Healthy' };
}
