const q = require('q');
const _ = require('lodash');
const moment = require('moment');

const db = require('../../../../lib/db');
const ReportManager = require('../../../../lib/ReportManager');
const Exchange = require('../../../finance/exchange');

const TEMPLATE = './server/controllers/finance/reports/analysis_auxiliary_cashbox/report.handlebars';
// expose to the API
exports.report = report;

// default report parameters
const DEFAULT_PARAMS = {
  csvKey : 'brea_report',
  filename : 'TREE.BREAK_EVEN_REPORT',
  orientation : 'landscape',
  footerRight : '[page] / [toPage]',
};

/**
 * @function report
 *
 * @description
 * This function renders the balance of accounts references as report.  The account_reference report provides a view
 * of the balance of account_references for a given period of fiscal year.
 */
function report(req, res, next) {
  const params = req.query;

  const data = {};
  data.enterprise = req.session.enterprise;
  let reporting;

  const daysWeek = [
    'FORM.LABELS.WEEK_D.SUNDAY',
    'FORM.LABELS.WEEK_D.MONDAY',
    'FORM.LABELS.WEEK_D.TUESDAY',
    'FORM.LABELS.WEEK_D.WEDNESDAY',
    'FORM.LABELS.WEEK_D.THURSDAY',
    'FORM.LABELS.WEEK_D.FRIDAY',
    'FORM.LABELS.WEEK_D.SATURDAY',
  ];

  const labelDisplay = {
    correct : {
      color : '#5cb85c',
      icon : '✔',
    },
    greater : {
      color : '#f0ad4e',
      icon : '▲',
    },
    lower : {
      color : '#d9534f',
      icon : '▼',
    },
    pending : {
      color : '#777777',
      icon : 'X',
    },
  };

  const cashboxParams = [
    params.account_id,
    params.period_id,
    params.start_date,
    params.end_date,
    params.start_date,
    params.end_date,
    params.account_id,
    params.period_id,
    params.start_date,
    params.end_date,
    params.start_date,
    params.end_date,
  ];

  const transfertParams = [
    params.transfer_account_id,
    params.period_id,
    params.start_date,
    params.end_date,
    params.start_date,
    params.end_date,
    params.transfer_account_id,
    params.period_id,
    params.start_date,
    params.end_date,
    params.start_date,
    params.end_date,
  ];

  const primaryParams = [
    params.transfer_account_id,
    params.period_id,
    params.transfer_account_id,
    params.account_id,
    params.transfer_account_id,
    params.period_id,
    params.transfer_account_id,
    params.account_id,
  ];

  data.report = {
    cashboxLabel : params.cashboxLabel,
    periodLabel : params.periodLabel,
    currencyId :  params.currency_id,
  };

  _.defaults(params, DEFAULT_PARAMS);

  try {
    reporting = new ReportManager(TEMPLATE, req.session, params);
  } catch (e) {
    next(e);
    return;
  }

  Exchange.getExchangeRate(data.enterprise.id, params.currency_id, new Date(params.end_date))
    .then(exchange => {
      data.exchageRate = exchange.rate || 1;

      const sqlCashBox = `
        SELECT DATE(cl.trans_date) AS trans_date, SUM(cl.debit) AS debit, SUM(cl.credit) AS credit,
        SUM(cl.debit - cl.credit) AS balance  
        FROM(
          SELECT gl.debit, gl.credit, gl.trans_date, gl.account_id, gl.period_id
          FROM general_ledger AS gl
          WHERE gl.account_id = ? AND gl.period_id = ? 
          AND gl.transaction_type_id <> 10
          AND gl.record_uuid NOT IN (
            SELECT rev.uuid
            FROM (
                SELECT v.uuid FROM voucher v WHERE v.reversed = 1
                AND DATE(v.date) >= DATE(?) AND DATE(v.date) <= DATE(?) 
              UNION
                SELECT c.uuid FROM cash c WHERE c.reversed = 1
                AND DATE(c.date) >= DATE(?) AND DATE(c.date) <= DATE(?)
            ) AS rev
          )
          UNION
          SELECT pj.debit, pj.credit, pj.trans_date, pj.account_id, pj.period_id
          FROM posting_journal AS pj
          WHERE pj.account_id = ? AND pj.period_id = ? 
          AND pj.transaction_type_id <> 10
          AND pj.record_uuid NOT IN (
            SELECT rev.uuid
            FROM (
                SELECT v.uuid FROM voucher v WHERE v.reversed = 1
                AND DATE(v.date) >= DATE(?) AND DATE(v.date) <= DATE(?) 
              UNION
                SELECT c.uuid FROM cash c WHERE c.reversed = 1
                AND DATE(c.date) >= DATE(?) AND DATE(c.date) <= DATE(?)
            ) AS rev
          )
        ) AS cl
        GROUP BY DATE(cl.trans_date)
        ORDER BY DATE(cl.trans_date) ASC;
      `;

      const sqlTransfertAccount = `
        SELECT DATE(cl.trans_date) AS trans_date, SUM(cl.debit) AS debit, SUM(cl.credit) AS credit,
        SUM(cl.debit - cl.credit) AS balance  
        FROM(
          SELECT gl.debit, gl.credit, gl.trans_date, gl.account_id, gl.period_id
          FROM general_ledger AS gl
          WHERE gl.account_id = ? AND gl.period_id = ? 
          AND gl.transaction_type_id <> 10
          AND gl.record_uuid NOT IN (
            SELECT rev.uuid
            FROM (
                SELECT v.uuid FROM voucher v WHERE v.reversed = 1
                AND DATE(v.date) >= DATE(?) AND DATE(v.date) <= DATE(?) 
              UNION
                SELECT c.uuid FROM cash c WHERE c.reversed = 1
                AND DATE(c.date) >= DATE(?) AND DATE(c.date) <= DATE(?)
            ) AS rev
          )
          UNION
          SELECT pj.debit, pj.credit, pj.trans_date, pj.account_id, pj.period_id
          FROM posting_journal AS pj
          WHERE pj.account_id = ? AND pj.period_id = ? 
          AND pj.transaction_type_id <> 10
          AND pj.record_uuid NOT IN (
            SELECT rev.uuid
            FROM (
                SELECT v.uuid FROM voucher v WHERE v.reversed = 1
                AND DATE(v.date) >= DATE(?) AND DATE(v.date) <= DATE(?) 
              UNION
                SELECT c.uuid FROM cash c WHERE c.reversed = 1
                AND DATE(c.date) >= DATE(?) AND DATE(c.date) <= DATE(?)
            ) AS rev
          )
        ) AS cl
        GROUP BY DATE(cl.trans_date)
        ORDER BY DATE(cl.trans_date) ASC;
      `;

      const sqlPrimaryCashbox = `
        SELECT SUM(ledger.debit) AS debit, SUM(ledger.credit) AS credit,
        SUM(ledger.debit - ledger.credit) AS balance, ledger.account_id,
        ledger.trans_date, a.number, a.label
          FROM (
          SELECT gll.debit, gll.credit, gll.account_id, gll.trans_date
          FROM general_ledger AS gll
          WHERE gll.trans_id IN (
            SELECT gl.trans_id 
            FROM general_ledger AS gl
            WHERE gl.account_id = ? AND gl.period_id = ?
          ) AND (gll.account_id <> ? AND gll.account_id <> ?)
          UNION
          SELECT pjl.debit, pjl.credit, pjl.account_id, pjl.trans_date
          FROM posting_journal AS pjl
          WHERE pjl.trans_id IN (
            SELECT pj.trans_id 
            FROM posting_journal AS pj
            WHERE pj.account_id = ? AND pj.period_id = ?
          ) AND (pjl.account_id <> ? AND pjl.account_id <> ?)
          ) AS ledger 
          JOIN account AS a ON a.id = ledger.account_id
          GROUP BY ledger.trans_date;
      `;

      const dbPromises = [
        db.exec(sqlCashBox, cashboxParams),
        db.exec(sqlTransfertAccount, transfertParams),
        db.exec(sqlPrimaryCashbox, primaryParams),
      ];

      return q.all(dbPromises);
    })
    .spread((transactions, transferts, primaryTransferts) => {
      transactions.forEach(item => {
        const numDays = moment(item.trans_date).day();
        const limiteValidationSup = data.exchageRate ? (data.exchageRate * 0.1) : 0.1;
        const limiteValidationInf = data.exchageRate ? (data.exchageRate * -0.1) : -0.1;

        item.transDateDays = daysWeek[numDays];

        if (item.balance > limiteValidationInf && item.balance < limiteValidationSup) {
          item.labelDisplay = labelDisplay.correct;
        } else if ((item.balance > limiteValidationSup) && (item.credit !== 0)) {
          item.labelDisplay = labelDisplay.lower;
        } else if ((item.balance < limiteValidationSup) && (item.credit !== 0)) {
          item.labelDisplay = labelDisplay.greater;
        } else if (item.debit > 0 && item.credit === 0) {
          item.labelDisplay = labelDisplay.pending;
        }

        transferts.forEach(transf => {
          if (moment(item.trans_date).format('YYYY-MM-DD') === moment(transf.trans_date).format('YYYY-MM-DD')) {
            item.debit_transfert = transf.debit;
            item.credit_transfert = transf.credit;
            item.balance_transfert = transf.balance;

            if (transf.balance > limiteValidationInf && transf.balance < limiteValidationSup) {
              item.labelDisplayTransfert = labelDisplay.correct;
            } else if ((transf.balance > limiteValidationSup) && (transf.credit !== 0)) {
              item.labelDisplayTransfert = labelDisplay.lower;
            } else if ((transf.balance < limiteValidationSup) && (transf.credit !== 0)) {
              item.labelDisplayTransfert = labelDisplay.greater;
            } else if (transf.debit === transf.balance) {
              item.labelDisplayTransfert = labelDisplay.pending;
            }
          }
        });

        primaryTransferts.forEach(primary => {
          if (moment(item.trans_date).format('YYYY-MM-DD') === moment(primary.trans_date).format('YYYY-MM-DD')) {
            item.account_target = ` ${primary.number}: ${primary.label} `;
            item.debit_primary = primary.debit;
            // Get the difference enter in target account And Out on transfert account
            item.balance_primary = (primary.debit - item.debit_transfert);

            if (item.balance_primary > (limiteValidationInf) && item.balance_primary < (limiteValidationSup)) {
              item.labelDisplayPrimary = labelDisplay.correct;
            } else if ((primary.debit > item.debit_transfert)) {
              item.labelDisplayPrimary = labelDisplay.greater;
            } else if ((primary.debit < item.debit_transfert)) {
              item.labelDisplayPrimary = labelDisplay.lower;
            } else if (primary.debit === 0 && item.debit_transfert > 0) {
              item.labelDisplayPrimary = labelDisplay.pending;
            }
          }
        });
      });

      _.merge(data, { transactions });

      return reporting.render(data);
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();

}
