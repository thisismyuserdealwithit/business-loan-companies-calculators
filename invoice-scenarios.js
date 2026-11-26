// Run with Node to regenerate invoice-scenarios.csv in this folder.
const { writeFileSync } = require('node:fs');
const { join } = require('node:path');
const assert = require('node:assert/strict');
const { invoiceFactoring } = require('./calculators.cjs');

const fields = ['scenario', 'payment_day', 'advance_pct', 'fee_pct_per_30_days', 'advance_usd',
  'fee_usd', 'reserve_release_usd', 'wait_payroll_usd', 'factor_payroll_usd', 'wait_final_usd', 'factor_final_usd'];
const rows = [fields];
for (const day of [7, 14, 15, 30, 45, 60, 75]) {
  for (const advance of [60, 75, 90]) {
    for (const rate of [1, 2, 3]) {
      const amount = 8000 * advance / 100;
      const fee = 8000 * rate / 100 * day / 30;
      const reserve = 8000 - amount - fee;
      const model = invoiceFactoring({invoiceFace: 8000, advancePercent: advance, feePer30DaysPercent: rate, daysOutstanding: day});
      assert.ok(Math.abs(model.fee - fee) < 1e-8);
      const mature = day <= 14;
      const payrollIfWait = 2100 + (mature ? 8000 : 0) - 3400;
      const payrollIfFactor = 2100 + amount + (mature ? reserve : 0) - 3400;
      const allSettled = 2100 + 8000 - 3400;
      const values = [amount, fee, reserve, payrollIfWait, payrollIfFactor, allSettled, allSettled-fee];
      assert.ok(reserve >= 0 && values.every(Number.isFinite));
      rows.push(['d'+day+'-a'+advance+'-f'+rate, day, advance, rate, ...values.map(v => v.toFixed(2))]);
    }
  }
}
assert.equal(rows.length-1,63);
const baseline = rows.find(row => row[0] === 'd45-a75-f2');
assert.deepEqual(baseline.slice(4), ['6000.00','240.00','1760.00','-1300.00','4700.00','6700.00','6460.00']);
writeFileSync(join(__dirname, 'invoice-scenarios.csv'), rows.map(row=>row.join(',')).join('\n')+'\n','utf8');
