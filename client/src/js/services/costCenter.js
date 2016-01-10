'use strict';

/**
 * @description 
 *
 * @returns 
 */

angular.module('bhima.services')
  .factory('costCenter', costCenter);
  
costCenter.$inject = ['$http'];

function costCenter($http) {  
  
  function list() { 
    var path = '/cost_centers/detailed';

    return $http.get(path)
      .then(extractData);
  }  

  return {
    list : list
  };
}

// Utility method - pass only data object to controller
// TODO Use shared utility service
function extractData(result) { 
  return result.data;
}