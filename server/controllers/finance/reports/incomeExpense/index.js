/**
 * IncomeExpense Controller
 *
 *
 * This controller is responsible for processing incomeExpense report.
 *
 * @module finance/incomeExpense
 *
 * @requires lodash
 * @requires lib/db
 * @requires lib/ReportManager
 * @requires lib/errors/BadRequest
 */


const _ = require('lodash');
const db = require('../../../../lib/db');
const ReportManager = require('../../../../lib/ReportManager');
const BadRequest = require('../../../../lib/errors/BadRequest');
const periodTotal = require('../../periodTotal');

const TEMPLATE = './server/controllers/finance/reports/incomeExpense/report.handlebars';
const accountType = { income: 1, expense: 2 };
const reportTypes = {
    1: fetchIncomeExpense,
    2: fetchIncome,
    3: fetchExpense,
}

// expose to the API
exports.document = document;
exports.report = report;

function document(req, res, next) {
    let docReport;

    const options = _.extend(req.query, {
        filename: 'TREE.INCOME_EXPENSE',
        csvKey: 'rows',
        user: req.session.user,
    });

    try {
        docReport = new ReportManager(TEMPLATE, req.session, options);
    } catch (e) {
        next(e);
        return;
    }

    return getDateRange(options.periodFrom, options.periodTo)
        .then((range) => {

            _.merge(options, { dateFrom : new Date(range.dateFrom), dateTo : new Date(range.dateTo) });
            return getRecord(options);
        })
        .then((records) => {
            return docReport.render({ incomeExpense: records });
        })
        .then((result) => {
            res.set(result.headers).send(result.report);
        })
        .catch(next)
        .done();
}

function report(req, res, next) {
    res.status(200).json([]);
}

function getRecord(options) {
    return reportTypes[options.type](options)
        .then((data) => {
            return data;
        })
}

function fetchIncomeExpense(options) {
    let result = {};
    return fetchIncome(options)
        .then((incomes) => {
            _.merge(result, incomes);
            return fetchExpense(options);
        })
        .then((expenses) => {
            _.merge(result, expenses);
            return result;
        });
}

function fetchIncome(options) {
    let incomeResult = {};
    // For getting just income account
    _.merge(options, { type_id: accountType.income });
    return periodTotal.getAccountsBalances(options)
        .then((incomes) => {
            _.merge(incomeResult, { incomes });
            // Aggregating data of incomes
            return periodTotal.getAccountsBalance(options);
        })
        .then((incomeAggregation) => {
            _.merge(incomeResult, { incomeAggregation });
            return incomeResult;
        });
}

function fetchExpense(options) {
    let expenseResult = {};
    // For getting just expense account
    _.merge(options, { type_id: accountType.expense });
    return periodTotal.getAccountsBalances(options)
        .then((expenses) => {
            _.merge(expenseResult, { expenses });
            // Aggregating data of expenses
            return periodTotal.getAccountsBalance(options);
        })
        .then((expenseAggregation) => {
            _.merge(expenseResult, { expenseAggregation });
            return expenseResult;
        });
}

function getDateRange(periodIdFrom, periodIdTo) {
    const sql =
        `
    SELECT 
        MIN(start_date) AS dateFrom, MAX(end_date) AS dateTo
    FROM 
        period
    WHERE 
        period.id IN (${periodIdFrom}, ${periodIdTo})`;

    return db.one(sql);
}