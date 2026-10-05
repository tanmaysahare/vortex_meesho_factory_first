# Factory Direct: supplier app and Meesho console (Team Vortex, Meesho DICE S3)

- **Supplier app** (`#/`): Meesho supplier registration (mobile OTP → email and password → GSTIN or Enrolment ID → pickup address → bank verification → store details). This is followed by the optional Factory Direct application, the launch period, orders, catalog, earnings and help. Available in English and Hindi. Terms that may be unclear have an "i" button that explains them.
- **Meesho console** (`#/console`): Overview (what needs attention and programme health against targets), Action items, Verification, Suppliers, Leads, Settings and Activity log.

## How it behaves
- **OTP:** auto-filled, the way Android reads an OTP from an SMS.
- **Account:** approved automatically a few seconds after submission (GST, bank and address checks).
- **Factory Direct:** applications that pass every automated check are approved automatically. Applications that fail a check go to **Console → Verification** for a team member to decide.
- **Sync:** the supplier app and the console share data within one browser, including across two tabs.

## Demo mode (for presenters and judges)
The product screens contain no demo text. To show the demo tools, open a link with `?demo=1`, or press **Ctrl+Shift+D**. A small **Demo** button then appears. It can:
- fill the current screen with sample data, including sample GSTINs (manufacturer, trader, cancelled),
- jump to a supplier state,
- switch the console user and role,
- move the date forward,
- reset all data.

## Links for the QR code (after hosting)
| Link | Opens |
|---|---|
| `URL/?demo=1&reset=1#/` | Fresh supplier app with demo tools (recommended for judges) |
| `URL/?reset=1#/` | Fresh supplier app, no demo tools |
| `URL/?demo=1&preset=launch#/home` | Supplier on launch period day 14 |
| `URL/?demo=1&preset=fdreview#/console/verify` | Console with an application in manual review |
| add `&lang=hi` | Hindi |

To host it, drag the `prototype` folder onto https://app.netlify.com/drop, or push it to GitHub Pages.

## Files
`js/data.js` config, categories, validators, simulated GST/bank lookups, sample suppliers · `js/glossary.js` "i" definitions and console targets · `js/sim.js` views, orders, returns, payments, rules · `js/store.js` state and presets · `js/seller.js` supplier app · `js/console.js` console · `js/app.js` router, actions, automated checks, demo mode.
