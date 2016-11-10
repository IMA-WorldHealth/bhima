/**
 * AgedDebtors Controller
 *
 *
 * This controller is responsible for processing agedDebtors report.
 *
 * @module finance/aged Debtors
 *
 * @requires lodash
 * @requires node-uuid
 * @requires moment
 * @requires lib/db
 * @requires lib/util
 * @requires lib/ReportManager
 * @requires lib/errors/BadRequest
 */

'use strict';

const _             = require('lodash');
const uuid          = require('node-uuid');
const moment        = require('moment');
const db            = require('../../../../lib/db');
const transaction   = db.transaction();
const util          = require('../../../../lib/util');
const ReportManager = require('../../../../lib/ReportManager');
const BadRequest    = require('../../../../lib/errors/BadRequest');

const TEMPLATE      = './server/controllers/finance/reports/agedDebtors/reports.handlebars';

// expose to the API
exports.document = document;

/** processingAgedDebtorsReport */
/*  @desc This function recovers up to date returned by the client side 
/*  and then retrieves the list of debtors, information about the current fiscal year, 
/*  but then research the balance of accounts of each Debtor groups with respect to by dates, 
/*  there are less than 3 months, between 3 months and 6 months, 
/*  over 6 months but also last fiscal Year
*/
function processingAgedDebtorsReport(params) {
  let glb = {};

  if (!params.untilDate) {
    throw new BadRequest('Until Date missing', 'ERRORS.BAD_REQUEST');
  }
  glb.untilDate = params.untilDate;

    return getDebtorGroups()
    .then(function (res){
      glb.debtorGroups = res;
      return getFiscalYear(params.untilDate);
    })
    .then(function (result) {
      glb.fiscalYear = result;
      return getPreviousDebts(glb.fiscalYear, glb.untilDate);
    })
    .then(function (previousDebts) {
      glb.previous = previousDebts[0];
      glb.first = previousDebts[3];
      glb.second = previousDebts[2];
      glb.third = previousDebts[1];
      glb.grandTotal = 0;

      glb.debtorGroups.forEach(function (deb) {
        deb.balancePrevious = 0;
        deb.balanceFirst = 0;
        deb.balanceSecond = 0;
        deb.balanceThird = 0;
        deb.total = 0;

        glb.previous.forEach(function (previous) {
          if(deb.uuid === previous.uuid){
            deb.balancePrevious = previous.balance;
            deb.total += previous.balance;
            
            glb.grandTotal += deb.total;
          }
        });

        glb.first.forEach(function (first) {
          if(deb.uuid === first.uuid){
            deb.balanceFirst = first.balance;
            deb.total += first.balance;

            glb.grandTotal += deb.total;
          }

        });

        glb.second.forEach(function (second) {
          if(deb.uuid === second.uuid){
            deb.balanceSecond = second.balance;
            deb.total += second.balance;

            glb.grandTotal += deb.total;
          }

        });

        glb.third.forEach(function (third) {
          if(deb.uuid === third.uuid){
            deb.balanceThird = third.balance;
            deb.total += third.balance;

            glb.grandTotal += deb.total;
          }
        });
      });
      return glb;
    });    
}

/**
 * @function getDebtorGroups
 */
function getDebtorGroups(){
  let query = `
    SELECT BUID(uuid) AS uuid, name AS nameDebtorGroup, account_id
    FROM debtor_group
    ORDER BY name ASC`;

    return db.exec(query);
}

/**
 * @function getFiscalYear
 * @param {untilDate} 
 */
function getFiscalYear(untilDate) {
  let query =`
    SELECT fiscal_year.id, fiscal_year.previous_fiscal_year_id, period.id AS period_id, period.start_date, period.end_date
    FROM fiscal_year
    JOIN period ON period.fiscal_year_id = fiscal_year.id
    WHERE DATE(period.start_date) <= DATE(?) AND DATE(period.end_date) >= DATE(?);`;

  return db.exec(query, [untilDate, untilDate]);
}


/**
 * @function getFiscalYear
 * @param {fiscalYear, untilDate} 
 * @Desc this function research the debts and make a categorisation by Times and by fiscal year
 */
function getPreviousDebts(fiscalYear, untilDate) {
  let query =`
    SELECT t.project_id, t.trans_date, SUM(t.debit_equiv) AS debit,
    SUM(t.credit_equiv) AS credit, SUM(t.debit_equiv - t.credit_equiv) as balance,
    t.account_id, t.currency_id, t.description, t.account_id,
    t.comment, dg.name, BUID(dg.uuid) AS uuid
    FROM general_ledger t
    JOIN debtor_group dg ON dg.account_id = t.account_id 
    WHERE t.fiscal_year_id = ?
    GROUP BY t.account_id HAVING balance <> 0`;

  let sqlTemplate = `
    SELECT t.project_id, t.trans_date, SUM(t.debit_equiv) AS debit,
    SUM(t.credit_equiv) AS credit, SUM(t.debit_equiv - t.credit_equiv) as balance,
    t.account_id, t.currency_id, t.description, t.account_id,
    t.comment, dg.name, BUID(dg.uuid) AS uuid
    FROM general_ledger t
    JOIN debtor_group dg ON dg.account_id = t.account_id 
    WHERE (%PERIOD%)
    GROUP BY t.account_id HAVING balance <> 0`; 

  let requette1 = sqlTemplate.replace(/%PERIOD%/g, '(DATEDIFF(?, t.trans_date) BETWEEN 0 AND 90) AND ( ? >= t.trans_date) AND t.fiscal_year_id = ?');  
  let requette2 = sqlTemplate.replace(/%PERIOD%/g, '(DATEDIFF(?, t.trans_date) BETWEEN 91 AND 180) AND ( ? >= t.trans_date) AND t.fiscal_year_id = ?');  
  let requette3 = sqlTemplate.replace(/%PERIOD%/g, '(DATEDIFF(?, t.trans_date) BETWEEN 181 AND 366) AND ( ? >= t.trans_date) AND t.fiscal_year_id = ?');

  transaction
    .addQuery(query, [fiscalYear[0].previous_fiscal_year_id])
    .addQuery(requette1, [untilDate, untilDate,fiscalYear[0].id])
    .addQuery(requette2, [untilDate, untilDate,fiscalYear[0].id])
    .addQuery(requette3, [untilDate, untilDate,fiscalYear[0].id]);

  return transaction.execute();  
}



/**
 * @function document
 * @description process and render the agedDebtors report document
 */
function document(req, res, next) {
  const session = {};
  const params = req.query;
  params.user = req.session.user;

  let report;

  session.dateFrom = params.dateFrom;
  session.dateTo = params.dateTo;
  session.reportType = params.reportType;
  

  _.defaults(params, { orientation : 'landscape' });

  try {
    report = new ReportManager(TEMPLATE, req.session, params);
  } catch (e) {
    return next(e);
  }

  processingAgedDebtorsReport(params)
    .then(agedDebtors => {
      return report.render({ agedDebtors });
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();

}