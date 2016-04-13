var q = require('q'),
    core = require('./core'),
    uuid = require('../../../lib/guid'),
    sanitize = require('../../../lib/sanitize'),
    validate = require('../../../lib/validate')(),
    util = require('../../../lib/util'),
    db = require('../../../lib/db');

// TODO
// 1) convert everything to using db.exec()
//    parameter parsing.
// 2) Stop using callbacks as the module API

function precision(num, p) {
  return parseFloat(num.toFixed(p));
}

// TODO remove this function
function getDate() {
  return util.toMysqlDate(new Date());
}

// handles rounding for cash payments
function handleRounding(id) {
  var sql, row;

  // find out what the current balance is on the invoice to find out if we are paying it all.
  sql =
    'SELECT c.uuid, c.date, c.cost, c.currency_id, sum(p.debit_equiv - p.credit_equiv) AS balance, cu.min_monentary_unit ' +
    'FROM cash AS c JOIN cash_item AS ci JOIN currency as cu JOIN sale AS s JOIN ' +
      '(SELECT credit_equiv, debit_equiv, account_id, inv_po_id, deb_cred_uuid FROM posting_journal ' +
      'UNION ' +
      'SELECT credit_equiv, debit_equiv, account_id, inv_po_id, deb_cred_uuid FROM general_ledger) AS p ' +
    'JOIN debtor AS d JOIN debtor_group as dg ON ' +
      'c.uuid = ci.cash_uuid AND c.currency_id = cu.id AND ' +
      'ci.invoice_uuid = s.uuid AND ci.invoice_uuid = p.inv_po_id AND ' +
      'p.deb_cred_uuid = s.debtor_uuid AND  p.account_id = dg.account_id AND ' +
      'd.uuid = s.debtor_uuid AND d.group_uuid = dg.uuid ' +
    'WHERE c.uuid = ? ' +
    'GROUP BY c.uuid;';

  return db.exec(sql, [id])
  .then(function (rows) {

    // pick the first (and only row);
    row = rows[0];

    // if no row, throw and error
    if (!row) {
      throw new Error('No debtor invoices found.  Internal system error in handling rounding.');
    }

    // find the correct exchange rate for the given date
    return core.queries.exchangeRate(row.date);
  })
  .then(function (store) {

    var paidValue = precision(row.cost / store.get(row.currency_id).rate, 4);
    var remainder = precision((row.balance - paidValue) * store.get(row.currency_id).rate, 4);

    // if the absolute value of the remainder is less than the min_monentary_unit
    // then they have paid in full
    var isPaidInFull = Math.abs(remainder) - row.min_monentary_unit < row.min_monentary_unit;
    
    return { isPaidInFull : isPaidInFull, remainder : row.balance - paidValue };
  });
}


