# Factory Direct: Factory First Batch prototype

**Team Vortex, IIT Kanpur** | Meesho DICE Challenge Season 3 | Seller Growth case | Round 2 (detailed submission)

This repository holds the working prototype that goes with our Round 2 deck. It shows how a manufacturer would join Meesho through an optional **Factory Direct** route, and how a Meesho programme team would monitor and support that factory through its first capped batch.

**Live demo:** https://vortex-meesho-factory-direct.vercel.app/app/?demo=1&reset=1#/

> All records in the prototype are sample data. OTP, GST and bank verification, orders, traffic, price benchmarks and payments are simulated in the browser. It is not connected to any live Meesho system.

---

## The idea in short

Removing the wholesaler can lower the buyer's price, but it also moves cataloguing, parcel dispatch, returns and payout reconciliation onto the factory. Registration alone does not make that work profitable, so many producers try once and stop.

Our proposal, **Factory First Batch**, treats the first batch as the thing to get right:

- **Start narrow.** Panipat manufacturers with ready-stock cover-only cushion covers, verifiable production costs and a named daily operator.
- **Cap the risk.** At most 60 packs of ready stock per factory, released in 20-pack tranches.
- **Show the full cost.** A per-order ledger covers production, packing, freight, returns, RTO and capital, so the owner sees what one batch actually earned.
- **Earn the refill.** The next batch happens only when mature contribution beats the factory's own alternative, the buyer price is lower than a matched offer, service is reliable, and the factory can continue without daily help.
- **Prove it with a pilot.** 12 factories in six matched pairs over 90 days, with a proposed support budget of Rs 60,000.

The prototype makes this workflow tangible for both sides.

## Quick links

