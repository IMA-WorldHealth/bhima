/**
 * TODO This file performs many varies finance requests, mostly revolving around 
 * requesting data from tables - this should be refactored/ removed whilst implementing
 * a standardised server API
 */

var db = require('./../../lib/db'),
    guid = require('./../../lib/guid'),
    core = require('./journal/core'),
    q = require('q');

// utilities
function getTransactionId(projectId) {
  'use strict';

  var sql =
    'SELECT CONCAT(abbr, IFNULL(MAX(increment), 1)) AS id FROM (' +
      'SELECT project.abbr, MAX(FLOOR(SUBSTR(trans_id, 4))) + 1 AS increment ' +
      'FROM posting_journal JOIN project ON posting_journal.project_id = project.id ' +
      'WHERE posting_journal.project_id = ? ' +
    'UNION ' +
      'SELECT project.abbr, MAX(FLOOR(SUBSTR(trans_id, 4))) + 1 AS increment ' +
      'FROM general_ledger JOIN project ON general_ledger.project_id = project.id ' +
      'WHERE general_ledger.project_id = ?)c;';

  return db.exec(sql, [projectId, projectId])
  .then(function (rows) {

    // This is guaranteed to be defined if a project is defined.
    // Even if there is no data in the posting journal and/or
    // general ledger
    return q('\'' + rows[0].id + '\'');
  });
}

// POST /journal/voucher
// Securely post a transaction to the posting journal.
//
// The steps involved are this:
//  1) Make sure the date is valid (not in the future)
//  2) Make sure the data sent from the client is valid (has valid totals, etc).
//  2a) Get the period_id, fiscal_year_id for the submitted date
//  2b) Validate the date isn't in the future
//  3) Check permissions and link the user with the registration
//  4) Exchange the values that need to be exchanged
//  5) Write to journal_log that a post happened
exports.postJournalVoucher = function (req, res, next) {
  'use strict';

  // error reporting FTW
  function report(errorText) {
    res.status(400).send(errorText);
  }

  var data = req.body.data,
      sql;

  /* validation checks */

  // turn into date object
  var date = new Date(data.date);

  // is the date in the future?
  if (date > new Date()) {

    // Send back"Bad Request" HTTP error code
    return report('ERROR.ERR_DATE_IN_THE_FUTURE');
  }

  // validate that the rows balance
  var validAccounts = data.rows.every(function (row) {
    return row.account_id !== undefined;
  });

  if (!validAccounts) {
    return report('ERROR.ERR_MISSING_ACCOUNTS');
  }

  // validate that the debits and credits balance
  var totals = data.rows.reduce(function (aggregate, row) {
    aggregate.debit += row.debit;
    aggregate.credit += row.credit;
    return aggregate;
  }, { debit : 0, credit : 0 });

  var validTotals = totals.debit.toFixed(4) === totals.credit.toFixed(4);

  if (!validTotals) {
    return report('ERROR.ERR_DEBIT_CREDIT_IMBALANCE');
  }

  // Flatten the data object into a series of rows for
  // insertion into the database
  var dbrows = data.rows.map(function (row) {
    row.project_id = req.session.project.id;
    row.description = data.description;
    row.user_id = req.session.user.id;
    row.currency_id = data.currencyId;
    row.date = date;

    // strip the deb_cred_type if the deb_cred_uuid is undefined
    if (row.deb_cred_uuid === null) { row.deb_cred_type = null; }

    return row;
  });

  /* Begin gathering data for posting */

  // Let's get the fiscal year id and the period id for the given date
  sql =
    'SELECT period.id, period.fiscal_year_id ' +
    'FROM period JOIN fiscal_year ON ' +
      'period.fiscal_year_id = fiscal_year.id ' +
    'WHERE period.period_start < ? AND ' +
      'period.period_stop > ? AND ' +
      'fiscal_year.enterprise_id = ?;';

  db.exec(sql, [date, date, req.session.enterpriseId || 200])
  .then(function (rows) {

    // whoops! No period found!
    if (rows.length < 1) {
      throw 'ERROR.ERR_NO_PERIOD';
    }

    // put the fiscal year and period id into the db rows
    var periodId = rows[0].id,
        fiscalYearId = rows[0].fiscal_year_id;

    dbrows.forEach(function (row) {
      row.fiscal_year_id = fiscalYearId;
      row.period_id = periodId;
    });

    // Okay, let's move on to exchange rate

    // If the currency is not the enterprise currency we need to
    // exchange the debits and credits.  Otherwise, do nothing.
    sql =
      'SELECT enterprise_id, currency_id, rate ' +
      'FROM exchange_rate WHERE DATE(date) = DATE(?);';

    return db.exec(sql, [date]);
  })
  .then(function (rows) {

    if (rows.length < 1) {
      throw 'ERROR.ERR_NO_EXCHANGE_RATE';
    }

    // get the most recent record for that date
    // (if someone made a mistake, there may be multiple)
    // TODO Should this be fixed to one rate per currency per day?
    var record = rows.pop();


    // if we are not using the enterprise currency, we need to exchange the debits
    // and credits
    if (data.currencyId !== record.enterprise_currency_id) {

      // we are not using the enterprise currency.  Does the record's foreign_curreny_id
      // match our currency we are trying to post? (it should, unless we use more than three currencies.)
      if (data.currencyId !== record.currency_id) {

        // didn't find a suitable exchange rate, throw an error
        throw 'ERROR.ERR_NO_EXCHANGE_RATE';
      }

      // we are exchanging the data using the exchange rate.
      dbrows.forEach(function (row) {
        row.debit_equiv = row.debit * (1 / record.rate);
        row.credit_equiv = row.credit * (1 / record.rate);
      });

    // we are using the enterprise currency.  Just transfer the debits and credits
    } else {

      // we are exchanging the data using the exchange rate.
      dbrows.forEach(function (row) {
        row.debit_equiv = row.debit;
        row.credit_equiv = row.credit;
      });
    }

    return core.queries.transactionId(req.session.project.id);
  })

  // FIXME We need to stop depending on this async transId function
  .then(function (transId) {
    sql =
      'INSERT INTO posting_journal ' +
        '(uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date, ' +
        'description, account_id, credit, debit, credit_equiv, debit_equiv, ' +
        'currency_id, deb_cred_uuid, deb_cred_type, inv_po_id, origin_id, user_id, pc_id, cc_id) ' +
      'VALUES ?;';

    // node-mysql accepts an array of arrays for bulk inserts.
    // we should shape our data to fit the standard it is looking to see.
    var insertRows = dbrows.map(function (row) {
      return [
        guid(),
        row.project_id,
        row.fiscal_year_id,
        row.period_id,
        transId,
        row.date,
        row.description,
        row.account_id,
        row.credit,
        row.debit,
        row.credit_equiv,
        row.debit_equiv,
        row.currency_id,
        row.deb_cred_uuid,
        row.deb_cred_type,
        row.inv_po_id,
        5, // FIXME: What is the origin id actually supposed to be?
        row.user_id,
        row.pc_id,
        row.cc_id
      ];
    });

    return db.exec(sql, [insertRows]);
  })
  .then(function () {
    res.status(200).send('JOURNAL_VOUCHER.POST_SUCCESSFUL');
  })
  .catch(function (error) {
    res.status(500).send(error);
  });
};


