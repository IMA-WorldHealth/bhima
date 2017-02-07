angular.module('bhima.services')
  .service('ProfitCenterService', ProfitCenterService);

ProfitCenterService.$inject = ['$http', 'util'];

function ProfitCenterService($http, util) {
  var service = this;
  var baseUrl = '/profit_centers/';

  service.read = read;

  /**
  * @desc Get an id (optionnal) and return back a list of Profit Centers or a Profit Center
  * @param {Integer} id, the id of the profit center (optionnal) 
  * @return {object} a promise object, with the response.body inside.
  * @example
  * service.read()
  * .then(function (profitCenter){
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