angular.module('bhima.services')
.service('DashboardService', DashboardService);

DashboardService.$inject = ['$http', 'util'];

function DashboardService($http, util) {
  var service = this;

  service.debtors = debtors;

  function debtors() {
    var url = '/dashboard/debtors';
    return $http.get(url)
      .then(util.unwrapHttpResponse);
  }
}
