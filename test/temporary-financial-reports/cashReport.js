/* global expect, chai, agent */
const expect = require('chai').expect;
const _ = require('lodash');

describe('Cash Report Report', () => {

    const reportURL = '/reports/finance/cash_report';

    const annualRequest = {
        account_id : 190,
        dateFrom: '2016-01-01',
        dateTo: '2016-12-31',
        type: 1,
        lang : 'en',
        renderer: 'json',
        reportId: 11,
        saveReport: 0
    };

    const oneMonthRequest = {
        account_id : 190,
        dateFrom: '2016-07-01',
        dateTo: '2016-07-31',
        type: 1,
        lang : 'en',
        renderer: 'json',
        reportId: 11,
        saveReport: 0
    };

    const noAccountRequest = {
        dateFrom: '2016-07-01',
        dateTo: '2016-07-31',
        type: 1,
        lang : 'en',
        renderer: 'json',
        reportId: 11,
        saveReport: 0
    };

    const noDateRequest = {
        account_id : 190,        
        type: 1,
        lang : 'en',
        renderer: 'json',
        reportId: 11,
        saveReport: 0
    };


    it('Returns correct data for year 2016 Primary cash $', () => {
        // see server/controllers/finance/reports/cashReport/index.js, getCashRecord method
        const totalEntry = 69.1;
        const totalExpense = 840;
        const finalTotal = 770.9

        const entriesLength = 11;
        const expensesLength = 24;
        

        return agent.get(reportURL)
            .query(annualRequest)
            .then((result) => {                
                const report = result.body;
                expect(Number(report.totalEntry)).to.equal(totalEntry);
                expect(Number(report.totalExpense)).to.equal(totalExpense);
                expect(Number(report.finalTotal)).to.equal(finalTotal);
                expect(Number(report.entries.length)).to.equal(entriesLength);
                expect(Number(report.expenses.length)).to.equal(expensesLength);
            });

    });

    it('Returns correct data for July month 2016 Primary cash $', () => {
        // see server/controllers/finance/reports/cashReport/index.js, getCashRecord method
        const totalEntry = 0;
        const totalExpense = 70;
        const finalTotal = 70;

        const entriesLength = 0;
        const expensesLength = 2;

        return agent.get(reportURL)
            .query(oneMonthRequest)
            .then((result) => {                
                const report = result.body;                
                expect(Number(report.totalEntry)).to.equal(totalEntry);
                expect(Number(report.totalExpense)).to.equal(totalExpense);
                expect(Number(report.finalTotal)).to.equal(finalTotal);
                expect(Number(report.entries.length)).to.equal(entriesLength);
                expect(Number(report.expenses.length)).to.equal(expensesLength);
            });

    });  

    it('Throw an error when no account id is provided', () => {
        // see server/controllers/finance/reports/cashReport/index.js, document method
        return agent.get(reportURL)
            .query(noAccountRequest)
            .then((result) => {
                const report = result.body;
                expect(Number(report.status)).to.equal(400);
            });
    });

    it('Throw an error when date are not provided', () => {
        // see server/controllers/finance/reports/cashReport/index.js, document method
            return agent.get(reportURL)
            .query(noDateRequest)
            .then((result) => {
                const report = result.body;
                expect(Number(report.status)).to.equal(400);
            });
    });
});
