'use strict';
/* =========================================================
   Static data, config, validators and simulated services.
   Everything here is sample data for a concept prototype.
   ========================================================= */

const STORE_KEY = 'fd_proto_v3';
const START_DATE = new Date(2026, 8, 1); // programme day 1 = 1 Sep 2026

const CFG_DEFAULT = {
  launchDays: 30,        // length of the Factory Direct launch period
  viewsTarget: 1000,     // views per launch product Meesho aims to deliver in the launch
  priceAdv: 10,          // % below similar listings needed for the Factory Direct tag
  retOver: 5,            // return-rate points above category average that raise an alert
  slaPct: 95,            // on-time dispatch target
  settleDays: 7,         // payment this many days after delivery
  inactiveDays: 7,       // days without activity before a nudge
  fees: { s1: 45, s2: 65, s3: 95, s4: 140 } // delivery charge per weight slab (illustrative)
};
const SLABS = [
  { id: 's1', en: 'Up to 500 g', hi: '500 ग्राम तक' },
  { id: 's2', en: '500 g to 1 kg', hi: '500 ग्राम से 1 किलो' },
  { id: 's3', en: '1 to 2 kg', hi: '1 से 2 किलो' },
  { id: 's4', en: '2 to 5 kg', hi: '2 से 5 किलो' }
];

/* Category templates: production steps, product types, attributes, return reasons.
   New categories are added here, nothing else changes. */
