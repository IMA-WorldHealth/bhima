var q         = require('q'),
    uuid      = require('../../../lib/guid'),
    db        = require('../../../lib/db'),
    validate  = require('../../../lib/validate')(),
    core      = require('./core');

exports.purchase = purchase;
exports.confirmIndirectPurchase = confirmIndirectPurchase;
exports.indirectPurchase = indirectPurchase;
exports.directPurchase = directPurchase;
exports.integration = integration;

// handle posting purchase requests
// TODO/FIXME - it doesn't seem like this is used.  Why?
function purchase(id, userId, cb) {
  'use strict';

  // posting purchase requests
  var sql, data, reference, cfg = {}, queries = {};
  sql =
    'SELECT purchase.project_id, project.enterprise_id, purchase.id, purchase.cost, purchase.currency_id, ' +
      'purchase.creditor_id, purchase.purchaser_id, purchase.discount, purchase.invoice_date, ' +
      'purchase.note, purchase.posted, purchase_item.unit_price, purchase_item.total, purchase_item.quantity ' +
    'FROM purchase JOIN purchase_item JOIN project ON ' +
      'purchase.id = purchase_item.purchase_id AND project.id = purchase.project_id ' +
    'WHERE purchase.id = ?;';

  db.exec(sql, [id])
  .then(function (results) {
    if (results.length === 0) { throw new Error('No purchase order by the id: ' + id); }

    reference = results[0];
    data = results;

    // first check - do we have a validPeriod?
    // Also, implicit in this check is that a valid fiscal year
    // is in place.
    return core.checks.validPeriod(reference.enterprise_id, reference.invoice_date);
  })
  .then(function () {
    // second check - is the cost positive for every transaction?
    var costPositive = data.every(function (row) { return validate.isPositive(row.cost); });
    if (!costPositive) {
      throw new Error('Negative cost detected for purchase id: ' + id);
    }

    // third check - are all the unit_price's for purchase_items positive?
    var unit_pricePositive = data.every(function (row) { return validate.isPositive(row.unit_price); });
    if (!unit_pricePositive) {
      throw new Error('Negative unit_price for purchase id: ' + id);
    }

    // fourth check - is the total the price * the quantity?
    var totalEquality = data.every(function (row) { return validate.isEqual(row.total, row.unit_price * row.quantity); });
    if (!totalEquality) {
      throw new Error('Unit prices and quantities do not match for purchase id: ' + id);
    }

    return core.queries.origin('purchase');
  })
  .then(function (originId) {
    cfg.originId = originId;
    return core.queries.period(reference.date);
  })
  .then(function (periodObject) {
    cfg.periodId = periodObject.id;
    cfg.fiscalYearId = periodObject.fiscal_year_id;
    return core.queries.transactionId(reference.project_id);
  })
  .then(function (transId) {
    cfg.transId = transId;

    // format queries
    queries.purchase =
      'INSERT INTO posting_journal ' +
        '(project_id, fiscal_year_id, period_id, trans_id, trans_date, ' +
        'description, account_id, debit, credit, debit_equiv, credit_equiv, ' +
        'currency_id, deb_cred_uuid, deb_cred_type, inv_po_id, origin_id, user_id ) ' +
      'SELECT purchase.project_id, ?, ?, ?, ?, ' +
        'purchase.note, creditor_group.account_id, 0, purchase.cost, 0, purchase.cost, ' + // last four debit, credit, debit_equiv, credit_equiv.  Note that debit === debit_equiv since we use enterprise currency.
        'purchase.currency_id, purchase.creditor_id, \'C\', purchase.id, ?, ?' +
      'FROM purchase JOIN creditor JOIN creditor_group ON ' +
        'purchase.creditor_id=creditor.id AND creditor_group.id=creditor.group_id ' +
      'WHERE purchase.id = ?;';

    queries.purchaseItem =
      'INSERT INTO posting_journal ' +
        '(project_id, fiscal_year_id, period_id, trans_id, trans_date, ' +
        'description, account_id, debit, credit, debit_equiv, credit_equiv, ' +
        'currency_id, deb_cred_uuid, deb_cred_type, inv_po_id, origin_id, user_id ) ' +
      'SELECT purchase.project_id, ?, ?, ?, ? ' +
        'purchase.note, inventory_group.sales_account, purchase_item.total, 0, purchase_item.total, 0, ' + // last three: credit, debit_equiv, credit_equiv
        'purchase.currency_id, purchase.creditor_id, \'C\', purchase.id, ?, ?' +
      'FROM purchase JOIN purchase_item JOIN inventory JOIN inventory_group ON ' +
        'purchase_item.purchase_id=purchase.id AND purchase_item.inventory_id=inventory.id AND ' +
        'inventory.group_id=inventory_group.id ' +
      'WHERE purchase.id = ?;';

    return db.exec(queries.purchase, [cfg.fiscalYearId, cfg.periodId, cfg.transId, new Date(), cfg.originId, userId, id]);
  })
  .then(function () {
    return db.exec(queries.purchaseItem, [cfg.fiscalYearId, cfg.periodId, cfg.transId, new Date(), cfg.originId, userId, id]);
  })
  .then(function (rows) {
    cb(null, rows);
  })
  .catch(cb)
  .done();
}


