var db = require('./../../lib/db');
var util = require('./../../lib/util');
var sanitize = require('./../../lib/sanitize');

exports.list = function (req, res, next) {
  var sql =
    'SELECT ' +
    'employee.id, employee.code AS code_employee, employee.prenom, employee.name, ' +
    'employee.postnom, employee.sexe, employee.dob, employee.date_embauche, employee.service_id, ' +
    'employee.nb_spouse, employee.nb_enfant, employee.grade_id, employee.locked, grade.text, grade.basic_salary, ' +
    'fonction.id AS fonction_id, fonction.fonction_txt, ' +
    'employee.phone, employee.email, employee.adresse, employee.bank, employee.bank_account, employee.daily_salary, employee.location_id, ' +
    'grade.code AS code_grade, debitor.uuid as debitor_uuid, debitor.text AS debitor_text,debitor.group_uuid as debitor_group_uuid, ' +
    'creditor.uuid as creditor_uuid, creditor.text AS creditor_text, creditor.group_uuid as creditor_group_uuid, creditor_group.account_id ' +
    'FROM employee ' +
    ' JOIN grade ON employee.grade_id = grade.uuid ' +
    ' JOIN fonction ON employee.fonction_id = fonction.id ' +
    ' JOIN debitor ON employee.debitor_uuid = debitor.uuid ' +
    ' JOIN creditor ON employee.creditor_uuid = creditor.uuid ' +
    ' JOIN creditor_group ON creditor_group.uuid = creditor.group_uuid ' +
    ' ORDER BY employee.name ASC, employee.postnom ASC, employee.prenom ASC';

  db.exec(sql)
  .then(function (result) {
    res.send(result);
  })
  .catch(function (err) { next(err); })
  .done();
};

exports.listHolidays = function (req, res, next) {
  var pp = JSON.parse(req.params.pp);
  var sql =
    'SELECT hollyday.id, hollyday.label, hollyday.dateFrom, hollyday.percentage, hollyday.dateTo ' +
    'FROM hollyday WHERE ' +
    '((hollyday.dateFrom>=' + sanitize.escape(util.toMysqlDate(pp.dateFrom)) + ' AND ' +
    'hollyday.dateFrom<=' + sanitize.escape(util.toMysqlDate(pp.dateTo)) + ') OR ' +
    '(hollyday.dateTo>=' + sanitize.escape(util.toMysqlDate(pp.dateFrom)) + ' AND ' +
    'hollyday.dateTo<=' + sanitize.escape(util.toMysqlDate(pp.dateTo)) + ') OR ' +
    '(hollyday.dateFrom<=' + sanitize.escape(util.toMysqlDate(pp.dateFrom)) + ' AND ' +
    'hollyday.dateTo>=' + sanitize.escape(util.toMysqlDate(pp.dateTo)) + ')) AND ' +
    'hollyday.employee_id=' + sanitize.escape(req.params.employee_id) + ';';

  db.exec(sql)
  .then(function (result) {
    res.send(result);
  })
  .catch(function (err) { next(err); })
  .done();
};

exports.checkHoliday = function (req, res, next) {
  var sql = 'SELECT id, employee_id, label, dateTo, percentage, dateFrom FROM hollyday WHERE employee_id = "'+ req.query.employee_id +'"' +
          ' AND ((dateFrom >= "' + req.query.dateFrom +'") OR (dateTo >= "' + req.query.dateFrom + '") OR (dateFrom >= "'+ req.query.dateTo +'")' +
          ' OR (dateTo >= "' + req.query.dateTo + '"))' +
          ' AND ((dateFrom <= "' + req.query.dateFrom +'") OR (dateTo <= "' + req.query.dateFrom + '") OR (dateFrom <= "'+ req.query.dateTo +'")' +
          ' OR (dateTo <= "' + req.query.dateTo + '"))';
  if (req.query.line !== ''){
    sql += ' AND id <> "' + req.query.line + '"';
  }

  db.exec(sql)
  .then(function (result) {
    res.send(result);
  })
  .catch(function (err) { next(err); })
  .done();
};

exports.checkOffday = function (req, res, next) {
  var sql ='SELECT * FROM offday WHERE date = "' + req.query.date + '" AND id <> "' + req.query.id +'"';
  db.exec(sql)
  .then(function (result) {
    res.send(result);
  })
  .catch(function (err) { next(err); })
  .done();
};
