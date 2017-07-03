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
const FilterParser = require('../../../../lib/filter');
const ReportManager = require('../../../../lib/ReportManager');

const TEMPLATE_SIMPLE = './server/controllers/finance/reports/clientsReport/report_simple.handlebars';
const TEMPLATE_COMPLEX = './server/controllers/finance/reports/clientsReport/report_complex.handlebars';

/**
 * @function document
 * @description processes and renders clients report document
 */
function document(req, res, next) {
  const params = req.query;
  const session = {};
  let report;

  _.defaults(session, {
    dateFrom: new Date(params.dateFrom),
    dateTo: new Date(params.dateTo),
    detailPrevious: params.detailPrevious,
    ignoredClients: params.ignoredClients,
    simplePreview: params.simplePreview,
    enterprise: req.session.enterprise,
  });

  _.defaults(params, { user: req.session.user });
  session.simplePreview = session.simplePreview === 'true';

  try {
    const TEMPLATE = session.simplePreview ? TEMPLATE_SIMPLE : TEMPLATE_COMPLEX;
    report = new ReportManager(TEMPLATE, req.session, params);
  } catch (e) {
    return next(e);
  }

  if (session.ignoredClients) {
    const ignoredClients = (Array.isArray(session.ignoredClients)) ? session.ignoredClients : [session.ignoredClients];
    session.notInStatement = `dg.uuid NOT IN (${escapeItems(ignoredClients).join(',')})`;
  }

  const promise = session.simplePreview ? buildSimpleReport(session) : buildComplexReport(session);

  // Getting data to be rendered
  // return fetchClientsData(session)
  promise
    .then((data) => {
      console.log(data);
      return report.render(data);
    })
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next);
}

function buildSimpleReport(opt) {
  let data = {};

  return getClientsData(opt, true)
    .then((clientsRecords) => {
      data.lines = clientsRecords;
      return getClientsTotal(opt, true);
    })
    .then((clientTotal) => {
      data.totalBalance = clientTotal.balance;
      return data;
    });
}

function buildComplexReport(opt) {
  const clientsData = {};
  // getting a boolean value from a string
  clientsData.detailPrevious = opt.detailPrevious === 'true';
  _.merge(clientsData, {
    dateFrom : opt.dateFrom,
    dateTo : opt.dateTo,
  });

  return getFiscalYear(opt.dateFrom)
    .then((row) => {
      clientsData.fy = row;
      clientsData.fy.openningBalanceDate = new Date(clientsData.fy.start_date);

      // just correcting the date value
      clientsData.fy.openningBalanceDate.setDate(clientsData.fy.openningBalanceDate.getDate() - 1);
      opt.fiscal_year_id = clientsData.fy.previous_fiscal_year_id;

      // getting the client data for the previous fiscal year
      return getClientsData(opt, true, true);
    })
    .then((data) => {
      // from previous fiscal year data, building the object containing all previous info to print
      clientsData.lines = data.reduce((obj, clientInfo) => {
        const number = clientInfo.accountNumber;
        _.merge(obj[number] = {}, clientInfo);
        return obj;
      }, {});

      // get the totals of openning balance
      return getClientsTotal(opt, true, true);
    })
    .then((previousTotal) => {
      _.merge(clientsData, previousTotal);
      // fetching data of the current fiscal year
      return getClientsData(opt, false);
    })
    .then((data) => {
      if (!data.length) {
        Object.keys(clientsData.lines).forEach((accountNumber) => {
          _.merge(clientsData.lines[accountNumber], {
            debit: 0,
            credit: 0,
            currentBalance: 0,
          });
        });
      } else {
        data.forEach((dt) => {
          // if there is no info about the client for the previous year
          if (!clientsData.lines[dt.accountNumber]) {
            _.merge(clientsData.lines[dt.accountNumber] = {}, {
              initDebit: 0,
              initCredit: 0,
              initBalance: 0,
              name: dt.name,
              accountNumber: dt.accountNumber,
            });
          }

          // adding effectively current info to the object
          // and adding the current balance of the client,
          // no way to get it from the database directly without altering the current requests
          _.merge(clientsData.lines[dt.accountNumber], {
            debit: dt.debit,
            credit: dt.credit,
            finalBalance: clientsData.lines[dt.accountNumber].initBalance + dt.balance,
          });
        });
      }

      // fetch totals for current period / fiscal year
      return getClientsTotal(opt, false);
    })
    .then((currentTotal) => {
      _.merge(clientsData, currentTotal);
      // remove the fiscal year to get all data
      delete opt.fiscal_year_id;
      return getClientsData(opt, true, false);
    })
    .then((data) => {
      data.forEach((dt) => {
        if(clientsData.lines[dt.accountNumber]){
          _.merge(clientsData.lines[dt.accountNumber], {
            finalBalance : dt.finalBalance,
          })
        }
      });
      // fetch the final total for each row of the period total table
      return getClientsTotal(opt, true, false);
    })
    .then(function (data){
      console.log('sss', data);
      _.merge(clientsData, { totalFinalBalance : data.totalFinalBalance });
      return clientsData;      
    })
    .catch(function (err) { console.log(err); });
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
    `
    SELECT 
      fy.id, fy.previous_fiscal_year_id, fy.start_date, fy.end_date 
    FROM 
      fiscal_year fy 
    WHERE 
      DATE(?) BETWEEN DATE(fy.start_date) AND DATE(fy.end_date)`;
  return db.one(query, [date]);
}

/**
 * @function escapeItems
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

/**
 * @function getClientsData
 * @param {object} options The object for filtering data using filterParser lib
 * @description
 * This function is responsible of returning a list of debtor and their balance
 **/