function confirmIndirectPurchase(id, userId, cb) {
  'use strict';

  var sql, references, params, dayExchange, cfg = {};

  sql =
    'SELECT purchase.uuid, purchase.cost, purchase.currency_id, purchase.project_id, ' +
      'purchase.purchaser_id, purchase.purchaser_id, employee.creditor_uuid, ' +
      'purchase_item.inventory_uuid, purchase_item.total, purchase.paid_uuid ' +
    'FROM purchase JOIN purchase_item JOIN employee ON ' +
      'purchase.uuid = purchase_item.purchase_uuid AND ' +
      'purchase.purchaser_id = employee.id ' +
    'WHERE purchase.paid_uuid = ?;';

  db.exec(sql, [id])
  .then(function (records) {
    if (records.length === 0) { throw new Error('No purchase with paid_uuid:' + id); }
    references = records;
    return q([
      core.queries.origin('confirm_purchase'),
      core.queries.period(new Date())
    ]);
  })
  .spread(function (originId, periodObject) {
    cfg.originId = originId;
    cfg.periodId = periodObject.id;
    cfg.fiscalYearId = periodObject.fiscal_year_id;
    return core.queries.transactionId(references[0].project_id);
  })
  .then(function (transId) {

    // FIXME : must get the project abbr by the sql request.
    cfg.transId = transId;
    cfg.description =  'CONFIRM C.A. INDIRECT/' + new Date().toISOString().slice(0, 10).toString();

    var queries = references.map(function (reference) {
      var sql, params;

      sql =
        'INSERT INTO posting_journal (' +
          'uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date, ' +
          'description, account_id, credit, debit, credit_equiv, debit_equiv, ' +
          'currency_id, deb_cred_uuid, deb_cred_type, inv_po_id, origin_id, user_id) ' +
        'SELECT ?, ?, ?, ?, ?, ?, ?, inventory_group.stock_account, ?, ?, ?, ?, ' +
          '?, ?, NULL, ?, ?, ? ' +
        'FROM inventory_group WHERE inventory_group.uuid IN ' +
          '(SELECT inventory.group_uuid FROM inventory WHERE inventory.uuid = ?)';

      params = [
        uuid(), reference.project_id, cfg.fiscalYearId, cfg.periodId, cfg.transId, new Date(),
        cfg.description, 0, reference.total, 0, reference.total, reference.currency_id,
        reference.inventory_uuid, reference.uuid, cfg.originId, userId, reference.inventory_uuid
      ];

      return db.exec(sql, params);
    });

    return q.all(queries);
  })
  .then(function () {


    var queries =  references.map(function (reference) {
      var sql, params;

      sql =
        'INSERT INTO posting_journal (' +
          'uuid,project_id, fiscal_year_id, period_id, trans_id, trans_date, ' +
          'description, account_id, credit, debit, credit_equiv, debit_equiv, ' +
          'currency_id, deb_cred_uuid, deb_cred_type, inv_po_id, origin_id, user_id ) '+
        'SELECT ?, ?, ?, ?, ?, ?, ?, inventory_group.cogs_account, ?, ?, ?, ?, ?, ?, NULL, ' +
          '?, ?, ?  ' +
         'FROM inventory_group WHERE inventory_group.uuid = ' +
            '(SELECT inventory.group_uuid FROM inventory WHERE inventory.uuid = ?)';

      params = [
        uuid(), reference.project_id, cfg.fiscalYearId, cfg.periodId, cfg.transId, new Date(),
        cfg.description, reference.total, 0, reference.total, 0, reference.currency_id,
        reference.inventory_uuid, reference.uuid, cfg.originId, userId, reference.inventory_uuid
      ];

      return db.exec(sql, params);
    });

    return q.all(queries);
  })
  .then(function (rows) {
    return cb(null, rows);
  })
  .catch(cb)
  .done();
}

