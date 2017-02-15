
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
    enterprise: req.session.enterprise,
    project: req.session.project,
    user: req.session.user
  };

  const options = req.query;

  let report;
  let data = {};
  let record = {};

  let template = RECEIPT_TEMPLATE;

  if (Boolean(Number(options.posReceipt))) {
    template = POS_TEMPLATE;
    _.extend(options, pdf.posReceiptOptions);
  }

  try {
    report = new ReportManager(template, req.session, options);
  } catch (e) {
    return next(e);
  }

  // request for detailed receipt
  options.detailed = true;

  Vouchers.getVouchers(req.params.uuid, options)
    .then(rows => {

      if (!rows.length) {
        throw new NotFound(`Could not find a voucher with uuid ${req.params.uuid}.`);
      }

      // voucher details
      record.details = rows[0];

      record.details.barcode = barcode.generate(entityIdentifier, record.details.uuid);

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

  let optionReport =  _.extend(options, { filename : 'VOUCHERS.GLOBAL.REPORT', orientation : 'landscape'});

  let report;
  try  {
    report = new ReportManager(REPORT_TEMPLATE, req.session, optionReport);
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
