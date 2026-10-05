'use strict';
/* =========================================================
   Term definitions shown behind the "i" buttons.
   Each entry: t = [English, Hindi] term, d() = [English, Hindi] meaning.
   Console-only terms have English text only.
   ========================================================= */
const GLOSS = {
  /* supplier app */
  gstin: { t: ['GSTIN', 'GSTIN'], d: () => ['Your 15-character GST registration number. We use it to fetch your business name, address and type from the GST portal.', 'आपका 15 अक्षरों का GST रजिस्ट्रेशन नंबर। इससे हम GST पोर्टल से आपके बिज़नेस का नाम, पता और प्रकार लाते हैं।'] },
  eid: { t: ['Enrolment ID', 'एनरोलमेंट ID'], d: () => ['An ID generated from your PAN that lets you sell without GST registration. Orders can be delivered only within your own state.', 'PAN से बनी ID जिससे आप बिना GST रजिस्ट्रेशन के बेच सकते हैं। ऑर्डर सिर्फ़ आपके अपने राज्य में डिलीवर हो सकते हैं।'] },
  nature: { t: ['Nature of business', 'व्यवसाय की प्रकृति'], d: () => ['Business activities declared on your GST registration, such as manufacturing, wholesale or retail.', 'GST रजिस्ट्रेशन में बताई गई गतिविधियाँ, जैसे मैन्युफैक्चरिंग, होलसेल या रिटेल।'] },
  pickup: { t: ['Pickup address', 'पिकअप पता'], d: () => ['Where our courier partner collects your orders. It must be in the same state as your GST registration.', 'जहाँ से हमारे कूरियर पार्टनर ऑर्डर लेते हैं। यह आपके GST रजिस्ट्रेशन वाले राज्य में होना चाहिए।'] },
  ifsc: { t: ['IFSC', 'IFSC'], d: () => ['The 11-character code of your bank branch, printed on your cheque book and passbook.', 'आपकी बैंक शाखा का 11 अक्षरों का कोड, जो चेकबुक और पासबुक पर छपा होता है।'] },
  bankcheck: { t: ['Bank verification', 'बैंक वेरिफ़िकेशन'], d: () => ['We deposit ₹1 into the account to confirm the account number and the account holder\'s name.', 'खाता नंबर और खाताधारक का नाम जाँचने के लिए हम खाते में ₹1 जमा करते हैं।'] },
  fd: { t: ['Factory Direct', 'फैक्ट्री डायरेक्ट'], d: () => [`A Meesho programme for suppliers who manufacture their own products. Approved suppliers get a ${DB.cfg.launchDays}-day launch period with extra visibility and a Factory Direct tag on eligible products.`, `अपने प्रोडक्ट खुद बनाने वाले सप्लायर के लिए Meesho प्रोग्राम। मंज़ूर सप्लायर को ${DB.cfg.launchDays} दिन की लॉन्च अवधि में ज़्यादा पहुँच और योग्य प्रोडक्ट पर फैक्ट्री डायरेक्ट टैग मिलता है।`] },
  launch: { t: ['Launch period', 'लॉन्च अवधि'], d: () => [`The first ${DB.cfg.launchDays} days after you start Factory Direct. Meesho shows your selected products to more customers, targeting ${nf(DB.cfg.viewsTarget)} views per product. Views are targeted; orders are not guaranteed.`, `फैक्ट्री डायरेक्ट शुरू करने के बाद के पहले ${DB.cfg.launchDays} दिन। Meesho आपके चुने प्रोडक्ट ज़्यादा ग्राहकों को दिखाता है, हर प्रोडक्ट के ${nf(DB.cfg.viewsTarget)} व्यू का लक्ष्य। व्यू का लक्ष्य है, ऑर्डर की गारंटी नहीं।`] },
  coresteps: { t: ['In-house production steps', 'फैक्ट्री में होने वाले काम'], d: () => ['Manufacturing steps done in your own factory by your own team. Work sent outside (job work) does not count.', 'आपकी अपनी फैक्ट्री में आपकी टीम द्वारा किए गए काम। बाहर भेजा गया काम (जॉब वर्क) नहीं गिना जाता।'] },
  views: { t: ['Views', 'व्यू'], d: () => ['Number of times customers saw your product in their feed, search or category pages.', 'ग्राहकों ने आपका प्रोडक्ट फ़ीड, सर्च या कैटेगरी पेज पर कितनी बार देखा।'] },
  conv: { t: ['Conversion', 'कन्वर्ज़न'], d: () => ['Orders as a share of views. 2% means 2 orders for every 100 views.', 'व्यू में से कितने ऑर्डर बने। 2% यानी हर 100 व्यू पर 2 ऑर्डर।'] },
  returns: { t: ['Customer returns', 'ग्राहक वापसी'], d: () => ['Delivered orders that the customer sent back within the return window. The product comes back to your inventory.', 'डिलीवर ऑर्डर जो ग्राहक ने वापसी अवधि में लौटाए। प्रोडक्ट आपकी इन्वेंटरी में लौटता है।'] },
  retrate: { t: ['Return rate', 'वापसी दर'], d: () => ['Customer returns as a share of delivered orders.', 'डिलीवर ऑर्डर में से लौटाए गए ऑर्डर का हिस्सा।'] },
  rto: { t: ['RTO (Return to Origin)', 'RTO (रिटर्न टू ओरिजिन)'], d: () => ['An order that could not be delivered, for example because the customer was unavailable or refused cash on delivery. It comes back to you with no extra charge.', 'ऐसा ऑर्डर जो डिलीवर नहीं हो सका, जैसे ग्राहक नहीं मिला या कैश ऑन डिलीवरी मना किया। यह बिना अतिरिक्त शुल्क आपके पास लौटता है।'] },
  benchmark: { t: ['Benchmark price', 'बेंचमार्क कीमत'], d: () => ['The price range at which similar products currently sell on Meesho.', 'जिस कीमत रेंज में मिलते-जुलते प्रोडक्ट अभी Meesho पर बिकते हैं।'] },
  fdprice: { t: ['Factory Direct price', 'फैक्ट्री डायरेक्ट कीमत'], d: () => [`To carry the Factory Direct tag, a product must be priced at least ${DB.cfg.priceAdv}% below the benchmark price.`, `फैक्ट्री डायरेक्ट टैग के लिए प्रोडक्ट की कीमत बेंचमार्क से कम से कम ${DB.cfg.priceAdv}% कम होनी चाहिए।`] },
  shipping: { t: ['Shipping charge', 'शिपिंग शुल्क'], d: () => ['Delivery charge for each order, based on the packed weight of the product.', 'हर ऑर्डर का डिलीवरी शुल्क, प्रोडक्ट के पैक्ड वज़न के आधार पर।'] },
  reverse: { t: ['Return shipping charge', 'वापसी शिपिंग शुल्क'], d: () => ['Charged when a customer returns a delivered order. There is no charge for RTO.', 'जब ग्राहक डिलीवर ऑर्डर लौटाता है तब लगता है। RTO पर कोई शुल्क नहीं।'] },
  payout: { t: ['Payout per order', 'प्रति ऑर्डर भुगतान'], d: () => ['Selling price minus the shipping charge. Meesho charges 0% commission.', 'बिक्री कीमत में से शिपिंग शुल्क घटाकर। Meesho 0% कमीशन लेता है।'] },
  cycle: { t: ['Payment cycle', 'पेमेंट साइकिल'], d: () => [`Payment for a delivered order reaches your bank ${DB.cfg.settleDays} days after delivery, once the return window closes.`, `डिलीवर ऑर्डर का पेमेंट डिलीवरी के ${DB.cfg.settleDays} दिन बाद, वापसी अवधि खत्म होने पर, आपके बैंक में आता है।`] },
  upcoming: { t: ['Upcoming payments', 'आने वाले पेमेंट'], d: () => ['Payouts for delivered orders that are still inside the return window.', 'उन डिलीवर ऑर्डर का भुगतान जो अभी वापसी अवधि में हैं।'] },
  sla: { t: ['Dispatch SLA', 'डिस्पैच SLA'], d: () => [`Share of orders packed and handed to the courier on time. Target: ${DB.cfg.slaPct}% or more.`, `समय पर पैक करके कूरियर को सौंपे गए ऑर्डर का हिस्सा। लक्ष्य: ${DB.cfg.slaPct}% या ज़्यादा।`] },
  inventory: { t: ['Inventory', 'इन्वेंटरी'], d: () => ['Units available to sell. Returned and RTO units are added back automatically.', 'बेचने के लिए उपलब्ध यूनिट। लौटे और RTO यूनिट अपने आप वापस जुड़ जाते हैं।'] },
  hsn: { t: ['HSN code', 'HSN कोड'], d: () => ['Tax classification code of the product. It sets the GST rate on each order.', 'प्रोडक्ट का टैक्स वर्गीकरण कोड। इससे हर ऑर्डर पर GST दर तय होती है।'] },
  udyam: { t: ['Udyam registration', 'उद्यम रजिस्ट्रेशन'], d: () => ['Government MSME registration number. Optional, but it speeds up Factory Direct approval.', 'सरकारी MSME रजिस्ट्रेशन नंबर। वैकल्पिक, पर इससे फैक्ट्री डायरेक्ट मंज़ूरी जल्दी होती है।'] },
  weight: { t: ['Packed weight', 'पैक्ड वज़न'], d: () => ['Weight of the product after packing. It decides the shipping charge.', 'पैकिंग के बाद प्रोडक्ट का वज़न। इससे शिपिंग शुल्क तय होता है।'] },
  mrp: { t: ['MRP', 'MRP'], d: () => ['Maximum retail price printed on the product. Customers see your selling price against it.', 'प्रोडक्ट पर छपी अधिकतम खुदरा कीमत। ग्राहक इसके सामने आपकी बिक्री कीमत देखते हैं।'] },
  profit: { t: ['Profit', 'मुनाफ़ा'], d: () => ['Payout minus the cost to make and pack that you entered. Visible only to you; Meesho does not see your costs.', 'भुगतान में से आपकी डाली गई बनाने और पैक करने की लागत घटाकर। सिर्फ़ आपको दिखता है; Meesho आपकी लागत नहीं देखता।'] },

  /* console */
  c_segment: { t: ['Segment', 'Segment'], d: () => ['Where the supplier comes from. Offline only: sells only B2B today. Online elsewhere: sells on other platforms. Previously on Meesho: had a Meesho account and stopped selling.', ''] },
  c_health: { t: ['Health', 'Health'], d: () => ['Healthy: no open issues. Auto-nudged: an automated message has been sent. Needs call: a team member must call. At risk: likely to stop selling or lose the Factory Direct tag. Not live: not selling yet.', ''] },
  c_completion: { t: ['Registration completion', ''], d: () => ['Share of people who started supplier registration and submitted it, last 30 days.', ''] },
  c_ontrack: { t: ['Launch suppliers on track', ''], d: () => ['Suppliers in their launch period with no issue that needs a team member to call.', ''] },
  c_retained: { t: ['Retained after launch', ''], d: () => [`Suppliers who completed the launch period and were active in the last ${DB.cfg.inactiveDays} days.`, ''] },
  c_support: { t: ['Support minutes', ''], d: () => ['Average team time spent per launch supplier on calls and messages. It must stay low for the programme to scale to hundreds of suppliers.', ''] },
  c_viewsto: { t: ['Views vs target', ''], d: () => [`Average views per launch product against the target due by today. The full target is ${nf(DB.cfg.viewsTarget)} views over ${DB.cfg.launchDays} days.`, ''] },
  c_nudge: { t: ['Automated nudge', ''], d: () => ['A message sent automatically on WhatsApp and in the supplier app, without a team member.', ''] },
  c_gap: { t: ['Price below benchmark', ''], d: () => [`How far the supplier's price is below the benchmark price. Factory Direct requires at least ${DB.cfg.priceAdv}%.`, ''] },
  c_geo: { t: ['Photo location check', ''], d: () => ['Factory photos are taken in the supplier app. Their location is compared with the registered pickup address.', ''] },
  c_manual: { t: ['Manual review', ''], d: () => ['Applications that failed at least one automated check, or have no GST record. Applications that pass every check are approved automatically.', ''] },
  c_action: { t: ['Action item', ''], d: () => ['An issue raised automatically by a programme rule. Each has an owner team and a recommended action.', ''] },
  c_stalled: { t: ['Stalled registration', ''], d: () => ['Registration stuck on the same step for 2 or more days.', ''] },
  c_mainissue: { t: ['Main issue', ''], d: () => ['The highest-priority open action item for this supplier.', ''] },
  c_funnel: { t: ['Registration funnel', ''], d: () => ['How many people reached each registration step in the last 30 days, and the share lost at each step.', ''] },
  c_core: { t: ['In-house production steps', ''], d: () => ['Main manufacturing steps the supplier does in their own factory. At least 2 are required for Factory Direct.', ''] }
};
/* Targets used by the console to flag what is going wrong */
const TARGETS = { completion: 60, onTrack: 65, retained: 65, support: 30 };
