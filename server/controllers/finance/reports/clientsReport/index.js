/**
 * Clients report Controller server side
 *
 * This controller is responsible for processing Clients report.
 *
 * @module finance/reports/clientsReport/index.js
 *
 * @requires lodash
 * @requires lib/db
 * @requires lib/ReportManager
 */
const _ = require('lodash');
const db = require('../../../../lib/db');
const ReportManager = require('../../../../lib/ReportManager');

const TEMPLATE = './server/controllers/finance/reports/clientsReport/report.handlebars';

/**
 * @function document
 * @description processes and renders clients report document
 */
function document(req, res, next) {
  const params = req.query;
  const session = {};
  let report;

  console.log('params', params);

  _.defaults(session, {
    dateFrom : new Date(params.dateFrom),
    dateTo : new Date(params.dateTo),
    detailPrevious : params.detailPrevious,
    ignoredClients : params.ignoredClients,
    enterprise : req.session.enterprise,
  });

  _.defaults(params, { user : req.session.user });

  try {
    report = new ReportManager(TEMPLATE, req.session, params);
  } catch (e) {
    return next(e);
  }

  // Getting data to be rendered
  return fetchClientsData(session)
    .then((data) => {
      //getting a boolean value from a string
      data.detailPrevious = data.detailPrevious === 'true';
      return report.render(data);
    })
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next);
}

/**
 * @function fetchClientsData
 *
 * {object} session : contains all configuration data to generate the report
 * @description
 * Fetch client data for current and previous fiscal year
 **/
