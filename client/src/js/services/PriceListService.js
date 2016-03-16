angular.module('bhima.services')
  .service('PriceListService', PriceListService);

PriceListService.$inject = ['$http', 'util'];

function PriceListService($http, util) {
  var service = this;
  var baseUrl = '/prices/';

  service.read = read;
  service.create = create;
  service.update = update;
  service.delete = del;

  /**
  * @desc Get an id (optionnal) and return back all price liste or a specific list 
  * @param {Integer} id, the id of the list (optionnal) 
  * @return {object} a promise object, with the response.body inside.
  * @example
  * service.read()
  * .then(function (priceList){
  *   your code here
  *  });
  **/
  function read(uuid, params) {
    var url = baseUrl.concat(uuid || '');
    return $http.get(url, { params : params })
      .then(util.unwrapHttpResponse);
  }

  /**
  * @desc It create an Price List
  * @param {object} price list, price list to create 
  * @example
  * service.create(priceList)
  * .then(function (res){
  *   your code here
  *  });
  **/
  function create(priceList) {
    return $http.post(baseUrl, {list : priceList})
      .then(util.unwrapHttpResponse);
  }

  /**
  * @desc It updates an priceList
  * @param {Integer} id, price list id to update 
  * @param {object} price list, price list to update 
  * @example
  * service.update(id, price list)
  * .then(function (res){
  *   your code here
  *  });
  **/
  function update(uuid, priceList) {
    delete priceList.created_at;

    return $http.put(baseUrl.concat(uuid), {list : priceList})
      .then(util.unwrapHttpResponse);
  }

  /**
  * @desc It Delete a Price List
  * @param {Integer} id, priceList id to delete 
  * @example
  * service.del(id)
  * .then(function (res){
  *   your code here
  *  });
  **/

  function del(id) {
    return $http.delete(baseUrl + id)
    .then(util.unwrapHttpResponse);
  }

  return service;
}