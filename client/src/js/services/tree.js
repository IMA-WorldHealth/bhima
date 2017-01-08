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

Tree.$inject = ['$http', '$translate', 'util'];

function Tree($http, $translate, util) {
  var service = this;

  /** fetch all units available to the current user. */
  service.units = units;
  service.sortByTranslationKey = sortByTranslationKey;

  function units() {
    return $http.get('/tree')
      .then(util.unwrapHttpResponse);
  }

  /** recursively sort an array of BHIMA units respecting translation keys. */
  function sortByTranslationKey(units) {
    if (angular.isUndefined(units)) {
      return;
    }

    units.sort(function (a, b) {
      return ($translate.instant(a.key) > $translate.instant(b.key)) ? 1 : -1;
    });

    // recursively step into each set of children
    units.forEach(function (node) {
      if (angular.isDefined(node.children)) {
        sortByTranslationKey(node.children);
      }
    });
  }

}
