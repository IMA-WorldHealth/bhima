/**
 * @overview
 * Voucher Reports
 *
 * @description
 * This module contains all the code for rendering PDFs of vouchers - reports
 * and receipts.
 */

const _ = require('lodash');
const ReportManager = require('../../../../lib/ReportManager');
const Vouchers = require('../../vouchers');
const pdf = require('../../../../lib/renderers/pdf');

// dependencies for barcode translation
const barcode = require('../../../../lib/barcode');
const identifiers = require('../../../../config/identifiers');

const entityIdentifier = identifiers.VOUCHER.key;

const RECEIPT_TEMPLATE = './server/controllers/finance/reports/vouchers/receipt.handlebars';
const POS_TEMPLATE = './server/controllers/finance/reports/vouchers/receipt.pos.handlebars';
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
    enterprise : req.session.enterprise,
    project    : req.session.project,
    user       : req.session.user,
  };

  const options = req.query;

  let report;
  const data = {};
  const record = {};

  let template = RECEIPT_TEMPLATE;

  if (Number(options.posReceipt)) {
    template = POS_TEMPLATE;
    _.extend(options, pdf.posReceiptOptions);
  }

  try {
    report = new ReportManager(template, req.session, options);
  } catch (e) {
    return next(e);
  }

  return Vouchers.lookupVoucher(req.params.uuid)
    .then((voucher) => {
      voucher.barcode = barcode.generate(entityIdentifier, voucher.uuid)

      // voucher details
      record.details = voucher;

      // voucher transaction rows
      record.items = voucher.items;

      // populate data for the view
      _.extend(data, record, metadata);

      return report.render(data);
    })
    .then((result) => {
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
  _.extend(options, { csvKey: 'rows', filename: 'VOUCHERS.GLOBAL.REPORT', orientation: 'landscape' });

  let report;

  try {
    report = new ReportManager(REPORT_TEMPLATE, req.session, options);
    delete options.orientation;
  } catch (e) {
    return next(e);
  }

  return Vouchers.find(options)
    .then((vouchers) => {
      const data = {
        rows     : vouchers,
        dateFrom : req.query.dateFrom,
        dateTo   : req.query.dateTo,
      };

      return report.render(data);
    })
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}
