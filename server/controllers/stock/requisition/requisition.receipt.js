const _ = require('lodash');
const db = require('../../../lib/db');
const barcode = require('../../../lib/barcode');
const ReportManager = require('../../../lib/ReportManager');
const identifiers = require('../../../config/identifiers');

const api = require('./requisition');

const BASE_PATH = './server/controllers/stock/requisition';
const STOCK_REQUISITION_TEMPLATE = `${BASE_PATH}/requisition.receipt.handlebars`;

/**
   * @method stockRequisitionReceipt
   *
   * @description
   * This method builds the stock requisition receipt
   * file to be sent to the client.
   *
   * GET /receipts/stock/requisition/:uuid
   */
async function stockRequisitionReceipt(req, res, next) {
  const data = {};
  const uuid = db.bid(req.params.uuid);
  const optionReport = _.extend(req.query, { filename : 'REQUISITION.STOCK_REQUISITION' });

  // set up the report with report manager
  try {
    const report = new ReportManager(STOCK_REQUISITION_TEMPLATE, req.session, optionReport);
    const details = await api.getDetails(db.bid(uuid));
    data.barcode = barcode.generate(identifiers.REQUISITION.key, details.uuid);
    data.enterprise = req.session.enterprise;
    data.details = details;
    const result = await report.render(data);
    res.set(result.headers).send(result.report);
  } catch (e) {
    next(e);
  }
}

module.exports = stockRequisitionReceipt;
