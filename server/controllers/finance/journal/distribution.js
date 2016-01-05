var q        = require('q'),
    core     = require('./core'),
    uuid     = require('../../../lib/guid'),
    db       = require('../../../lib/db');

exports.patient = patient;
exports.service = service;
exports.loss = loss;
exports.reverseDistribution = reverseDistribution;

/**
* Distribution to a Patient
*
* Allows a patient to claim medicine he paid for at
* the pharmacy.
*
* LINK: partials/depots/distributions/patients/patients.js
*/
function patient(id, userId, cb) {
  'use strict';

  var sql, references, queries, cfg = {}, ids = [];

  sql =
    'SELECT consumption.uuid, consumption.date, consumption.unit_price, consumption.quantity, stock.inventory_uuid, ' +
      'inventory.purchase_price, inventory_group.uuid AS group_uuid, inventory_group.cogs_account, ' +
      'inventory_group.stock_account, sale.project_id, sale.service_id ' +
    'FROM consumption JOIN stock JOIN inventory JOIN inventory_group JOIN sale ON ' +
      'consumption.tracking_number = stock.tracking_number AND ' +
      'stock.inventory_uuid = inventory.uuid AND ' +
      'inventory.group_uuid = inventory_group.uuid AND ' +
      'sale.uuid = consumption.document_id ' +
    'WHERE consumption.document_id = ?;';

  db.exec(sql, [id])
  .then(function (records) {
    if (records.length === 0) { throw new Error('Could not find consumption with uuid:' + id); }
    references = records;

    return [
      core.queries.origin('distribution'),
      core.queries.period(references[0].date)
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
    cfg.description =  'DP/'+new Date().toISOString().slice(0, 10).toString();

    queries = references.map(function (reference) {
      var params, uid = uuid();

      // generate a new uuid and store for later error correction
      ids.push(uid);

      sql =
        'INSERT INTO posting_journal (' +
          'uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date, ' +
          'description, account_id, credit, debit, credit_equiv, debit_equiv, ' +
          'currency_id, deb_cred_uuid, deb_cred_type, inv_po_id, origin_id, user_id, cc_id) ' +
        'SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, service.cost_center_id ' +
        'FROM service ' +
        'WHERE service.id = ?;';

      params = [
        uid, reference.project_id, cfg.fiscalYearId, cfg.periodId, cfg.transId, new Date(), cfg.description,
        reference.cogs_account, 0, (reference.quantity * reference.unit_price).toFixed(4), 0,
        (reference.quantity * reference.unit_price).toFixed(4), 2, null, null, id, cfg.originId, userId,
        reference.service_id
      ];

      return db.exec(sql, params);
    });

    return q.all(queries);
  })
  .then(function () {
    queries = references.map(function (reference) {
      var params, uid = uuid();

      // generate a new uuid and store for later error correction
      ids.push(uid);

      var sql =
      'INSERT INTO posting_journal (' +
        'uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date, ' +
        'description, account_id, credit, debit, credit_equiv, debit_equiv, ' +
        'currency_id, deb_cred_uuid, deb_cred_type, inv_po_id, origin_id, user_id) ' +
      'SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ' +
      'FROM inventory_group ' +
      'WHERE inventory_group.uuid = ?;';

      params = [
        uid, reference.project_id, cfg.fiscalYearId, cfg.periodId, cfg.transId, new Date(),
        cfg.description, reference.stock_account, (reference.quantity * reference.unit_price).toFixed(4),
        0, (reference.quantity * reference.unit_price).toFixed(4), 0, 2, reference.inventory_uuid, null,
        reference.uuid, cfg.originId, userId, reference.group_uuid
      ];

      return db.exec(sql, params);
    });

    return q.all(queries);
  })
  .then(function (res) {
    cb(null, res);
  })

  // handle errors appropriately
  .catch(function (err) {

    // delete from posting journal if we've posted there
    // TODO - make a logic 1,2,3 steps to this process
    // and then replicate it everywhere
    sql = ids.length > 0 ? 'DELETE FROM posting_journal WHERE posting_journal.uuid IN (?);' : 'SELECT 1 + 1;';

    // execute in order
    db.exec(sql, [ids])
    .then(function () {
      sql = 'DELETE FROM consumption_patient WHERE consumption_patient.sale_uuid = ?;';
      return db.exec(sql, [id]);
    })
    .then(function () {
      sql = 'DELETE FROM consumption WHERE consumption.document_id = ?';
      return db.exec(sql, [id]);
    })
    .finally(function () {
      cb(err);
    });
  })
  .done();
}


/* Distribution to a Service
*
* Handles distribution of medicines to a service.
*
*/
function service(id, userId, details, cb) {
  'use strict';

  var sql, queries, references,
      cfg = {},
      ids = [];

  sql =
    'SELECT consumption.uuid, consumption.date, consumption.unit_price, consumption.quantity, ' +
      'consumption_service.service_id, stock.inventory_uuid, inventory.purchase_price, ' +
      'inventory_group.uuid AS group_uuid, inventory_group.cogs_account, inventory_group.stock_account ' +
    'FROM consumption JOIN consumption_service JOIN stock JOIN inventory JOIN inventory_group ON ' +
      'consumption.tracking_number = stock.tracking_number AND ' +
      'consumption_service.consumption_uuid = consumption.uuid AND ' +
      'stock.inventory_uuid = inventory.uuid AND ' +
      'inventory.group_uuid = inventory_group.uuid ' +
    'WHERE consumption.document_id = ?;';

  db.exec(sql, [id])
  .then(function (records) {
    if (records.length === 0) {
      throw new Error('Could not find distribution with uuid:' + id);
    }
    references = records;
    return [
      core.queries.origin('distribution'),
      core.queries.period(new Date())
    ];
  })
  .spread(function (originId, periodObject) {
    cfg.originId = originId;
    cfg.periodId = periodObject.id;
    cfg.fiscalYearId = periodObject.fiscal_year_id;
    return core.queries.transactionId(details.project.id);
  })
  .then(function (transId) {
    cfg.transId = transId;
    cfg.description =  'DS/'+new Date().toISOString().slice(0, 10).toString();

    queries = references.map(function (reference) {
      var params, uid = uuid();
      ids.push(uid);

      sql =
        'INSERT INTO posting_journal (' +
          'uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date, ' +
          'description, account_id, credit, debit, credit_equiv, debit_equiv, ' +
          'currency_id, deb_cred_uuid, deb_cred_type, inv_po_id, origin_id, user_id, cc_id) ' +
        'SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, service.cost_center_id ' +
        'FROM service WHERE service.id = ?;';

      params = [
        uid, details.project.id, cfg.fiscalYearId, cfg.periodId, cfg.transId, new Date(), cfg.description,
        reference.cogs_account, 0, reference.quantity * reference.unit_price, 0,
        reference.quantity * reference.unit_price, details.enterprise.currency_id, null, null, id, cfg.originId,
        userId, reference.service_id
      ];

      return db.exec(sql, params);
    });

    return q.all(queries);
  })
  .then(function () {

    queries = references.map(function (reference) {
      var params, uid = uuid();
      ids.push(uid);

      sql =
        'INSERT INTO posting_journal (' +
          'uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date, ' +
          'description, account_id, credit, debit, credit_equiv, debit_equiv, ' +
          'currency_id, deb_cred_uuid, deb_cred_type, inv_po_id, origin_id, user_id) ' +
        'SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ' +
        'FROM inventory_group ' +
        'WHERE inventory_group.uuid = ?;';

      params = [
        uid, details.project.id, cfg.fiscalYearId, cfg.periodId, cfg.transId, new Date(), cfg.description,
        reference.stock_account, reference.quantity * reference.unit_price, 0, reference.quantity * reference.unit_price, 0,
        details.enterprise.currency_id, reference.inventory_uuid, null, reference.uuid, cfg.originId, userId,
        reference.group_uuid
      ];

      return db.exec(sql, params);
    });

    return q.all(queries);
  })

  // all done!
  .then(function (res) {
    return cb(null, res);
  })
  .catch(function (err) {
    sql = ids.length > 0 ? 'DELETE FROM posting_journal WHERE posting_journal.uuid IN (?)' : 'SELECT 1 + 1;';

    db.exec(sql, [ids])
    .then(function () {
      sql =
        'DELETE FROM consumption_service WHERE consumption_service.consumption_uuid IN (' +
          'SELECT DISTINCT consumption.uuid FROM consumption WHERE consumption.document_id = ?' +
        ');';

      return db.exec(sql, [id]);
    })
    .then(function () {
      sql = 'DELETE FROM consumption WHERE consumption.document_id = ?;';
      return db.exec(sql, [id]);
    })
    .finally(function () {
      return cb(err);
    });
  })
  .done();
}

/**
* Distribution Loss
*
* This route is responsible for 
*
* TODO Rewrite this route
*/
function loss(id, userId, details, cb) {
  'use strict';


  var sql, queries, references, cfg = {}, ids = [];

  sql =
    'SELECT consumption.uuid, consumption.date, consumption.quantity, consumption.unit_price, stock.inventory_uuid, ' +
    'inventory.purchase_price, inventory_group.uuid AS group_uuid, inventory_group.cogs_account, inventory_group.stock_account ' +
    'FROM consumption JOIN consumption_loss JOIN stock JOIN inventory JOIN inventory_group ON ' +
      'consumption.tracking_number = stock.tracking_number AND ' +
      'consumption_loss.consumption_uuid = consumption.uuid AND ' +
      'stock.inventory_uuid = inventory.uuid AND ' +
      'inventory.group_uuid = inventory_group.uuid ' +
    'WHERE consumption.document_id = ?;';

  db.exec(sql, [id])
  .then(function (records) {
    if (records.length === 0) {
      throw new Error('Could not find consumption with uuid:' + uuid);
    }
    references = records;
    return [
      core.queries.origin('stock_loss'),
      core.queries.period(new Date())
    ];
  })
  .spread(function (originId, periodObject) {
    cfg.originId = originId;
    cfg.periodId = periodObject.id;
    cfg.fiscalYearId = periodObject.fiscal_year_id;
    return core.queries.transactionId(details.project.id);
  })
  .then(function (transId) {
    cfg.transId = transId;
    cfg.description =  'LO/'+new Date().toISOString().slice(0, 10).toString();

    queries = references.map(function (reference) {
      var params, uid = uuid();
      ids.push(uid);

      sql =
        'INSERT INTO posting_journal (' +
          'uuid,project_id, fiscal_year_id, period_id, trans_id, trans_date, ' +
          'description, account_id, credit, debit, credit_equiv, debit_equiv, ' +
          'currency_id, deb_cred_uuid, deb_cred_type, inv_po_id, origin_id, user_id) ' +
        'SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ' +
        'FROM inventory_group WHERE inventory_group.uuid = ?';

      params = [
        uid, details.project.id, cfg.fiscalYearId, cfg.periodId, cfg.transId, new Date(), cfg.description,
        reference.cogs_account, 0, reference.quantity * reference.unit_price, 0, reference.quantity * reference.unit_price,
        details.enterprise.currency_id, null, null, id, cfg.originId, userId, reference.group_uuid
      ];

      return db.exec(sql, params);
    });

    return q.all(queries);
  })
  .then(function () {
    queries = references.map(function (reference) {
      var params, uid = uuid();
      ids.push(uid);

      sql =
        'INSERT INTO posting_journal (' +
          'uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date, ' +
          'description, account_id, credit, debit, credit_equiv, debit_equiv, ' +
          'currency_id, deb_cred_uuid, deb_cred_type, inv_po_id, origin_id, user_id) ' +
        'SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ' +
        'FROM inventory_group ' +
        'WHERE inventory_group.uuid = ?';

      params = [
        uid, details.project.id, cfg.fiscalYearId, cfg.periodId, cfg.transId, new Date(), cfg.description,
        reference.stock_account, reference.quantity * reference.unit_price, 0,
        reference.quantity * reference.unit_price, 0, details.enterprise.currency_id, reference.inventory_uuid, null,
        id, cfg.originId, userId, reference.group_uuid
      ];

      return db.exec(sql, params);
    });

    return q.all(queries);
  })
  .then(function (res) {
    return cb(null, res);
  })
  .catch(function (err) {
    sql = ids.length > 0 ? 'DELETE FROM posting_journal WHERE posting_journal.uuid IN (?);' : 'SELECT 1 + 1;';

    db.exec(sql, [ids])
    .then(function () {
      sql = 'DELETE FROM consumption_loss WHERE consumption_loss.document_uuid = ?;';
      return db.exec(sql, [id]);
    })
    .then(function () {
      sql = 'DELETE FROM consumption WHERE consumption.document_id = ?;';
      return db.exec(sql, [id]);
    })
    .finally(function () {
      return cb(err, null);
    });
  })
  .done();
}


/**
* Responsible to reversing a stock transfer made in error.  It is used by the
* module "Cancel Stock Distribution" found in depots client controller.
*
* LINK: partials/depots/distributions/cancel/cancel.js
*
* This module should only be used in error.  If any errors are incurred during
* the stock distribution process, cancel the order, and restart.
*/
function reverseDistribution(id, userId, cb) {
  'use strict';

  var sql, params, queries, reference, references, cfg = {};

  sql =
    'SELECT uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date, doc_num, ' +
      'description, account_id, debit, credit, debit_equiv, credit_equiv, currency_id, ' +
      'deb_cred_uuid, inv_po_id, cost_ctrl_id, origin_id, '+
      'user_id, cc_id, pc_id ' +
    'FROM posting_journal ' +
    'WHERE inv_po_id = ? ' +
    'UNION ' +
    'SELECT uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date, doc_num, ' +
      'description, account_id, debit, credit, debit_equiv, credit_equiv, currency_id, ' +
      'deb_cred_uuid, inv_po_id, cost_ctrl_id, origin_id, '+
      'user_id, cc_id, pc_id ' +
    'FROM general_ledger ' +
    'WHERE inv_po_id = ?;';

  db.exec(sql, [id, id])
  .then(function (records) {
    if (records.length === 0) {
      throw new Error('Could not find transaction with id:' + id);
    }

    reference = records[0];

    sql =
      'SELECT uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date, doc_num, ' +
        'description, account_id, debit, credit, debit_equiv, credit_equiv, currency_id, ' +
        'deb_cred_uuid, inv_po_id, cost_ctrl_id, origin_id, '+
        'user_id, cc_id, pc_id ' +
      'FROM posting_journal ' +
      'WHERE trans_id = ? ' +
      'UNION ' +
      'SELECT uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date, doc_num, ' +
        'description, account_id, debit, credit, debit_equiv, credit_equiv, currency_id, ' +
        'deb_cred_uuid, inv_po_id, cost_ctrl_id, origin_id, '+
        'user_id, cc_id, pc_id ' +
      'FROM general_ledger ' +
      'WHERE trans_id = ?;';

    return db.exec(sql, [reference.trans_id, reference.trans_id]);   
  })
  .then(function (records){
    references = records;

    return [
      core.queries.origin('reversing_stock'),
      core.queries.period(new Date())
    ];

  })
  .spread(function (originId, periodObject) {
    cfg.originId = originId;
    cfg.periodId = periodObject.id;
    cfg.fiscalYearId = periodObject.fiscal_year_id;
    return core.queries.transactionId(reference.project_id);
  })
  .then(function (transId) {
    var description = 'REVERSING_STOCK/' + new Date().toISOString().slice(0, 10).toString();

    queries = references.map(function (item) {
      item.uuid = uuid();
      item.origin_id = cfg.originId;
      item.description = description;
      item.period_id = cfg.periodId;
      item.fiscal_year_id = cfg.fiscalYearId;
      item.trans_id = transId;
      item.trans_date = new Date();

      if (!item.deb_cred_uuid) {
        item.deb_cred_uuid = null
      }

      sql =
        'INSERT INTO posting_journal (' +
          'uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date, doc_num, ' +
          'description, account_id, debit, credit, debit_equiv, credit_equiv, currency_id, ' +
          'deb_cred_uuid, inv_po_id, cost_ctrl_id, origin_id, '+
          'user_id, cc_id, pc_id) ' +
        'VALUES (?);';

      params = [
        item.uuid, item.project_id, item.fiscal_year_id, item.period_id, item.trans_id, item.trans_date,
        item.doc_num, item.description, item.account_id, item.credit, item.debit,item.credit_equiv, item.debit_equiv,
        item.currency_id, item.deb_cred_uuid, item.inv_po_id,item.cost_ctrl_id, item.origin_id,
        item.user_id, item.cc_id, item.pc_id
      ];

      return db.exec(sql, [params]);
    });

    return q.all(queries);
  })
  .then(function (res) {
    cb(null, res);
  })
  .catch(cb)
  .done();
}
