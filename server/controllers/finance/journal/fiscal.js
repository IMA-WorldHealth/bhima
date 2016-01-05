var q         = require('q'),
    core      = require('./core'),
    uuid      = require('../../../lib/guid'),
    sanitize  = require('../../../lib/sanitize'),
    validate  = require('../../../lib/validate')(),
    db        = require('../../../lib/db'),
    util      = require('../../../lib/util');

exports.close = close;
exports.create = create;

/*
 * Closes a fiscal year, migrating data over to the
 *
 *
 * FIXME - this route has been overloaded to do both opening
 * and closing a fiscal year.  We should really only ever do
 * one operation in the posting journal with one function...
 * This code is very difficult to test.
 *
 */
function close(id, user_id, data, cb) {
  'use strict';

  /*
  * param id : new fiscal year ID
  * param user_id : user ID
  * param data : useful data
  */

  var transactionDate,
      reference,
      cfg = {},
      resAccount  = data.resultat_account,
      charge      = data.charge,
      produit     = data.produit;

  try {
    // Transaction date manipulation
    if (data.flag === 'SIMPLE_LOCKING') {
      // Locking simply a fiscal year without creation
      // Transaction date (in journal) must be the last date of the concerned
      // fiscal year
      transactionDate = util.toMysqlDate(data.fiscalYearLastDate);
      cfg.descrip = 'Closing Fiscal Year/' + String(transactionDate);

    } else if (data.flag === 'CREATE_WITH_LOCKING') {
      // Create a new fiscal year with closing previous
      // Transaction date of creation (in journal) must be the last date of
      // the closed fiscal year
      transactionDate = util.toMysqlDate(data.closedFYLastDate);
      cfg.descrip = 'New Fiscal Year/Closing Previous/' + String(transactionDate);
    }
  } catch (err) {
    return cb(err);
  }

  function init() {
    cfg.user_id = user_id;
    cfg.project_id = 1; // HBB by default
    return q.when([
      core.queries.origin('journal'),
      core.queries.period(transactionDate)
    ]);
  }

  init()
  .spread(function (originId, periodObject) {
    cfg.originId = originId;
    cfg.periodId = periodObject.id;
    cfg.fiscalYearId = periodObject.fiscal_year_id;
    return core.queries.transactionId(cfg.project_id);
  })
  .then(function (transId) {
    cfg.transId = '"' + transId + '"'; // FIXME - migrate to db.exec()
  })
  .then(function () {
    return postingResultat(resAccount);
  })
  .then(function (res) {
    return cb(null, res);
  })
  .catch(cb)
  .done();

  function postingResultat (resAccount) {
    var processCharge, processProduit;

    if (charge.length) {
      processCharge = charge.map(function (account) {
        return processDebCredCharge(resAccount.id, account);
      });
    }

    if (produit.length) {
      processProduit = produit.map(function (account) {
        return processDebCredProduit(resAccount.id, account);
      });
    }

    return q.all([processCharge, processProduit]);
  }

  function processDebCredCharge (resultatAccount, chargeAccount) {
    var bundle = {
          chargeAccount : chargeAccount,
          solde         : chargeAccount.debit_equiv - chargeAccount.credit_equiv,
          currency_id   : chargeAccount.currency_id
        };

    if (bundle.solde > 0) {
      return q.all([debit(resultatAccount, bundle), credit(bundle.chargeAccount.id, bundle)]);
    } else if (bundle.solde < 0) {
      return q.all([debit(bundle.chargeAccount.id, bundle), credit(resultatAccount, bundle)]);
    }

    function debit (accountId, bundle) {
      var sql =
        'INSERT INTO posting_journal (' +
        'uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date, ' +
        'description, account_id, credit, debit, credit_equiv, debit_equiv, ' +
        'currency_id, deb_cred_uuid, deb_cred_type, inv_po_id, origin_id, user_id) '+
        'SELECT '+
          [
            sanitize.escape(uuid()),
            cfg.project_id,
            cfg.fiscalYearId,
            cfg.periodId,
            cfg.transId, '\'' + transactionDate + '\'', sanitize.escape(cfg.descrip)
          ].join(',') + ', account.id, ' +
          [
            0, Math.abs(bundle.solde),
            0, Math.abs(bundle.solde),
            bundle.currency_id,
            'null'
          ].join(',') +
          ', null, ' +
          [
            'null',
            cfg.originId,
            cfg.user_id
          ].join(',') +
        ' FROM account WHERE account.id= ' + sanitize.escape(accountId)+';';
      return db.exec(sql);
    }

    function credit (accountId, bundle) {
      var sql =
        'INSERT INTO posting_journal ' +
        '(uuid,project_id, fiscal_year_id, period_id, trans_id, trans_date, ' +
        'description, account_id, credit, debit, credit_equiv, debit_equiv, ' +
        'currency_id, deb_cred_uuid, deb_cred_type, inv_po_id, origin_id, user_id) ' +
        'SELECT ' +
          [
            sanitize.escape(uuid()),
            cfg.project_id,
            cfg.fiscalYearId,
            cfg.periodId,
            cfg.transId, '\'' + transactionDate + '\'', sanitize.escape(cfg.descrip)
          ].join(',') + ', account.id, ' +
          [
            Math.abs(bundle.solde), 0,
            Math.abs(bundle.solde), 0,
            bundle.currency_id
          ].join(',') +
          ', null, null, ' +
          [
            'null',
            cfg.originId,
            user_id
          ].join(',') +
        ' FROM account WHERE account.id= ' + sanitize.escape(accountId)+';';
      return db.exec(sql);
    }
  }

  function processDebCredProduit (resultatAccount, produitAccount) {
    var bundle = {
          produitAccount : produitAccount,
          solde          : produitAccount.credit_equiv - produitAccount.debit_equiv,
          currency_id    : produitAccount.currency_id
        };

    if (bundle.solde > 0) {
      return q.all([debit(bundle.produitAccount.id, bundle), credit(resultatAccount, bundle)]);
    } else if (bundle.solde < 0) {
      return q.all([debit(resultatAccount, bundle), credit(bundle.produitAccount.id, bundle)]);
    }

    function debit (accountId, bundle) {
      var sql =
        'INSERT INTO posting_journal '+
        '(uuid,project_id, fiscal_year_id, period_id, trans_id, trans_date, ' +
        'description, account_id, credit, debit, credit_equiv, debit_equiv, ' +
        'currency_id, deb_cred_uuid, deb_cred_type, inv_po_id, origin_id, user_id) '+
        'SELECT '+
          [
            sanitize.escape(uuid()),
            cfg.project_id,
            cfg.fiscalYearId,
            cfg.periodId,
            cfg.transId, '\'' + transactionDate + '\'', sanitize.escape(cfg.descrip)
          ].join(',') + ', account.id, ' +
          [
            0, Math.abs(bundle.solde),
            0, Math.abs(bundle.solde),
            bundle.currency_id,
            'null'
          ].join(',') +
          ', null, ' +
          [
            'null',
            cfg.originId,
            cfg.user_id
          ].join(',') +
        ' FROM account WHERE account.id= ' + sanitize.escape(accountId)+';';
      return db.exec(sql);
    }

    function credit (accountId, bundle) {
      var sql =
        'INSERT INTO posting_journal (' +
        'uuid,project_id, fiscal_year_id, period_id, trans_id, trans_date, ' +
        'description, account_id, credit, debit, credit_equiv, debit_equiv, ' +
        'currency_id, deb_cred_uuid, deb_cred_type, inv_po_id, origin_id, user_id) ' +
        'SELECT ' +
          [
            sanitize.escape(uuid()),
            cfg.project_id,
            cfg.fiscalYearId,
            cfg.periodId,
            cfg.transId, '\'' + transactionDate + '\'', sanitize.escape(cfg.descrip)
          ].join(',') + ', account.id, ' +
          [
            Math.abs(bundle.solde), 0,
            Math.abs(bundle.solde), 0,
            bundle.currency_id
          ].join(',') +
          ', null, null, ' +
          [
            'null',
            cfg.originId,
            user_id
          ].join(',') +
        ' FROM account WHERE account.id= ' + sanitize.escape(accountId)+';';
      return db.exec(sql);
    }
  }
}


