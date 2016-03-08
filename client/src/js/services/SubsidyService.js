angular.module('bhima.services')
  .service('SubsidyService', SubsidyService);

SubsidyService.$inject = ['$http', 'util'];

function SubsidyService($http, util) {
  var service = this;
  var baseUrl = '/subsidies/';

  service.read = read;
  service.create = create;
  service.update = update;
  service.delete = del;

  /**
  * @desc Get an id (optionnal) and return back a list of subsidies or an subsidy
  * @param {Integer} id, the id of the subsidy (optionnal) 
  * @return {object} a promise object, with the response.body inside.
  * @example
  * service.read()
  * .then(function (subsidies){
  *   your code here
  *  });
  **/
  function read(id, params) {
    var url = baseUrl.concat(id || '');
    return $http.get(url, { params : params })
      .then(util.unwrapHttpResponse);
  }

  /**
  * @desc It create an subsidy
  * @param {object} subsidy, subsidy to create 
  * @example
  * service.create(subsidy)
  * .then(function (res){
  *   your code here
  *  });
  **/
  function create(subsidy) {
    return $http.post(baseUrl, subsidy)
      .then(util.unwrapHttpResponse);
  }

  /**
  * @desc It updates an subsidy
  * @param {Integer} id, subsidy id to update 
  * @param {object} subsidy, subsidy to update 
  * @example
  * service.update(id, subsidy)
  * .then(function (res){
  *   your code here
  *  });
  **/
  function update(id, subsidy) {
    var subsidyClean = {
      label : subsidy.label,
      value : subsidy.value,
      account_id : subsidy.account_id,
      description : subsidy.description
    };

    return $http.put(baseUrl.concat(id), subsidyClean)
      .then(util.unwrapHttpResponse);
  }

  /**
  * @desc It Delete a subsidy
  * @param {Integer} id, subsidy id to delete 
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