| Link | What it opens |
|---|---|
| [Fresh supplier journey](https://vortex-meesho-factory-direct.vercel.app/app/?demo=1&reset=1#/) | Supplier app from the start, with demo tools (recommended) |
| [Supplier on launch day 14](https://vortex-meesho-factory-direct.vercel.app/app/?demo=1&preset=launch#/home) | A supplier partway through the launch period |
| [Console: factory review](https://vortex-meesho-factory-direct.vercel.app/app/?demo=1&preset=fdreview#/console/verify) | Meesho console with an application waiting for manual review |
| [Hindi version](https://vortex-meesho-factory-direct.vercel.app/app/?demo=1&reset=1&lang=hi#/) | Fresh supplier journey in Hindi |
| [Demo guide](https://vortex-meesho-factory-direct.vercel.app/support/demo.html) | Step-by-step walkthrough for judges |
| [Interactive model](https://vortex-meesho-factory-direct.vercel.app/support/model.html) | Unit economics calculator with editable assumptions |
| [Research register](https://vortex-meesho-factory-direct.vercel.app/support/research.html) | Sources, what each one supports and what it cannot show |

## What is in the prototype

### 1. Supplier app (`#/`)

The factory owner's side, in English and Hindi.

- Meesho supplier registration: mobile OTP, email and password, GSTIN or Enrolment ID, pickup address, bank verification and store details.
- Optional **Factory Direct** application covering business nature, production stage and factory evidence.
- Launch period view with daily tasks, orders, catalogue, stock editing and earnings.
- Product screen that shows price beside cost. If a price change removes the required price advantage, the Factory Direct tag pauses.
- Small "i" buttons next to terms such as RTO, contribution and kept order, explaining them in plain language.

### 2. Meesho programme console (`#/console`)

The programme team's side.

- **Overview:** what needs attention, plus programme health against targets (launch suppliers on track, retained after launch).
- **Action items:** a deduplicated exception queue driven by nine simulated intervention rules, each with a named owner.
- **Verification:** applications that fail an automated check land here for a reviewer to approve, reject or request changes.
- **Suppliers, Leads, Settings and Activity log.**

Applications that pass every automated check are approved on their own. The supplier app and the console share state inside one browser, including across two tabs, so a decision in one shows up in the other.

### 3. Supporting pages (`support/`)

- `demo.html`: the judge walkthrough.
- `model.html`: the calculation model behind the deck. Change any assumption and the contribution, gates and scale scenario update. Results can be downloaded as CSV.
- `research.html` and `sources.json`: the evidence register.

## Suggested walkthrough (about 5 minutes)

1. **Register and apply.** Open the fresh supplier journey and tap *Start selling*. Use the **Demo** button to fill sample details on each screen, then apply for Factory Direct.
2. **Price to action.** Open the *launch day 14* link. Open the sample cushion cover in the catalogue, change its price from Rs 229 to Rs 250 and save. The Factory Direct tag pauses. Now open *Console > Action items* in the same browser (do not reload a preset in between) and find the price exception with its owner and activity.
3. **Review to supplier.** Open the *factory review* link. Inspect the evidence, request changes for the factory photo and confirm. Then open the supplier's Factory Direct page in the same browser to see the requested change.
4. **Look around.** Orders, stock, earnings, Hindi, programme settings and the activity log all work.

## Demo mode

The product screens carry no demo text. Add `?demo=1` to the URL or press **Ctrl+Shift+D** to show a small **Demo** button. It can:

- fill the current screen with sample data, including sample GSTINs (manufacturer, trader, cancelled),
- jump to a supplier state,
- switch the console user and role,
- move the date forward,
- reset all data.

Other URL options: `reset=1` clears saved state, `preset=launch` or `preset=fdreview` loads a scenario, and `lang=hi` switches to Hindi.

## Run it locally

There is no build step and nothing to install. The app is plain HTML, CSS and JavaScript.

```bash
git clone https://github.com/tanmaysahare/vortex_meesho_factory_first.git
cd vortex_meesho_factory_first
python -m http.server 8000
```

Then open http://localhost:8000/app/?demo=1&reset=1#/

Any static file server works (for example `npx serve`).

## Project structure

```
.
├── index.html          Redirects to a fresh supplier journey with demo tools
├── vercel.json         Hosting headers and root redirect used for the live demo
├── app/
│   ├── index.html      App shell
│   ├── styles.css      All styles
│   ├── README.md       Short technical notes on the app
│   └── js/
│       ├── data.js     Config, categories, validators, simulated GST and bank lookups, sample suppliers
│       ├── glossary.js "i" definitions and console targets
│       ├── store.js    State, localStorage persistence, presets and audit log
│       ├── sim.js      Views, orders, returns, payments and intervention rules
│       ├── seller.js   Supplier app screens
│       ├── console.js  Meesho console screens
│       └── app.js      Router, actions, automated checks and demo mode
└── support/
    ├── demo.html       Judge walkthrough
    ├── model.html      Interactive unit economics model
    ├── research.html   Research and evidence register
    ├── sources.json    Source list
    └── style.css       Styles for the supporting pages
```

## What works today and what production would need

| Shown in the prototype | Needed for production |
|---|---|
| Supplier registration, optional Factory Direct flow, catalogue, orders, earnings, Hindi and local persistence | Authenticated server accounts, real verification and account APIs, actual order and settlement events |
| Nine simulated intervention rules, a deduplicated action queue, reviewer decisions and an activity log | Server-side role controls, durable event storage, real messaging, an appeal workflow and monitoring |
| Editable price and stock with generated benchmarks and fees | Matched live offers, a full dispatch cost ledger, mature return reconciliation and cohort experiment tracking |

The deck's cost model uses an illustrative Rs 225 / Rs 250 scenario. The prototype's Rs 229 / Rs 259 seed values and simplified profit display are there to demonstrate the interactions, not to validate the economics.

## Team Vortex

- Tanmay Sahare, IIT Kanpur
- Sanchit Arora, IIT Kanpur

Built for the Meesho DICE Challenge Season 3. This is a student concept prototype and is not an official Meesho product. Names, suppliers, numbers and documents shown inside the app are fictional sample data.