function fetchClientsData(session) {
  const clientsData = {};
  let ignoredClients;
  let notInStatement = '';

  _.defaults(clientsData, session);

  if (session.ignoredClients) {
    ignoredClients = (Array.isArray(session.ignoredClients)) ? session.ignoredClients : [session.ignoredClients];
    notInStatement = `AND dg.uuid NOT IN (${escapeItems(ignoredClients).join(',')})`;
  }

  // request to fetch data of previous year
  const previousDetailSql =
    `    
    SELECT 
     t.number AS accountNumber, t.name, 
     IFNULL(t.debit, 0) AS initDebit, IFNULL(t.credit, 0) AS initCredit, IFNULL(t.balance, 0) AS initBalance
    FROM
    (
      SELECT
       ac.number AS number, dg.name AS name, SUM(pt.debit) AS debit,
       SUM(pt.credit) AS credit, SUM(pt.debit - pt.credit) AS balance 
      FROM debtor_group dg 
      JOIN account ac ON ac.id = dg.account_id 
      LEFT JOIN period_total pt ON ac.id = pt.account_id
      WHERE pt.fiscal_year_id = ? ${notInStatement} GROUP BY ac.number
    ) AS t`;

  // getting a fiscal year and the previous fiscal year ID from the date start defined by the user
  return getFiscalYear(session.dateFrom)
    .then((rows) => {
      clientsData.fy = rows[0];
      clientsData.fy.openningBalanceDate = new Date(clientsData.fy.start_date);
      // just correcting the date value
      clientsData.fy.openningBalanceDate.setDate(clientsData.fy.openningBalanceDate.getDate() - 1);

      // getting the client data for the previous fiscal year
      return db.exec(previousDetailSql, [clientsData.fy.previous_fiscal_year_id]);
    })
    .then((data) => {
      // from previous fiscal year data, building the object containing all previous info to print
      clientsData.lines = data.reduce((obj, clientInfo) => {
        const number = clientInfo.accountNumber;
        _.merge(obj[number] = {}, clientInfo);
        return obj;
      }, {});

      // getting total for previous fiscal year
      const previousTotalSql =
        `
        SELECT 
          IFNULL(debit, 0) AS totalInitDebit, IFNULL(credit, 0) AS totalInitCredit, 
          IFNULL(balance, 0) AS totalInitBalance 
        FROM 
        (
          SELECT 
            SUM(pt.debit) AS debit, SUM(pt.credit) AS credit, SUM(pt.debit - pt.credit) AS balance 
          FROM period_total pt
          JOIN debtor_group dg ON dg.account_id = pt.account_id 
          WHERE pt.fiscal_year_id = ? ${notInStatement} 
        ) AS t`;

      return db.one(previousTotalSql, [clientsData.fy.previous_fiscal_year_id]);
    })
    .then((previousTotal) => {
      _.merge(clientsData, previousTotal);

      // request to fetch the current fiscal year data of a client
      const currentDetailSql =
        `
        SELECT 
          t.number AS accountNumber, t.name, IFNULL(t.debit, 0) AS debit, IFNULL(t.credit, 0) AS credit, 
          IFNULL(t.balance, 0) AS balance
        FROM 
        (
          SELECT 
            ac.number, dg.name, SUM(gl.debit_equiv) AS debit, SUM(gl.credit_equiv) AS credit, 
            SUM(gl.debit_equiv - gl.credit_equiv) AS balance 
          FROM debtor_group dg 
          JOIN account ac ON ac.id = dg.account_id 
          LEFT JOIN general_ledger gl ON ac.id = gl.account_id
          WHERE DATE(gl.trans_date) >= DATE(?) AND DATE(gl.trans_date) <= DATE(?) ${notInStatement} 
          GROUP BY ac.number
        ) AS t`;

      // fetching data of the current fiscal year
      return db.exec(currentDetailSql, [session.dateFrom, session.dateTo]);
    })
    .then((data) => {
      // completing the object {clientsData} by adding current info
      data.forEach((dt) => {
        // if there is no info about the client for the previous year
        if (!clientsData.lines[dt.accountNumber]) {
          _.merge(clientsData.lines[dt.accountNumber] = {}, {
            initDebit : 0,
            initCredit : 0,
            initBalance : 0,
            name : dt.name,
            accountNumber : dt.accountNumber,
          });
        }

        // adding effectively current info to the object
        // and adding the final balance of the client,
        // no way to get it from the database directly without altering the current requests
        _.merge(clientsData.lines[dt.accountNumber], {
          debit : dt.debit,
          credit : dt.credit,
          finalBalance : clientsData.lines[dt.accountNumber].initBalance + dt.balance,
        });
      });

      const currentTotalSql =
        `
        SELECT 
          IFNULL(t.debit, 0) AS totalDebit, IFNULL(t.credit, 0) AS totalCredit, 
          IFNULL(${clientsData.totalInitBalance} + t.balance, 0) AS totalFinalBalance
        FROM 
        (
          SELECT 
            SUM(gl.debit_equiv) AS debit, SUM(gl.credit_equiv) AS credit, 
            SUM(gl.debit_equiv - gl.credit_equiv) AS balance 
          FROM debtor_group dg 
          JOIN account ac ON ac.id = dg.account_id 
          JOIN general_ledger gl ON ac.id = gl.account_id
          WHERE DATE(gl.trans_date) >= DATE(?) AND DATE(gl.trans_date) <= DATE(?) ${notInStatement} 
        ) AS t`;

      return db.one(currentTotalSql, [session.dateFrom, session.dateTo]);
    })
    .then((currentTotal) => {
      _.merge(clientsData, currentTotal);

      return clientsData;
    });
}

/**
 * @function getFiscalYear
 * @param {object} date The date in which we want to get the fiscal year
 * @description
 * This function is responsible of returning a correct fiscal year
 * according a date given
 */
function getFiscalYear(date) {
  var query =
    'SELECT fy.id, fy.previous_fiscal_year_id, fy.start_date, fy.end_date FROM fiscal_year fy ' +
    'WHERE DATE(?) BETWEEN DATE(`fy`.`start_date`) AND DATE(`fy`.`end_date`)';
  return db.exec(query, [date]);
}

/**
 * @function escape
 * @param {Array} list a list of debtor group uuids
 * @return {Array} a list of escaped debtor group uuids
 * @description
 * This function is responsible of returning an escaped list of string
 * in : [1, 2] out : ["1", "2"]
 */
function escapeItems(list) {
  return list.reduce((t, item) => {
    t.push(db.escape(db.bid(item)));
    return t;
  }, []);
}

exports.document = document;
