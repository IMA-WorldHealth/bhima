var q        = require('q'),
    db       = require('../../../lib/db'),
    uuid     = require('../../../lib/guid'),
    validate = require('../../../lib/validate')(),
    core     = require('./core');

exports.invoice = invoice;
exports.promiseCotisation = promiseCotisation;
exports.promisePayment = promisePayment;
exports.promiseTax = promiseTax;
exports.taxPayment = taxPayment;
exports.advancePayment = advancePayment;

// invoice an employee
function invoice(id, userId, cb) {
  // posting group invoice requests
  var sql, references = {}, cfg = {};

  sql =
    'SELECT employee_invoice.uuid, employee_invoice.project_id, project.enterprise_id, employee_invoice.debtor_uuid,  ' +
      'employee_invoice.note, employee_invoice.authorized_by, employee_invoice.date, ' +
      'employee_invoice.total, employee_invoice_item.invoice_uuid, employee_invoice_item.cost, ' +
      'employee_invoice_item.uuid as gid ' +
    'FROM employee_invoice JOIN employee_invoice_item JOIN sale JOIN project ON ' +
      'employee_invoice.uuid = employee_invoice_item.payment_uuid AND ' +
      'employee_invoice_item.invoice_uuid = sale.uuid AND ' +
      'project.id = employee_invoice.project_id ' +
    'WHERE employee_invoice.uuid = ?;';

  db.exec(sql, [id])
  .then(function (results) {
    if (results.length === 0) {
      throw new Error('No record found');
    }
    references = results;
    cfg.enterprise_id = results[0].enterprise_id;
    cfg.project_id = results[0].project_id;
    cfg.date = results[0].date;
    return core.checks.validPeriod(cfg.enterprise_id, cfg.date);
  })
  .then(function () {
    var costPositive = references.every(function (row) {
      return validate.isPositive(row.cost);
    });

    if (!costPositive) {
      throw new Error('Negative cost detected for invoice id: ' + id);
    }

    var sum = references.reduce(function (a,b) { return a + b.cost; }, 0);
    var totalEquality = validate.isEqual(references[0].total, sum);

    if (!totalEquality) {
      throw new Error('Individual costs do not match total cost for invoice id: ' + id);
    }

    return core.queries.origin('employee_invoice');
  })
  .then(function (originId) {
    cfg.originId = originId;
    return core.queries.period(cfg.date);
  })
  .then(function (periodObject) {
    cfg.period_id = periodObject.id;
    cfg.fiscal_year_id = periodObject.fiscal_year_id;

    return q.all(references.map(function (row) {
      return core.queries.transactionId(cfg.project_id)
      .then(function  (transId) {
        var debsql, credsql, params;

        cfg.description = transId.substring(0,4) + '_CHARGE_TAKEN/' + new Date().toISOString().slice(0, 10).toString();

        debsql =
          'INSERT INTO posting_journal (' +
            'project_id, uuid, fiscal_year_id, period_id, trans_id, trans_date, ' +
            'description, account_id, debit, credit, debit_equiv, credit_equiv, ' +
            'currency_id, deb_cred_uuid, deb_cred_type, inv_po_id, origin_id, user_id) ' +
          'SELECT employee_invoice.project_id, ?, ?, ?, ?, ?, ?, ' +
            'creditor_group.account_id, employee_invoice_item.cost, 0, ' +
            'employee_invoice_item.cost, 0, enterprise.currency_id,  ' +
            'employee_invoice.creditor_uuid, \'C\', employee_invoice_item.invoice_uuid, ?, ? ' +
          'FROM employee_invoice JOIN employee_invoice_item JOIN debtor JOIN creditor JOIN debtor_group JOIN creditor_group JOIN sale JOIN project JOIN enterprise ON ' +
          '  employee_invoice.uuid = employee_invoice_item.payment_uuid AND ' +
          '  employee_invoice.debtor_uuid = debtor.uuid  AND ' +
          '  employee_invoice.creditor_uuid = creditor.uuid  AND ' +
          '  debtor.group_uuid = debtor_group.uuid AND ' +
          '  creditor.group_uuid = creditor_group.uuid AND ' +
          '  employee_invoice_item.invoice_uuid = sale.uuid AND ' +
          '  employee_invoice.project_id = project.id AND ' +
          '  project.enterprise_id = enterprise.id ' +
          'WHERE employee_invoice_item.uuid = ?;';

        params = [
          uuid(), cfg.fiscal_year_id, cfg.period_id, transId, new Date(),
          cfg.description, cfg.originId, userId, row.gid
        ];

        // execute the debit query
        debsql = db.exec(debsql, params);

        credsql =
          'INSERT INTO posting_journal (' +
            'project_id, uuid, fiscal_year_id, period_id, trans_id, trans_date, ' +
            'description, account_id, debit, credit, debit_equiv, credit_equiv, ' +
            'currency_id, deb_cred_uuid, deb_cred_type, inv_po_id, origin_id, user_id) ' +
          'SELECT employee_invoice.project_id, ?, ?, ?, ?, ?, ?, ' +
            'debtor_group.account_id, 0, employee_invoice_item.cost, ' +
            '0, employee_invoice_item.cost, enterprise.currency_id,  ' +
            'employee_invoice.debtor_uuid, \'D\', employee_invoice_item.invoice_uuid, ?, ? ' +
          'FROM employee_invoice JOIN employee_invoice_item JOIN debtor JOIN debtor_group JOIN sale JOIN project JOIN enterprise ON ' +
            'employee_invoice.uuid = employee_invoice_item.payment_uuid AND ' +
            'employee_invoice.debtor_uuid = debtor.uuid  AND ' +
            'debtor.group_uuid = debtor_group.uuid AND ' +
            'employee_invoice_item.invoice_uuid = sale.uuid AND ' +
            'employee_invoice.project_id = project.id AND ' +
            'project.enterprise_id = enterprise.id ' +
          'WHERE employee_invoice_item.uuid = ?;';

        params = [
          uuid(), cfg.fiscal_year_id, cfg.period_id, transId, new Date(),
          cfg.description, cfg.originId, userId, row.gid
        ];

        // execute the credit query
        credsql = db.exec(credsql, params);

        return q.all([debsql, credsql]);
      });
    }));
  })
  .then(function (res) {
    cb(null, res);
  })
  .catch(function (err) {
    cb(err);
  })
  .done();
}

