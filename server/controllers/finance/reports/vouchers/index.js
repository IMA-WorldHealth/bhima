'use strict';
/**
 * @overview
 * Voucher Reports
 *
 * @description
 * This module contains all the code for rendering PDFs of vouchers - reports
 * and receipts.
 */

const _    = require('lodash');
const ReportManager  = require('../../../../lib/ReportManager');
const NotFound = require('../../../../lib/errors/NotFound');
const Vouchers = require('../../vouchers');

const RECEIPT_TEMPLATE = './server/controllers/finance/reports/vouchers/receipt.handlebars';
const REPORT_TEMPLATE = './server/controllers/finance/reports/vouchers/report.handlebars';

exports.receipt = receipt;
exports.report = report;

/**
 * GET reports/vouchers/:uuid
 *
 * @method receipt
 */
function receipt(req, res, next) {

  // page options
  const options =
    _.defaults({ pageSize : 'A5', orientation: 'landscape' }, req.query);

  let report;
  try {
    report = new ReportManager(RECEIPT_TEMPLATE, req.session, options);
  } catch (e) {
    return next(e);
  }

  // request for detailed receipt
  req.query.detailed = true;

  Vouchers.getVouchers(req.params.uuid, req.query)
    .then(rows => {

      if (!rows.length) {
        throw new NotFound(`Could not find a voucher with uuid ${req.params.uuid}`);
      }

      return report.render({ rows });
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}


/**
 * GET reports/finance/vouchers
 *
 * @method report
 */
function report(req, res, next) {

  let report;
  try  {
    report = new ReportManager(REPORT_TEMPLATE, req.session, req.query);
  } catch(e) {
    return next(e);
  }

  Vouchers.getVouchers(null, req.query)
    .then(rows => {

      const data = {
        rows: rows,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo
      };

      return report.render(data);
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}
