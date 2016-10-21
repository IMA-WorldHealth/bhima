angular.module('bhima.services')
.service('BaseReportService', BaseReportService);

BaseReportService.$inject = ['$http', 'util'];

function BaseReportService($http, util) {
  var service = this;

  service.requestKey = requestKey;

  function requestKey(key) {
    var url = '/reports/';
    return $http.get(url)
      .then(util.unwrapHttpResponse);
  }
}

