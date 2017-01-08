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

  const metadata = {
    enterprise: req.session.enterprise,
    project: req.session.project,
    user: req.session.user
  };

  const options = req.query;

  let report;
  let data = {};
  let record = {};

  try {
    report = new ReportManager(RECEIPT_TEMPLATE, req.session, options);
  } catch (e) {
    return next(e);
  }

  // request for detailed receipt
  req.query.detailed = true;

  Vouchers.getVouchers(req.params.uuid, options)
    .then(rows => {

      if (!rows.length) {
        throw new NotFound(`Could not find a voucher with uuid ${req.params.uuid}`);
      }

      // voucher details
      record.details = rows[0];

      // voucher transaction rows
      record.rows = rows;

      // populate data for the view
      _.extend(data, record, metadata);

      return report.render(data);
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

  const options = _.clone(req.query);
  _.extend(options, { csvKey : 'rows' });

  let report;
  try  {
    report = new ReportManager(REPORT_TEMPLATE, req.session, options);
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