/*
 * Indirect Purchase
 *
 * Description - TODO
 *
 */
function indirectPurchase(id, userId, cb) {
  'use strict';

  var sql, reference, params, dayExchange, cfg = {};

  sql =
    'SELECT primary_cash.reference, primary_cash.uuid, primary_cash.project_id, primary_cash.type, ' +
      'primary_cash.date, primary_cash.deb_cred_uuid, primary_cash.deb_cred_type, primary_cash.currency_id, ' +
      'primary_cash.account_id, primary_cash.cost, primary_cash.user_id, primary_cash.description, ' +
      'primary_cash.cash_box_id, primary_cash.origin_id, primary_cash_item.debit, primary_cash_item.credit, ' +
      'primary_cash_item.inv_po_id, primary_cash_item.document_uuid, creditor.group_uuid ' +
     'FROM primary_cash JOIN primary_cash_item JOIN creditor ON ' +
       'primary_cash.uuid = primary_cash_item.primary_cash_uuid AND ' +
       'primary_cash.deb_cred_uuid = creditor.uuid ' +
     'WHERE primary_cash.uuid = ?;';

  db.exec(sql, [id])
  .then(function (records) {
    if (records.length === 0) { throw new Error('No primary cash record found with uuid:' + id); }

    reference = records[0];

    sql =
      'SELECT cash_box_account_currency.account_id ' +
      'FROM cash_box_account_currency ' +
      'WHERE cash_box_account_currency.currency_id = ? ' +
        'AND cash_box_account_currency.cash_box_id = ?;';

    return q([
      core.queries.origin('indirect_purchase'),
      core.queries.period(reference.date),
      db.exec(sql, [reference.currency_id, reference.cash_box_id])
    ]);
  })
  .spread(function (originId, periodObject, res) {

    cfg.originId = originId;
    cfg.periodId = periodObject.id;
    cfg.fiscalYearId = periodObject.fiscal_year_id;
    cfg.account_cashbox = res[0].account_id;

    return core.queries.transactionId(reference.project_id);
  })
  .then(function (transId) {
    cfg.transId = transId;
    cfg.description =  'PAIE C.A Indirect/' + new Date().toISOString().slice(0, 10).toString();

    sql =
      'INSERT INTO posting_journal (' +
        'uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date, ' +
        'description, account_id, credit, debit, credit_equiv, debit_equiv, ' +
        'currency_id, deb_cred_uuid, deb_cred_type, inv_po_id, origin_id, user_id) ' +
      'SELECT ?, ?, ?, ?, ?, ?, ?, account_id, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ' +
      'FROM creditor_group WHERE creditor_group.uuid = ?;';

    params = [
      uuid(), reference.project_id, cfg.fiscalYearId, cfg.periodId, cfg.transId, new Date(), cfg.description,
      0, reference.debit, 0, reference.debit, reference.currency_id, reference.deb_cred_uuid,
      'C', reference.inv_po_id, cfg.originId, userId, reference.group_uuid
    ];

    return db.exec(sql, params);
  })
  .then(function () {
    sql =
      'INSERT INTO posting_journal (' +
        'uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date, ' +
        'description, account_id, credit, debit, credit_equiv, debit_equiv, ' +
        'currency_id, deb_cred_uuid, deb_cred_type, inv_po_id, origin_id, user_id ) ' +
      'VALUES (?);';

      params = [
        uuid(), reference.project_id, cfg.fiscalYearId, cfg.periodId, cfg.transId, new Date(),
        cfg.description, cfg.account_cashbox, reference.debit, 0, reference.debit, 0, reference.currency_id,
        null, null, reference.inv_po_id, cfg.originId, userId
      ];

    return db.exec(sql, [params]);
  })
  .then(function (res) {
    return cb(null, res);
  })
  .catch(cb)
  .done();
}

