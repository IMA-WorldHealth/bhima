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
const fiscalPeriod = require('../../fiscalPeriod');


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

    fiscalPeriod.getPeriodDiff(options.periodFrom, options.periodTo)
        .then((ans) =>{

            if(ans.nb > 0){
                throw new BadRequest(`The period From should be before the period To`, 'FORM.ERRORS.PERIOD_ORDER');
            }

            return getDateRange(options.periodFrom, options.periodTo);
        })
        .then((range) => {
            _.merge(options, { dateFrom : new Date(range.dateFrom), dateTo : new Date(range.dateTo) });
            return fiscalPeriod.isInSameFiscalYear({ periods : [options.periodFrom, options.periodTo] })
        })
        .then((ans) => {

            if(!ans){
                throw new BadRequest(`The two period selected must be in the same fiscal year`, 'FORM.ERRORS.PERIOD_DIFF_FISCAL');
            }
            return getRecord(options);
        })
        .then((records) => {
            records.isEmpty = records.incomes.length === 0 && records.expenses.length === 0;
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
    let data;
    return reportTypes[options.type](options)
        .then((data) => {
            _.merge(data, { dateFrom : options.dateFrom, dateTo : options.dateTo, type_id : options.type });
            return data;
        });
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
            return db.one(`SELECT IFNULL(${result.incomeAggregation.balance} - ${result.expenseAggregation.balance}, 0) AS finalBalance`);
        })
        .then((finalAggregate) =>{
            result.isLost = finalAggregate.finalBalance <= 0;            
            _.merge(result, {finalBalance : finalAggregate.finalBalance <= 0 ? finalAggregate.finalBalance * -1 : finalAggregate.finalBalance });
            // it is an incomeExpense report            
            result.isIncomeExpense = true;
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