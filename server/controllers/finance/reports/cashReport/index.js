/**
 * cashReport Controller
 *
 *
 * This controller is responsible for processing cash report.
 *
 * @module finance/cashReport
 *
 * @requires lodash
 * @requires lib/db
 * @requires lib/ReportManager
 * @requires lib/errors/BadRequest
 */

const _ = require('lodash');
const db = require('../../../../lib/db');
const ReportManager = require('../../../../lib/ReportManager');
const BadRequest = require('../../../../lib/errors/BadRequest');

const TEMPLATE_1 = './server/controllers/finance/reports/cashReport/report_combined.handlebars';
const TEMPLATE_2 = './server/controllers/finance/reports/cashReport/report_separated.handlebars';

// expose to the API
exports.document = document;


function getRecordQuery (token, format){
  let query;

  if(format === 1){
    query = 
    `
    SET @cbal := 0;
    SELECT
      t.trans_id, t.trans_date, t.debit_equiv AS debit, t.credit_equiv AS credit,
      t.description, a.number, a.label, t.balance, (@cbal := @cbal + t.balance) AS cbalance
    FROM
      (
        (
          SELECT
            p.trans_date, p.debit_equiv, p.credit_equiv, p.trans_id, 
            p.description, p.account_id, (p.debit_equiv - p.credit_equiv) AS balance
          FROM
            posting_journal AS p
          WHERE 
            p.account_id= ? AND 
            (p.trans_date >= DATE(?) AND p.trans_date <= DATE(?)) 
          ORDER BY 
            p.trans_date DESC	
        )
        UNION ALL
        (
          SELECT
            g.trans_date, g.debit_equiv, g.credit_equiv, g.trans_id, g.description, g.account_id, (g.debit_equiv - g.credit_equiv) AS balance
          FROM
            general_ledger AS g 
          WHERE 
            g.account_id= ? AND 
            (g.trans_date >= DATE(?) AND g.trans_date <= DATE(?))
          ORDER BY 
            g.trans_date DESC
        )
      ) AS t
    JOIN 
      account a ON a.id = t.account_id;`


  }else{
   query =
    `
    SELECT
      t.trans_id, t.trans_date, t.debit_equiv AS debit, t.credit_equiv AS credit, t.description, 
      t.origin_id, t.user_id, u.username, a.number, 
      tr.text AS transactionType, a.label
    FROM
      (
        (
          SELECT
            p.trans_date, p.debit_equiv, p.credit_equiv,
            p.trans_id, p.description, p.origin_id, p.user_id, p.account_id
          FROM
            posting_journal AS p
          WHERE 
            p.account_id= ? AND (p.trans_date >= DATE(?) AND p.trans_date <= DATE(?))
        )
        UNION ALL
        (
          SELECT
            g.trans_date, g.debit_equiv, g.credit_equiv,
            g.trans_id, g.description, g.origin_id, g.user_id, g.account_id
          FROM
            general_ledger AS g
          WHERE 
            g.account_id= ? AND (g.trans_date >= DATE(?) AND g.trans_date <= DATE(?))
        )
      ) AS t
    JOIN 
      user u ON t.user_id = u.id
    JOIN 
      account a ON a.id = t.account_id
    LEFT JOIN 
      transaction_type tr ON tr.id = t.origin_id
    WHERE 
      ${token} 
    GROUP BY 
      t.trans_id;`;        
  }

  return query;
}

function getCashRecord (accountId, dateFrom, dateTo, format, type){
  let reportContext = {};
  let promise;

  if(format === 1){
    promise = db.exec(getRecordQuery(null, format), [accountId, dateFrom, dateTo, accountId, dateFrom, dateTo]);
  }else{
    promise = db.exec(getRecordQuery('t.debit_equiv > 0', format), [accountId, dateFrom, dateTo, accountId, dateFrom, dateTo])
    .then((entries) => {
      reportContext.entries = entries;

      // Getting expenses records
      return db.exec(getRecordQuery('t.credit_equiv > 0', format), [accountId, dateFrom, dateTo, accountId, dateFrom, dateTo]);
    })
    .then((expenses) => {
      reportContext.expenses = expenses;
      _.merge(reportContext, {
        type_id : Number(type),
        isEmpty : reportContext.entries.length === 0 && reportContext.expenses.length === 0
      });
      // Getting sum entries 
      return db.one(aggregateRecordQuery('t.debit > 0'), [accountId, dateFrom, dateTo, accountId, dateFrom, dateTo]);      
    })
    .then((totalEntry) => {
      reportContext.totalEntry = totalEntry.balance;

      // Getting sum expenses 
      return db.one(aggregateRecordQuery('t.credit > 0', format), [accountId, dateFrom, dateTo, accountId, dateFrom, dateTo]);   
    })
    .then((totalExpense) => {
      reportContext.totalExpense = totalExpense.balance;

      // Getting balance of cash account 
      return db.one(aggregateRecordQuery(), [accountId, dateFrom, dateTo, accountId, dateFrom, dateTo]);   
    })
    .then((finalTotal) => {
      return {finalTotal : finalTotal.balance};      
    });
  }

  return promise
  .then((data) => {
    _.merge(reportContext, data);
    const sql = 
      `SELECT
	      c.label AS cashName, cu.symbol AS cashCurrency
      FROM 
        cash_box AS c
      JOIN 
        cash_box_account_currency AS cac ON c.id = cac.cash_box_id
      JOIN 
        currency AS cu ON cac.currency_id = cu.id
      WHERE cac.account_id = ?;`
    return db.one(sql, [accountId]);

  })  
  .then((cashDetail) => {
    _.merge(reportContext, cashDetail);
    return reportContext;
  });
}

function aggregateRecordQuery (token = 1){
  const query =
  `
  SELECT
    ABS(SUM(t.debit - t.credit)) AS balance
  FROM
    (
      (
      SELECT
        p.debit_equiv AS debit, p.credit_equiv AS credit
      FROM
        posting_journal AS p
      WHERE 
        p.account_id= ? AND 
        (p.trans_date >= DATE(?) AND p.trans_date <= DATE(?))
      )
      UNION ALL
      (
      SELECT
        g.debit_equiv AS debit, g.credit_equiv AS credit
      FROM
        general_ledger AS g
      WHERE 
			  g.account_id= ? AND 
        (g.trans_date >= DATE(?) AND g.trans_date <= DATE(?))
      )
    ) AS t WHERE ${token};`

  return query;
}


/**
 * @function document
 * @description process and render the cash report document
 */
function document(req, res, next) {
  const params = req.query;
  let documentReport;

  if (!params.dateFrom || !params.dateTo) {
    throw new BadRequest('Date range should be specified', 'ERRORS.BAD_REQUEST');
  }

  if (!params.account_id) {
    throw new BadRequest('account of cash box not specified', 'ERRORS.BAD_REQUEST');
  }

  params.user = req.session.user;
  params.format = Number(params.format);  

  try {
    const TEMPLATE = params.format === 1 ? TEMPLATE_1 : TEMPLATE_2;
    documentReport = new ReportManager(TEMPLATE, req.session, params);
  } catch (e) {
    next(e);
    return;
  }

 getCashRecord(params.account_id, params.dateFrom, params.dateTo, params.format, params.type)
    .then((reportContext) => {      
      console.log('reportContext', reportContext);
      return documentReport.render(reportContext);
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(function(err){
      console.log(err);
    })
    .done();
}
