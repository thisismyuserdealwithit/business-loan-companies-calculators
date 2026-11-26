# Business Loan Companies calculators

Compare what a small business receives at funding, what it owes each period, and how much it pays in total. The calculations run offline in Node or a browser. The [Business Loan Companies toolkit](https://businessloancompanies.com/free-business-loan-tools/) includes the companion spreadsheets and printable guide.

Download this repository to run the examples. The code's attribution permission is in LICENSE.

## Run

Node 18 or later:

```sh
npm run build
npm test
npm pack --dry-run
```

ES modules:

```js
import { termLoan } from './index.mjs';
const offer = termLoan({principal: 10000, annualRate: 12, months: 12});
console.log(offer.payment); // about 888.4878867834
console.log(offer.apr);     // about 12, nominal annual percent
```

CommonJS: `const tools = require('./calculators.cjs');`

Browsers: load `browser.js` as a script and use `window.BusinessLoanTools`.

## Units and schedule assumptions

All money inputs use the same currency. Rates expressed as percentages use 12 for 12%, not 0.12. A factor rate uses 1.2 for a 20% charge. Calculations retain full precision; round only for display. Finite numeric strings are accepted by the five business calculators; booleans, objects, empty inputs and negative numbers are rejected. The lower-level `periodicApr` helper expects numbers and returns null for invalid schedules.

| Function | Required inputs | Optional inputs | Assumptions and main results |
|---|---|---|---|
| termLoan | principal, annualRate, months | feePercent=0 | Fixed monthly amortizing payments at month end; fee deducted at funding. Returns payment, netProceeds, totalPayments, costAboveNetProceeds and apr. |
| lineOfCreditDraw | draw, annualRate, monthsOutstanding | allocatedFeePercent=0 | One constant draw; interest paid monthly; principal repaid at final month end. No redraws, compounding unpaid interest or daily balance changes. |
| factorAdvance | advance, factorRate | feePercent=0, remittances, periodsPerYear=52, months=6 | Equal remittances. Provide exact remittances and frequency where known. Legacy months input is converted to a rounded count. Fees reduce funding proceeds. |
| invoiceFactoring | invoiceFace, advancePercent, feePer30DaysPercent, daysOutstanding | None | Fee charged against face value and prorated continuously per 30 days. Reserve is released less fee; excess fee appears as cashShortfall. annualizedFeePercent is a simple annualized fee ratio, not IRR APR. |
| debtServiceCoverage | annualCashFlow | existingAnnualDebtService=0, proposedAnnualDebtService=0 | DSCR is cash flow divided by annual debt service. Zero debt service returns null. newPaymentCapacity is annual capacity using a fixed illustrative 1.25 threshold. |
| periodicApr | net, payments, perYear | None | net is received at time zero; nonnegative payments occur at equal period ends. Returns periodic IRR times periods per year times 100. No date adjustment. |

Integer period counts are limited to 1 through 10,000. Origination fees must be below 100%. The DSCR function presently accepts nonnegative cash flow only; it cannot model operating losses. newPaymentCapacity can be negative when existing debt exceeds the illustrative threshold.

## Worked examples

[Cash before the customer pays](Cash-before-the-customer-pays.pdf) is a printable 20-minute exercise for an entrepreneurship class. Students compare collecting an invoice on day 45 with taking an advance to cover payroll on day 14. Page two contains the answer key and a delayed-payment variation.

* A 12-month, $10,000 loan at 12% with no fee pays about $888.49 monthly. Total payments are about $10,661.85. A 2% fee reduces proceeds to $9,800 while leaving the scheduled payments unchanged, so the calculated nominal APR rises.
* A $10,000 draw at 12% for six months pays $100 interest monthly and returns the $10,000 principal in the final month. A 1% allocated fee adds $100 of cost, for a $700 estimated draw cost.
* A $10,000 factor advance at 1.2 repays $12,000. Over 12 monthly remittances it pays $1,000 monthly. The 20% total charge is not its APR.
* A $10,000 invoice with an 80% advance and a 2% fee per 30 days, paid after 45 days, releases $8,000 initially and $1,700 from reserve after the $300 fee.
* $125,000 cash flow divided by $100,000 annual debt service gives a DSCR of 1.25.

## Limits

These are planning estimates. They exclude unentered charges and do not constitute regulatory APR disclosures, approval predictions or a lender's amortization schedule. Nominal annual APR differs from effective annual yield. Actual contracts may use daily accrual, irregular first periods, holidays, minimum fees, tiered factoring fees or revenue-dependent remittances. Reconcile results with the written offer. This package does not validate every extreme floating-point input.

## Attribution and provenance

Business Loan Companies: https://businessloancompanies.com/free-business-loan-tools/

See LICENSE and PROVENANCE.json. `upstream-original.cjs` preserves the original published file. Edit `calculators.cjs` and run `npm run build` to regenerate index.mjs and browser.js. Joe, Finofin's AI assistant, prepared this source distribution.
