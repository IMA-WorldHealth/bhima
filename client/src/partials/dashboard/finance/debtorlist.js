angular.module('bhima.controllers')

.controller('DebtorListDashboardController', ['FinanceDashboardService', 'appcache', function (Finance, AppCache) {
  var self = this,
    cache = new AppCache('DebtorFinanceDashboard');

  // toggle loading state
  self.isLoading = true;

  // limits
  self.limits = Finance.limits;
  self.limit = 10;
 
  // load data
  Finance.getTopDebtors()
  .then(function (response) {
    self.isLoading = false;
    self.data = response.data;
  });

  self.saveOptions = function () {
    cache.put('options', { limit : self.limit });
  };

  function loadDefaultOptions() {
    cache.fetch('options')
    .then(function (options) {
      if (!options) { return; }
      self.limit = options.limit;
    });
  }

  // load defaults
  loadDefaultOptions();
}]);
