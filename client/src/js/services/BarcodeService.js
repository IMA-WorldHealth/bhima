angular.module('bhima.services')
  .service('BarcodeService', BarcodeService);

BarcodeService.$inject = [ '$http', 'util' ];

function BarcodeService($http, util) {
  var service = this;

  // TODO - barcode redirection
  service.redirect = angular.noop;

  service.search = function search(code) {
    return $http.get('/barcode/'.concat(code))
      .then(util.unwrapHttpResponse);
  };

  return service;
}
