const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const tools = require('./calculators.cjs');
const near = (actual, expected, tolerance=1e-8) => assert.ok(Math.abs(actual-expected)<tolerance, `${actual} != ${expected}`);

test('zero interest loan repays principal evenly', () => {
  const r=tools.termLoan({principal:12000,annualRate:0,months:12});
  near(r.payment,1000); near(r.totalPayments,12000); near(r.apr,0);
});
test('independent amortization fixture at 12 percent monthly', () => {
  const r=tools.termLoan({principal:10000,annualRate:12,months:12});
  near(r.payment,888.487886783416); near(r.apr,12);
});
test('deducted fee reduces cash and raises APR', () => {
  const r=tools.termLoan({principal:10000,annualRate:12,months:12,feePercent:2});
  near(r.netProceeds,9800); near(r.fee,200); assert.ok(r.apr>12);
  // Discounting the returned payment at its annualized rate must recover net cash.
  let present=0; for(let t=1;t<=12;t++) present += r.payment/((1+r.apr/1200)**t);
  near(present,9800);
});
test('tiny positive rate remains finite and approaches zero interest payment', () => {
  const r=tools.termLoan({principal:12000,annualRate:1e-15,months:12});
  near(r.payment,1000,1e-7); assert.ok(Number.isFinite(r.payment));
});
test('credit line bullet repayment and fee', () => {
  const r=tools.lineOfCreditDraw({draw:10000,annualRate:12,monthsOutstanding:6,allocatedFeePercent:1});
  near(r.interest,600); near(r.finalPayment,10100); near(r.estimatedDrawCost,700); near(r.netProceeds,9900);
});
test('factor rate is not annual rate', () => {
  const r=tools.factorAdvance({advance:10000,factorRate:1.2,remittances:12,periodsPerYear:12});
  near(r.remittance,1000); near(r.purchasedAmount,12000); near(r.costAboveNetProceeds,2000);
  assert.ok(r.apr>30 && r.apr<40);
});
test('invoice reserve and prorated fee', () => {
  const r=tools.invoiceFactoring({invoiceFace:10000,advancePercent:80,feePer30DaysPercent:2,daysOutstanding:45});
  near(r.initialAdvance,8000); near(r.fee,300); near(r.reserveAfterFee,1700); near(r.cashShortfall,0);
});
test('factoring fee above reserve exposes shortfall', () => {
  const r=tools.invoiceFactoring({invoiceFace:10000,advancePercent:100,feePer30DaysPercent:2,daysOutstanding:30});
  near(r.cashShortfall,200); near(r.reserveAfterFee,-200);
});
test('DSCR and zero debt cases', () => {
  near(tools.debtServiceCoverage({annualCashFlow:125000,existingAnnualDebtService:100000}).dscr,1.25);
  assert.equal(tools.debtServiceCoverage({annualCashFlow:125000}).dscr,null);
});
test('single payment IRR fixture', () => {
  near(tools.periodicApr(100,[110],1),10); near(tools.periodicApr(100,[90],1),-10);
});
test('numeric strings supported without accepting coercion objects', () => {
  near(tools.termLoan({principal:'12000',annualRate:'0',months:'12'}).payment,1000);
  for(const value of [true,false,[],{},' ',null,NaN,Infinity,-1]) {
    assert.throws(()=>tools.termLoan({principal:value,annualRate:0,months:12}));
  }
});
test('invalid schedule and rate inputs rejected', () => {
  for(const months of [0,0.5,10001]) assert.throws(()=>tools.termLoan({principal:100,annualRate:0,months}));
  assert.throws(()=>tools.termLoan({principal:100,annualRate:0,months:12,feePercent:100}));
  assert.throws(()=>tools.factorAdvance({advance:100,factorRate:0.9}));
  assert.throws(()=>tools.invoiceFactoring({invoiceFace:100,advancePercent:101,feePer30DaysPercent:1,daysOutstanding:30}));
});
test('APR helper returns null for malformed schedules', () => {
  for(const p of [null,{},[],[0],[-1],[NaN],[Infinity],Array(2)]) assert.equal(tools.periodicApr(100,p,12),null);
  assert.equal(tools.periodicApr(Infinity,[100],12),null);
  assert.equal(tools.periodicApr(100,[100],true),null);
});
test('ESM distribution matches CommonJS', async () => {
  const esm=await import('./index.mjs');
  assert.deepEqual(esm.termLoan({principal:10000,annualRate:12,months:12}),tools.termLoan({principal:10000,annualRate:12,months:12}));
});
test('browser build works without require or network', () => {
  const context=vm.createContext({}); vm.runInContext(fs.readFileSync(__dirname+'/browser.js','utf8'),context);
  near(context.BusinessLoanTools.termLoan({principal:12000,annualRate:0,months:12}).payment,1000);
});
