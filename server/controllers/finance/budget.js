/* Budget controller */

'use strict';

var csv = require('fast-csv'),
	  fs  = require('fs'),
	  q   = require('q');
var db  = require('../../lib/db');


var uploadDir = process.env.UPLOAD_FOLDER;

module.exports = {
	update : updateBudget,
	upload : uploadedFile
};

function uploadedFile(req, res, next) {
	/**
	  * Objectif : handling the uploaded file and generate an array (csvArray) from the file
	  */
	var csvArray       = [],
		file           = req.files.file,
		fiscal_year_id = req.body.fiscal_year_id,
		period         = JSON.parse(req.body.period);

	if (file && file.path && file.name) {
		var fileName = uploadDir + file.name.replace(/ /g, '_');

		// File name can be more readable
		fs.rename(file.path, fileName, function (err) {
			if (err) { return next(err); }
			fs.stat(fileName, function (err) {
				if (err) { return next(err); }
				csv.fromPath(fileName, {headers: true})
				.on('data', function (data) {
					csvArray.push(data);
				})
				.on('end', function () {
					createBudget(csvArray, fiscal_year_id, period, next)
					.then(success(res))
					.catch(next)
					.done();
				})
				.on('error', next);
			});
		});
	}
}

function createBudget(csvArray, fiscal_year_id, period, next) {

	/**
	  * Objectif : create a new budget via params given
	  * Params :
	  *	- csvArray : an array of the budget csv file
	  * - fiscal_year_id : the fiscal year id
	  * - period : the period
	  */

	if (!csvArray.length) { return next('Error with CSV file'); }

	var queryInsertBudget = 'INSERT INTO `budget` (account_id, period_id, budget) VALUES (?, ?, ?) ;';

	if (period.period_number === 0) {
		// Budget for the fiscal year
		var queryPeriods = 'SELECT period.id, period.period_number FROM period WHERE period.fiscal_year_id = ? ';
		db.exec(queryPeriods, [fiscal_year_id])
		.then(createAnnualBudget)
		.catch(error);

	} else if (period.period_number >= 1 && period.period_number <= 12) {
		// Budget for a particular period in fiscal year
		handleCSVArray(period.id);
	}

	function createAnnualBudget (periods) {
		/**
		  * This function is responsible to create an annual budget
		  * the `periodLength` variable bellow is used in division of budget by period
		  */
		var periodIds    = periods;
		var periodLength = periodIds.length - 1 > 0 ? periodIds.length - 1 : 1;
		periodIds.forEach(function (item) {
			if (item.period_number !== 0) {
				handleCSVArray(item.id, periodLength);
			}
		});
	}

	function handleCSVArray(period_id, periodLength) {
		/**
		  * This function is responsible to get budget from csvArray
		  * and insert these data into budget table in database
		  * the `periodLength` variable is used in divison of budget by period, and must be different to zero
		  */
		periodLength = (periodLength && periodLength > 0) ? periodLength : 1;
		csvArray.forEach(function (acc) {
			// Hack for performance : Number(acc.Budget) !== 0 skip default budget=0
			// If we choose to set a budget to zero in csv file, it's will be impossible to import it
			if (acc.Type !== 'title' && Number(acc.Budget) !== 0 && !isNaN(Number(acc.Budget))) {
				clearPreviousBudgets(period_id)
				.then(function () {
					db.exec(queryInsertBudget, [acc.AccountId, period_id, acc.Budget/periodLength]);
				})
				.catch(error);
			}
		});
	}

	function clearPreviousBudgets(period_id) {
		// remove all previous budgets for the fiscal_year or period given
		// because in budget analyse module we have the sum of all
		var sql = 'DELETE FROM budget WHERE period_id = ? ;';
		return db.exec(sql, [period_id]);
	}

	function error(err) {
		return next(err);
	}

	// this function must return a promise to handle errors
	// and for sending success status to client
	return q(true);
}

function updateBudget(req, res, next) {
	var budgets           = req.body.params.budgets;
	var accountId         = req.body.params.accountId;
	var queryUpdateBudget = 'UPDATE budget SET budget.account_id=?, budget.period_id=?, budget.budget=? WHERE budget.id=? ;';
	var dbPromises        = budgets.map(function (bud) {
		return db.exec(queryUpdateBudget, [accountId, bud.period_id, bud.budget, bud.id]);
	});

	q.all(dbPromises)
	.then(success(res))
	.catch(next)
	.done();
}

function success(res) {
	res.status(200).send('success');
}
