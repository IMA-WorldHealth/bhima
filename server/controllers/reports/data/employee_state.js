// reports_proposed/data/balance_sheet.js
// Collects and aggregates data for the enterprise balance sheet
var q       = require('q');
var db      = require('../../../lib/db');
var numeral = require('numeral');
var sanitize = require('../../../lib/sanitize');

var formatDollar = '$0,0.00';
var employeeStateDate = new Date();

exports.compile = function (options) {
  'use strict';

  var i18nEmployeeState = options.language == 'fr' ? require('../lang/fr.json').EMPLOYEE_STATE : require('../lang/en.json').EMPLOYEE_STATE;

  var deferred = q.defer();
  var context = {};
  context.reportDate = employeeStateDate.toDateString();
  context.enterpriseName = options.enterprise.abbr;
  context.title = i18nEmployeeState.TITLE;
  context.enterprise = i18nEmployeeState.ENTERPRISE;
  context.debit = i18nEmployeeState.DEBIT;
  context.credit = i18nEmployeeState.CREDIT;
  context.date = i18nEmployeeState.DATE;
  context.code = i18nEmployeeState.CODE;
  context.prenom = i18nEmployeeState.PRENOM;
  context.nom = i18nEmployeeState.NOM;
  context.postnom = i18nEmployeeState.POSTNOM;


  var uuids = [];

  db.exec('SELECT creditor_uuid FROM employee')
  .then(function (results){
    results.forEach(function (item) {
      uuids.push(sanitize.escape(item.creditor_uuid));
    });

    var sql =
    `SELECT employee.id, employee.code, employee.prenom, employee.name, employee.postnom, sum(aggregate.credit_equiv) as credit,
    sum(aggregate.debit_equiv) as debit FROM employee LEFT JOIN (SELECT posting_journal.deb_cred_uuid, posting_journal.inv_po_id, posting_journal.debit_equiv,
    posting_journal.credit_equiv FROM posting_journal
    JOIN transaction_type ON transaction_type.id= posting_journal.origin_id WHERE posting_journal.deb_cred_uuid IN (${uuids.join(', ')}) 
    AND posting_journal.deb_cred_type='C' AND transaction_type.service_txt NOT IN ('cotisation_paiement', 'tax_payment', 'cotisation_engagement','tax_engagement')
    UNION 
    SELECT general_ledger.deb_cred_uuid, general_ledger.inv_po_id, general_ledger.debit_equiv, general_ledger.credit_equiv FROM general_ledger JOIN transaction_type
    ON transaction_type.id= general_ledger.origin_id WHERE general_ledger.deb_cred_uuid IN (${uuids.join(', ')}) AND general_ledger.deb_cred_type='C' 
    AND transaction_type.service_txt NOT IN ('cotisation_paiement','tax_payment')) as aggregate ON employee.creditor_uuid = aggregate.deb_cred_uuid GROUP BY employee.id`;

    return db.exec(sql);
  })
  .then(function (rows) {
    rows.forEach(function (item){
      item.debit = numeral(item.debit).format(formatDollar);
      item.credit = numeral(item.credit).format(formatDollar);
    });
    context.data = rows;
    deferred.resolve(context);
  })
  .catch(deferred.reject)
  .done();
  return deferred.promise;
};