const CATS = {
  home: {
    en: 'Home furnishing', hi: 'होम फर्निशिंग', icon: '🛏️', rr: 0.12, conv: 0.018, hsn: '6304', gst: '5%',
    steps: [
      { id: 'weave', en: 'Weaving or knitting the fabric', hi: 'कपड़े की बुनाई', core: true },
      { id: 'dye', en: 'Dyeing or printing', hi: 'रंगाई या छपाई', core: true },
      { id: 'stitch', en: 'Cutting and stitching', hi: 'कटाई और सिलाई', core: true },
      { id: 'pack', en: 'Packing', hi: 'पैकिंग', core: false }
    ],
    types: [
      { id: 'cushion', en: 'Cushion covers', hi: 'कुशन कवर', base: 140, slab: 's1', sizes: ['12 × 12 in', '16 × 16 in', '18 × 18 in', '24 × 24 in'] },
      { id: 'bedsheet', en: 'Double bedsheet with 2 pillow covers', hi: 'डबल बेडशीट, 2 तकिया कवर', base: 499, slab: 's2', sizes: ['90 × 100 in', '90 × 108 in'] },
      { id: 'curtain', en: 'Door curtains', hi: 'दरवाज़े के पर्दे', base: 299, slab: 's2', sizes: ['4 × 7 ft', '4 × 9 ft'] },
      { id: 'runner', en: 'Table runner', hi: 'टेबल रनर', base: 199, slab: 's1', sizes: ['13 × 72 in', '13 × 90 in'] }
    ],
    materials: ['Cotton', 'Cotton blend', 'Polyester', 'Jute'],
    packChecks: [
      { en: 'Count matches the pack (e.g. 2 covers)', hi: 'गिनती पैक से मेल खाती है (जैसे 2 कवर)' },
      { en: 'Colour matches the product photo', hi: 'रंग फोटो से मेल खाता है' },
      { en: 'Folded in a sealed polybag, label on top', hi: 'सील पॉलीबैग में, ऊपर लेबल' }
    ],
    reasons: [
      { id: 'colour', en: 'Colour looked different from the photo', hi: 'रंग फोटो से अलग लगा', fixEn: 'Retake photos in daylight so colours look true.', fixHi: 'दिन की रोशनी में फोटो दोबारा लें ताकि रंग सही दिखें।' },
      { id: 'size', en: 'Smaller than expected', hi: 'उम्मीद से छोटा लगा', fixEn: 'Write the size in the title and add a photo with a measuring tape.', fixHi: 'टाइटल में साइज़ लिखें और इंची टेप वाली फोटो जोड़ें।' },
      { id: 'thin', en: 'Fabric felt thinner than expected', hi: 'कपड़ा उम्मीद से पतला लगा', fixEn: 'Mention fabric weight (GSM) in the title and add a close-up photo.', fixHi: 'टाइटल में कपड़े का वज़न (GSM) लिखें और पास से फोटो जोड़ें।' },
      { id: 'mind', en: 'Buyer changed their mind', hi: 'ग्राहक ने मन बदल लिया', fixEn: 'No action needed. This happens with every seller.', fixHi: 'कुछ करने की ज़रूरत नहीं। यह हर विक्रेता के साथ होता है।' }
    ]
  },
  apparel: {
    en: 'Women ethnic wear', hi: 'महिला एथनिक वियर', icon: '👗', rr: 0.2, conv: 0.02, hsn: '6204', gst: '5%',
    steps: [
      { id: 'fabric', en: 'Making or processing the fabric', hi: 'कपड़ा बनाना या प्रोसेस करना', core: true },
      { id: 'cut', en: 'Cutting', hi: 'कटाई', core: true },
      { id: 'stitch', en: 'Stitching', hi: 'सिलाई', core: true },
      { id: 'finish', en: 'Finishing and packing', hi: 'फिनिशिंग और पैकिंग', core: false }
    ],
    types: [
      { id: 'kurti', en: 'Kurti', hi: 'कुर्ती', base: 399, slab: 's1', sizes: ['S to XXL', 'M to 3XL'] },
      { id: 'kurtaset', en: 'Kurta set with dupatta', hi: 'दुपट्टे के साथ कुर्ता सेट', base: 649, slab: 's2', sizes: ['S to XXL', 'M to 3XL'] },
      { id: 'dupatta', en: 'Dupatta', hi: 'दुपट्टा', base: 199, slab: 's1', sizes: ['Free size'] }
    ],
    materials: ['Rayon', 'Cotton', 'Georgette', 'Crepe'],
    packChecks: [
      { en: 'Size on the tag matches the order', hi: 'टैग का साइज़ ऑर्डर से मेल खाता है' },
      { en: 'No loose threads or stains', hi: 'कोई ढीला धागा या दाग नहीं' },
      { en: 'Folded in a sealed polybag, label on top', hi: 'सील पॉलीबैग में, ऊपर लेबल' }
    ],
    reasons: [
      { id: 'fit', en: 'Size did not fit', hi: 'साइज़ फिट नहीं हुआ', fixEn: 'Add a size chart with chest and length in inches.', fixHi: 'छाती और लंबाई इंच में लिखा साइज़ चार्ट जोड़ें।' },
      { id: 'colour', en: 'Colour looked different from the photo', hi: 'रंग फोटो से अलग लगा', fixEn: 'Retake photos in daylight so colours look true.', fixHi: 'दिन की रोशनी में फोटो दोबारा लें ताकि रंग सही दिखें।' },
      { id: 'quality', en: 'Fabric quality not as expected', hi: 'कपड़े की क्वालिटी उम्मीद जैसी नहीं', fixEn: 'Add a close-up photo of the fabric and name the fabric in the title.', fixHi: 'कपड़े की पास से फोटो जोड़ें और टाइटल में कपड़े का नाम लिखें।' },
      { id: 'mind', en: 'Buyer changed their mind', hi: 'ग्राहक ने मन बदल लिया', fixEn: 'No action needed. This happens with every seller.', fixHi: 'कुछ करने की ज़रूरत नहीं। यह हर विक्रेता के साथ होता है।' }
    ]
  },
  storage: {
    en: 'Kitchen storage', hi: 'किचन स्टोरेज', icon: '🫙', rr: 0.07, conv: 0.016, hsn: '3924', gst: '18%',
    steps: [
      { id: 'mould', en: 'Own moulds or dies', hi: 'अपने मोल्ड या डाई', core: true },
      { id: 'moulding', en: 'Moulding or forming', hi: 'मोल्डिंग', core: true },
      { id: 'assembly', en: 'Assembly or printing', hi: 'असेंबली या प्रिंटिंग', core: true },
      { id: 'pack', en: 'Packing', hi: 'पैकिंग', core: false }
    ],
    types: [
      { id: 'container', en: 'Airtight container set', hi: 'एयरटाइट कंटेनर सेट', base: 299, slab: 's2', sizes: ['3 × 500 ml', '3 × 1 L', '4 × 1.5 L'] },
      { id: 'organiser', en: 'Drawer organiser', hi: 'ड्रॉअर ऑर्गनाइज़र', base: 249, slab: 's2', sizes: ['4 compartments', '6 compartments'] },
      { id: 'bottle', en: 'Fridge water bottle', hi: 'फ्रिज पानी की बोतल', base: 149, slab: 's1', sizes: ['750 ml', '1 L'] }
    ],
    materials: ['PP plastic', 'PET', 'Stainless steel'],
    packChecks: [
      { en: 'Every lid fits and closes', hi: 'हर ढक्कन ठीक से बंद होता है' },
      { en: 'Each piece wrapped against cracks', hi: 'हर पीस टूटने से बचाने के लिए लपेटा' },
      { en: 'Box taped, label on top', hi: 'डिब्बा टेप किया, ऊपर लेबल' }
    ],
    reasons: [
      { id: 'damage', en: 'Arrived cracked or damaged', hi: 'टूटा या खराब पहुँचा', fixEn: 'Use a thicker box and wrap each piece separately.', fixHi: 'मोटा डिब्बा लें और हर पीस अलग से लपेटें।' },
      { id: 'size', en: 'Smaller than expected', hi: 'उम्मीद से छोटा लगा', fixEn: 'Show capacity in the title and add a photo next to a common object.', fixHi: 'टाइटल में क्षमता लिखें और किसी आम चीज़ के साथ फोटो जोड़ें।' },
      { id: 'lid', en: 'Lid did not close properly', hi: 'ढक्कन ठीक से बंद नहीं हुआ', fixEn: 'Check every lid before packing.', fixHi: 'पैकिंग से पहले हर ढक्कन जाँचें।' },
      { id: 'mind', en: 'Buyer changed their mind', hi: 'ग्राहक ने मन बदल लिया', fixEn: 'No action needed. This happens with every seller.', fixHi: 'कुछ करने की ज़रूरत नहीं। यह हर विक्रेता के साथ होता है।' }
    ]
  }
};
const COLOURS = ['Blue', 'Mustard', 'Maroon', 'Green', 'Ivory', 'Pink', 'Grey', 'Multicolour'];
const RTO_RATE = 0.07;

