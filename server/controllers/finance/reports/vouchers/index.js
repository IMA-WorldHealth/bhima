/**
 * @overview
 * Voucher Reports
 *
 * @description
 * This module contains all the code for rendering PDFs of vouchers - reports
 * and receipts.
 */

const _ = require('lodash');
const shared = require('../shared');
const ReportManager = require('../../../../lib/ReportManager');
const Vouchers = require('../../vouchers');
const pdf = require('../../../../lib/renderers/pdf');

// dependencies for barcode translation
const barcode = require('../../../../lib/barcode');
const identifiers = require('../../../../config/identifiers');

const util = require('../../../../lib/util');

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

  let receiptReport;
  const data = {};
  const record = {};

  let template = RECEIPT_TEMPLATE;

  if (Number(options.posReceipt)) {
    template = POS_TEMPLATE;
    _.extend(options, pdf.posReceiptOptions);
  }

  try {
    receiptReport = new ReportManager(template, req.session, options);
  } catch (e) {
    return next(e);
  }

  return Vouchers.lookupVoucher(req.params.uuid)
    .then((voucher) => {
      voucher.barcode = barcode.generate(entityIdentifier, voucher.uuid);

      // voucher details
      record.details = voucher;

      // voucher transaction rows
      record.items = voucher.items;

      // populate data for the view
      _.extend(data, record, metadata);

      return receiptReport.render(data);
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
  const filters = shared.formatFilters(options);
  _.extend(options, {
    csvKey : 'rows',
    filename : 'VOUCHERS.GLOBAL.REPORT',
    orientation : 'landscape',
    footerRight : '[page] / [toPage]',
    footerFontSize : '7',
  });

  let reportInstance;

  try {
    reportInstance = new ReportManager(REPORT_TEMPLATE, req.session, options);
    delete options.orientation;
  } catch (e) {
    return next(e);
  }

  const data = { filters };

    return Vouchers.find(options)
    .then(rows => {
      _.extend(data, { rows });
      return Vouchers.totalAmountByCurrency(options);
    })
    .then((sumAmount) => {
      _.extend(data, { totals : sumAmount });
      return reportInstance.render(data);
    })
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

