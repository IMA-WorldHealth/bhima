/**
 * Clients report Controller
 *
 *
 * This controller is responsible for processing Clients report.
 *
 * @module finance/clientsReport
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

const _          = require('lodash');
const uuid       = require('node-uuid');
const moment     = require('moment');

const db         = require('../../../../lib/db');
const util       = require('../../../../lib/util');
const ReportManager = require('../../../../lib/ReportManager');
const BadRequest = require('../../../../lib/errors/BadRequest');

const TEMPLATE = './server/controllers/finance/reports/clientsReport/report.handlebars';

/**
 * @function document
 * @description processes and renders the client report document
 */
function document(req, res, next) {
  const session = {};
  const params = req.query;
  let report;

  session.dateFrom = params.dateFrom;
  session.dateTo = params.dateTo;
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

  if(session.ignoredClients){
    ignoredClients = (Array.isArray(session.ignoredClients))? session.ignoredClients : [session.ignoredClients];
    ignoredToken = ` AND dg.uuid NOT IN (${escapeItems(ignoredClients).join(',')})`;
  }

  //request to fetch data of previous year
  var request =
    `SELECT ac.number, BUID(dg.uuid) AS ID, dg.name, IFNULL(SUM(gl.debit_equiv), 0) AS debit, 
     IFNULL(SUM(gl.credit_equiv), 0) AS credit FROM debtor_group dg JOIN account ac 
     ON ac.id = dg.account_id LEFT JOIN general_ledger gl ON ac.id = gl.account_id
      WHERE gl.fiscal_year_id = ? ${ignoredToken} GROUP BY ID`;

  //getting a fiscal year and the previous fiscal year ID form the date start defined by the user
  return getFiscalYear(session.dateFrom)
    .then(function (rows) {
      clientsData.fy = rows[0];

      //getting the client data for the previous fiscal year
      return db.exec(request, [clientsData.fy.previous_fiscal_year_id]);
    })
    .then(function (data){
      //init totals of previous fiscal year
      clientsData.totalInitialCredit = 0; clientsData.totalInitialDebit = 0; clientsData.totalBalance = 0;

      //from previous fiscal year data, building the object containing all previous info to print
      clientsData.lines = data.reduce(function (obj, clientInfo) {
        var id = clientInfo.ID;
        obj[id] = {};
        obj[id].initCredit = clientInfo.credit;
        obj[id].initDebit = clientInfo.debit;
        obj[id].balance = (clientInfo.debit - clientInfo.credit);
        obj[id].name = clientInfo.name;
        obj[id].accountNumber = clientInfo.number;
        clientsData.totalInitialCredit += clientInfo.credit;
        clientsData.totalInitialDebit += clientInfo.debit;
        clientsData.totalBalance += obj[id].balance;
        return obj;
      }, {});

      //request to fetch the current fiscal year data of a client
      request =
        `SELECT ac.number, BUID(dg.uuid) AS ID, dg.name, IFNULL(SUM(gl.debit_equiv), 0) AS debit, 
     IFNULL(SUM(gl.credit_equiv), 0) AS credit FROM debtor_group dg JOIN account ac 
     ON ac.id = dg.account_id LEFT JOIN general_ledger gl ON ac.id = gl.account_id
      WHERE DATE(gl.trans_date) >= DATE(?) AND DATE(gl.trans_date) <= DATE(?) ${ignoredToken} 
      GROUP BY dg.name`;

      //fetching data of the current fiscal year
      return db.exec(request, [session.dateFrom, session.dateTo]);
    })
    .then(function (data) {
      //init total
      clientsData.totalCredit = 0; clientsData.totalDebit = 0; clientsData.totalFinalBalance = 0;

      //completing the object {clientsData} by adding current info
      data.forEach(function (dt) {

        //if there is no info about the client for the previous year
        if(!clientsData.lines[dt.ID]){
          clientsData.lines[dt.ID] = {};
          clientsData.lines[dt.ID].initCredit = 0;
          clientsData.lines[dt.ID].initDebit = 0;
          clientsData.lines[dt.ID].balance = 0;
          clientsData.lines[dt.ID].name = dt.name;
          clientsData.lines[dt.ID].accountNumber = dt.number;
        }

        //adding effectively current info to the object
        clientsData.lines[dt.ID].credit = dt.credit;
        clientsData.lines[dt.ID].debit = dt.debit;

        //adding the final balance of the client
        clientsData.lines[dt.ID].finalBalance = (clientsData.lines[dt.ID].balance + dt.debit) - dt.credit;

        //total of credit, debit, and finalBalance
        clientsData.totalCredit += dt.credit;
        clientsData.totalDebit += dt.debit;
        clientsData.totalFinalBalance += clientsData.lines[dt.ID].finalBalance;
      });

      //processing totals
      return clientsData;
    })
    .catch(function (err){
      console.log(err);
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
    'JOIN period p ON p.fiscal_year_id = fy.id ' +
    'WHERE DATE(?) BETWEEN DATE(p.start_date) AND DATE(p.end_date)';
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
