/**
 * Top level application navigation directive
 */
angular.module('bhima.directives')
.controller('bhimaNavController', NavigationController)
.directive('bhimaNav', navigation);

NavigationController.$inject = ['$location', '$rootScope', 'Tree', 'AppCache'];

function NavigationController($location, $rootScope, Tree, AppCache) {
  var vm = this;
  var MODULE_NAMESPACE = 'navigation';
  var cache = AppCache(MODULE_NAMESPACE);

  /**
   * Object used to index unit ids and paths, this allows for very efficient
   * lookups during runtime and means that the units only have to be recursively
   * parsed once - every following method should use the index to point to the
   * relevent unit
   */
  var unitsIndex = {id : {}, path : {}};

  /** @todo handle exception cases displayed at the top of the Tree directive */
  Tree.units()
    .then(function (result) {

      Tree.sortByTranslationKey(result);
      vm.units = result;

      calculateUnitIndex(vm.units);
      expandInitialUnits(vm.units);
    });

  // Tree Utility methods
  vm.toggleUnit = function toggleUnit(unit) {
    unit.open = unit.open || false;
    unit.open = !unit.open;

    // Update cached record of modules expansion
    cache[unit.id] = { open : unit.open };
    //cache.put(unit.id, {open : unit.open});
  };

  vm.navigate = function navigate(unit) {
    selectUnit(unit);
    $location.path(unit.path);
  };

  vm.refreshTranslation = function refreshTranslation() {
    Tree.sortByTranslationKey(vm.units);
  };

  /**
   * Select a unit in the tree given aa specified URL
   *
   * @todo search through all of the path keys - if the recorded path is found
   * /anywhere/ in the url the path should be selected in the tree
   */

  function trackPathChange(event, url) {
    var path = url.split('/#')[1];
    var unit = unitsIndex.path[normalisePath(path)];

    if (unit) {
      selectUnit(unit);
    }
  }

  function selectUnit(unit) {

    // Clear previous selection if it exists
    if (vm.selectedUnit) {
      vm.selectedUnit.selected = false;
    }

    // Update status of currently selected unit
    unit.selected = true;
    vm.selectedUnit = unit;
  }

  // Remove trailing path elements
  function normalisePath(path) {
    return path.replace(/\//g, '');
  }

  /**
   * Set the open state on units that are registered as open in the app cache
   *
   * @todo - This method may make more sense as part of the Tree service
   */
  function expandInitialUnits(units, states) {

    var nodes = Object.keys(cache);

    nodes.forEach(function (key) {

      var node = cache[key];

      // Lookup the cached unit key in the current set of units
      var currentUnit = unitsIndex.id[key];

      if (angular.isDefined(currentUnit)) {

        // Unit exists - set the relevent open state
        currentUnit.open = node.open;
      } else {

        // Unit does not exist - potentially the permission has been revoked
        // Update the cache to reflect this
        delete cache[key];
      }
    });
  }

  /**
   * Recursively calculate unit indexes (only one recursive parse of each tree
   * should be required
   */
  function calculateUnitIndex(units) {
    units.forEach(function (unit) {
      unitsIndex.id[unit.id] = unit;
      unitsIndex.path[normalisePath(unit.path)] = unit;
      calculateUnitIndex(unit.children);
    });
  }

  /**
   * Track changes to translation and sort units accordingly
   * '$translateChangeSuccess' event will fire when then translation key has
   * changed within BHIMA - tracking this allows the tree to update without the
   * page being refreshed
   */
  $rootScope.$on('$translateChangeSuccess', vm.refreshTranslation);
  $rootScope.$on('$locationChangeStart', trackPathChange);
}

function navigation() {
  return {
    restrict : 'E',
    scope : {},
    templateUrl : 'partials/templates/navigation.tmpl.html',
    controller : 'bhimaNavController as NavCtrl',
    bindToController : true
  };
}
