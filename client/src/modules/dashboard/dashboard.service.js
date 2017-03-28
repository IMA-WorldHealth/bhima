angular.module('bhima.services')
.service('DashboardService', DashboardService);

DashboardService.$inject = ['$http', 'util'];

function DashboardService($http, util) {
  var service = this;

  service.debtors = debtors;
  service.invoices = invoices;
  service.patients = patients;

  function debtors() {
    var url = '/dashboard/debtors';
    return $http.get(url)
      .then(util.unwrapHttpResponse);
  }

  // invoices stats 
  function invoices(params) {
    var url = '/invoices/stats';
    return $http.get(url, { params : params })
      .then(util.unwrapHttpResponse);
  }

  // patients stats 
  function patients(params) {
    var url = '/patients/stats';
    return $http.get(url, { params : params })
      .then(util.unwrapHttpResponse);
  }
}