function getClientsData(options, isFromPeriodTotal, isInitBalance) {
  let finalQuery;
  let parameters;

  if (isFromPeriodTotal) {
    const filterParser = new FilterParser(options, { tableAlias: 'dg', autoParseStatements: false });

    const sql = `
      SELECT
        ac.number AS number, dg.name AS name, SUM(pt.debit) AS debit,
        SUM(pt.credit) AS credit, SUM(pt.debit - pt.credit) AS balance 
      FROM debtor_group dg 
      JOIN 
        account ac ON ac.id = dg.account_id 
      LEFT JOIN period_total pt ON ac.id = pt.account_id`;

    filterParser.equals('fiscal_year_id', 'fiscal_year_id', 'pt');
    filterParser.custom('ignoredClients', options.notInStatement);
    filterParser.setGroup('GROUP BY ac.number');

    const query = filterParser.applyQuery(sql);
    parameters = filterParser.parameters();

    if (options.simplePreview) {
      finalQuery =
        `
      SELECT 
        t.number AS accountNumber, t.name, IFNULL(t.balance, 0) AS balance 
      FROM 
      (${query}) AS t`;

    } else {
      let cols;

      if(isInitBalance){
        cols = `t.number AS accountNumber, t.name, IFNULL(t.debit, 0) AS initDebit, 
        IFNULL(t.credit, 0) AS initCredit, IFNULL(t.balance, 0) AS initBalance`;
      }else{
        cols = `t.number AS accountNumber, t.name, IFNULL(t.balance, 0) AS finalBalance`;
      }

      finalQuery =
        `
      SELECT 
        ${cols}         
      FROM 
        (${query}) AS t`;
    }
  } else {
    const filterParser = new FilterParser(options, { tableAlias: 'gl', autoParseStatements: false });
    const sql = `
    SELECT
      ac.number, dg.name, SUM(gl.debit_equiv) AS debit, SUM(gl.credit_equiv) AS credit, 
      SUM(gl.debit_equiv - gl.credit_equiv) AS balance 
    FROM 
      debtor_group dg 
    JOIN 
      account ac ON ac.id = dg.account_id
    LEFT JOIN 
      general_ledger gl ON ac.id = gl.account_id`;

    filterParser.dateFrom('dateFrom', 'trans_date');
    filterParser.dateTo('dateTo', 'trans_date');
    filterParser.custom('ignoredClients', options.notInStatement);
    filterParser.setGroup('GROUP BY ac.number');

    const query = filterParser.applyQuery(sql);
    parameters = filterParser.parameters();

    // request to fetch the current fiscal year data of a client from the general ledger
    finalQuery =
      `
        SELECT 
          t.number AS accountNumber, t.name, IFNULL(t.debit, 0) AS debit, IFNULL(t.credit, 0) AS credit, 
          IFNULL(t.balance, 0) AS balance
        FROM 
          (${query}) AS t`;
  }

  return db.exec(finalQuery, parameters);
}

function getClientsTotal(options, isFromPeriodTotal, isInitTotal) {
  let finalQuery;
  let parameters;

  if (isFromPeriodTotal) {
    const filterParser = new FilterParser(options, { tableAlias: 'pt', autoParseStatements: false });

    const sql = `
      SELECT
        SUM(pt.debit) AS debit, SUM(pt.credit) AS credit, SUM(pt.debit - pt.credit) AS balance 
      FROM 
        period_total pt
      JOIN 
        debtor_group dg ON dg.account_id = pt.account_id`;

    filterParser.equals('fiscal_year_id', 'fiscal_year_id', 'pt');
    filterParser.custom('ignoredClients', options.ignoredClients);

    const query = filterParser.applyQuery(sql);
    parameters = filterParser.parameters();

    if (options.simplePreview) {
      finalQuery =
        `
    SELECT 
      IFNULL(t.balance, 0) AS balance 
    FROM 
    (${query}) AS t`;

  } else {
    let cols;

      if(isInitTotal){
        cols = `IFNULL(debit, 0) AS totalInitDebit, IFNULL(credit, 0) AS totalInitCredit, 
          IFNULL(balance, 0) AS totalInitBalance`;
      }else{
        cols = `IFNULL(t.balance, 0) AS totalFinalBalance`;
      }

      finalQuery =
        `
      SELECT 
        ${cols}         
      FROM 
        (${query}) AS t`;
    }
  } else {
    const filterParser = new FilterParser(options, { tableAlias: 'gl', autoParseStatements: false });
    const sql =
      `
    SELECT 
     SUM(gl.debit_equiv) AS debit, SUM(gl.credit_equiv) AS credit, 
     SUM(gl.debit_equiv - gl.credit_equiv) AS balance 
    FROM 
      debtor_group dg 
    JOIN 
      account ac ON ac.id = dg.account_id 
    JOIN 
      general_ledger gl ON ac.id = gl.account_id`;

    filterParser.dateFrom('dateFrom', 'trans_date');
    filterParser.dateTo('dateTo', 'trans_date');
    filterParser.custom('ignoredClients', options.notInStatement);

    const query = filterParser.applyQuery(sql);
    parameters = filterParser.parameters();

    finalQuery =
      `SELECT 
      IFNULL(t.debit, 0) AS totalCurrentDebit, IFNULL(t.credit, 0) AS totalCurrentCredit, 
      IFNULL(t.balance, 0) AS totalCurrentBalance
     FROM 
      (${query}) AS t`;
  }

  return db.one(finalQuery, parameters);
}

exports.document = document;