/* Create
 *
 * Create fiscal year, which involves the posting journal
 * for some reason...
*/
function create(id, userId, details, cb) {
  'use strict';

  var sql, rate, queries, cfg = {},
      ids = [];

  // fiscal year starting date
  // When a fiscal year is created, in the posting journal we put the starting date
  // of the fiscal year like transaction date
  cfg.dateStart = details.dateStart;

  q([
    core.queries.origin('journal'),
    core.queries.period(cfg.dateStart),
    core.queries.exchangeRate(new Date())
  ])
  .spread(function (originId, periodObject, store) {
    cfg.balance = details.balances[0];
    cfg.originId = originId;
    cfg.periodId = periodObject.id;
    cfg.description = cfg.balance.description;
    cfg.fiscalYearId = periodObject.fiscal_year_id;
    cfg.store = store;
    rate = cfg.store.get(cfg.balance.currencyId).rate;
    return core.queries.transactionId(cfg.balance.projectId);
  })
  .then(function (transId) {
    queries = details.balances.map(function (balance) {
      var params, uid = uuid();
      ids.push(uid);

      sql =
        'INSERT INTO posting_journal (' +
          'uuid,project_id, fiscal_year_id, period_id, trans_id, trans_date, ' +
          'description, account_id, credit, debit, credit_equiv, debit_equiv, ' +
          'currency_id, origin_id, user_id) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';

      params = [
        uid, balance.projectId, cfg.fiscalYearId, cfg.periodId, transId, cfg.dateStart,
        cfg.description, balance.accountId, balance.credit, balance.debit,
        balance.credit / rate, balance.debit / rate, balance.currencyId, cfg.originId,
        userId
      ];
      return db.exec(sql, params);
    });

    return q.all(queries);
  })
  .then(function (res) {
    cb(null, res);
  })
  .catch(function (err) {
    sql = ids.length > 0 ? 'DELETE FROM posting_journal WHERE posting_journal.uuid IN (?);' : 'SELECT 1 + 1;';
    db.exec(sql, [ids])
    .finally(function () {
      cb(err);
    });
  })
  .done();
}
