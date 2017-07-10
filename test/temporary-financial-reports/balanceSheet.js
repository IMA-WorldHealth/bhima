/* global expect, chai, agent */
const expect = require('chai').expect;

describe('Balance Sheet Report', () => {
  const reportURL = '/reports/finance/balance_sheet';

  const end2016 = {
    date : '2016-12-31',
    lang : 'en',
    renderer : 'json',
    reportId : 11,
    saveReport : 0,
  };

  const start2017 = {
    date : '2017-01-01',
    lang : 'en',
    renderer : 'json',
    reportId : 11,
    saveReport : 0,
  };

  let result2016;

  it('Returns expected aggregate results for the end of fiscal year 2016', () => {
    /**
      SELECT SUM(pt.credit) AS credit, SUM(pt.debit) AS debit, SUM(pt.debit - pt.credit) AS balance
        FROM period_total AS pt JOIN account AS a ON pt.account_id = a.id
      JOIN period AS p ON pt.period_id = p.id
      WHERE pt.enterprise_id = 1
      AND (DATE(p.start_date) <= DATE('2016-12-31') OR (p.start_date IS NULL OR p.end_date IS NULL))
      AND pt.fiscal_year_id =
        (SELECT f.id FROM fiscal_year f WHERE DATE(?) BETWEEN DATE(f.start_date) AND DATE(f.end_date) LIMIT 1)
      GROUP BY a.id
     */
    const totalAssets = 486.43;
    const totalLiabilities = 0;
    const totalEquity = -1270.11; // equity has a creditor sold (negative)
    const totalRevenue = -56.33;  // revenue has a creditor sold (negative)
    const totalExpense = 840.01;  // expense has a debtor sold (positive)

    result2016 = totalEquity + totalRevenue + totalExpense;

    return agent.get(reportURL)
      .query(end2016)
      .then((result) => {
        const report = result.body;

        formatTotals(report);

        expect(Number((report.assets.totals.balance || 0).toFixed(2))).to.equal(totalAssets);
        expect(Number((report.liabilities.totals.balance || 0).toFixed(2))).to.equal(totalLiabilities);
        expect(Number((report.equity.totals.balance || 0).toFixed(2))).to.equal(totalEquity);
        expect(Number((report.revenue.totals.balance || 0).toFixed(2))).to.equal(totalRevenue);
        expect(Number((report.expense.totals.balance || 0).toFixed(2))).to.equal(totalExpense);
      });
  });

  it('Returns expected aggregate results for the start of fiscal year 2017', () => {
    const totalAssets = 486.43;
    const totalLiabilities = 0;
    const totalRevenue = 0; // revenue has a creditor sold (negative)
    const totalExpense = 0; // expense has a debtor sold (positive)

    return agent.get(reportURL)
      .query(start2017)
      .then((result) => {
        const report = result.body;

        formatTotals(report);

        expect(Number((report.assets.totals.balance || 0).toFixed(2))).to.equal(totalAssets);
        expect(Number((report.liabilities.totals.balance || 0).toFixed(2))).to.equal(totalLiabilities);
        expect(Number((report.equity.totals.balance || 0).toFixed(2))).to.equal(round(result2016, 2));
        expect(Number((report.revenue.totals.balance || 0).toFixed(2))).to.equal(totalRevenue);
        expect(Number((report.expense.totals.balance || 0).toFixed(2))).to.equal(totalExpense);
      });
  });

  function formatTotals(report) {
    report.assets.totals = report.assets.totals || {};
    report.liabilities.totals = report.liabilities.totals || {};
    report.equity.totals = report.equity.totals || {};
    report.revenue.totals = report.revenue.totals || {};
    report.expense.totals = report.expense.totals || {};
  }

  function round(value, decimals) {
    // The rounding problem can be avoided by using numbers represented in exponential notation
    return Number(`${Math.round(`${value}e${decimals}`)}e-${decimals}`);
  }
});