// Cette fonction ecrit dans le journal la promesse d'un paiment de cotisation
// mais la cotisation n'est pas encore paye effectivement.
function promiseCotisation(id, userId, data, cb) {
  var sql, rate, state = {}, reference, cfg = {}, references;

  sql =
    'SELECT cotisation.label, cotisation.abbr, cotisation.is_employee, cotisation.four_account_id, ' +
      'cotisation.six_account_id, paiement.employee_id, paiement.paiement_date, paiement.currency_id, ' +
      'cotisation_paiement.value ' +
    'FROM cotisation JOIN paiement JOIN cotisation_paiement ON ' +
      'cotisation.id = cotisation_paiement.cotisation_id AND ' +
      'paiement.uuid = cotisation_paiement.paiement_uuid ' +
    'WHERE paiement.uuid = ?;';

  db.exec(sql, [data.paiement_uuid])
  .then(function (records) {
    if (records.length === 0) { throw new Error('No payment by that uuid.'); }

    reference = records[0];
    references = records;

    sql =
    'SELECT creditor_group.account_id, creditor.uuid AS creditor_uuid ' +
    'FROM paiement ' +
      'JOIN employee ON employee.id=paiement.employee_id ' +
      'JOIN creditor ON creditor.uuid=employee.creditor_uuid ' +
      'JOIN creditor_group ON creditor_group.uuid=creditor.group_uuid ' +
    'WHERE paiement.uuid = ?;';

    return [
      core.queries.origin('cotisation_engagement'),
      core.queries.period(new Date()),
      core.queries.exchangeRate(new Date()),
      db.exec(sql, [data.paiement_uuid])
    ];
  })
  .spread(function (originId, periodObject, store, res) {
    cfg.originId = originId;
    cfg.periodId = periodObject.id;
    cfg.fiscalYearId = periodObject.fiscal_year_id;
    cfg.account_id = res[0].account_id;
    cfg.creditor_uuid = res[0].creditor_uuid;
    cfg.store = store;
    rate = cfg.store.get(reference.currency_id).rate;
    return core.queries.transactionId(data.project_id);
  })

  // run the debit query
  .then(function (transId) {
    cfg.transId = transId;
    cfg.description =  transId.substring(0,4) + '_EngagementCotisation/' + new Date().toISOString().slice(0, 10).toString();

    return q.all(references.map(function (reference) {
      var account, params, debsql;

      cfg.note = cfg.description + '/' + references.label + '/' + reference.abbr;

      if (!reference.six_account_id) {

        account = cfg.account_id;

        debsql =
          'INSERT INTO posting_journal ' +
          '(uuid,project_id, fiscal_year_id, period_id, trans_id, trans_date, ' +
          'description, account_id, credit, debit, credit_equiv, debit_equiv, ' +
          'currency_id, deb_cred_uuid, deb_cred_type, inv_po_id, origin_id, user_id) ' +
          'VALUES (?);';

        params = [
          uuid(), data.project_id, cfg.fiscalYearId, cfg.periodId, cfg.transId, new Date(),
          cfg.note, account, 0, (reference.value).toFixed(4), 0, (reference.value / rate).toFixed(4),
          reference.currency_id, cfg.creditor_uuid, 'C', data.paiement_uuid, cfg.originId, userId
        ];

      } else {
        account = reference.six_account_id;
        debsql =
          'INSERT INTO posting_journal (' +
            'uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date, ' +
            'description, account_id, credit, debit, credit_equiv, debit_equiv, ' +
            'currency_id, deb_cred_uuid, deb_cred_type, inv_po_id, origin_id, user_id) ' +
          'VALUES (?);';

        params = [
          uuid(), data.project_id, cfg.fiscalYearId, cfg.periodId, cfg.transId,
          new Date(), cfg.note, account, 0, (reference.value).toFixed(4), 0,
          (reference.value / rate).toFixed(4), reference.currency_id, null, null,
          data.paiement_uuid, cfg.originId, userId
        ];
      }

      return db.exec(debsql, [params]);
    }));
  })
  .then(function () {
    return q.all(references.map(function (reference) {
      var credsql, params;

      cfg.note = cfg.description + '/' + reference.label + '/' + reference.abbr;

      credsql =
        'INSERT INTO posting_journal (' +
          'uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date, ' +
          'description, account_id, credit, debit, credit_equiv, debit_equiv, ' +
          'currency_id, deb_cred_uuid, deb_cred_type, inv_po_id, origin_id, user_id ) ' +
        'VALUES (?);';

      params = [
        uuid(), data.project_id, cfg.fiscalYearId, cfg.periodId, cfg.transId, new Date(),
         cfg.note, reference.four_account_id, reference.value.toFixed(4), 0,
         (reference.value / rate).toFixed(4), 0, reference.currency_id, cfg.creditor_uuid,
         null, data.paiement_uuid, cfg.originId, userId
      ];

      return db.exec(credsql, [params]);
    }));
  })
  .then(function (res) {
    cb(null, res);
  })
  .catch(function (err) {
    cb(err);
  })
  .done();
}

