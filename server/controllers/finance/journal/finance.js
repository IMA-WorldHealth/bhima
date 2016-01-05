var q         = require('q'),
    core      = require('./core'),
    uuid      = require('../../../lib/guid'),
    db        = require('../../../lib/db');

exports.cancelInvoice = cancelInvoice;
exports.extraPayment = extraPayment;

/* cancelInvoice
 *
 * Allows you to reverse invoices found in the posting journal and GL
 *
*/
function cancelInvoice(id, userId, cb) {
  'use strict';

  var sql, rate, reference, references, cfg = {};

  sql =
    'SELECT uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date, doc_num, ' +
      'description, account_id, debit, credit, debit_equiv, credit_equiv, deb_cred_type, currency_id, ' +
      'deb_cred_uuid, inv_po_id, cost_ctrl_id, origin_id, ' +
      'user_id, cc_id, pc_id ' +
    'FROM posting_journal ' +
    'WHERE posting_journal.inv_po_id = ? ' +
    'UNION ALL ' +
    'SELECT uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date, doc_num, ' +
      'description, account_id, debit, credit, debit_equiv, credit_equiv,  deb_cred_type, currency_id, ' +
      'deb_cred_uuid, inv_po_id, cost_ctrl_id, origin_id, '+
      'user_id, cc_id, pc_id ' +
    'FROM general_ledger ' +
    'WHERE general_ledger.inv_po_id = ?;';

  db.exec(sql, [id, id])
  .then(function (records) {
    if (records.length === 0) {
      throw new Error('No invoice found with uuid:' + id);
    }

    reference = records[0];
    references = records;

    return [
      core.queries.origin('group_invoice'),
      core.queries.period(new Date()),
      core.queries.exchangeRate(new Date())
    ];
  })
  .spread(function (originId, periodObject, store, res) {
    cfg.originId = originId;
    cfg.periodId = periodObject.id;
    cfg.fiscalYearId = periodObject.fiscal_year_id;
    rate = store.get(reference.currency_id).rate;


    // FIXME -- this is a dangerous operation.  Just because
    // they have the same origin, does not mean they are part
    // of the same operation.
    references = references.filter(function (item) {
      return item.origin_id === cfg.originId;
    });

    return core.queries.transactionId(reference.project_id);
  })
  .then(function (transId) {
    cfg.transId = transId;
    cfg.description =  'CANCEL SUPPORTED ' + new Date().toISOString().slice(0, 10).toString();

    sql =
      'INSERT INTO posting_journal (' +
        'uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date, doc_num, ' +
        'description, account_id, debit, credit, debit_equiv, credit_equiv, deb_cred_type, currency_id, ' +
        'deb_cred_uuid, inv_po_id, cost_ctrl_id, origin_id, user_id, cc_id, pc_id) ' +
      'VALUES (?);';

    var queries = references.map(function (item) {
      var params;

      item.uuid = uuid();
      item.origin_id = cfg.originId;
      item.description = cfg.descrip;
      item.period_id = cfg.periodId;
      item.fiscal_year_id = cfg.fiscalYearId;
      item.transId = cfg.transId;
      item.trans_date = new Date();

      // FIXME - we may not have to do this, but this
      // refactor should only change small peices at a
      // time
      if (item.deb_cred_uuid) {
        item.deb_cred_uuid = item.deb_cred_uuid;
      } else {
        item.deb_cred_uuid = null;
      }

      params =  [
        item.uuid, item.project_id, item.fiscal_year_id, item.period_id, item.transId,
        item.trans_date, item.doc_num, item.description, item.account_id, item.credit,
        item.debit, item.credit_equiv, item.debit_equiv, item.deb_cred_type, item.currency_id,
        item.deb_cred_uuid, item.inv_po_id, item.cost_ctrl_id, item.origin_id, item.userId,
        item.cc_id, item.pc_id
      ];

      return db.exec(sql, [params]);
    });

    return q.all(queries);
  })
  .then(function (res){
    cb();
  })
  .catch(function (err) {
    cb(err);  
  })
  .done();
}


/* Extra Payment
 *
 * For doing extra things (tm).
*/
function extraPayment(id, userId, details, cb) {
  'use strict';

  var sql, params, rate, data, reference, cfg = {};

  sql =
    'SELECT g.account_id ' +
    'FROM sale ' +
    'JOIN debitor AS d ON d.uuid = sale.debitor_uuid ' +
    'JOIN debitor_group AS g ON g.uuid = d.group_uuid ' +
    'WHERE sale.uuid = ?;';

  db.exec(sql, [details.sale_uuid])
  .then(function (records) {
    if (records.length === 0) {
      throw new Error('Could not find sale with uuid:' +  details.sale_uuid);
    }
    reference = records[0];

    // FIXME - why is this necessary?  The client should only send numbers!
    details.cost = parseFloat(details.cost);
    return [
      core.queries.origin('journal'),
      core.queries.period(new Date()),
      core.queries.exchangeRate(new Date())
    ];
  })
  .spread(function (originId, periodObject, store) {
    cfg.originId = originId;
    cfg.periodId = periodObject.id;
    cfg.fiscalYearId = periodObject.fiscal_year_id;
    cfg.store = store;
    rate = cfg.store.get(details.currency_id).rate;
    return core.queries.transactionId(details.project_id);
  })
  .then(function (transId) {
    cfg.transId = transId;
    cfg.description =  transId.substring(0,4) + '_Extra_Payment/' + new Date().toISOString().slice(0, 10).toString();
    sql =
      'INSERT INTO posting_journal (' +
        'uuid,project_id, fiscal_year_id, period_id, trans_id, trans_date, ' +
        'description, account_id, credit, debit, credit_equiv, debit_equiv, ' +
        'currency_id, deb_cred_uuid, deb_cred_type, inv_po_id, origin_id, user_id) ' +
      'VALUES (?);';

    params = [
      uuid(), details.project_id, cfg.fiscalYearId, cfg.periodId, cfg.transId, new Date(),
      cfg.description, details.wait_account, 0, details.cost, 0, details.cost / rate, details.currency_id,
      details.debitor_uuid, 'C', details.sale_uuid, cfg.originId, details.user_id
    ];

    return db.exec(sql, [params]);
  })
  .then(function () {
    sql =
      'INSERT INTO posting_journal (' +
        'uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date, ' +
        'description, account_id, credit, debit, credit_equiv, debit_equiv, ' +
        'currency_id, deb_cred_uuid, deb_cred_type, inv_po_id, origin_id, user_id) ' +
      'VALUES (?);';

    params = [
      uuid(), details.project_id, cfg.fiscalYearId, cfg.periodId, cfg.transId, new Date(),
      cfg.description, reference.account_id, details.cost, 0, details.cost / rate, 0,
      details.currency_id, details.debitor_uuid, 'D', details.sale_uuid, cfg.originId,
      userId
    ];

    return db.exec(sql, [params]);
  })
  .then(function (res) {
    return cb(null, res);
  })
  .catch(cb)
  .done();
}
