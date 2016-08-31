var db        = require('./../../lib/db');

exports.listPaiementData = function (req, res, next) {
  var sql = 'SELECT paiement.uuid, paiement.employee_id, paiement.paiement_period_id, paiement_period.dateFrom,' +
          ' paiement_period.dateTo, paiement.currency_id,' +
          ' paiement.net_before_tax, paiement.net_after_tax, paiement.net_after_tax, paiement.net_salary,' +
          ' paiement.working_day, paiement.paiement_date, employee.code, employee.display_name,' +
          ' employee.dob, employee.sexe, employee.nb_spouse, employee.nb_enfant,' +
          ' employee.grade_id, grade.text, grade.code AS \'codegrade\', grade.basic_salary, exchange_rate.rate,' +
          ' exchange_rate.enterprise_id, enterprise.enterprise_currency_id' +
          ' FROM paiement' +
          ' JOIN employee ON employee.id = paiement.employee_id' +
          ' JOIN grade ON grade.uuid = employee.grade_id ' +
          ' JOIN paiement_period ON paiement_period.id = paiement.paiement_period_id' +
          ' JOIN exchange_rate ON exchange_rate.date = paiement.paiement_date' +
          ' JOIN enterprise ON enterprise.id = exchange_rate.enterprise_id' +
          ' WHERE paiement.uuid = ' + db.escape(req.query.invoiceId);

  db.exec(sql)
  .then(function (result) {
    res.send(result);
  })
  .catch(function (err) { next(err); })
  .done();
};

exports.listPaymentByEmployee = function (req, res, next) {
  var sql = 'SELECT e.id, e.code, e.display_name, e.creditor_uuid, p.uuid as paiement_uuid, p.currency_id, t.label, t.abbr, t.four_account_id AS \'other_account\', z.tax_id, z.value, z.posted' +
          ' FROM employee e ' +
          ' JOIN paiement p ON e.id=p.employee_id ' +
          ' JOIN tax_paiement z ON z.paiement_uuid=p.uuid ' +
          ' JOIN tax t ON t.id=z.tax_id ' +
          ' WHERE p.paiement_period_id=' + db.escape(req.params.id) + ' AND t.is_employee=1 ' +
          ' ORDER BY e.display_name ASC';

  db.exec(sql)
  .then(function (result) {
    res.send(result);
  })
  .catch(function (err) { next(err); })
  .done();
};

exports.listPaymentByEnterprise = function (req, res, next) {
  var sql = 'SELECT e.id, e.code, e.display_name, e.creditor_uuid, p.uuid as paiement_uuid, p.currency_id, t.label, t.abbr, t.four_account_id AS \'other_account\', z.tax_id, z.value, z.posted' +
          ' FROM employee e ' +
          ' JOIN paiement p ON e.id=p.employee_id ' +
          ' JOIN tax_paiement z ON z.paiement_uuid=p.uuid ' +
          ' JOIN tax t ON t.id=z.tax_id ' +
          ' WHERE p.paiement_period_id=' + db.escape(req.params.employee_id) + ' AND t.is_employee=0 ' +
          ' ORDER BY e.display_name ASC';

  db.exec(sql)
  .then(function (result) {
    res.send(result);
  })
  .catch(function (err) { next(err); })
  .done();
};


exports.setCotisationPayment = function (req, res, next) {
  var sql = 'UPDATE cotisation_paiement SET posted=1' +
          ' WHERE cotisation_paiement.paiement_uuid=' + db.escape(req.body.paiement_uuid) + ' AND cotisation_paiement.cotisation_id=' + db.escape(req.body.cotisation_id);

  db.exec(sql)
  .then(function (result) {
    res.send(result);
  })
  .catch(function (err) { next(err); })
  .done();
};

exports.listEmployeeCotisationPayments = function (req, res, next) {
  var sql = 'SELECT e.id, e.code, e.display_name, e.creditor_uuid, p.uuid as paiement_uuid, p.currency_id, t.label, t.abbr, t.four_account_id AS \'other_account\', z.cotisation_id, z.value, z.posted' +
          ' FROM employee e ' +
          ' JOIN paiement p ON e.id=p.employee_id ' +
          ' JOIN cotisation_paiement z ON z.paiement_uuid=p.uuid ' +
          ' JOIN cotisation t ON t.id=z.cotisation_id ' +
          ' WHERE p.paiement_period_id=' + db.escape(req.params.id) + ' ORDER BY e.display_name ASC';

  db.exec(sql)
  .then(function (result) {
    res.send(result);
  })
  .catch(function (err) { next(err); })
  .done();
};

exports.listTaxCurrency = function (req, res, next) {
  var sql = 'SELECT t.id,t.taux,t.tranche_annuelle_debut,t.tranche_annuelle_fin,t.tranche_mensuelle_debut,t.tranche_mensuelle_fin,t.ecart_annuel,t.ecart_mensuel,t.impot_annuel,t.impot_mensuel,t.cumul_annuel,t.cumul_mensuel,t.currency_id,c.symbol FROM taxe_ipr t, currency c WHERE t.currency_id = c.id';
  db.exec(sql)
  .then(function (result) {
    res.send(result);
  })
  .catch(function (err) { next(err); })
  .done();
};
