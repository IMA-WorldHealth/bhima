/* global expect, chai, agent */
const expect = require('chai').expect;
const _ = require('lodash');

describe('Cash Report Report', () => {

    const reportURL = '/reports/finance/cash_report';

    const annualRequestFormat1 = {
        account_id : 190,
        dateFrom: '2016-01-01',
        dateTo: '2016-12-31',
        lang : 'en',
        renderer: 'json',
        reportId: 12,
        saveReport: 0,
        format : 1
    };

    const annualRequestFormat2 = {
        account_id : 190,
        dateFrom: '2016-01-01',
        dateTo: '2016-12-31',
        lang : 'en',
        renderer: 'json',
        reportId: 12,
        saveReport: 0,
        format : 2,
        type : 1
    };

    const oneMonthRequestFormat1 = {
        account_id : 190,
        dateFrom: '2016-07-01',
        dateTo: '2016-07-31',
        lang : 'en',
        renderer: 'json',
        reportId: 12,
        saveReport: 0,
        format : 1
    };

    const oneMonthRequestFormat2 = {
        account_id : 190,
        dateFrom: '2016-07-01',
        dateTo: '2016-07-31',
        type: 1,
        lang : 'en',
        renderer: 'json',
        reportId: 12,
        saveReport: 0,
        format : 2
    };

    const noAccountRequest = {
        dateFrom: '2016-07-01',
        dateTo: '2016-07-31',
        type: 1,
        lang : 'en',
        renderer: 'json',
        reportId: 12,
        saveReport: 0,
        format : 2
    };

    const noDateRequest = {
        account_id : 190,        
        type: 1,
        lang : 'en',
        renderer: 'json',
        reportId: 12,
        saveReport: 0,
        format : 2
    };

    const noFormatRequest = {
        account_id : 190,        
        type: 1,
        lang : 'en',
        renderer: 'json',
        reportId: 12,
        saveReport: 0
    };

    it('Returns correct data for year 2016 Primary cash $ for cash journal (format 1)', () => {
        // see server/controllers/finance/reports/cashReport/index.js, getCashRecord method
        const openingBalance = -800.28;
        const recordsLength = 35;

        return agent.get(reportURL)
            .query(annualRequestFormat1)
            .then((result) => {                
                const report = result.body;
                expect(Number(report.openingBalance)).to.equal(openingBalance);
                expect(Number(report.records.length)).to.equal(recordsLength);
            });
    });

    it('Returns correct data for July month 2016 Primary cash $ for cash journal (format 1)', () => {
        // see server/controllers/finance/reports/cashReport/index.js, getCashRecord method
        const openingBalance = -1213.57;
        const recordsLength = 2;        

        return agent.get(reportURL)
            .query(oneMonthRequestFormat1)
            .then((result) => {
                const report = result.body;
                expect(Number(report.openingBalance)).to.equal(openingBalance);
                expect(Number(report.records.length)).to.equal(recordsLength);
            });

    });    

    it('Returns correct data for year 2016 Primary cash $ splited entry exit cash report (format 2)', () => {
        // see server/controllers/finance/reports/cashReport/index.js, getCashRecord method
        const openingBalance = -800.28;
        const totalEntry = 69.1;
        const totalExpense = 840;
        const intermediateBalance = -770.9;
        const balanceTotal = -1571.18;

        const entriesLength = 11;
        const expensesLength = 24;
        

        return agent.get(reportURL)
            .query(annualRequestFormat2)
            .then((result) => {                
                const report = result.body;
                expect(Number(report.openingBalance)).to.equal(openingBalance);
                expect(Number(report.totalEntry)).to.equal(totalEntry);
                expect(Number(report.totalExpense)).to.equal(totalExpense);
                expect(Number(report.intermediateTotal)).to.equal(intermediateBalance);
                expect(Number(report.entries.length)).to.equal(entriesLength);
                expect(Number(report.expenses.length)).to.equal(expensesLength);
                expect(Number(report.finalTotal)).to.equal(balanceTotal);
            });
    });

    it('Returns correct data for July month 2016 Primary cash $ splited entry exit cash report (format 2)', () => {
        // see server/controllers/finance/reports/cashReport/index.js, getCashRecord method

        const openingBalance = -1213.57;
        const totalEntry = 0;
        const totalExpense = 70;
        const intermediateBalance = -70;
        const balanceTotal = -1283.57;

        const entriesLength = 0;
        const expensesLength = 2;
        

        return agent.get(reportURL)
            .query(oneMonthRequestFormat2)
            .then((result) => {                
                const report = result.body;
                expect(Number(report.openingBalance)).to.equal(openingBalance);
                expect(Number(report.totalEntry)).to.equal(totalEntry);
                expect(Number(report.totalExpense)).to.equal(totalExpense);
                expect(Number(report.intermediateTotal)).to.equal(intermediateBalance);
                expect(Number(report.entries.length)).to.equal(entriesLength);
                expect(Number(report.expenses.length)).to.equal(expensesLength);
                expect(Number(report.finalTotal)).to.equal(balanceTotal);
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

    it('Throw an error when no report format is provided', () => {
        // see server/controllers/finance/reports/cashReport/index.js, document method
            return agent.get(reportURL)
            .query(noFormatRequest)
            .then((result) => {
                const report = result.body;
                expect(Number(report.status)).to.equal(400);
            });
    });
});
