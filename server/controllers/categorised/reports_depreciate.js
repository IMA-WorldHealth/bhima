var db        = require('./../../lib/db');
var sanitize  = require('./../../lib/sanitize');

exports.listDistinctInventory = function (req, res, next) {
  var sql = 'SELECT DISTINCT inventory.code, inventory.text, stock.inventory_uuid FROM stock' +
          ' JOIN inventory ON stock.inventory_uuid=inventory.uuid';

  db.exec(sql)
  .then(function (result) {
    res.send(result);
  })
  .catch(function (err) { next(err); })
  .done();
};

exports.buildPayrollReport = function (req, res, next) {
  var sql = 'SELECT paiement.uuid, paiement.employee_id, paiement.paiement_period_id, paiement.currency_id,' +
          ' paiement.net_before_tax, paiement.net_after_tax, paiement.net_after_tax, paiement.net_salary,' +
          ' employee.code, employee.prenom, employee.name, employee.postnom, employee.dob, employee.sexe' +
          ' FROM paiement' +
          ' JOIN employee ON employee.id = paiement.employee_id' +
          ' WHERE paiement_period_id = ' + sanitize.escape(req.query.period_id);

  db.exec(sql)
  .then(function (result) {
    res.send(result);
  })
  .catch(function (err) { next(err); })
  .done();
};
