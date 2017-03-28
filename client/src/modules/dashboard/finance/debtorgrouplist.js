angular.module('bhima.controllers')

.controller('DebtorGroupListDashboardController', ['FinanceDashboardService', 'appcache', function (Finance, AppCache) {
  var self = this,
      cache = new AppCache('DGFinanceDashboard');

  // toggle loading state
  self.isLoading = true;

  // limits
  self.limits = Finance.limits;
  self.limit = 10;
 
  // load list data
  Finance.getTopDebtorGroups()
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
