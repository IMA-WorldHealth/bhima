
/**
 * @overview General Ledger Accounts Reports
 *
 * @description
 * This module contains all the code for rendering PDFs of Journal
 */

const _ = require('lodash');
const ReportManager = require('../../../../lib/ReportManager');
const GeneralLedger = require('../../generalLedger');
const AccountReport = require('../reportAccounts');
const Accounts = require('../../accounts');

const REPORT_TEMPLATE = './server/controllers/finance/reports/generalLedger/report.handlebars';
const ACCOUNT_SLIP_TEMPLATE = './server/controllers/finance/reports/generalLedger/accountSlip.handlebars';

exports.report = renderReport;
exports.accountSlip = renderAccountSlip;


/**
 * GET reports/finance/general_ledger
 *
 * @method report
 */
function renderReport(req, res, next) {
  const options = _.extend(req.query, { filename: 'TREE.GENERAL_LEDGER', csvKey: 'rows' });
  let report;
  let data;

  try {
    report = new ReportManager(REPORT_TEMPLATE, req.session, options);
  } catch (e) {
    return next(e);
  }

  return GeneralLedger.getlistAccounts()
    .then((rows) => {
      data = { rows };
      return report.render(data);
    })
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

/**
 * GET reports/finance/general_ledger/:account_id
 *
 * @method accountSlip
 */
function renderAccountSlip(req, res, next) {
  const GENERAL_LEDGER_SOURCE = 1;
  const params = req.params;
  const options = _.extend(req.query, { filename: 'GENERAL_LEDGER.ACCOUNT_SLIP', csvKey: 'rows' });
  let report;

  try {
    report = new ReportManager(ACCOUNT_SLIP_TEMPLATE, req.session, options);
  } catch (e) {
    return next(e);
  }

  const data = {};

  return AccountReport.getAccountTransactions(params.account_id, GENERAL_LEDGER_SOURCE)
    .then((result) => {
      _.extend(data, { transactions: result.transactions, sum: result.sum });
      data.hasDebtorSold = data.sum.balance >= 0;
      return Accounts.lookupAccount(params.account_id);
    })
    .then((account) => {
      _.extend(data, { account });
      return report.render(data);
    })
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}
