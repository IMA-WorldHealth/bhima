/**
 * User Modules (Tree) Service 
 * Provides methods for accessing modules that the user is subscribed to 
 * and formatting them for display in the tree navigation. 
 *
 * @todo End to end tests to ensure the service is always returning 
 * expected results
 */
angular.module('bhima.services')
.service('Tree', Tree);

Tree.$inject = ['$http', 'util'];

function Tree($http, util) { 
  var service = this;

  /** Fetch all units available to the current user. */
  service.units = units;

  function units() { 
    return $http.get('/tree')
      .then(util.unwrapHttpResponse);
  }
}
