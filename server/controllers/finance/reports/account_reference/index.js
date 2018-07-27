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
// const Tree = require('../../../../lib/Tree');
const ReportManager = require('../../../../lib/ReportManager');

// report template
const TEMPLATE = './server/controllers/finance/reports/account_reference/report.handlebars';

// expose to the API
exports.report = report;

// default report parameters
const DEFAULT_PARAMS = {
  csvKey : 'account_reference',
  filename : 'TREE.ACCOUNT_REFERENCE_REPORT',
  orientation : 'landscape',
  footerRight : '[page] / [toPage]',
};

/**
 * @function report
 *
 * @description
 * This function renders the balance of accounts references as report.  The account_reference report provides a view
 * of the balance of account_references for a given period of fiscal year.
 */
function report(req, res, next) {
  const params = req.query;
  const context = {};
  let reporting;

  _.defaults(params, DEFAULT_PARAMS);

  try {
    reporting = new ReportManager(TEMPLATE, req.session, params);
  } catch (e) {
    next(e);
    return;
  }

  AccountReference.computeAllAccountReference(params.period_id)
    .then(data => {
      console.log(data);
      _.merge(context, data);
      return reporting.render(context);
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}
