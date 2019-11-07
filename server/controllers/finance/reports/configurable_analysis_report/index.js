const q = require('q');
const _ = require('lodash');
const db = require('../../../../lib/db');
const ReportManager = require('../../../../lib/ReportManager');

const TEMPLATE = './server/controllers/finance/reports/configurable_analysis_report/report.handlebars';
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
 *
 */
function report(req, res, next) {
  const params = req.query;
  const data = {};
  let reporting;

  data.period = {
    start_date : new Date(params.start_date),
    end_date : new Date(params.end_date),
    period_start_label : params.start_label,
    period_end_label : params.end_label,
    start_year : params.start_year,
    end_year : params.end_year,
  };

  params.start_date = new Date(params.start_date);
  data.currencyId = params.currency_id;

  _.defaults(params, DEFAULT_PARAMS);

  try {
    reporting = new ReportManager(TEMPLATE, req.session, params);
  } catch (e) {
    next(e);
    return;
  }

  const sqlType = `
    SELECT id, label FROM analysis_tool_type
    ORDER BY id
  `;

  const sqlConfig = `
    SELECT id, is_creditor, restrict_title_account, account_reference_id, label,
    analysis_tool_type_id
    FROM configuration_analysis_tools
  `;

  const sqlReferences = `
    SELECT at.id, at.is_creditor, at.restrict_title_account, at.account_reference_id,
    a.number, a.label, ari.is_exception,
    at.analysis_tool_type_id
    FROM configuration_analysis_tools AS at
    JOIN account_reference AS ar ON ar.id = at.account_reference_id
    JOIN account_reference_item AS ari ON ari.account_reference_id = ar.id
    JOIN account AS a ON a.id = ari.account_id  
  `;

  const promises = [
    db.exec(sqlType),
    db.exec(sqlConfig),
    db.exec(sqlReferences)];

  q.all(promises)
    .spread((type, config, dataConfig) => {
      data.type = type;
      data.config = config;
      data.dataConfig = dataConfig;

      const dbPromises = [];
      const accountsNumber = dataConfig.map(row => row.number);

      accountsNumber.forEach(item => {
        const sqlGetAccounts = `
          SELECT a.id, a.number 
          FROM account AS a
          WHERE a.number LIKE '${item}%' AND a.type_id <> 6;
        `;
        dbPromises.push(db.exec(sqlGetAccounts));
      });

      return q.all(dbPromises);
    })
    .then(accountsFound => {
      const accountReferences = [];
      accountsFound.forEach(account => {
        account.forEach(item => {
          accountReferences.push(item.id);
        });
      });

      const paramFilter = [
        data.period.start_date,
        data.period.end_date,
        accountReferences,
        data.period.start_date,
        data.period.start_date,
        data.period.start_date,
        data.period.start_date,
        data.period.end_date,
        accountReferences,
        data.period.start_date,
        data.period.start_date,
        data.period.start_date,
      ];

      const sqlBalanceAccounts = `
        SELECT a.number, a.label,cl.account_id, SUM(cl.debit) AS debit, SUM(cl.credit) AS credit,
        SUM(cl.debit - cl.credit) AS balance, cl.record_uuid, cl.trans_date
        FROM
        (
          SELECT gl.account_id, gl.debit_equiv AS debit, gl.credit_equiv AS credit, gl.record_uuid, gl.trans_date
          FROM general_ledger AS gl
          WHERE DATE(gl.trans_date) >= DATE(?) AND DATE(gl.trans_date) <= DATE(?)
          AND gl.account_id iN (?)
          AND gl.transaction_type_id <> 10
          AND gl.record_uuid NOT IN (
              SELECT rev.uuid
              FROM (
                  SELECT v.uuid FROM voucher v WHERE v.reversed = 1
                  AND DATE(v.date) >= DATE(?)
                UNION
                  SELECT c.uuid FROM cash c WHERE c.reversed = 1
                  AND DATE(c.date) >= DATE(?)
                UNION
                  SELECT i.uuid FROM invoice i WHERE i.reversed = 1
                  AND DATE(i.date) >= DATE(?)
              ) AS rev
            )
          UNION
          SELECT ps.account_id, ps.debit_equiv AS debit, ps.credit_equiv AS credit, ps.record_uuid, ps.trans_date
          FROM posting_journal AS ps
          WHERE DATE(ps.trans_date) >= DATE(?) AND DATE(ps.trans_date) <= DATE(?)
          AND ps.account_id iN (?)
          AND ps.transaction_type_id <> 10
          AND ps.record_uuid NOT IN (
              SELECT rev.uuid
              FROM (
                  SELECT v.uuid FROM voucher v WHERE v.reversed = 1
                  AND DATE(v.date) >= DATE(?)
                UNION
                  SELECT c.uuid FROM cash c WHERE c.reversed = 1
                  AND DATE(c.date) >= DATE(?)
                UNION
                  SELECT i.uuid FROM invoice i WHERE i.reversed = 1
                  AND DATE(i.date) >= DATE(?)
              ) AS rev
            )
        ) AS cl
        JOIN account AS a ON a.id = cl.account_id
          GROUP BY cl.account_id
          ORDER BY a.number ASC, a.label
      `;

      return db.exec(sqlBalanceAccounts, paramFilter);
    })
    .then(rows => {
      data.config.forEach(config => {
        config.balance = [];
        data.dataConfig.forEach(dataConfig => {
          if (config.id === dataConfig.id) {
            rows.forEach(item => {
              const accountNumber = item.number.toString();
              if (accountNumber.startsWith(dataConfig.number)) {
                config.balance.push(item);
              }
            });
          }
        });
      });

      data.type.forEach(type => {
        type.report = [];
        data.config.forEach(config => {
          if (type.id === config.analysis_tool_type_id) {
            type.report.push(config);
          }
        });
      });

      return reporting.render(data);
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();

}
