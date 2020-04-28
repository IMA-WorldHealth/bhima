/**
 * @overview
 * Voucher Reports
 *
 * @description
 * This module contains all the code for rendering PDFs of vouchers - reports
EP and receipts.
 */

const _ = require('lodash');
const shared = require('../shared');
const ReportManager = require('../../../../lib/ReportManager');
const Vouchers = require('../../vouchers');
const pdf = require('../../../../lib/renderers/pdf');
const db = require('../../../../lib/db');
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
async function receipt(req, res, next) {
  const metadata = {
    enterprise : req.session.enterprise,
    project    : req.session.project,
    user       : req.session.user,
  };

  const options = req.query;

  const data = {};
  const record = {};

  let template = RECEIPT_TEMPLATE;

  if (Number(options.posReceipt)) {
    template = POS_TEMPLATE;
    _.extend(options, pdf.posReceiptOptions);
  }

  try {
    const receiptReport = new ReportManager(template, req.session, options);

    const voucher = await Vouchers.lookupVoucher(req.params.uuid);

    voucher.isCreditNoted = voucher.reversed === 1;
    voucher.barcode = barcode.generate(entityIdentifier, voucher.uuid);

    // voucher details
    record.details = voucher;

    // voucher transaction rows
    record.items = voucher.items;

    data.numberOfLines = voucher.items.length;
    data.showNumberOfLines = (data.numberOfLines >= 6);

    // populate data for the view
    _.extend(data, record, metadata);

    // if voucher is reversed, get the reversing document identifier
    if (voucher.reversed === 1) {
      record.details.creditNoteVoucher = await findCreditNotedReference(db.bid(voucher.uuid));
    }

    const result = await receiptReport.render(data);
    res.set(result.headers).send(result.report);
  } catch (e) {
    next(e);
  }
}


/**
 * GET reports/finance/vouchers
 *
 * @method report
 */
async function report(req, res, next) {
  const options = _.clone(req.query);
  const filters = shared.formatFilters(options);
  _.extend(options, {
    csvKey : 'rows',
    filename : 'VOUCHERS.GLOBAL.REPORT',
    orientation : 'landscape',
  });

  try {
    const reporter = new ReportManager(REPORT_TEMPLATE, req.session, options);
    delete options.orientation;

    const [rows, totals] = await Promise.all([
      Vouchers.find(options),
      Vouchers.totalAmountByCurrency(options),
    ]);

    const result = await reporter.render({ filters, rows, totals });
    res.set(result.headers).send(result.report);
  } catch (e) {
    next(e);
  }
}

function findCreditNotedReference(uuid) {
  const sql = `
    SELECT dm.text as reference
    FROM voucher v
    JOIN  document_map dm ON v.uuid = dm.uuid
    WHERE v.reference_uuid = ?
  `;

  return db.one(sql, db.bid(uuid));
}
