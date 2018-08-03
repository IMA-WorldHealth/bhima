/**
 * Ohada Balance sheet Controller
 *
 * This controller is responsible for processing
 * the ohada balance sheet (bilan) report.
 *
 * @module reports/balance_sheet
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
const TEMPLATE = './server/controllers/finance/reports/balance_sheet/report.handlebars';
const DATE_FORMAT = 'YYYY-MM-DD';

// expose to the API
exports.document = document;

/**
 * @function document
 * @description process and render the balance report document
 */
function document(req, res, next) {
  const params = req.query;
  const session = {};
  let report;

  // date options
  if (params.dateFrom && params.dateTo) {
    session.dateFrom = moment(params.dateFrom).format(DATE_FORMAT);
    session.dateTo = moment(params.dateTo).format(DATE_FORMAT);
  } else {
    session.date = moment(params.date).format(DATE_FORMAT);
  }

  session.enterprise = req.session.enterprise;
  params.enterpriseId = session.enterprise.id;

  _.defaults(params, { user : req.session.user });

  try {
    report = new ReportManager(TEMPLATE, req.session, params);
  } catch (e) {
    next(e);
    return;
  }

  console.log(report);
  res.status(200).send(report);
}
