/* global expect, chai, agent */
const expect = require('chai').expect;
const _ = require('lodash');

describe('Income expense Report', () => {

    const reportURL = '/reports/finance/income_expense';

    const onePeriodRequest = {
        periodFrom: 16,
        periodTo: 16,
        type: 1,
        render: 'json',
        reportId: 3,
        saveReport: 0
    };

    // independently tested by summing the general ledger
    it('Returns expected aggregate results for the primary cash box in 2015', () => {
        const incomeBalance = 0;
        const expenseBalance = 0;
        

        return agent.get(reportURL)
            .query(onePeriodRequest)
            .then((result) => {
                console.log('the rsult is ', result);
                // const report = result.body;

                // expect(Number(report.openingBalance.credit)).to.equal(openingCredit);
                // expect(Number(report.openingBalance.debit)).to.equal(openingDebit);
                // expect(Number(report.openingBalance.balance)).to.equal(openingBalance);

                // expect(Number(report.sum.period.balance)).to.equal(totalLedgerBalance);
                // expect(Number(report.sum.period.debit)).to.equal(totalLedgerDebit);
                // expect(Number(report.sum.period.credit)).to.equal(totalLedgerCredit);

                // expect(Number(report.sum.balance)).to.equal(finalBalance);
            });

    });
});