// USED IN MULTIPLE PAYROLL
// Cette fonction ecrit dans le journal la promesse d'un paiment de salaire
// mais le salaire n'est pas encore paye effectivement.
function promisePayment(id, userId, data, cb) {
  var sql, rate, state = {}, reference, params, cfg = {};

  sql =
    'SELECT config_accounting.account_id, paiement.uuid, paiement.employee_id, paiement.net_salary, '+
      'paiement.currency_id, ((paiement.net_before_tax - paiement.net_after_tax) + paiement.net_salary) AS gros_salary ' +
    'FROM paiement JOIN paiement_period JOIN config_accounting ON ' +
      'paiement_period.id = paiement.paiement_period_id AND ' +
      'config_accounting.id = paiement_period.config_accounting_id ' +
    'WHERE paiement.uuid = ?;';

  db.exec(sql, [data.paiement_uuid])
  .then(function (records) {
    if (records.length === 0) { throw new Error('Could not find a payment with uuid:' + data.paiement_uuid); }

    reference = records[0];

    sql =
      'SELECT creditor_group.account_id, creditor.uuid AS creditor_uuid ' +
      'FROM paiement ' +
        'JOIN employee ON employee.id=paiement.employee_id ' +
        'JOIN creditor ON creditor.uuid=employee.creditor_uuid ' +
        'JOIN creditor_group ON creditor_group.uuid=creditor.group_uuid ' +
      'WHERE paiement.uuid = ?;';

    return q([
      core.queries.origin('payroll'),
      core.queries.period(new Date()),
      core.queries.exchangeRate(new Date()),
      db.exec(sql, [reference.uuid])
    ]);
  })
  .spread(function (originId, periodObject, store, res) {
    cfg.originId = originId;
    cfg.periodId = periodObject.id;
    cfg.fiscalYearId = periodObject.fiscal_year_id;
    cfg.account_id = res[0].account_id;
    cfg.creditor_uuid = res[0].creditor_uuid;
    cfg.store = store;
    rate = cfg.store.get(reference.currency_id).rate;
    return core.queries.transactionId(data.project_id);
  })

  // debit sql
  .then(function (transId) {
    cfg.transId = transId;
    cfg.description =  transId.substring(0,4) + '_EngagementPay/' + new Date().toISOString().slice(0, 10).toString();

    sql =
      'INSERT INTO posting_journal (' +
      'uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date, ' +
      'description, account_id, credit, debit, credit_equiv, debit_equiv, ' +
      'currency_id, deb_cred_uuid, deb_cred_type, inv_po_id, origin_id, user_id) ' +
      'VALUES (?);';

    params =  [
      uuid(), data.project_id, cfg.fiscalYearId, cfg.periodId, cfg.transId, new Date(),
      cfg.description, reference.account_id, 0, reference.gros_salary, 0, reference.gros_salary / rate,
      reference.currency_id, null, null, data.paiement_uuid, cfg.originId, userId
    ];

    return db.exec(sql, [params]);
  })

  // credit sql
  .then(function () {
    sql =
      'INSERT INTO posting_journal (' +
        'uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date, ' +
        'description, account_id, credit, debit, credit_equiv, debit_equiv, ' +
        'currency_id, deb_cred_uuid, deb_cred_type, inv_po_id, origin_id, user_id) ' +
      'VALUES (?);';

    params = [
      uuid(), data.project_id, cfg.fiscalYearId, cfg.periodId, cfg.transId, new Date(),
      cfg.description, cfg.account_id, reference.gros_salary, 0, reference.gros_salary / rate,
      0, reference.currency_id, cfg.creditor_uuid, 'C', data.paiement_uuid, cfg.originId, userId
    ];

    return db.exec(sql, [params]);
  })
  .then(function (res) {
    return cb(null, res);
  })
  .catch(cb)
  .done();
}

