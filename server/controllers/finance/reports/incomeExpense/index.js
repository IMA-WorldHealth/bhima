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


const db = require('../../../../lib/db');
const ReportManager = require('../../../../lib/ReportManager');
const BadRequest = require('../../../../lib/errors/BadRequest');
const fiscalPeriod = require('../../fiscalPeriod');


const TEMPLATE = './server/controllers/finance/reports/incomeExpense/report.handlebars';
const types = [1, 2];

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
        .then((ans) => {

            if (ans.nb > 0) {
                throw new BadRequest(`The period From should be before the period To`, 'FORM.ERRORS.PERIOD_ORDER');
            }

            return getDateRange(options.periodFrom, options.periodTo);
        })
        .then((range) => {
            _.merge(options, { dateFrom: new Date(range.dateFrom), dateTo: new Date(range.dateTo) });
            return fiscalPeriod.isInSameFiscalYear({ periods: [options.periodFrom, options.periodTo] })
        })
        .then((ans) => {

            if (!ans) {
                throw new BadRequest(`The two period selected must be in the same fiscal year`, 'FORM.ERRORS.PERIOD_DIFF_FISCAL');
            }
            return sumIncomeExpenseAccounts(options.fiscal, options.periodFrom, options.periodTo);
        })
        .then((reportContext) => {
            const contents = reportContext.accounts.reduce((obj, item) => {
                if (item.type_id === 1) {
                    obj.incomes.push(item);
                } else {
                    obj.expenses.push(item);
                }
                return obj;
            }, { incomes: [], expenses: [] });

            _.merge(reportContext, {
                isEmpty: reportContext.accounts.length === 0,
                dateFrom: options.dateFrom,
                dateTo: options.dateTo,
                type_id: Number(options.type),
                isLost : reportContext.overallBalance.debit > reportContext.overallBalance.credit,
            });
            _.merge(reportContext, contents);
            delete reportContext.accounts;
            return docReport.render(reportContext);
        })
        .then((result) => {
            res.set(result.headers).send(result.report);
        })
        .catch(next)
        .done();
}

function getQuery(fiscalYearId, periodFromId, periodToId, groupToken = '') {
    // get all of the period IDs between the first periods number and the second periods number (within a fiscal year)
    const periodCondition = `
        SELECT id FROM period
        WHERE fiscal_year_id = ${fiscalYearId}
        AND number BETWEEN (SELECT number FROM period WHERE id = ${periodFromId}) AND (SELECT number FROM period WHERE id = ${periodToId})
    `;
    // Get the absolute value of the balance, if the value is negative a positive value will be returned    
    const balanceQuery = `
        SELECT 
            account.type_id, account.number, account.label,
            SUM(credit) as credit, SUM(debit) as debit, 
            ABS(SUM(credit) - SUM(debit)) as balance
        FROM 
            period_total             
        JOIN 
            account ON period_total.account_id = account.id
        JOIN 
            period ON period.id = period_total.period_id
        WHERE 
            period.id IN (${periodCondition}) AND 
            account.type_id IN (?)
        ${groupToken}
    `;
    return balanceQuery;
}

function sumIncomeExpenseAccounts(fiscalYearId, periodFromId, periodToId) {
    let reportContext = {};

    // grouping by account_id gives us the individual account line items
    return db.exec(getQuery(fiscalYearId, periodFromId, periodToId, 'GROUP BY account_id'), [types])
        .then((accountBalances) => {
            reportContext.accounts = accountBalances;
            // grouping by type_id gives us total income/ expense types balance
            return db.exec(getQuery(fiscalYearId, periodFromId, periodToId, 'GROUP BY type_id'), [types]);
        })
        .then((typeBalances) => {
            reportContext.incomeBalance = typeBalances[0];
            reportContext.expenseBalance = typeBalances[1];

            // grouping by nothing gives us the overall balance of all types
            return db.one(getQuery(fiscalYearId, periodFromId, periodToId), [types]);
        })
        .then((overallBalance) => {
            reportContext.overallBalance = overallBalance;
            return reportContext;
        });
}

function report(req, res, next) {
    res.status(200).json([]);
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