/* GST state codes and pincode prefixes */
const GST_STATES = {
  '01': 'Jammu and Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab', '04': 'Chandigarh', '05': 'Uttarakhand', '06': 'Haryana',
  '07': 'Delhi', '08': 'Rajasthan', '09': 'Uttar Pradesh', '10': 'Bihar', '18': 'Assam', '19': 'West Bengal', '20': 'Jharkhand',
  '21': 'Odisha', '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat', '27': 'Maharashtra', '29': 'Karnataka',
  '30': 'Goa', '32': 'Kerala', '33': 'Tamil Nadu', '36': 'Telangana', '37': 'Andhra Pradesh'
};
const STATE_LIST = [...new Set(Object.values(GST_STATES))].sort();
const PIN_PREFIX = {
  '11': ['Delhi'], '12': ['Haryana'], '13': ['Haryana', 'Punjab', 'Chandigarh'], '14': ['Punjab'], '15': ['Punjab'], '16': ['Punjab', 'Chandigarh'],
  '17': ['Himachal Pradesh'], '18': ['Jammu and Kashmir'], '19': ['Jammu and Kashmir'],
  '20': ['Uttar Pradesh'], '21': ['Uttar Pradesh'], '22': ['Uttar Pradesh'], '23': ['Uttar Pradesh'], '24': ['Uttar Pradesh', 'Uttarakhand'],
  '25': ['Uttar Pradesh'], '26': ['Uttar Pradesh', 'Uttarakhand'], '27': ['Uttar Pradesh'], '28': ['Uttar Pradesh'],
  '30': ['Rajasthan'], '31': ['Rajasthan'], '32': ['Rajasthan'], '33': ['Rajasthan'], '34': ['Rajasthan'],
  '36': ['Gujarat'], '37': ['Gujarat'], '38': ['Gujarat'], '39': ['Gujarat'],
  '40': ['Maharashtra', 'Goa'], '41': ['Maharashtra'], '42': ['Maharashtra'], '43': ['Maharashtra'], '44': ['Maharashtra'],
  '45': ['Madhya Pradesh'], '46': ['Madhya Pradesh'], '47': ['Madhya Pradesh'], '48': ['Madhya Pradesh'], '49': ['Chhattisgarh'],
  '50': ['Telangana'], '51': ['Andhra Pradesh'], '52': ['Andhra Pradesh'], '53': ['Andhra Pradesh'],
  '56': ['Karnataka'], '57': ['Karnataka'], '58': ['Karnataka'], '59': ['Karnataka'],
  '60': ['Tamil Nadu'], '61': ['Tamil Nadu'], '62': ['Tamil Nadu'], '63': ['Tamil Nadu'], '64': ['Tamil Nadu'],
  '67': ['Kerala'], '68': ['Kerala'], '69': ['Kerala'],
  '70': ['West Bengal'], '71': ['West Bengal'], '72': ['West Bengal'], '73': ['West Bengal'], '74': ['West Bengal'],
  '75': ['Odisha'], '76': ['Odisha'], '77': ['Odisha'], '78': ['Assam'],
  '80': ['Bihar'], '81': ['Bihar', 'Jharkhand'], '82': ['Bihar', 'Jharkhand'], '83': ['Jharkhand'], '84': ['Bihar'], '85': ['Bihar']
};
const BANKS = {
  SBIN: 'State Bank of India', HDFC: 'HDFC Bank', ICIC: 'ICICI Bank', PUNB: 'Punjab National Bank', BARB: 'Bank of Baroda',
  UBIN: 'Union Bank of India', CNRB: 'Canara Bank', KKBK: 'Kotak Mahindra Bank', UTIB: 'Axis Bank', IDIB: 'Indian Bank', YESB: 'Yes Bank', IDFB: 'IDFC First Bank'
};
const TAKEN_STORES = ['fashion hub', 'shree ram', 'home decor', 'kitchen king', 'trendy', 'meesho'];