/* Promise Tax
 *
*/
// Cette fonction ecrit dans le journal la promesse d'un paiment de cotisation
// mais la cotisation n'est pas encore payE effectivement.
function promiseTax(id, userId, data, cb) {
  'use strict';

  var sql, queries, rate, reference, cfg = {}, references;

  sql =
    'SELECT tax.label, tax.abbr, tax.is_employee, tax.four_account_id, tax.six_account_id, ' +
      'paiement.employee_id, paiement.paiement_date, paiement.currency_id, tax_paiement.value ' +
    'FROM tax JOIN paiement JOIN tax_paiement ON ' +
      'tax.id = tax_paiement.tax_id AND paiement.uuid = tax_paiement.paiement_uuid ' +
    'WHERE paiement.uuid = ?;';

  db.exec(sql, [data.paiement_uuid])
  .then(function (records) {
    if (records.length === 0) {
      throw new Error('Could not find paiement with uuid:' + data.paiement_uuid);
    }

    reference = records[0];
    references = records;

    sql =
      'SELECT creditor_group.account_id, creditor.uuid AS creditor_uuid ' +
      'FROM paiement ' +
      'JOIN employee ON employee.id = paiement.employee_id ' +
      'JOIN creditor ON creditor.uuid = employee.creditor_uuid ' +
      'JOIN creditor_group ON creditor_group.uuid = creditor.group_uuid ' +
      'WHERE paiement.uuid = ?;';

    return [
      core.queries.origin('tax_engagement'),
      core.queries.period(new Date()),
      core.queries.exchangeRate(new Date()), db.exec(sql, [data.paiement_uuid])
    ];
  })

  // FIXME/TODO -- what is res?  Descriptive naming
  .spread(function (originId, periodObject, store, res) {
    cfg.originId = originId;
    cfg.periodId = periodObject.id;
    cfg.fiscalYearId = periodObject.fiscal_year_id;
    cfg.account_id = res[0].account_id;
    cfg.creditor_uuid = res[0].creditor_uuid;
    rate = store.get(reference.currency_id).rate;
    return core.queries.transactionId(data.project_id);
  })
  .then(function (transId) {
    cfg.transId = transId;
    cfg.description =  transId.substring(0,4) + '_EngagementTax/' + new Date().toISOString().slice(0, 10).toString();

    queries = references.map(function (reference) {
      var account, params;
      cfg.note = cfg.description + '/' + reference.label + '/' + reference.abbr;

      if (!reference.six_account_id) {
        account = cfg.account_id;

        sql =
          'INSERT INTO posting_journal (' +
            'uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date, ' +
            'description, account_id, credit, debit, credit_equiv, debit_equiv, ' +
            'currency_id, deb_cred_uuid, deb_cred_type, inv_po_id, origin_id, user_id ' +
          'VALUES (?);';

        params = [
          uuid(), data.project_id, cfg.fiscalYearId, cfg.periodId, cfg.transId, new Date(),
          cfg.note, account, 0, reference.value, 0, reference.value / rate, reference.currency_id,
          cfg.creditor_uuid, 'C', data.paiement_uuid, cfg.originId, userId
        ];
      } else {
        account = reference.six_account_id;

        sql =
          'INSERT INTO posting_journal (' +
          'uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date, ' +
          'description, account_id, credit, debit, credit_equiv, debit_equiv, ' +
          'currency_id, deb_cred_uuid, deb_cred_type, inv_po_id, origin_id, user_id) ' +
          'VALUES (?);';
        params = [
          uuid(), data.project_id, cfg.fiscalYearId, cfg.periodId, cfg.transId, new Date(),
          cfg.note, account, 0, reference.value, 0, reference.value / rate, reference.currency_id,
          null, null, data.paiement_uuid, cfg.originId, userId
        ];
      }

      return db.exec(sql, [params]);
    });

    return q.all(queries);
  })
  .then(function () {

    queries = references.map(function (reference) {
      var params;

      cfg.note = cfg.description + '/' + reference.label + '/' + reference.abbr;
      sql =
        'INSERT INTO posting_journal (' +
          'uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date, ' +
          'description, account_id, credit, debit, credit_equiv, debit_equiv, ' +
          'currency_id, deb_cred_uuid, deb_cred_type, inv_po_id, origin_id, user_id ) ' +
        'VALUES (?);';

      params = [
        uuid(), data.project_id, cfg.fiscalYearId, cfg.periodId, cfg.transId, new Date(),
        cfg.note, reference.four_account_id, reference.value, 0, reference.value / rate, 0,
        reference.currency_id, cfg.creditor_uuid, null, data.paiement_uuid, cfg.originId,
        userId
      ];

      return db.exec(sql, [params]);
    });
    return q.all(queries);
  })
  .then(function (res) {
    return cb(null, res);
  })
  .catch(cb)
  .done();
}

