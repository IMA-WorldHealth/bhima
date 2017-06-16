angular.module('bhima.controllers')
  .controller('income_expenseController', IncomeExpenseConfigController);

IncomeExpenseConfigController.$inject = [
  '$sce', 'NotifyService', 'BaseReportService', 'AppCache', 'reportData', '$state',
];

function IncomeExpenseConfigController($sce, Notify, SavedReports, AppCache, reportData, $state) {
  var vm = this;
  var cache = new AppCache('configure_income_expense');
  var reportUrl = 'reports/finance/income_expense'; 
  console.log('our controller');
}
