/**
 * Ohada Balance sheet Controller
 *
 * This controller is responsible for processing
 * the ohada balance sheet (bilan) report.
 *
 * @module reports/ohada_balance_sheet
 *
 * @requires lodash
 * @requires lib/db
 * @requires lib/ReportManager
 * @requires lib/errors/BadRequest
 */

const _ = require('lodash');
const moment = require('moment');
// const db = require('../../../../lib/db');
const AccountReference = require('../../accounts/references');
const ReportManager = require('../../../../lib/ReportManager');

// report template
const TEMPLATE = './server/controllers/finance/reports/ohada_balance_sheet/report.handlebars';
const DATE_FORMAT = 'YYYY-MM-DD';

// default report parameters
const DEFAULT_PARAMS = {
  csvKey : 'accounts',
  filename : 'TREE.BALANCE',
  orientation : 'landscape',
  footerRight : '[page] / [toPage]',
};

// expose to the API
exports.document = document;

/**
 * @function document
 * @description process and render the balance report document
 */
function document(req, res, next) {
  const params = req.query;
  const context = {};
  let report;

  _.defaults(params, DEFAULT_PARAMS);

  try {
    report = new ReportManager(TEMPLATE, req.session, params);
  } catch (e) {
    next(e);
    return;
  }

  AccountReference.computeAllAccountReference(params.period_id)
    .then(data => {
      _.merge(context, data);
      console.log(data);
      return report.render(context);
    })
    .then(result => {
      res.set(result.header).send(result.report);
    })
    .catch(next);
}
