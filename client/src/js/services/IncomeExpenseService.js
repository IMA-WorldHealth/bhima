/**
 * @name IncomeExpenseService
 * @description
 * The `IncomeExpenseService` Service provide a mean to get IncomeExpense data by requesting
 * to the /finance/incomeExpense API
 */
angular.module('bhima.services')
.factory('IncomeExpenseService', IncomeExpenseService);

// dependencies injection
IncomeExpenseService.$inject = ['PrototypeApiService'];

// service definition
function IncomeExpenseService(PrototypeApiService) {
	var service = new PrototypeApiService('/finance/incomeExpense/');

	return service;
}