// Supports cash payments at the auxillary cashbox
exports.payment = function (id, userId, callback) {
  'use strict';

  var sql, state = {};

  sql =
    'SELECT cash.uuid, cash_item.uuid AS cash_item_uuid, cash.project_id, project.enterprise_id, cash.date, cash.debit_account, cash.credit_account, '  +
      'cash.deb_cred_uuid, cash.deb_cred_type, cash.currency_id, cash.cost, cash.user_id, ' +
      'cash.cashbox_id, cash.description, cash_item.cash_uuid, cash_item.allocated_cost, cash_item.invoice_uuid, ' +
      'cash.type, cash.document_id ' +
    'FROM cash JOIN cash_item JOIN project ON ' +
      'cash.uuid = cash_item.cash_uuid ' +
      'AND cash.project_id = project.id ' +
    'WHERE cash.uuid = ?;';

  state.id = id;

  db.exec(sql, [id])
  .then(function (results) {

    // first check - make sure the cash payment actually exists in the cash table
    if (results.length === 0) {
      throw new Error('No cash value by the id :' + id);
    }

    state.items = results;
    state.reference = results[0];

    // second check - do we have a valid period?
    return core.checks.validPeriod(state.reference.enterprise_id, state.reference.date);
  })
  .then(function () {
    var document_id_exist = validate.exists(state.reference.document_id);

    if (!document_id_exist) {
      throw new Error('The document number is not defined for cash id: ' + id);
    }

    // third check - is the type defined?
    var type_exist = validate.exists(state.reference.type);
    if (!type_exist) {
      throw new Error('The document type is not defined for cash id: ' + id);
    }

    // forth check - is the cost positive?
    var cost_positive = validate.isPositive(state.reference.cost);
    if (!cost_positive) {
      throw new Error('Invalid value for cost for cash id: ' + id);
    }

    // fifth check - is the allocated cost positive for every cash item?
    var allocated_postive = state.items.every(function (row) {
      return validate.isPositive(row.allocated_cost);
    });

    if (!allocated_postive) {
      throw new Error('Invalid payment price for one invoice with cash id: ' + id);
    }

    // six check - do we have a valid creditor or debtor?
    return core.checks.validDebtorOrCreditor(state.reference.deb_cred_uuid);
  })
  .then(function () {
    return core.queries.origin('cash');
  })
  // TODO : collapse this code using Q.spread();
  .then(function (id) {
    state.originId = id;
    return core.queries.period(state.reference.date);
  })
  .then(function (period) {
    state.period = period;
    return core.queries.exchangeRate(state.reference.date);
  })
  .then(function (store) {
    state.store = store;
    return core.queries.transactionId(state.reference.project_id);
  })
  .then(function (transId) {
    state.transId = '"' + transId + '"';
    return handleRounding(id);
  })
  .then(function (rounding) {
    state.remainder = rounding.remainder;
    state.isPaidInFull = rounding.isPaidInFull;

    var account_type = state.reference.type !== 'E' ? 'credit_account' : 'debit_account' ;

    // Are they a debtor or a creditor?
    state.deb_cred_type = state.reference.type === 'E' ? '\'D\'' : '\'C\'';

    // calculate exchange rate.  If money coming in, credit is cash.cost,
    // credit_equiv is rate*cash.cost and vice versa.
    var money = state.reference.type === 'E' ?
      'cash.cost, 0, ' + 1/state.store.get(state.reference.currency_id).rate + '*cash.cost, 0, ' :
      '0, cash.cost, 0, ' + 1/state.store.get(state.reference.currency_id).rate + '*cash.cost, ' ;

    state.cashUUID = uuid();

    // copy the data from cash into the journal with care to convert exchange rates.
    var sql =
      'INSERT INTO posting_journal ' +
        '(project_id, uuid, fiscal_year_id, period_id, trans_id, trans_date, ' +
        'description, doc_num, account_id, debit, credit, debit_equiv, credit_equiv, ' +
        'inv_po_id, currency_id, deb_cred_uuid, deb_cred_type, origin_id, user_id ) ' +
      'SELECT cash.project_id, ' + [sanitize.escape(state.cashUUID), state.period.fiscal_year_id, state.period.id , state.transId, '\'' + getDate() + '\''].join(', ') + ', ' +
        'cash.description, cash.document_id, cash.' + account_type + ', ' + money + sanitize.escape(state.id) +
        ', cash.currency_id, null, null, ' +
        [state.originId, userId].join(', ') + ' ' +
      'FROM cash JOIN cash_item ON ' +
        ' cash.uuid = cash_item.cash_uuid ' +
      'WHERE cash.uuid=' + sanitize.escape(id) + ' ' +
      'LIMIT 1;'; // just in case

    return db.exec(sql);
  })
  .then(function () {

    // Then copy data from CASH_ITEM -> JOURNAL
    var cash_item_money = state.reference.type === 'E' ?
      '0, cash_item.allocated_cost, 0, ' + 1/state.store.get(state.reference.currency_id).rate + '*cash_item.allocated_cost, ' :
      'cash_item.allocated_cost, 0, '+ 1/state.store.get(state.reference.currency_id).rate + '*cash_item.allocated_cost, 0, ' ;

    state.cash_item_account_id = state.reference.type !== 'E' ? 'debit_account' : 'credit_account';

    var sqls = [];

    state.itemUUIDs = [];
    state.items.forEach(function (item) {
      var id = uuid();
      state.itemUUIDs.push(id);
      var sql =
        'INSERT INTO posting_journal ' +
        '(project_id, uuid, fiscal_year_id, period_id, trans_id, trans_date, ' +
        'description, doc_num, account_id, debit, credit, debit_equiv, credit_equiv, ' +
        'currency_id, deb_cred_uuid, deb_cred_type, inv_po_id, origin_id, user_id ) ' +
      'SELECT cash.project_id, ' + [sanitize.escape(id), state.period.fiscal_year_id, state.period.id, state.transId, '\'' + getDate() + '\''].join(', ') + ', ' +
        'cash.description, cash.document_id, cash.' + state.cash_item_account_id  + ', ' + cash_item_money +
        'cash.currency_id, cash.deb_cred_uuid, ' + state.deb_cred_type + ', ' +
        'cash_item.invoice_uuid, ' + [state.originId, userId].join(', ') + ' ' +
      'FROM cash JOIN cash_item ON ' +
        'cash.uuid=cash_item.cash_uuid '+
      'WHERE cash_item.uuid=' + sanitize.escape(item.cash_item_uuid) + ';';
      sqls.push(sql);
    });

    return q.all(sqls.map(function (sql) {
      return db.exec(sql);
    }));
  })
  .then(function () {
    var query;

    if (state.isPaidInFull && state.remainder !== 0) {

      state.creditOrDebitBool = state.remainder > 0;
      state.roundedRemainder = precision(Math.abs(state.remainder), 4);
      var creditOrDebit = state.creditOrDebitBool ?
        [state.roundedRemainder, 0, state.roundedRemainder, 0].join(', ') :  // debit
        [0, state.roundedRemainder, 0, state.roundedRemainder].join(', ') ;   // credit

      var description =
        '\'Rounding Exchange Rate \'';

      state.roundingUUID = uuid();

      query =
        'INSERT INTO posting_journal ' +
        '(project_id, uuid, fiscal_year_id, period_id, trans_id, trans_date, ' +
        'description, doc_num, account_id, debit, credit, debit_equiv, credit_equiv, ' +
        'currency_id, deb_cred_uuid, deb_cred_type, inv_po_id, origin_id, user_id ) ' +
      'SELECT cash.project_id, ' + [sanitize.escape(state.roundingUUID), state.period.fiscal_year_id, state.period.id, state.transId, '\'' + getDate() + '\''].join(', ') + ', ' +
        description + ', cash.document_id, cash_box_account_currency.'+ ((state.remainder > 0) ? 'loss_exchange_account_id' : 'gain_exchange_account_id' ) + ', ' + creditOrDebit + ', ' +
        'cash.currency_id, null, null, cash_item.invoice_uuid, ' +
        [state.originId, userId].join(', ') + ' ' +
      'FROM cash JOIN cash_item JOIN cash_box_account_currency ON cash.uuid = cash_item.cash_uuid AND cash_box_account_currency.id=cash.cashbox_id ' +
      'WHERE cash.uuid = ' + sanitize.escape(state.id) + ' LIMIT 1;';
    }
    return query ? db.exec(query) : q();
  })
  .then(function () {
    var query;
    if (state.creditOrDebitBool) {

      var balance = state.creditOrDebitBool ?
        [0, state.roundedRemainder, 0, state.roundedRemainder].join(', ') :   // credit
        [state.roundedRemainder, 0, state.roundedRemainder,  0].join(', ') ;  // debit

      state.roundingUUID2 = uuid();

      var description =
        '\'Rounding Exchange Rate \'';

      query =
        'INSERT INTO posting_journal ' +
        '(project_id, uuid, fiscal_year_id, period_id, trans_id, trans_date, ' +
        'description, doc_num, account_id, debit, credit, debit_equiv, credit_equiv, ' +
        'currency_id, deb_cred_uuid, deb_cred_type, inv_po_id, origin_id, user_id ) ' +
      'SELECT cash.project_id, ' + [sanitize.escape(state.roundingUUID2), state.period.fiscal_year_id, state.period.id, state.transId, '\'' + getDate() + '\''].join(', ') + ', ' +
        description +', cash.document_id, cash.' + state.cash_item_account_id  + ', ' + balance + ', ' +
        'cash.currency_id, cash.deb_cred_uuid, cash.deb_cred_type, cash_item.invoice_uuid, ' +
        [state.originId, userId].join(', ') + ' ' +
      'FROM cash JOIN cash_item ON cash.uuid = cash_item.cash_uuid ' +
      'WHERE cash.uuid=' + sanitize.escape(state.id) + ' LIMIT 1;';
    }
    return query ? db.exec(query) : q();
  })
  .then(function () {
    callback();
  })
  .catch(function (error) {
    // undo all transaction on error state
    // clean up
    
    // collect all uuids
    var ids = [state.roundingUUID, state.roundingUUID2, state.cashUUID]
    .concat(state.itemUUIDs || [])
    .filter(function (uuid) { return !!uuid; })
    .map(function (uuid) { return sanitize.escape(uuid); });

    var sql =
      'DELETE FROM posting_journal WHERE uuid IN (' + ids.join(', ') + ');';

    if (!ids.length) { return callback(error); }

    db.exec(sql)
    .then(function () {
      callback(error);
    })
    .catch(function (err) {
      callback(err);
    })
    .done();
  })
  .done();
};


