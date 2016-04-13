var db      = require('../../../lib/db');
var numeral = require('numeral');

var formatDollar = '$0,0.00';

exports.compile = function (options) {
  'use strict';

  var debtorGroupReportDate = new Date();
  var i18nDebitorGroupReport = options.language == 'fr' ? require('../lang/fr.json').DEBITOR_GROUP_REPORT : require('../lang/en.json').DEBITOR_GROUP_REPORT;
  var context = {}, params = options.involveJournal === true ? [options.dg.account_id, options.dg.account_id] : [options.dg.account_id];

  var postingJournalSql =
    'UNION ALL SELECT s.uuid as saleUUID, CONCAT(pr.abbr, s.reference) AS saleNumber, s.cost, DATE_FORMAT(s.invoice_date, \'%d-%m-%Y\') AS invoice_date, dg.name, ac.label, SUM(pj.debit_equiv) AS debit, SUM(pj.credit_equiv) AS credit, pj.trans_id, ' +
    'CONCAT(pt.first_name, \' \', pt.last_name) AS patientName FROM sale AS s JOIN posting_journal AS pj ON pj.inv_po_id = s.uuid JOIN account AS ac ON pj.account_id = ac.id JOIN debtor_group AS dg ' +
    'ON dg.account_id = pj.account_id JOIN patient AS pt ON pt.debtor_uuid = s.debtor_uuid JOIN project AS pr ON pr.id = s.project_id WHERE pj.account_id =? GROUP BY s.uuid ORDER BY invoice_date DESC';
  var defaultSql = 
    'SELECT s.uuid as saleUUID, CONCAT(pr.abbr, s.reference) AS saleNumber, s.cost, DATE_FORMAT(s.invoice_date, \'%d-%m-%Y\') AS invoice_date, dg.name, ac.label, SUM(gl.debit_equiv) AS debit, SUM(gl.credit_equiv) AS credit, gl.trans_id, ' +
    'CONCAT(pt.first_name, \' \', pt.last_name) AS patientName FROM sale AS s JOIN general_ledger AS gl ON gl.inv_po_id = s.uuid JOIN account AS ac ON gl.account_id = ac.id JOIN debtor_group AS dg ' +
    'ON dg.account_id = gl.account_id JOIN patient AS pt ON pt.debtor_uuid = s.debtor_uuid JOIN project AS pr ON pr.id = s.project_id WHERE gl.account_id =? GROUP BY s.uuid ';

  // var involvedSql = 
  defaultSql += options.involveJournal === true ? postingJournalSql : ' ORDER BY invoice_date DESC';
  

  context.reportDate = debtorGroupReportDate.toDateString();
  context.enterpriseName = options.enterprise.abbr + ' - ' + options.enterprise.name;
  context.phone = options.enterprise.phone;
  context.bp = options.enterprise.po_box;
  context.debtorGroupName = options.dg.name;
  context.dataStructure = i18nDebitorGroupReport;


  function filterResults(results){
    return results.filter(function (item){
      return item.debit - item.credit !== 0;
    });
  }
 
  return db.exec(defaultSql, params)
  .then(function (results){
    context.data = options.unsoldOnly === true ? filterResults(results) : results;
    var total = {billed : 0, payed : 0};
    context.data.forEach(function (item){
      total.billed += item.cost;
      total.payed += item.credit;
      item.difference = item.cost - item.credit;
      item.cost = numeral(item.cost).format(formatDollar);      
      item.credit = numeral(item.credit).format(formatDollar);
      item.difference = numeral(item.difference).format(formatDollar);
    });
    context.somBilled = numeral(total.billed).format(formatDollar);
    context.somPayed = numeral(total.payed).format(formatDollar);
    context.somDifference = total.billed - total.payed;
    context.somDifference = numeral(context.somDifference).format(formatDollar);
    return context;
  });
};
