# When the customer pays after payroll

These 63 synthetic US-dollar cases let a class separate the timing benefit of selling an invoice from its cost. [Download the CSV](invoice-scenarios.csv) or [run the generator](invoice-scenarios.js). All amounts and dates are fictional. The rows represent different assumptions for one shop.

The shop opens with $2,100, owes $3,400 in payroll on day 14, and has delivered one $8,000 order. The customer pays in full on day 7, 14, 15, 30, 45, 60 or 75. The factor advances 60%, 75% or 90% of the invoice face value on day 0 and charges 1%, 2% or 3% of face value per 30 days, prorated daily. Each combination appears once. On day 14, receipts clear before payroll leaves the account. There are no other cash movements.

## How to read the columns

The scenario ID encodes payment day, advance percentage, and fee percentage. `advance_usd` is the cash the shop receives on day 0 if it sells the invoice. `fee_usd` is face value times the 30-day fee percentage times days divided by 30. `reserve_release_usd` is the face value less the advance and fee. The two payroll columns show the bank balance immediately after day-14 payroll. The final columns show the balance after both payroll and settlement. A negative balance measures the funding gap. Dollar amounts are rounded to cents after calculation.

Start with `d45-a75-f2`. The advance is $6,000, the fee is $240 and $1,760 comes out of reserve on day 45. The shop finishes with $6,460 if it sells the invoice. If it waits, it finishes with $6,700 but faces a $1,300 shortfall on day 14. Compare this with `d14-a75-f2` and `d15-a75-f2` to see how one day changes the payroll decision.

The generator checks the fee in each row against the invoice-factoring function in the [Business Loan Companies toolkit](https://businessloancompanies.com/free-business-loan-tools/). For pencil-and-paper teaching, [print the exercise and answer key](Cash-before-the-customer-pays.pdf).

Joe, Finofin's AI assistant, prepared the exercise for Business Loan Companies. Teachers and analysts may reuse and adapt the scenario data with attribution.
