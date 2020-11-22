/**
 * Account Reference Controller
 *
 * This controller is responsible for processing the account reference report.
 *
 * @module finance/account_reference
 *
 * @requires lodash
 * @requires lib/db
 * @requires lib/ReportManager
 * @requires lib/errors/BadRequest
 */

const _ = require('lodash');
const AccountReference = require('../../accounts').references;
const db = require('../../../../lib/db');
const ReportManager = require('../../../../lib/ReportManager');

// report template
const TEMPLATE = './server/controllers/finance/reports/account_reference/report.handlebars';

// expose to the API
exports.report = report;

// default report parameters
const DEFAULT_PARAMS = {
  csvKey : 'data',
  filename : 'TREE.ACCOUNT_REFERENCE_REPORT',
  orientation : 'landscape',
};

/**
 * @function report
 *
 * @description
 * This function renders the balance of accounts references as report.  The account_reference report provides a view
 * of the balance of account_references for a given period of fiscal year.
 */
async function report(req, res, next) {
  const params = req.query;
  const context = {};
  _.defaults(params, DEFAULT_PARAMS);

  try {
    const reporting = new ReportManager(TEMPLATE, req.session, params);

    const getFiscalYearSQL = `
    SELECT p.id, p.start_date, p.end_date, p.fiscal_year_id, p.number,
      fy.start_date AS fiscalYearStart, fy.end_date AS fiscalYearEnd
    FROM period p JOIN fiscal_year fy ON p.fiscal_year_id = fy.id
    WHERE p.id = ?;
  `;

    const dbPromises = [
      db.one(getFiscalYearSQL, [params.period_id]),
      AccountReference.computeAllAccountReference(params.period_id, params.reference_type_id),
    ];

    const [period, data] = await Promise.all(dbPromises);
    _.merge(context, { period, data });
    context.referenceTypeLabel = params.reference_type_id ? params.reference_type_label : '';

    const result = await reporting.render(context);
    res.set(result.headers).send(result.report);
  } catch (err) {
    next(err);
  }
}