/* ---------- Validators ---------- */
const GST_CH = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function gstCheckChar(first14) {
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const v = GST_CH.indexOf(first14[i]);
    const p = v * (i % 2 === 0 ? 1 : 2);
    sum += Math.floor(p / 36) + (p % 36);
  }
  return GST_CH[(36 - (sum % 36)) % 36];
}
const V = {
  mobile: s => /^[6-9]\d{9}$/.test(s),
  email: s => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(s),
  gstinFormat: s => /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(s),
  gstin: s => V.gstinFormat(s) && gstCheckChar(s.slice(0, 14)) === s[14] && !!GST_STATES[s.slice(0, 2)],
  pan: s => /^[A-Z]{3}[PCHFATBLJG][A-Z]\d{4}[A-Z]$/.test(s),
  ifsc: s => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(s),
  acc: s => /^\d{9,18}$/.test(s),
  pin: s => /^[1-9]\d{5}$/.test(s),
  udyam: s => /^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/.test(s),
  store: s => /^[A-Za-z0-9 &'.-]{3,40}$/.test(s.trim()),
  name: s => /^[A-Za-z .'-]{3,60}$/.test(s.trim())
};
function pinStates(pin) { return PIN_PREFIX[pin.slice(0, 2)] || null; }

/* ---------- Sample GST records (the lookup is simulated) ---------- */
function mkGstin(base14) { return base14 + gstCheckChar(base14); }
const GST_SAMPLES = [
  {
    key: 'mfr', label: { en: 'Manufacturer', hi: 'निर्माता' }, gstin: mkGstin('06AKSPM4821L1Z'),
    legal: 'Rakesh Malik', trade: 'Sutradhar Home Textiles', status: 'Active', type: 'Proprietorship',
    nature: ['Factory / Manufacturing', 'Wholesale Business'],
    addr: { line1: 'Plot 47, Sector 29 Part 2', line2: 'HSIIDC Industrial Area', city: 'Panipat', pin: '132103' }
  },
  {
    key: 'trader', label: { en: 'Trader', hi: 'ट्रेडर' }, gstin: mkGstin('07AAFFM3317C1Z'),
    legal: 'Mehta Trading Co', trade: 'Mehta Trading Co', status: 'Active', type: 'Partnership',
    nature: ['Wholesale Business', 'Retail Business'],
    addr: { line1: '2381, Katra Neel', line2: 'Chandni Chowk', city: 'Delhi', pin: '110006' }
  },
  {
    key: 'cancelled', label: { en: 'Cancelled GST', hi: 'रद्द GST' }, gstin: mkGstin('33AAHCK7702D1Z'),
    legal: 'Kaveri Knit Fabrics Private Limited', trade: 'Kaveri Knit Fabrics', status: 'Cancelled', type: 'Private Limited Company',
    nature: ['Factory / Manufacturing'],
    addr: { line1: 'SF 112, Avinashi Road', line2: 'Tiruppur North', city: 'Tiruppur', pin: '641603' }
  }
];
const FAKE_NAMES = ['Shree Balaji Industries', 'Navkar Enterprises', 'Om Sai Manufacturing', 'Jai Ambe Creations', 'Kiran Textiles', 'Surya Polymers'];
const FAKE_CITIES = { Haryana: ['Panipat', '132103'], Delhi: ['Delhi', '110020'], Gujarat: ['Surat', '395003'], Maharashtra: ['Bhiwandi', '421302'], 'Tamil Nadu': ['Karur', '639001'], Rajasthan: ['Jaipur', '302013'], 'Uttar Pradesh': ['Kanpur', '208012'], Punjab: ['Ludhiana', '141003'], Karnataka: ['Bengaluru', '560058'], 'West Bengal': ['Kolkata', '700001'] };

/* Simulated network call with realistic latency */
function fakeCall(result, ms = 700) { return new Promise(r => setTimeout(() => r(result), ms)); }
function gstLookup(gstin) {
  const s = GST_SAMPLES.find(x => x.gstin === gstin);
  const state = GST_STATES[gstin.slice(0, 2)];
  if (s) return fakeCall({ ...s, state, pan: gstin.slice(2, 12) });
  const h = h32(gstin);
  const c = FAKE_CITIES[state] || [state.split(' ')[0], ''];
  return fakeCall({
    gstin, legal: FAKE_NAMES[h % FAKE_NAMES.length], trade: FAKE_NAMES[h % FAKE_NAMES.length], status: 'Active', type: 'Proprietorship',
    nature: h % 3 === 0 ? ['Wholesale Business'] : ['Factory / Manufacturing'], state, pan: gstin.slice(2, 12),
    addr: { line1: 'Shed ' + (h % 90 + 10) + ', Industrial Estate', line2: '', city: c[0], pin: c[1] }
  });
}
function ifscLookup(ifsc) {
  const b = BANKS[ifsc.slice(0, 4)];
  return b ? { bank: b, branch: ['Main Branch', 'Industrial Area', 'GT Road', 'Station Road', 'Market Yard'][h32(ifsc) % 5] } : null;
}
function pennyDrop(acc, expectName) {
  // account numbers ending in 0000 simulate a name mismatch
  return fakeCall(acc.endsWith('0000') ? { ok: false, holder: 'R K Traders' } : { ok: true, holder: expectName }, 1100);
}
function storeAvailable(name) { const n = name.trim().toLowerCase(); return fakeCall(!TAKEN_STORES.includes(n), 450); }

/* ---------- Hashing / deterministic randomness ---------- */
function h32(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rnd(seed, i) {
  let t = (seed + Math.imul(i + 1, 0x9E3779B1)) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

/* ---------- Sample sellers for the Meesho console ----------
   launchStart is a programme day. The demo clock (DB.day) defaults to 30. */
const P = (id, type, name, price, extra = {}) => ({ id, type, name, price, packOf: 1, stock: 60, launch: true, ...extra });
const SEEDS = [
  { id: 's01', name: 'Anand Kurti Udyog', owner: 'Mahesh Anand', city: 'Jaipur', state: 'Rajasthan', cat: 'apparel', cohort: 'offline', source: 'Industry association', am: 'Kavya', mobile: '9829012345',
    stage: 'registering', signupStep: 'bank', stuckSince: 27, gstNature: ['Factory / Manufacturing'], products: [] },
  { id: 's02', name: 'Vishwakarma Plastics', owner: 'Dinesh Patel', city: 'Rajkot', state: 'Gujarat', cat: 'storage', cohort: 'online', source: 'Sells on another marketplace', am: 'Arjun', mobile: '9824011122',
    stage: 'fd_review', fdSubmitted: 29, gstNature: ['Factory / Manufacturing'], fdSteps: ['moulding', 'pack'], udyam: 'UDYAM-GJ-24-0012345', geoKm: 0.4, products: [] },
  { id: 's03', name: 'Kamdhenu Handloom', owner: 'Suresh Kumar', city: 'Panipat', state: 'Haryana', cat: 'home', cohort: 'churned', source: 'Past Meesho account', am: 'Kavya', mobile: '9812033344',
    stage: 'fd_review', fdSubmitted: 27, gstNature: ['Factory / Manufacturing', 'Wholesale Business'], fdSteps: ['weave', 'stitch', 'pack'], udyam: '', geoKm: 18.6, products: [] },
  { id: 's04', name: 'Laxmi Moulders', owner: 'Ramesh Gupta', city: 'Delhi', state: 'Delhi', cat: 'storage', cohort: 'offline', source: 'GST manufacturing data', am: 'Arjun', mobile: '9811044455',
    stage: 'fd', launchStart: 26, gstNature: ['Factory / Manufacturing'], onTime: 98, idle: 0, supportMin: 34,
    products: [P('a', 'container', 'Airtight container set, 3 × 1 L', 265), P('b', 'organiser', 'Drawer organiser, 6 compartments', 219), P('c', 'bottle', 'Fridge water bottle, 1 L', 129)] },
  { id: 's05', name: 'Tiruppur Knit House', owner: 'K. Senthil', city: 'Tiruppur', state: 'Tamil Nadu', cat: 'apparel', cohort: 'online', source: 'Sells on another marketplace', am: 'Kavya', mobile: '9843055566',
    stage: 'fd', launchStart: 22, gstNature: ['Factory / Manufacturing'], onTime: 98, idle: 0, viewMul: 0.42, supportMin: 22,
    products: [P('a', 'kurti', 'Rayon printed kurti, straight fit', 349), P('b', 'kurtaset', 'Cotton kurta set with dupatta', 579), P('c', 'dupatta', 'Chiffon dupatta, solid', 175)] },
  { id: 's06', name: 'Sai Ram Furnishings', owner: 'Prakash Jadhav', city: 'Solapur', state: 'Maharashtra', cat: 'home', cohort: 'churned', source: 'Past Meesho account', am: 'Arjun', mobile: '9822066677',
    stage: 'fd', launchStart: 15, gstNature: ['Factory / Manufacturing'], onTime: 96, idle: 1, rrAdd: 0.13, bias: 'colour', supportMin: 58,
    products: [P('a', 'bedsheet', 'Cotton double bedsheet, jacquard', 445), P('b', 'curtain', 'Door curtains, pack of 2', 489, { packOf: 2 }), P('c', 'cushion', 'Cushion covers 16 × 16 in, pack of 5', 549, { packOf: 5 })] },
  { id: 's07', name: 'Bhagwati Creations', owner: 'Nisha Shah', city: 'Surat', state: 'Gujarat', cat: 'apparel', cohort: 'online', source: 'Sells on another marketplace', am: 'Kavya', mobile: '9825077788',
    stage: 'fd', launchStart: 10, gstNature: ['Factory / Manufacturing'], onTime: 97, idle: 0, supportMin: 18,
    products: [P('a', 'kurti', 'Georgette kurti, embroidered', 355), P('b', 'kurtaset', 'Rayon kurta set with dupatta', 575), P('c', 'kurti', 'Cotton kurti, block print', 339)] },
  { id: 's08', name: 'Nirmal Home Products', owner: 'Jignesh Modi', city: 'Ahmedabad', state: 'Gujarat', cat: 'storage', cohort: 'offline', source: 'Trade fair', am: 'Arjun', mobile: '9898088899',
    stage: 'fd', launchStart: 7, gstNature: ['Factory / Manufacturing'], onTime: 89, idle: 0, supportMin: 71,
    products: [P('a', 'container', 'Airtight container set, 3 × 500 ml', 259), P('b', 'organiser', 'Drawer organiser, 4 compartments', 222), P('c', 'bottle', 'Fridge water bottle, 750 ml', 132)] },
  { id: 's09', name: 'Kohinoor Textiles', owner: 'Abdul Rahman', city: 'Karur', state: 'Tamil Nadu', cat: 'home', cohort: 'offline', source: 'Industry association', am: 'Kavya', mobile: '9842099900',
    stage: 'fd', launchStart: -7, gstNature: ['Factory / Manufacturing'], onTime: 97, idle: 0, supportMin: 26,
    products: [P('a', 'cushion', 'Cotton cushion covers 16 × 16 in, pack of 2', 229, { packOf: 2 }), P('b', 'runner', 'Handloom table runner, 13 × 72 in', 175), P('c', 'bedsheet', 'Cotton double bedsheet, printed', 449)] },
  { id: 's10', name: 'Om Garments', owner: 'Harpreet Singh', city: 'Ludhiana', state: 'Punjab', cat: 'apparel', cohort: 'churned', source: 'Past Meesho account', am: 'Arjun', mobile: '9814011223',
    stage: 'fd', launchStart: -13, gstNature: ['Factory / Manufacturing'], onTime: 96, idle: 1, supportMin: 31,
    products: [P('a', 'kurti', 'Woollen blend kurti', 375), P('b', 'kurtaset', 'Crepe kurta set', 612), P('c', 'dupatta', 'Cotton dupatta, printed', 189)] },
  { id: 's11', name: 'Shiv Shakti Traders', owner: 'Vikas Jain', city: 'Delhi', state: 'Delhi', cat: 'home', cohort: 'online', source: 'Sells on another marketplace', am: 'Kavya', mobile: '9811122334',
    stage: 'regular', fdRejected: 'GST lists trading only, no manufacturing', gstNature: ['Wholesale Business', 'Retail Business'], onTime: 95, idle: 0,
    products: [P('a', 'cushion', 'Velvet cushion covers, pack of 5', 499, { packOf: 5, launch: false })], liveFrom: 2 },
  { id: 's12', name: 'Ganesh Plasto', owner: 'Mukesh Solanki', city: 'Rajkot', state: 'Gujarat', cat: 'storage', cohort: 'offline', source: 'GST manufacturing data', am: 'Arjun', mobile: '9824122335',
    stage: 'fd', launchStart: -21, gstNature: ['Factory / Manufacturing'], onTime: 96, idle: 9, supportMin: 29,
    products: [P('a', 'container', 'Airtight container set, 3 × 1 L', 262, { stock: 22 }), P('b', 'bottle', 'Fridge water bottle, 1 L', 131, { stock: 18 }), P('c', 'organiser', 'Drawer organiser, 6 compartments', 219, { stock: 20 })] }
];
const LEADS = [
  { id: 'l1', name: 'Shree Ganesh Handloom', city: 'Panipat', cat: 'home', cohort: 'offline', source: 'Industry association', am: 'Kavya', stage: 'New', touch: '-' },
  { id: 'l2', name: 'Rathi Knitwear', city: 'Tiruppur', cat: 'apparel', cohort: 'online', source: 'Sells on another marketplace', am: 'Arjun', stage: 'Contacted', touch: '2 days ago' },
  { id: 'l3', name: 'Patel Polymers', city: 'Rajkot', cat: 'storage', cohort: 'offline', source: 'GST manufacturing data', am: 'Kavya', stage: 'Invite sent', touch: 'Yesterday' },
  { id: 'l4', name: 'Krishna Home Linen', city: 'Karur', cat: 'home', cohort: 'churned', source: 'Past Meesho account', am: 'Arjun', stage: 'New', touch: '-' },
  { id: 'l5', name: 'Saanvi Fashions', city: 'Surat', cat: 'apparel', cohort: 'online', source: 'Sells on another marketplace', am: 'Kavya', stage: 'Opened link', touch: 'Today' },
  { id: 'l6', name: 'Maruti Moulding Works', city: 'Delhi', cat: 'storage', cohort: 'churned', source: 'Past Meesho account', am: 'Arjun', stage: 'Contacted', touch: '4 days ago' },
  { id: 'l7', name: 'Bharat Weaving Mills', city: 'Solapur', cat: 'home', cohort: 'offline', source: 'Trade fair', am: 'Kavya', stage: 'New', touch: '-' },
  { id: 'l8', name: 'Jaipur Block Prints', city: 'Jaipur', cat: 'home', cohort: 'online', source: 'Sells on another marketplace', am: 'Arjun', stage: 'Invite sent', touch: '3 days ago' }
];
const COHORTS = { offline: 'Offline only', online: 'Online elsewhere', churned: 'Left Meesho before', unknown: 'Not known yet' };
/* Sign-up funnel for the last 30 days (sample). The demo seller is added on top. */
const FUNNEL_BASE = [
  ['mobile', 'Registration started', 1240], ['otp', 'Mobile verified', 1102], ['gst', 'Account created', 1061],
  ['address', 'GSTIN / Enrolment ID verified', 781], ['bank', 'Pickup address added', 752], ['store', 'Bank account verified', 683],
  ['review', 'Store details added', 671], ['submitted', 'Submitted', 664]
];
const SIGNUP_ORDER = ['mobile', 'otp', 'email', 'gst', 'address', 'bank', 'store', 'review'];