// GET /finance/debtors
// returns a list of debtors
exports.getDebtors = function (req, res, next) {
  'use strict';

  var sql =
    'SELECT d.uuid, d.text, CONCAT(p.first_name, p.middle_name, p.last_name) AS patientname, ' +
      'dg.name AS groupname, a.id AS account_id, a.account_number ' +
    'FROM debitor AS d JOIN patient AS p JOIN debitor_group AS dg JOIN account AS a ON ' +
      'd.uuid = p.debitor_uuid AND d.group_uuid = dg.uuid AND dg.account_id = a.id;';

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(function (error) {
    next(error);
  })
  .done();
};

// GET /finance/creditors
exports.getCreditors = function (req, res, next) {
  'use strict';

  var sql =
    'SELECT c.uuid, c.text, cg.name, c.group_uuid, a.id AS account_id, a.account_number ' +
    'FROM creditor AS c JOIN creditor_group AS cg JOIN account AS a ' +
      'ON c.group_uuid = cg.uuid AND cg.account_id = a.id;';

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(function (error) {
    next(error);
  })
  .done();
};

// GET /finance/currencies
exports.getCurrencies = function (req, res, next) {
  'use strict';

  var sql =
    'SELECT c.id, c.name, c.note, c.format_key, c.symbol ' +
    'FROM currency AS c;';

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(function (error) {
    next(error);
  })
  .done();
};

// GET /finance/costcenters
exports.getCostCenters = function (req, res, next) {
  'use strict';

  var sql =
    'SELECT project_id, id, text FROM cost_center;';

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(function (error) {
    next(error);
  })
  .done();
};


// GET /finance/profitcenters
exports.getProfitCenters = function (req, res, next) {
  'use strict';

  var sql =
    'SELECT project_id, id, text FROM profit_center;';

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(function (error) {
    next(error);
  })
  .done();
};
