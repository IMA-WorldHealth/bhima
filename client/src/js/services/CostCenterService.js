angular.module('bhima.services')
  .service('CostCenterService', CostCenterService);

CostCenterService.$inject = ['$http', 'util'];

function CostCenterService($http, util) {
  var service = this;
  var baseUrl = '/cost_centers/';

  service.read = read;

  /**
  * @desc Get an id (optionnal) and return back a list of Cost Centers or a Cost Center
  * @param {Integer} id, the id of the cost center (optionnal) 
  * @return {object} a promise object, with the response.body inside.
  * @example
  * service.read()
  * .then(function (costCenter){
  *   your code here
  *  });
  **/

  function read(id) {
    var url = baseUrl.concat(id || '');
    return $http.get(url)
      .then(util.unwrapHttpResponse);
  }

  return service;
}