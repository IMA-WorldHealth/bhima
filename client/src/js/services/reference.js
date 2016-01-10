'use strict';

/**
 * @description 
 *
 * @returns 
 */

angular.module('bhima.services')
  .factory('reference', reference);
  
reference.$inject = ['$http'];

function reference($http) {  
  
  function list() { 
    var path = '/references/default';

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