// support refunding cash payments through the auxillary cashbox
exports.refund = function (id, userId, callback) {
  var sql, reference,
      cfg = { rows : [] },
      queries = {};

  sql =
    'SELECT cash_discard.project_id, cash_discard.reference, cash_discard.uuid, cash_discard.cost, ' +
      'cash_discard.debtor_uuid, cash_discard.cash_uuid, cash_discard.date, cash_discard.description, ' +
      'cash_discard.posted, cash.document_id, cash.type, cash.date, cash.debit_account, cash.credit_account, ' +
      'cash.deb_cred_uuid, cash.deb_cred_type, cash.currency_id, cash_item.allocated_cost, cash_item.invoice_uuid ' +
    'FROM cash_discard JOIN cash JOIN cash_item ON ' +
      'cash_discard.cash_uuid = cash.uuid AND ' +
      'cash.uuid = cash_item.cash_uuid ' +
    'WHERE cash_discard.uuid = ?;';

  db.exec(sql, [id])
  .then(function (results) {

    if (results.length === 0) {
      throw new Error('No cash discard by the id: ' + id);
    }

    reference = results[0];
    return [
      core.queries.origin('cash_discard'),
      core.queries.period(reference.date)
    ];
  })
  .spread(function (originId, periodObject) {
    cfg.originId = originId;
    cfg.periodId = periodObject.id;
    cfg.fiscalYearId = periodObject.fiscal_year_id;

    sql =
      'SELECT trans_id FROM (' +
        'SELECT trans_id, inv_po_id FROM posting_journal ' +
        'UNION ' +
        'SELECT trans_id, inv_po_id FROM general_ledger' +
      ') AS pg WHERE pg.inv_po_id = ? LIMIT 1;';

    return db.exec(sql, [reference.invoice_uuid]);
  })
  .then(function (t) {
    var sql =
      'SELECT project_id, fiscal_year_id, period_id, trans_date, account_id, debit, credit, debit_equiv,' +
      ' credit_equiv, inv_po_id, currency_id, deb_cred_uuid, deb_cred_type, origin_id, user_id ' +
      'FROM (' +
        'SELECT project_id, fiscal_year_id, period_id, trans_date, trans_id, account_id, debit, credit, debit_equiv, ' +
          'credit_equiv, inv_po_id, currency_id, deb_cred_uuid, deb_cred_type, origin_id, user_id FROM posting_journal ' +
        'UNION ' +
        'SELECT project_id, fiscal_year_id, period_id, trans_date, trans_id, account_id, debit, credit, debit_equiv, ' +
          'credit_equiv, inv_po_id, currency_id, deb_cred_uuid, deb_cred_type, origin_id, user_id FROM general_ledger ' +
      ') AS pg WHERE pg.trans_id = ?;';

    var transId = t[0].trans_id;

    return db.exec(sql, [transId]);
  })
  .then(function (rows) {

    rows.forEach(function (item){
      var tapon = item.debit;
      item.debit = item.credit;
      item.credit = tapon;
      var tapon_equiv = item.debit_equiv;
      item.debit_equiv = item.credit_equiv;
      item.credit_equiv = tapon_equiv;
      cfg.rows.push(item);
    });

    return core.queries.transactionId(reference.project_id);
  })
  .then(function (transId) {
    var sqls = [];

    cfg.rows.forEach(function (item) {
      var sql =
        'INSERT INTO posting_journal ' +
          '(project_id, uuid, fiscal_year_id, period_id, trans_id, trans_date, ' +
          'description, doc_num, account_id, debit, credit, debit_equiv, credit_equiv, ' +
          'currency_id, deb_cred_uuid, deb_cred_type, inv_po_id, origin_id, user_id ) ' +
        'SELECT cash_discard.project_id, ' + [sanitize.escape(uuid()), cfg.fiscalYearId, cfg.periodId, sanitize.escape(transId), sanitize.escape(getDate())].join(', ') + ', ' +
          'cash_discard.description, null, ' + [item.account_id, item.debit, item.credit, item.debit_equiv, item.credit_equiv].join(', ') + ', ' +
          'cash.currency_id, ' + ((item.deb_cred_uuid) ? sanitize.escape(item.deb_cred_uuid) : 'null') + ', ' +
          ((item.deb_cred_type) ? sanitize.escape(item.deb_cred_type) : 'null') + ', ' + sanitize.escape(item.inv_po_id) + ', ' +
          [cfg.originId, userId].join(', ') + ' ' +
        'FROM cash_discard JOIN cash ON cash.uuid=cash_discard.cash_uuid '+
        'WHERE cash_discard.uuid = ' + sanitize.escape(id) + ';';
      sqls.push(sql);
    });

    return q.all(sqls.map(function (sql) {
      return db.exec(sql);
    }));
  })
  .then(function () {
    callback();
  })
  .catch(function (error) {
    callback(error);
  })
  .done();
};
