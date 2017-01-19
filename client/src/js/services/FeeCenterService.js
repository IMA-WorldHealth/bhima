angular.module('bhima.services')
  .service('FeeCenterService', FeeCenterService);

FeeCenterService.$inject = ['$http', 'util', '$translate'];

function FeeCenterService($http, util, translate) {
  var service = this;
  var baseUrl = '/fee_centers/';

  service.read = read;
  service.fullRead = fullRead;
  service.formatRecord = formatRecord;
  service.create = create;
  service.update = update;

  /**
  * @desc Get an id (optional) and return back a list of Fee Centers or a Fee Center
  * @param {Integer} id, the id of the fee center (optional)
  * @return {object} a promise object, with the response.body inside.
  * @example
  * service.read()
  * .then(function (feeCenter){
  *   your code here
  *  });
  **/

  function read(id) {
    var url = baseUrl.concat(id || '');
    return $http.get(url)
      .then(util.unwrapHttpResponse);
  }

  /**
   * @desc Get an id (optional) and return back a full list of Fee Centers or a Fee Center
   * @param {Integer} id, the id of the fee center (optional)
   * @return {object} a promise object, with the response.body inside.
   * @example
   * service.fullRead()
   * .then(function (feeCenter){
  *   your code here
  *  });
   **/

  function fullRead (id){
    var query = '?full=1';
    var url = baseUrl.concat(id || '').concat(query);
    return $http.get(url)
      .then(util.unwrapHttpResponse);    
  }

  function formatRecord(list) {
    list.forEach(function (item) {
      item.type = item.is_cost === 1 ? translate.instant('FEE_CENTER.COST_CENTER') : translate.instant('FEE_CENTER.PROFIT_CENTER');
      item.principalState = item.is_principal === 1 ? translate.instant('FORM.LABELS.YES') : translate.instant('FORM.LABELS.NO');
    });
    return list;
  }

  /**
   * @desc create a Fee Center
   * @param {object} feeCenter, the feeCenter to insert
   * @return {object} a promise object, with the response.body inside.
   * @example
   * service.create(feeCenter)
   * .then(function (){
  *   your code here
  *  });
   **/

  function create(feeCenter) {
    return $http.post('/fee_centers', feeCenter)
      .then(util.unwrapHttpResponse);
  }

  // updates a fee center with id
  function update(id, feeCenter) {

    // delete properties that should not be updated
    delete feeCenter.id;

    return $http.put('/fee_centers/' + id, feeCenter)
      .then(util.unwrapHttpResponse);
  }

  return service;
}