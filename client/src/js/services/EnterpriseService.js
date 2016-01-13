'use strict';

/**
 * @description 
 *
 * @returns 
 */

angular.module('bhima.services')
  .factory('EnterpriseService', EnterpriseService);
  
EnterpriseService.$inject = ['$http', 'util'];

function EnterpriseService($http, util) {  
  var service = {};

  service.read = read;
  service.readLocations = readLocations;
  service.create = create;
  service.update = update;

  /* ------------------------------------------------------------------------ */

  function read(id) {
    var url = '/enterprises/';
    return $http.get(url)
      .then(util.unwrapHttpResponse);
  }

  function readLocations() {
    var url = '/location/villages';
    return $http.get(url)
      .then(util.unwrapHttpResponse);
  }

  function create(enterprise) {
    return $http.post('/enterprises', { enterprises: enterprise })
      .then(util.unwrapHttpResponse);
  }

  function update(id, enterprise) {
    delete enterprise.id;

    return $http.put('/enterprises/' + id, enterprise)
      .then(util.unwrapHttpResponse);
  }

  return service;
}
