# ShopLedger Legacy Workshop

ShopLedger is a small wholesale and retail billing app for a kirana shop. It handles checkout, GST invoices, inventory, and Khata, the shop’s customer credit ledger. This workshop uses real bugs in those workflows to practice reading legacy code, capturing its current behavior in tests, and making focused fixes.

## Run locally

From the repository root, use Node.js 22 or newer with npm.

```sh
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000). Express serves plain HTML, CSS, and JavaScript with no build step. Set the `PORT` environment variable before starting the app to use a different port. The app loads sample shop data from `data/db.json` and saves changes there when you place or cancel an order or record a settlement.

## Explore the app

| Screen | What you can do |
| --- | --- |
| Sales desk | Browse products and sellable stock, add items to a cart, preview GST and coupons, and check out using a payment method such as Khata. |
| Order History | Search and filter orders, open printable GST invoices, and cancel orders. |
| Customer Khata | Review balances and recent payments, and record customer settlements. |
| Inventory & GST Audit | Compare physical, reserved, and sellable stock, and inspect GST reconciliation. |

## Workshop progress

| Ticket | What the work covers |
| --- | --- |
| [#1 Invoice total and GST](https://github.com/SampurnR/shopledger-legacy-workshop/issues/1) | The invoice uses the amounts saved at checkout. It shows reconstructed line-level GST when it matches the recorded breakdown. [Merged invoice fix](https://github.com/Harshalh93/shopledger-legacy-workshop/pull/2) |
| [#2 Last sellable unit and cancellation](https://github.com/SampurnR/shopledger-legacy-workshop/issues/2) | Tests capture that checkout rejects the last sellable unit and cancellation leaves physical stock reduced. The production fix is pending. [Merged stock tests](https://github.com/Harshalh93/shopledger-legacy-workshop/pull/1) |
| [#3 Order history and Khata settlements](https://github.com/SampurnR/shopledger-legacy-workshop/issues/3) | Tests capture day-first sorting and date comparisons, and how a string payment amount corrupts the customer’s balance. The production fixes are pending. [Merged order history and Khata tests](https://github.com/Harshalh93/shopledger-legacy-workshop/pull/3) |

## Code map

| Path | Responsibility |
| --- | --- |
| [`server.js`](server.js), [`config.js`](config.js) | Express entry point, static files, printable invoices, and shop settings. |
| [`public/`](public/) | Browser screens, styles, and client-side JavaScript. |
| [`routes/`](routes/) | HTTP endpoints for products, orders, customers, and reports. The cart preview lives in [`routes/reports.js`](routes/reports.js). |
| [`lib/`](lib/) | Pricing, GST, coupons, invoices, inventory, date handling, order history, and the Khata ledger. |
| [`lib/store.js`](lib/store.js) | Reads and writes `data/db.json`. |
| [`test/`](test/) | Regression and characterization tests using Node’s built-in test runner. |

## Run tests and contribute

```sh
node --test
```

Run one file with `node --test test/invoice.test.js`. The `npm test` script is still a placeholder.

Before changing behavior, add and run a characterization test that captures what the code does today. Use `CURRENT BEHAVIOUR` in the name when the test records a known bug. Keep the change focused on the affected modules and update expectations when a ticket intentionally changes behavior. Use in-memory fixtures and Node’s built-in test tools so the tests never access `data/db.json` or require new dependencies.
