'use strict';

/**
 * @description 
 *
 * @returns 
 */

angular.module('bhima.services')
  .factory('profitCenter', profitCenter);
  
profitCenter.$inject = ['$http'];

function profitCenter($http) {  
  
  function list() { 
    var path = '/profit_centers/detailed';

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