function taxPayment(id, userId, details, cb) {
  var sql, params, rate, reference, cfg = {};

  sql =
    'SELECT primary_cash_item.primary_cash_uuid, reference, project_id, date, deb_cred_uuid, deb_cred_type, currency_id, ' +
      'account_id, cost, user_id, description, cash_box_id, origin_id, primary_cash_item.debit, ' +
      'primary_cash_item.credit, primary_cash_item.inv_po_id, primary_cash_item.document_uuid ' +
    'FROM primary_cash JOIN primary_cash_item ON primary_cash.uuid = primary_cash_item.primary_cash_uuid ' +
    'WHERE primary_cash.uuid = ?;';

  db.exec(sql, [id])
  .then(function (records) {
    if (records.length === 0) {
      throw new Error('Could not find primary cash with uuid:' + id);
    }
    reference = records[0];

    var sql2 =
      'SELECT creditor_group.account_id, creditor.uuid FROM primary_cash ' +
      'JOIN creditor ON creditor.uuid = primary_cash.deb_cred_uuid ' +
      'JOIN creditor_group ON creditor_group.uuid = creditor.group_uuid ' +
      'WHERE primary_cash.deb_cred_uuid = ?;' + ';';


    var sql3 =
      'SELECT cash_box_account_currency.account_id ' +
      'FROM cash_box_account_currency ' +
      'WHERE cash_box_account_currency.currency_id = ? ' +
      'AND cash_box_account_currency.cash_box_id = ?;';

    return [
      core.queries.origin('tax_payment'),
      core.queries.period(new Date()),
      core.queries.exchangeRate(new Date()),
      db.exec(sql2, [reference.deb_cred_uuid]),
      db.exec(sql3, [reference.currency_id, reference.cash_box_id])
    ];
  })
  .spread(function (originId, periodObject, store, res, res2) {
    cfg.originId = originId;
    cfg.periodId = periodObject.id;
    cfg.fiscalYearId = periodObject.fiscal_year_id;
    cfg.employee_account_id = res[0].account_id;
    cfg.creditor_uuid = res[0].uuid;
    cfg.store = store;
    cfg.account_cashbox = res2[0].account_id;

    rate = cfg.store.get(reference.currency_id).rate;
    return core.queries.transactionId(reference.project_id);
  })
  .then(function (transId) {
    cfg.transId = transId;
    cfg.description =  transId.substring(0,4) + '_Tax Payment/' + new Date().toISOString().slice(0, 10).toString();

    sql =
      'INSERT INTO posting_journal (' +
        'uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date, ' +
        'description, account_id, credit, debit, credit_equiv, debit_equiv, ' +
        'currency_id, deb_cred_uuid, deb_cred_type, inv_po_id, origin_id, user_id) ' +
      'VALUES (?);';

    params = [
      uuid(), reference.project_id, cfg.fiscalYearId, cfg.periodId, cfg.transId, new Date(), cfg.description,
      reference.account_id, 0, reference.cost, 0, reference.cost / rate, reference.currency_id, cfg.creditor_uuid,
      'C', reference.document_uuid, cfg.originId, userId
    ];

    return db.exec(sql, [params]);
  })
  .then(function () {
    sql =
      'INSERT INTO posting_journal (' +
        'uuid,project_id, fiscal_year_id, period_id, trans_id, trans_date, ' +
        'description, account_id, credit, debit, credit_equiv, debit_equiv, ' +
        'currency_id, deb_cred_uuid, deb_cred_type, inv_po_id, origin_id, user_id ) ' +
      'VALUES (?);';

    params = [
      uuid(), reference.project_id, cfg.fiscalYearId, cfg.periodId, cfg.transId, new Date(), cfg.description,
      cfg.account_cashbox, reference.cost, 0, reference.cost / rate, 0, reference.currency_id, null, null,
      reference.document_uuid, cfg.originId, userId
    ];

    return db.exec(sql, [params]);
  })
  .then(function (res){
    return cb(null, res);
  })
  .catch(cb)
  .done();


  function credit () {
  }
}

