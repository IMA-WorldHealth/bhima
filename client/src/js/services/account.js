'use strict';

/**
 * @description 
 *
 * @returns 
 */

angular.module('bhima.services')
  .factory('Account', Account);
  
Account.$inject = ['$http'];

function Account($http) {  
  
  function list() { 
    var path = '/accounts?list=\'full\'';

    return $http.get(path)
      .then(extractData);
  }

  function create (account){
    var path = '/accounts';
    return $http.post(path, account).then(extractData);
  }

  function getAccountDetails (list, id) { 
    return list.filter(function (line){return line.id === id;})[0];
  }  

  return {
    create : create,
    getAccountDetails : getAccountDetails,
    list : list  
  };
}



// Utility method - pass only data object to controller
// TODO Use shared utility service
function extractData(result) { 
  return result.data;
}
