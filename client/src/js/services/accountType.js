'use strict';

/**
 * @description 
 *
 * @returns 
 */

angular.module('bhima.services')
  .factory('AccountType', AccountType);
  
AccountType.$inject = ['$http'];

function AccountType($http) {  
  
  function list() { 
    var path = '/accountTypes';

    return $http.get(path)
      .then(extractData);
  } 

  function getAccountType(list, id) {
    return list.filter(function (line){return line.id == id;})[0];
  } 

  return {
    list : list,
    getAccountType : getAccountType
  };
}

// Utility method - pass only data object to controller
// TODO Use shared utility service
function extractData(result) { 
  return result.data;
}
