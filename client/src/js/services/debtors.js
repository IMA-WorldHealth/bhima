'use strict';

/**
 * @description 
 *
 * @returns 
 */

angular.module('bhima.services')
  .factory('Debtors', Debtors);
  
Debtors.$inject = ['$http'];

function Debtors($http) {  

  // function detail(uuid)
  // function list()
  
  function groupDetail(uuid) { 
    var path = '/debtors/groups/';

    return $http.get(path.concat(uuid))
      .then(extractData);
  }

  function groups() { 
    var path = '/debtors/groups';

    return $http.get(path)
      .then(extractData);
  }

  function update(uuid, params) { 
    var path = '/debtors/';

    return $http.put(path.concat(uuid), params)
      .then(extractData);
  }

  return {
    update : update,
    groups : groups,
    groupDetail : groupDetail
  };
}

// Utility method - pass only data object to controller
// TODO Use shared utility service
function extractData(result) { 
  return result.data;
}
