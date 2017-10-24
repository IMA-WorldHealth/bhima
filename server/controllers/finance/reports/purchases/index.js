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
function report(req, res, next) {
  let reportInstance;

  const query = _.clone(req.query);
  const filters = shared.formatFilters(req.query);

  _.extend(query, {
    filename : 'TREE.PURCHASE_REGISTRY',
    csvKey : 'rows',
    footerRight : '[page] / [toPage]',
    footerFontSize : '8',
  });

  try {
    reportInstance = new ReportManager(REPORT_TEMPLATE, req.session, query);
  } catch (e) {
    next(e);
    return;
  }

  const data = { filters };

  Purchases.find(query)
    .then(rows => {
      data.rows = rows;
      return reportInstance.render(data);
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}