/*
 * Confirm Direct Purchase
 *
 *
*/
function directPurchase(id, userId, cb) {
  'use strict';

  var references, dayExchange, cfg = {};

  var sql =
    'SELECT purchase.uuid, purchase.creditor_uuid , purchase.cost, purchase.currency_id, purchase.project_id, ' +
      'purchase.purchaser_id, purchase_item.inventory_uuid, purchase.purchase_date, purchase_item.total ' +
    'FROM purchase JOIN purchase_item ON ' +
      'purchase.uuid = purchase_item.purchase_uuid ' +
    'WHERE purchase.is_direct = 1 AND ' +
      'purchase.uuid = ?;';

  db.exec(sql, [id])
  .then(function (records) {
    if (records.length === 0) { throw new Error('Could not find purchase order with uuid:' + id); }
    references = records;
    return q([core.queries.origin('confirm_purchase'), core.queries.period(references[0].purchase_date)]);
  })
  .spread(function (originId, periodObject) {
    cfg.originId = originId;
    cfg.periodId = periodObject.id;
    cfg.fiscalYearId = periodObject.fiscal_year_id;
    return core.queries.transactionId(references[0].project_id);
  })
  .then(function (transId) {
    cfg.transId = transId;
    cfg.description =  'CONFIRM C.A. DIRECT/' + new Date().toISOString().slice(0, 10).toString();

    var queries = references.map(function (reference) {
      var sql, params;

      sql =
        'INSERT INTO posting_journal ('+
          'uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date, ' +
          'description, account_id, credit, debit, credit_equiv, debit_equiv, ' +
          'currency_id, deb_cred_uuid, deb_cred_type, inv_po_id, origin_id, user_id) ' +
        'SELECT ?, ?, ?, ?, ?, ?, ?, inventory_group.stock_account, ?, ?, ?, ?, ?, ?, ' +
          'NULL, ?, ?, ? ' +
        'FROM inventory_group WHERE inventory_group.uuid IN ' +
          '(SELECT inventory.group_uuid FROM inventory WHERE inventory.uuid = ?);';

      params = [
        uuid(), reference.project_id, cfg.fiscalYearId, cfg.periodId, cfg.transId, new Date(),
        cfg.description, 0, reference.total, 0, reference.total, reference.currency_id,
        reference.inventory_uuid, reference.uuid, cfg.originId, userId, reference.inventory_uuid
      ];

      return db.exec(sql, params);
    });

    return q.all(queries);
  })
  .then(function () {

    var queries = references.map(function (reference) {
      var sql, params;

      sql =
        'INSERT INTO posting_journal ('+
          'uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date, ' +
          'description, account_id, credit, debit, credit_equiv, debit_equiv, ' +
          'currency_id, deb_cred_uuid, deb_cred_type, inv_po_id, origin_id, user_id) ' +
        'SELECT ?, ?, ?, ?, ?, ?, ?, inventory_group.cogs_account, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ? ' +
        'FROM inventory_group WHERE inventory_group.uuid IN ' +
          '(SELECT inventory.group_uuid FROM inventory WHERE inventory.uuid = ?);';

      params = [
        uuid(), reference.project_id, cfg.fiscalYearId, cfg.periodId, cfg.transId, new Date(),
        cfg.description, reference.total, 0, reference.total, 0, reference.currency_id,
        reference.inventory_uuid, reference.uuid, cfg.originId, userId, reference.inventory_uuid
      ];

      return db.exec(sql, params);
    });

    return q.all(queries);
  })
  .then(function (res){
    return cb(null, res);
  })
  .catch(cb)
  .done();
}

