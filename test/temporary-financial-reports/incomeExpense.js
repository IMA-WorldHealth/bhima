/* global expect, chai, agent */
const expect = require('chai').expect;
const _ = require('lodash');

describe('Income expense Report', () => {

    const reportURL = '/reports/finance/income_expense';

    const onePeriodRequest = {
        fiscal: 2,
        periodFrom: 16,
        periodTo: 16,
        type: 1,
        lang : 'en',
        renderer: 'json',
        reportId: 3,
        saveReport: 0
    };

    const allPeriodsRequest = {
        fiscal: 2,        
        periodFrom: 16,
        periodTo: 27,
        type: 1,
        lang : 'en',
        renderer: 'json',
        reportId: 3,
        saveReport: 0
    };

    const badPeriodRangeRequest = {
        fiscal: 2,
        periodFrom: 27,
        periodTo: 16,
        type: 1,
        lang : 'en',
        renderer: 'json',
        reportId: 3,
        saveReport: 0
    };

    const periodInDiferentFYRequest = {
        fiscal: 2,
        periodFrom: 16,
        periodTo: 30,
        type: 1,
        lang : 'en',
        renderer: 'json',
        reportId: 3,
        saveReport: 0
    };

    // independently tested by summing the general ledger
    it('Returns correct data for a one period january 2016', () => {
        // see server/controllers/finance/reports/incomeExpense/index.js, sumIncomeExpenseAccounts method
        const incomeBalance = 3.3979;
        const expenseBalance = 90;

        // see server/controllers/finance/reports/incomeExpense/index.js, sumIncomeExpenseAccounts method
        const incomesLength = 2;
        const expensesLength = 2;
        

        return agent.get(reportURL)
            .query(onePeriodRequest)
            .then((result) => {                
                const report = result.body;
                expect(Number(report.incomeBalance.balance)).to.equal(incomeBalance);
                expect(Number(report.expenseBalance.balance)).to.equal(expenseBalance);
                expect(Number(report.incomes.length)).to.equal(incomesLength);
                expect(Number(report.expenses.length)).to.equal(expensesLength);
            });

    });

    it('Returns correct data for all 2016 periods', () => {
        // see server/controllers/finance/periodTotal/index.js, getAccountsBalance method
        const incomeBalance = 56.3312;
        const expenseBalance = 1080.0052;

        // see server/controllers/finance/periodTotal/index.js, getAccountsBalances method
        const incomesLength = 3;
        const expensesLength = 3;
        

        return agent.get(reportURL)
            .query(allPeriodsRequest)
            .then((result) => {
                const report = result.body;

                expect(Number(report.incomeBalance.balance)).to.equal(incomeBalance);
                expect(Number(report.expenseBalance.balance)).to.equal(expenseBalance);
                expect(Number(report.incomes.length)).to.equal(incomesLength);
                expect(Number(report.expenses.length)).to.equal(expensesLength);
            });

    });

    it('Throw an error when period interval is not set correctly', () => {
        //see server/controllers/finance/fiscalPeriod.js, getPeriodDiff method
        return agent.get(reportURL)
            .query(badPeriodRangeRequest)
            .then((result) => {
                const report = result.body;
                expect(Number(report.status)).to.equal(400);
            });
    });

    it('Throw an error when periods are in diferent fiscal year', () => {
         //see server/controllers/finance/fiscalPeriod.js, isInSameFiscalYear method
            return agent.get(reportURL)
            .query(periodInDiferentFYRequest)
            .then((result) => {
                const report = result.body;
                expect(Number(report.status)).to.equal(400);
            });
    });
});
