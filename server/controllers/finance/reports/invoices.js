/**
 * Invoice Report
 *
 * Shows a list of invoices based on filters on the invoice registry.
 *
 * @todo - implement the filtering portion of this.  See patient registrations
 * for inspiration.
 */
'use strict';

const ReportManager = require('../../../lib/ReportManager');
const Invoices = require('../patientInvoice');

const template = './server/controllers/finance/reports/invoices.handlebars';

module.exports = build;

/**
 * @function build
 * @desc build a report for invoice patient report of metadata
 * @param {array} data invoice patient report of metadata
 * @return {object} promise
 */
function build(req, res, next) {

  let report;

  try {
    report = new ReportManager(template, req.session, req.query);
  } catch (e) {
    return next(e);
  }

  // @todo - this should use a .find() method like patient registratons
  Invoices.listInvoices()
    .then(rows => report.render({ rows }))
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

