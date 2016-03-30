angular.module('bhima.services')
  .service('PriceLists', PriceLists);

PriceLists.$inject = [ '$http', 'util' ];

function PriceLists($http, util) {
  var service = this;

  service.detail = detail;
  
  /** request details end point for a specified price list uuid */
  function detail(uuid) { 
    var path = '/prices/';

    return $http.get(path.concat(uuid))
        .then(util.unwrapHttpResponse);
  }
}
 
