/**
 * Clients report Controller
 *
 *
 * This controller is responsible for processing Clients report.
 *
 * @module finance/clientsReport
 *
 * @requires lodash
 * @requires lib/db
 * @requires lib/ReportManager
 */

'use strict';

const _          = require('lodash');

const db         = require('../../../../lib/db');
const ReportManager = require('../../../../lib/ReportManager');

const TEMPLATE = './server/controllers/finance/reports/clientsReport/report.handlebars';

/**
 * @function document
 * @description processes and renders the client report document
 */
function document(req, res, next) {
  const session = {};
  const params = req.query;
  let report;

  session.dateFrom = new Date(params.dateFrom);
  session.dateTo = new Date(params.dateTo);
  session.detailPrevious = params.detailPrevious;
  session.ignoredClients = params.ignoredClients;
  session.enterprise = req.session.enterprise;

  _.defaults(params, {user : req.session.user });

  try {
    report = new ReportManager(TEMPLATE, req.session, params);
  } catch (e) {
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
  //will contain data to fill in the report
  var clientsData = {};
  var ignoredClients, ignoredToken = '';

  //attaching the enterprise to the context (good ???)
  clientsData.enterprise = session.enterprise;

  //Attaching the describing choice to the context (true | false)
  clientsData.detailPrevious = session.detailPrevious;
  
  //Attache the dateTo and dateFrom (just attache the session??)
  clientsData.dateFrom = session.dateFrom;
  clientsData.dateTo = session.dateTo;

  if(session.ignoredClients){
    ignoredClients = (Array.isArray(session.ignoredClients))? session.ignoredClients : [session.ignoredClients];
    ignoredToken = ` AND dg.uuid NOT IN (${escapeItems(ignoredClients).join(',')})`;
  }

  //request to fetch data of previous year
  var request =
    `SELECT ac.number, dg.name, IFNULL(SUM(gl.debit_equiv), 0) AS debit, 
     IFNULL(SUM(gl.credit_equiv), 0) AS credit FROM debtor_group dg JOIN account ac 
     ON ac.id = dg.account_id LEFT JOIN general_ledger gl ON ac.id = gl.account_id
      WHERE gl.fiscal_year_id = ? ${ignoredToken} GROUP BY ac.number`;

  //getting a fiscal year and the previous fiscal year ID form the date start defined by the user
  return getFiscalYear(session.dateFrom)
    .then(function (rows) {
      clientsData.fy = rows[0];
      clientsData.fy.openningBalanceDate = new Date(clientsData.fy.start_date);
      var openningDay = clientsData.fy.openningBalanceDate.getDate() - 1;
      clientsData.fy.openningBalanceDate.setDate(openningDay);

      //getting the client data for the previous fiscal year
      return db.exec(request, [clientsData.fy.previous_fiscal_year_id]);
    })
    .then(function (data){
      //init totals of previous fiscal year
      clientsData.totalInitialCredit = 0; clientsData.totalInitialDebit = 0; clientsData.totalBalance = 0; clientsData.totalFinalBalance = 0;

      //from previous fiscal year data, building the object containing all previous info to print
      clientsData.lines = data.reduce(function (obj, clientInfo) {
        var number = clientInfo.number;
        obj[number] = {};
        obj[number].initCredit = clientInfo.credit;
        obj[number].initDebit = clientInfo.debit;
        obj[number].balance = (clientInfo.debit - clientInfo.credit);
        obj[number].credit = 0;
        obj[number].debit = 0;
        obj[number].finalBalance = (obj[number].balance - obj[number].credit) + obj[number].debit;
        obj[number].accountNumber = clientInfo.number;
        obj[number].name = clientInfo.name;
        clientsData.totalInitialCredit += clientInfo.credit;
        clientsData.totalInitialDebit += clientInfo.debit;
        clientsData.totalBalance += obj[number].balance;
        clientsData.totaFinalBalance += obj[number].finalBalance;
        return obj;
      }, {});

      //request to fetch the current fiscal year data of a client
      request =
        `SELECT ac.number, dg.name, IFNULL(SUM(gl.debit_equiv), 0) AS debit, 
     IFNULL(SUM(gl.credit_equiv), 0) AS credit FROM debtor_group dg JOIN account ac 
     ON ac.id = dg.account_id LEFT JOIN general_ledger gl ON ac.id = gl.account_id
      WHERE DATE(gl.trans_date) >= DATE(?) AND DATE(gl.trans_date) <= DATE(?) ${ignoredToken} 
      GROUP BY ac.number`;

      //fetching data of the current fiscal year
      return db.exec(request, [session.dateFrom, session.dateTo]);
    })
    .then(function (data) {
      //init total
      clientsData.totalCredit = 0; clientsData.totalDebit = 0;

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

        //adding the final balance of the client
        clientsData.lines[dt.number].finalBalance = (clientsData.lines[dt.number].balance + dt.debit) - dt.credit;

        //total of credit, debit, and finalBalance
        clientsData.totalCredit += dt.credit;
        clientsData.totalDebit += dt.debit;
        clientsData.totalFinalBalance += clientsData.lines[dt.number].finalBalance;
      });

      //processing totals
      return clientsData;
    })
    .catch(function (err){
      throw err;
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
 * @param {Array} list a list of IDs
 * @return {Array} a list of escaped IDs
 * @description
 * This function is responsible of returning am escaped list of string
 * in : [1, 2] out : ["1", "2"]
 */
function escapeItems (list) {
  return list.reduce(function (t, item) {
    t.push(db.escape(db.bid(item)));
    return t;
  }, []);
}

exports.document = document;
