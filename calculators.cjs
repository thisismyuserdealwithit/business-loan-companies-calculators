/* Business Loan Companies calculator functions. Version 2.0, October 2026.
 * Permission: use, copy, modify and distribute with attribution.
 * Planning estimates use the specified schedule and exclude unentered fees.
 * APR results are nominal annual percentages, not regulatory disclosures.
 */
(function (root, factory) {
  const tools = factory();
  if (typeof module === 'object' && module.exports) module.exports = tools;
  else root.BusinessLoanTools = tools;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  function positive(value, label, allowZero = true) {
    if (value === '' || value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) throw new TypeError(label + ' is required');
    if (typeof value !== 'number' && typeof value !== 'string') throw new TypeError(label + ' must be a number or numeric string');
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0 || (!allowZero && n === 0)) throw new RangeError(label + ' must be ' + (allowZero ? 'non-negative' : 'positive'));
    return n;
  }
  function periods(value, label) {
    const n = positive(value,label,false);
    if (!Number.isInteger(n) || n > 10000) throw new RangeError(label + ' must be a whole number from 1 to 10,000');
    return n;
  }
  function feeRate(value,label) {
    const n = positive(value,label);
    if (n >= 100) throw new RangeError(label + ' must be less than 100%');
    return n;
  }
  function periodicApr(net, payments, perYear) {
    if (!Number.isFinite(net) || !(net > 0) || !Number.isFinite(perYear) || !(perYear > 0) || !Array.isArray(payments) || !payments.length || Array.from(payments).some(p => !Number.isFinite(p) || p < 0) || !payments.some(p => p > 0)) return null;
    const pv = r => payments.reduce((sum,p,i) => sum + p / Math.pow(1+r,i+1),0);
    if (Math.abs(pv(0)-net) < 1e-8) return 0;
    let low=-0.999999, high=1;
    while (pv(high)>net && high<1048576) high*=2;
    if (pv(high)>net) return null;
    for(let i=0;i<180;i++){const mid=(low+high)/2;if(pv(mid)>net)low=mid;else high=mid;}
    return (low+high)/2*perYear*100;
  }
  function termLoan({principal,annualRate,months,feePercent=0}) {
    principal=positive(principal,'Principal',false);annualRate=positive(annualRate,'Annual rate');months=periods(months,'Months');feePercent=feeRate(feePercent,'Fee');
    const rate=annualRate/100/12;
    const payment=rate===0?principal/months:principal*rate/(-Math.expm1(-months*Math.log1p(rate)));
    const fee=principal*feePercent/100, netProceeds=principal-fee,totalPayments=payment*months;
    return {payment,fee,netProceeds,totalPayments,costAboveNetProceeds:totalPayments-netProceeds,apr:periodicApr(netProceeds,Array(months).fill(payment),12)};
  }
  function lineOfCreditDraw({draw,annualRate,monthsOutstanding,allocatedFeePercent=0}) {
    draw=positive(draw,'Draw',false);annualRate=positive(annualRate,'Annual rate');monthsOutstanding=periods(monthsOutstanding,'Months');allocatedFeePercent=feeRate(allocatedFeePercent,'Fee');
    const monthlyInterest=draw*annualRate/100/12,interest=monthlyInterest*monthsOutstanding,allocatedFee=draw*allocatedFeePercent/100,netProceeds=draw-allocatedFee;
    const payments=Array.from({length:monthsOutstanding},(_,i)=>monthlyInterest+(i===monthsOutstanding-1?draw:0));
    return {interest,allocatedFee,netProceeds,monthlyInterest,finalPayment:draw+monthlyInterest,estimatedDrawCost:interest+allocatedFee,apr:periodicApr(netProceeds,payments,12)};
  }
  function factorAdvance({advance,factorRate,feePercent=0,remittances,periodsPerYear=52,months=6}) {
    advance=positive(advance,'Advance',false);factorRate=positive(factorRate,'Factor rate');feePercent=feeRate(feePercent,'Fee');periodsPerYear=periods(periodsPerYear,'Periods per year');
    if(factorRate<1)throw new RangeError('Factor rate must be at least 1.00');
    // Legacy months input maps to a rounded equal-period schedule. Supply an exact count for a written offer.
    remittances=periods(remittances===undefined?Math.round(positive(months,'Months',false)*periodsPerYear/12):remittances,'Remittances');
    const purchasedAmount=advance*factorRate,fee=advance*feePercent/100,netProceeds=advance-fee,remittance=purchasedAmount/remittances;
    return {purchasedAmount,fee,netProceeds,costAboveNetProceeds:purchasedAmount-netProceeds,remittance,averageWeeklyRemittance:periodsPerYear===52?remittance:null,remittances,periodsPerYear,apr:periodicApr(netProceeds,Array(remittances).fill(remittance),periodsPerYear)};
  }
  function invoiceFactoring({invoiceFace,advancePercent,feePer30DaysPercent,daysOutstanding}) {
    invoiceFace=positive(invoiceFace,'Invoice face',false);advancePercent=positive(advancePercent,'Advance rate',false);feePer30DaysPercent=positive(feePer30DaysPercent,'Fee');daysOutstanding=positive(daysOutstanding,'Days outstanding',false);
    if(advancePercent>100)throw new RangeError('Advance rate cannot exceed 100%');
    const initialAdvance=invoiceFace*advancePercent/100,reserve=invoiceFace-initialAdvance,fee=invoiceFace*feePer30DaysPercent/100*daysOutstanding/30,reserveAfterFee=reserve-fee;
    return {initialAdvance,reserve,fee,reserveAfterFee,cashShortfall:Math.max(0,-reserveAfterFee),annualizedFeePercent:fee/initialAdvance*365/daysOutstanding*100};
  }
  function debtServiceCoverage({annualCashFlow,existingAnnualDebtService=0,proposedAnnualDebtService=0}) {
    annualCashFlow=positive(annualCashFlow,'Annual cash flow');existingAnnualDebtService=positive(existingAnnualDebtService,'Existing annual debt');proposedAnnualDebtService=positive(proposedAnnualDebtService,'New annual debt');
    const totalDebtService=existingAnnualDebtService+proposedAnnualDebtService;
    return {totalDebtService,dscr:totalDebtService===0?null:annualCashFlow/totalDebtService,newPaymentCapacity:annualCashFlow/1.25-existingAnnualDebtService};
  }
  return {termLoan,lineOfCreditDraw,factorAdvance,invoiceFactoring,debtServiceCoverage,periodicApr};
});
