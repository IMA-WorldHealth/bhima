'use strict';

const Accounts = require('../../accounts');
const ReportManager = require('../../../../lib/ReportManager');

const TEMPLATE = './server/controllers/finance/reports/accounts/chart.handlebars';

/**
 * @method chart
 *
 * @description
 * generate chart of account as a document
 */
function chart(req, res, next) {

  let report;

  try {
    report = new ReportManager(TEMPLATE, req.session, req.query);
  } catch(e) {
    return next(e);
  }

  Accounts.lookupAccount()
    .then(Accounts.processAccountDepth)
    .then(accounts => {
      return report.render({ accounts });
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

exports.chart = chart;
