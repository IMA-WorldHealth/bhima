/* CASHFLOW controller */
'use strict';

var q  = require('q'),
		db = require('../lib/db');

module.exports = {
	getReport : cashflowReport
};

function cashflowReport (req, res, next) {
  var incomes, expenses, glb = {};
  var params = req.query;

  queryIncomeExpense()
	.then(handleResult)
	.then(function () {
		res.status(200).send(glb);
	})
  .catch(function (err) {
    return next(err);
  });

	function queryIncomeExpense () {
		var requette =
				'SELECT `t`.`uuid`, `t`.`trans_id`, `t`.`trans_date`, `a`.`account_number`, `t`.`debit_equiv`,  ' +
				'`t`.`credit_equiv`, SUM(`t`.`debit`) AS debit, SUM(`t`.`credit`) AS credit, `t`.`currency_id`, `t`.`description`, `t`.`comment`, `t`.`primary_cash_uuid`, `t`.`document_uuid`, `t`.`inv_po_id`, `o`.`service_txt`, `u`.`first`, `u`.`last` ' +
				'FROM (' +
					'(' +
						'SELECT `posting_journal`.`project_id`, `posting_journal`.`uuid`, `primary_cash_item`.`primary_cash_uuid`, `primary_cash_item`.`document_uuid`, `posting_journal`.`inv_po_id`, `posting_journal`.`trans_date`, `posting_journal`.`debit_equiv`, ' +
							'`posting_journal`.`credit_equiv`, `posting_journal`.`debit`, `posting_journal`.`credit`, `posting_journal`.`account_id`, `posting_journal`.`deb_cred_uuid`, '+
							'`posting_journal`.`currency_id`, `posting_journal`.`doc_num`, posting_journal.trans_id, `posting_journal`.`description`, `posting_journal`.`comment`, `posting_journal`.`origin_id`, `posting_journal`.`user_id` ' +
						'FROM `posting_journal` LEFT JOIN `primary_cash_item` ON `primary_cash_item`.`document_uuid` = `posting_journal`.`inv_po_id` ' +
						'WHERE `posting_journal`.`account_id`= ? AND `posting_journal`.`trans_date` >= ? AND `posting_journal`.`trans_date` <= ? ' +
					') UNION (' +
						'SELECT `general_ledger`.`project_id`, `general_ledger`.`uuid`, `primary_cash_item`.`primary_cash_uuid`, `primary_cash_item`.`document_uuid`, `general_ledger`.`inv_po_id`, `general_ledger`.`trans_date`, `general_ledger`.`debit_equiv`, ' +
							'`general_ledger`.`credit_equiv`, `general_ledger`.`debit`, `general_ledger`.`credit`, `general_ledger`.`account_id`, `general_ledger`.`deb_cred_uuid`, `general_ledger`.`currency_id`, ' +
							'`general_ledger`.`doc_num`, general_ledger.trans_id, `general_ledger`.`description`, `general_ledger`.`comment`, `general_ledger`.`origin_id`, `general_ledger`.`user_id` ' +
							'FROM `general_ledger` LEFT JOIN `primary_cash_item` ON `primary_cash_item`.`document_uuid` = `general_ledger`.`inv_po_id` ' +
							'WHERE `general_ledger`.`account_id`= ? AND `general_ledger`.`trans_date` >= ? AND `general_ledger`.`trans_date` <= ? ' +
					')' +
				') AS `t`, account AS a, transaction_type as o, user as u WHERE `t`.`account_id` = `a`.`id` AND `t`.`origin_id` = `o`.`id` AND `t`.`user_id` = `u`.`id` ' +
				'GROUP BY `t`.`trans_id` ;' ;
		return db.exec(requette, [params.account_id, params.dateFrom, params.dateTo, params.account_id, params.dateFrom, params.dateTo]);
	}

	function handleResult(results) {
		 glb.incomes = results.filter(function (item) {
			 return item.debit > 0;
		 });
		 glb.expenses = results.filter(function (item) {
			 return item.credit > 0;
		 });
		 return glb;
	}
}
