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
    periodZeroNumber : 0,    
  });

  _.defaults(params, { user: req.session.user });
  session.simplePreview = session.simplePreview === 'true';

  try {
    const TEMPLATE = session.simplePreview ? TEMPLATE_SIMPLE : TEMPLATE_COMPLEX;
    report = new ReportManager(TEMPLATE, req.session, params);
  } catch (e) {
    return next(e);
  }

  // if there is some client to ignore
  if (session.ignoredClients) {
    const ignoredClients = [].concat(session.ignoredClients);
    session.notInStatement = `dg.uuid NOT IN (${escapeItems(ignoredClients).join(',')})`;
  }

  // If the simple preview, the latest balance is needed
  const dateParam = session.simplePreview ? new Date() : session.dateFrom;

  // Getting the fiscal year with his period zero ID
  return getFiscalYearByDate(dateParam, session.periodZeroNumber)
    .then((row) => {
      _.merge(session, row);
      session.openningBalanceDate = new Date(session.start_date);

      // just correcting the date value
      session.openningBalanceDate.setDate(session.openningBalanceDate.getDate() - 1);
      // check if the simple report shoild be rendered or not
      const promise = session.simplePreview ? buildSimpleReport(session) : buildComplexReport(session);
      return promise;
    })
    .then((data) => {
      return report.render(data);
    })
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next);
}

// this report build the object to encapsulate simple report data
function buildSimpleReport(opt) {
  let data = {};
  data.today = new Date();

  // removing repriod_id to considere all period
  delete opt.period_id;

  return getClientBalancesFromPeriodTotal(opt)
    .then((clientsRecords) => {
      data.lines = clientsRecords;
      // Getting totals
      return getClientTotalsFromPeriodTotal(opt);
    })
    .then((clientTotal) => {
      data.totalBalance = clientTotal.balance;
      return data;s
    });
}

function buildComplexReport(opt) {
  let clientsData = {};

  // getting a boolean value from a string
  clientsData.detailPrevious = opt.detailPrevious === 'true';
  _.merge(clientsData, {
    dateFrom : opt.dateFrom,
    dateTo : opt.dateTo,
    openningBalanceDate : opt.openningBalanceDate,
  });

  return getClientBalancesFromPeriodTotal(opt, true)
  .then((data) => {
    // from previous fiscal year data, building the object containing all previous info to print
    clientsData.lines = data.reduce((obj, clientInfo) => {
      const number = clientInfo.accountNumber;
      _.merge(obj[number] = {}, clientInfo);
      return obj;
    }, {});

    // get the totals of openning balance
    return getClientTotalsFromPeriodTotal(opt, true);
  })
  .then((previousTotal) => {
    _.merge(clientsData, previousTotal);
    // fetching data of the current fiscal year
    return getClientBalancesFromGeneralLedger(opt);
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
          currentBalance : dt.balance,
        });
      });
    }
    // fetch totals for current period / fiscal year
    return getClientTotalsFromGeneralLedger(opt, false);
  })
  .then((currentTotal) => {
    _.merge(clientsData, currentTotal);

    //removing the period filter
    delete opt.period_id;

    // fecth final balances
    return getClientBalancesFromPeriodTotal(opt, false);
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
    return getClientTotalsFromPeriodTotal(opt, false);
  })
  .then((data) => {
    _.merge(clientsData, data);
    return clientsData;      
  });
}

/**
 * @function getFiscalYearByDate
 * @param {date} date The date in which we want to get the fiscal year
 * @param {integer} periodZeroNumber the period zero number to use in order to get the period zero ID
 * @description
 * This function is responsible of returning a correct fiscal year and its period zero Id
 */
