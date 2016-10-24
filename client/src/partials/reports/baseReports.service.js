angular.module('bhima.services')
.service('BaseReportService', BaseReportService);

BaseReportService.$inject = ['$http', 'util'];

function BaseReportService($http, util) {
  var service = this;

  service.requestKey = requestKey;
  service.listSavedReports = listSavedReports;

  function requestKey(key) {
    var url = '/reports/keys/';
    return $http.get(url.concat(key))
      .then(util.unwrapHttpResponse);
  }

  function listSavedReports(reportId) {
    var url = '/reports/saved/';
    return $http.get(url.concat(reportId))
      .then(util.unwrapHttpResponse);
  }
}