/*  handleIntegration
 *
 *
*/
function integration(id, userId, cb) {
  'use strict';

  var sql, params, references, dayExchange, cfg = {};

  sql =
    'SELECT purchase.uuid, purchase.creditor_uuid , purchase.cost, purchase.currency_id, ' +
      'purchase.project_id, purchase.purchaser_id, purchase.emitter_id, ' +
      'purchase_item.inventory_uuid, purchase_item.total ' +
    'FROM purchase JOIN purchase_item ON ' +
      'purchase.uuid = purchase_item.purchase_uuid ' +
    'WHERE purchase.uuid = ?;';

  db.exec(sql, [id])
  .then(function (records) {
    if (records.length === 0) {
      throw new Error('Could not find a purchase with uuid:' + id);
    }

    references = records;

    return [
      core.queries.origin('confirm_integration'),
      core.queries.period(new Date())
    ];
  })
  .spread(function (originId, periodObject) {
    cfg.originId = originId;
    cfg.periodId = periodObject.id;
    cfg.fiscalYearId = periodObject.fiscal_year_id;
    return core.queries.transactionId(references[0].project_id);
  })
  .then(function (transId) {
    cfg.transId = transId;
    cfg.description =  'Confirm Integration/' + new Date().toISOString().slice(0, 10).toString();

    var queries = references.map(function (reference) {
      sql =
        'INSERT INTO posting_journal ('+
          'uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date, ' +
          'description, account_id, credit, debit, credit_equiv, debit_equiv, ' +
          'currency_id, deb_cred_uuid, deb_cred_type, inv_po_id, origin_id, user_id) '+
        'SELECT ?, ?, ?, ?, ?, ?, ?, inventory_group.stock_account, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ' +
        'FROM inventory_group WHERE inventory_group.uuid IN (' +
          'SELECT inventory.group_uuid FROM inventory WHERE inventory.uuid = ?);';

      params = [
        uuid(), reference.project_id, cfg.fiscalYearId, cfg.periodId, cfg.transId, new Date(),
        cfg.description, 0, reference.total, 0, reference.total, reference.currency_id,
        null, null, reference.uuid, cfg.originId, userId, reference.inventory_uuid
      ];

      return db.exec(sql, params);
    });
    return q.all(queries);
  })
  .then(function () {
    var queries = references.map(function (reference) {
      sql =
        'INSERT INTO posting_journal (' +
          'uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date, ' +
          'description, account_id, credit, debit, credit_equiv, debit_equiv, ' +
          'currency_id, deb_cred_uuid, deb_cred_type, inv_po_id, origin_id, user_id) ' +
        'SELECT ?, ?, ?, ?, ?, ?, ?, inventory_group.cogs_account, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ' +
        'FROM inventory_group WHERE inventory_group.uuid  IN (' +
          'SELECT inventory.group_uuid FROM inventory WHERE inventory.uuid = ?);';

      params = [
        uuid(),reference.project_id, cfg.fiscalYearId, cfg.periodId, cfg.transId, new Date(), cfg.description,
        reference.total, 0, reference.total, 0, reference.currency_id, null, null, reference.uuid, cfg.originId,
        userId, reference.inventory_uuid
      ];

      return db.exec(sql, params);
    });
    return q.all(queries);
  })
  .then(function (res){
    return cb(null, res);
  })
  .catch(cb)
  .done();
}