/*  Payment of Advances
 *
 *
*/
function advancePayment(id, userId, cb) {
  'use strict';

  var sql, rate, params, reference, cfg = {};

  sql =
    'SELECT rubric_paiement.id, rubric_paiement.rubric_id, rubric_paiement.paiement_uuid, rubric_paiement.value, ' +
      'rubric.is_advance, paiement.currency_id, paiement.employee_id, employee.prenom, employee.name, employee.creditor_uuid, ' +
      'creditor_group.account_id AS account_creditor, config_accounting.account_id AS account_paiement, primary_cash.project_id ' +
    'FROM rubric_paiement ' +
    'JOIN rubric ON rubric.id = rubric_paiement.rubric_id ' +
    'JOIN paiement ON paiement.uuid = rubric_paiement.paiement_uuid ' +
    'JOIN paiement_period ON paiement_period.id = paiement_period.config_accounting_id ' +
    'JOIN config_accounting ON config_accounting.id = paiement_period.config_accounting_id ' +
    'JOIN employee ON employee.id = paiement.employee_id ' +
    'JOIN creditor ON creditor.uuid= employee.creditor_uuid ' +
    'JOIN creditor_group ON creditor_group.uuid=creditor.group_uuid ' +
    'JOIN primary_cash_item ON primary_cash_item.inv_po_id = rubric_paiement.paiement_uuid ' +
    'JOIN primary_cash ON primary_cash.uuid = primary_cash_item.primary_cash_uuid ' +
    'WHERE rubric_paiement.paiement_uuid = ? ' +
      'AND rubric.is_advance = 1;';


  db.exec(sql, [id])
  .then(function (records) {
    if (records.length === 0) {
      throw new Error('No payment record with uuid:' + id);
    }

    reference = records[0];

    return [
      core.queries.origin('salary_advance'),
      core.queries.period(new Date()),
      core.queries.exchangeRate(new Date())
    ];
  })
  .spread(function (originId, periodObject, store) {
    cfg.originId = originId;
    cfg.periodId = periodObject.id;
    cfg.fiscalYearId = periodObject.fiscal_year_id;
    cfg.store = store;
    rate = cfg.store.get(reference.currency_id).rate;

    return core.queries.transactionId(reference.project_id);
  })
  .then(function (transId) {
    cfg.transId = transId;
    cfg.description =  transId.substring(0,4) + '_Pay Advance salary/' + new Date().toISOString().slice(0, 10).toString();

    // TODO - Why does this depend on a value?  What error messages
    // are sent if this criteria is not met?
    if (reference.value > 0) {
      sql =
        'INSERT INTO posting_journal (' +
          'uuid,project_id, fiscal_year_id, period_id, trans_id, trans_date, ' +
          'description, account_id, credit, debit, credit_equiv, debit_equiv, ' +
          'currency_id, deb_cred_uuid, deb_cred_type, inv_po_id, origin_id, user_id) ' +
        'VALUES (?);';

      params = [
        uuid(), reference.project_id, cfg.fiscalYearId, cfg.periodId, cfg.transId, new Date(), cfg.description,
        reference.account_creditor, reference.value, 0, reference.value / rate, 0, reference.currency_id,
        reference.creditor_uuid, 'C', reference.paiement_uuid, cfg.originId, userId
      ];

      return db.exec(sql, [params]);
    }
  })
  .then(function () {
    if (reference.value > 0) {
      sql =
        'INSERT INTO posting_journal (' +
          'uuid,project_id, fiscal_year_id, period_id, trans_id, trans_date, ' +
          'description, account_id, credit, debit, credit_equiv, debit_equiv, ' +
          'currency_id, deb_cred_uuid, deb_cred_type, inv_po_id, origin_id, user_id) ' +
        'VALUES (?);';

      params = [
        uuid(), reference.project_id, cfg.fiscalYearId, cfg.periodId, cfg.transId, new Date(), cfg.description,
        reference.account_paiement, 0, reference.value, 0, reference.value / rate,
        reference.currency_id, null, null, reference.paiement_uuid, cfg.originId, userId
      ];

      return db.exec(sql, [params]);
    }
  })
  .then(function (res){
    return cb(null, res);
  })
  .catch(cb)
  .done();
}
