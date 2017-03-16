/**
 * Clients report Controller server side
 *
 * This controller is responsible for processing Clients report.
 *
 * @module finance/clientsReport/index.js
 *
 * @requires lodash
 * @requires lib/db
 * @requires lib/ReportManager
 * @requires lib/filter
 */

'use strict';

const _             = require('lodash');
const db            = require('../../../../lib/db');
const ReportManager = require('../../../../lib/ReportManager');
const TEMPLATE = './server/controllers/finance/reports/clientsReport/report.handlebars';

/**
 * @function document
 * @description processes and renders clients report document
 */
function document(req, res, next) {
  let params = req.query;
  let session = {};
  let report;


  _.defaults(session, { dateFrom : new Date(params.dateFrom), dateTo : new Date(params.dateTo), detailPrevious : params.detailPrevious, ignoredClients : params.ignoredClients, enterprise : req.session.enterprise });
  _.defaults(params, {user : req.session.user });

  try {
    report = new ReportManager(TEMPLATE, req.session, params);
  } catch (next) {
    return next(e);
  }

  //Getting data to be rendered
  fetchClientsData(session)
    .then(function (data) {
      return report.render(data);
    })
    .then(function (result) {
      res.set(result.headers).send(result.report);
    })
    .catch(next);
 }

/**
 * @function fetchClientsData
 * @description
 * Fetch client data for current and previous fiscal year
 **/
function fetchClientsData(session) {

  let clientsData = {}, ignoredClients, notInStatement = '';
  _.defaults(clientsData, session);

  if(session.ignoredClients){
    ignoredClients = (Array.isArray(session.ignoredClients))? session.ignoredClients : [session.ignoredClients];
    notInStatement = `AND dg.uuid NOT IN (${escapeItems(ignoredClients).join(',')})`;
  }

  //request to fetch data of previous year
  const previousDetailSql =
    `    
    SELECT 
     t.number, t.name, IFNULL(t.debit, 0) AS debit, IFNULL(t.credit, 0) AS credit, 
	   0 AS finalBalance, IFNULL(t.balance, 0) AS balance
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

  //getting a fiscal year and the previous fiscal year ID form the date start defined by the user
  return getFiscalYear(session.dateFrom)
    .then(function (rows) {
      clientsData.fy = rows[0];
      clientsData.fy.openningBalanceDate = new Date(clientsData.fy.start_date);
      clientsData.fy.openningBalanceDate.setDate(clientsData.fy.openningBalanceDate.getDate() - 1); //just correcting the date value

      //getting the client data for the previous fiscal year
      return db.exec(previousDetailSql, [clientsData.fy.previous_fiscal_year_id]);
    })
    .then(function (data){

      //from previous fiscal year data, building the object containing all previous info to print
      clientsData.lines = data.reduce(function (obj, clientInfo) {
        const number = clientInfo.number;
        obj[number] = {};
        obj[number].initCredit = clientInfo.credit;
        obj[number].initDebit = clientInfo.debit;
        obj[number].balance = clientInfo.balance;
        obj[number].credit = 0;
        obj[number].debit = 0;
        obj[number].finalBalance = clientInfo.finalBalance;
        obj[number].accountNumber = clientInfo.number;
        obj[number].name = clientInfo.name;
        return obj;
      }, {});

      //getting total for previous fiscal year
      const previousTotalSql =
        `
        SELECT 
          IFNULL(debit, 0) AS totalInitialDebit, IFNULL(credit, 0) AS totalInitialCredit, IFNULL(balance, 0) AS totalBalance 
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
    .then(function (previousTotal) {
      _.merge(clientsData, previousTotal);

      //request to fetch the current fiscal year data of a client
      const currentDetailSql =
        `
        SELECT 
          t.number, t.name, IFNULL(t.debit, 0) AS debit, IFNULL(t.credit, 0) AS credit, 
           IFNULL(t.balance, 0) AS totalBalance
        FROM 
        (
          SELECT 
            ac.number, dg.name, SUM(gl.debit_equiv) AS debit, SUM(gl.credit_equiv) AS credit, 
            SUM(gl.debit_equiv - gl.credit_equiv) AS balance 
          FROM debtor_group dg 
          JOIN account ac ON ac.id = dg.account_id 
          LEFT JOIN posting_journal gl ON ac.id = gl.account_id
          WHERE DATE(gl.trans_date) >= DATE(?) AND DATE(gl.trans_date) <= DATE(?) ${notInStatement} 
          GROUP BY ac.number
        ) AS t`;

      //fetching data of the current fiscal year
      return db.exec(currentDetailSql, [session.dateFrom, session.dateTo]);
    })
    .then(function (data) {
      //completing the object {clientsData} by adding current info
      data.forEach(function (dt) {

        //if there is no info about the client for the previous year
        if(!clientsData.lines[dt.number]){
          clientsData.lines[dt.number] = {};
          clientsData.lines[dt.number].initCredit = 0;
          clientsData.lines[dt.number].initDebit = 0;
          clientsData.lines[dt.number].balance = 0;
          clientsData.lines[dt.number].name = dt.name;
          clientsData.lines[dt.number].accountNumber = dt.number;
        }

        //adding effectively current info to the object
        clientsData.lines[dt.number].credit = dt.credit;
        clientsData.lines[dt.number].debit = dt.debit;

        //adding the final balance of the client, no way to get it from the database directly without altering the current requests
        clientsData.lines[dt.number].finalBalance = clientsData.lines[dt.number].balance + dt.balance;
      });

      const currentTotalSql =
        `
        SELECT 
          IFNULL(t.debit, 0) AS totalDebit, IFNULL(t.credit, 0) AS totalCredit, 
          IFNULL(t.balance, 0) AS totalFinalBalance
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
    .then(function (currentTotal) {
      _.merge(clientsData, currentTotal);
      return clientsData;
    })
    .catch(function (e){
      return next(e);
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
function escapeItems (list) {
  return list.reduce(function (t, item) {
    t.push(db.escape(db.bid(item)));
    return t;
  }, []);
}

exports.document = document;