function getFiscalYearByDate(date, periodZeroNumber) {
  var query =
    `
    SELECT 
      fy.id AS fiscal_year_id, fy.previous_fiscal_year_id, fy.start_date, fy.end_date, p.id AS period_id 
    FROM 
      fiscal_year fy 
    JOIN 
      period p ON p.fiscal_year_id = fy.id
    WHERE 
      p.number = ? AND
      DATE(?) BETWEEN DATE(fy.start_date) AND DATE(fy.end_date)`;
  return db.one(query, [periodZeroNumber, date]);
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

// computes the client balances using the period total's table
function getClientBalancesFromPeriodTotal(options, isInitial) {
  const filterParser = new FilterParser(options, { tableAlias: 'dg', autoParseStatements: false });

  const sql = `
    SELECT
      ac.number AS number, dg.name AS name, SUM(pt.debit) AS debit,
      SUM(pt.credit) AS credit, SUM(pt.debit - pt.credit) AS balance 
    FROM 
      debtor_group dg 
    JOIN 
      account ac ON ac.id = dg.account_id 
    LEFT JOIN period_total pt ON ac.id = pt.account_id`;

  filterParser.equals('fiscal_year_id', 'fiscal_year_id', 'pt');
  filterParser.equals('period_id', 'period_id', 'pt');
  filterParser.custom('ignoredClients', options.notInStatement);
  filterParser.setGroup('GROUP BY ac.number');

  const query = filterParser.applyQuery(sql);
  const parameters = filterParser.parameters();

  // columns to fetch
  let cols;

  // In the simple report preview only the accountNumber, name, and balance is needed  
  if(options.simplePreview){
    cols = `t.number AS accountNumber, t.name, IFNULL(t.balance, 0) AS balance`;
  } else {
    cols = (isInitial) ? 
    `t.number AS accountNumber, t.name, IFNULL(t.debit, 0) AS initDebit, IFNULL(t.credit, 0) AS initCredit, IFNULL(t.balance, 0) AS initBalance` :
    `t.number AS accountNumber, t.name, IFNULL(t.balance, 0) AS finalBalance`;
  }

  const finalQuery =
      `
    SELECT 
      ${cols}         
    FROM 
      (${query}) AS t`;

  // In the simple report preview only the accountNumber, name, and balance is needed
  // if (options.simplePreview) {
  //   finalQuery =
  //     `
  //   SELECT 
  //     t.number AS accountNumber, t.name, IFNULL(t.balance, 0) AS balance 
  //   FROM 
  //     (${query}) AS t`;
  // } else {
  //   // this code wil be executed if the  complex report should be rendered
  //   let cols;

  //   // cols will be different as it initial data report or final
  //   if(isInitial){
  //     cols = `t.number AS accountNumber, t.name, IFNULL(t.debit, 0) AS initDebit, 
  //     IFNULL(t.credit, 0) AS initCredit, IFNULL(t.balance, 0) AS initBalance`;
  //   }else{
  //     cols = `t.number AS accountNumber, t.name, IFNULL(t.balance, 0) AS finalBalance`;
  //   }           

  //   finalQuery =
  //     `
  //   SELECT 
  //     ${cols}         
  //   FROM 
  //     (${query}) AS t`;
  // }
  return db.exec(finalQuery, parameters);
}

// computes the client balances using the general ledger's table
function getClientBalancesFromGeneralLedger(options){
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
  const parameters = filterParser.parameters();

    // request to fetch the current fiscal year data of a client from the general ledger
  const finalQuery = `
    SELECT 
      t.number AS accountNumber, t.name, IFNULL(t.debit, 0) AS debit, IFNULL(t.credit, 0) AS credit, 
      IFNULL(t.balance, 0) AS balance
    FROM 
      (${query}) AS t`;
  return db.exec(finalQuery, parameters);
}

// computes the client totals using the period total's table
function getClientTotalsFromPeriodTotal (options, isInitial){
  const filterParser = new FilterParser(options, { tableAlias: 'pt', autoParseStatements: false });

  const sql = `
    SELECT
      SUM(pt.debit) AS debit, SUM(pt.credit) AS credit, SUM(pt.debit - pt.credit) AS balance 
    FROM 
      period_total pt
    JOIN 
      debtor_group dg ON dg.account_id = pt.account_id`;

  filterParser.equals('fiscal_year_id', 'fiscal_year_id', 'pt');
  filterParser.equals('period_id', 'period_id', 'pt');
  filterParser.custom('ignoredClients', options.notInStatement);

  const query = filterParser.applyQuery(sql);
  const parameters = filterParser.parameters();

  let cols;

  if(options.simplePreview){
    cols = `IFNULL(t.balance, 0) AS balance`;
  }else{
    cols = (isInitial) ? 
    `IFNULL(debit, 0) AS totalInitDebit, IFNULL(credit, 0) AS totalInitCredit, IFNULL(balance, 0) AS totalInitBalance` :
    `IFNULL(t.balance, 0) AS totalFinalBalance`;
  }

  const finalQuery =
      `
    SELECT 
      ${cols}         
    FROM 
      (${query}) AS t`;

  return db.one(finalQuery, parameters);
}

// computes the client totals using the eneral ledger's table
function getClientTotalsFromGeneralLedger (options){
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
    const parameters = filterParser.parameters();

    const finalQuery =
      `SELECT 
        IFNULL(t.debit, 0) AS totalCurrentDebit, IFNULL(t.credit, 0) AS totalCurrentCredit, 
        IFNULL(t.balance, 0) AS totalCurrentBalance
      FROM 
        (${query}) AS t`;

  return db.one(finalQuery, parameters);
}

exports.document = document;
