/**
 * @overview
 * Invoice Reports
 *
 * @description
 * This module contains the functionality to generate invoice reports and
 * receipts.
 */

const _ = require('lodash');

const ReportManager = require('../../../../lib/ReportManager');
const Purchases = require('../../purchases');
const shared = require('../shared');

const REPORT_TEMPLATE = './server/controllers/finance/reports/purchases/report.handlebars';

exports.report = report;

/**
 * @function report
 *
 * @description
 * Build a report for Purchase Registry report of metadata
 *
 */
async function report(req, res, next) {
  const query = _.clone(req.query);
  const filters = shared.formatFilters(req.query);

  _.extend(query, {
    filename : 'TREE.PURCHASE_REGISTRY',
    csvKey : 'rows',
    orientation : 'landscape',
  });

  try {
    const reportInstance = new ReportManager(REPORT_TEMPLATE, req.session, query);
    const rows = await Purchases.find(query);
    const result = await reportInstance.render({ filters, rows });
    res.set(result.headers).send(result.report);
  } catch (e) {
    next(e);
  }
}
