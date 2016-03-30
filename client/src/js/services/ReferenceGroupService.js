angular.module('bhima.services')
  .service('ReferenceGroupService', ReferenceGroupService);

ReferenceGroupService.$inject = ['$http', 'util'];

function ReferenceGroupService($http, util) {
  var service = this;
  var baseUrl = '/reference_group/';

  service.read = read;
  service.create = create;
  service.update = update;
  service.delete = del;

  /**
  * @desc Get an id (optionnal) and return back a list of Reference Groups or a Reference Group
  * @param {Integer} id, the id of the Reference Group (optionnal) 
  * @return {object} a promise object, with the response.body inside.
  * @example
  * service.read()
  * .then(function (ReferenceGroups){
  *   your code here
  *  });
  **/
  function read(id, params) {
    var url = baseUrl.concat(id || '');
    return $http.get(url, { params : params })
      .then(util.unwrapHttpResponse);
  }

  /**
  * @desc It create an Reference Group
  * @param {object} Reference Group, Reference Group to create 
  * @example
  * service.create(ReferenceGroup)
  * .then(function (res){
  *   your code here
  *  });
  **/
  function create(ReferenceGroup) {
    return $http.post(baseUrl, ReferenceGroup)
      .then(util.unwrapHttpResponse);
  }

  /**
  * @desc It updates an ReferenceGroup
  * @param {Integer} id, ReferenceGroup id to update 
  * @param {object} ReferenceGroup, ReferenceGroup to update 
  * @example
  * service.update(id, ReferenceGroup)
  * .then(function (res){
  *   your code here
  *  });
  **/
  function update(id, ReferenceGroup) {
    return $http.put(baseUrl.concat(id), ReferenceGroup)
      .then(util.unwrapHttpResponse);
  }

  /**
  * @desc It Delete a ReferenceGroup
  * @param {Integer} id, ReferenceGroup id to delete 
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