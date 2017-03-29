angular.module('bhima.components')
  .component('bhNavigation', {
    controller : NavigationController,
    templateUrl : 'modules/templates/navigation.tmpl.html'
  });

NavigationController.$inject = [
  '$location', '$rootScope', 'Tree', 'AppCache', 'NotifyService'
];

/**
 * Navigation Controller
 *
 * @description
 * This controller determines the
 */
function NavigationController($location, $rootScope, Tree, AppCache, Notify) {
  var $ctrl = this;
  var openedCache = AppCache('navigation.opened');

  var $$listeners = [];

  /*
   * Object used to index unit ids and paths, this allows for very efficient
   * lookups during runtime and means that the units only have to be recursively
   * parsed once - every following method should use the index to point to the
   * relevant unit
   */
  var unitsIndex = { id : {}, path : {} };

  function loadTreeUnits() {
    Tree.units()
      .then(function (units) {

        Tree.sortByTranslationKey(units);
        $ctrl.units = units;

        calculateUnitIndex($ctrl.units);
        expandInitialUnits($ctrl.units);

        // updates the tree selection on path change
        updateSelectionOnPathChange();
      })
      .catch(Notify.handleError);
  }

  // Tree Utility methods
  $ctrl.toggleUnit = function toggleUnit(unit) {
    unit.open = unit.open || false;
    unit.open = !unit.open;

    // Update cached record of modules expansion
    openedCache[unit.id] = unit.open;
  };

  $ctrl.navigate = function navigate(unit) {
    selectUnit(unit);
    $location.path(unit.path);
  };

  $ctrl.refreshTranslation = function refreshTranslation() {
    Tree.sortByTranslationKey($ctrl.units);
  };

  $ctrl.isParentNode = function isParentNode(node) {
    return node.children && node.children.length > 0;
  };

  $ctrl.isChildNode = function isChildNode(node) {
    return node.children && node.children.length === 0;
  };

  $ctrl.isOpen = function isOpen(node) {
    return $ctrl.isParentNode(node) && node.open;
  };

  /**
   * Select a unit in the tree given a specified URL.
   */
  function updateSelectionOnPathChange() {
    var path = $location.path();

    /**
     * loop through all paths, selecting those are match the selected url
     *
     * @todo - write test cases to be sure this works in all cases, probably
     * dependent on the ordering of unitsIndex.
     */
    var paths = Object.keys(unitsIndex.path);
    paths.sort();

    paths.forEach(function (key) {
      var node = unitsIndex.path[key];
      if (path.includes(node.path)) {
        selectUnit(node);
      }
    });
  }

  function selectUnit(unit) {

    // Clear previous selection if it exists
    if ($ctrl.selectedUnit) {
      $ctrl.selectedUnit.selected = false;
    }

    // Update status of currently selected unit
    unit.selected = true;
    $ctrl.selectedUnit = unit;
  }

  /**
   * Set the open state on units that are registered as open in the app cache
   *
   * @todo - This method may make more sense as part of the Tree service
   */
  function expandInitialUnits(units, states) {

    var nodes = Object.keys(openedCache);

    nodes.forEach(function (key) {

      var isOpen = openedCache[key];

      // Lookup the cached unit key in the current set of units
      var currentUnit = unitsIndex.id[key];

      if (angular.isDefined(currentUnit)) {

        // Unit exists - set the relevant open state
        currentUnit.open = isOpen;
      } else {

        // Unit does not exist - potentially the permission has been revoked
        // Update the cache to reflect this
        delete openedCache[key];
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
      unitsIndex.path[unit.path] = unit;
      calculateUnitIndex(unit.children);
    });
  }

  /**
   * Track changes to translation and sort units accordingly
   * '$translateChangeSuccess' event will fire when then translation key has
   * changed within BHIMA - tracking this allows the tree to update without the
   * page being refreshed
   */
  $$listeners.push($rootScope.$on('$translateChangeSuccess', $ctrl.refreshTranslation));
  $$listeners.push($rootScope.$on('$stateChangeSuccess', updateSelectionOnPathChange));

  // if the session is reloaded, download the new tree units
  $$listeners.push($rootScope.$on('session:reload', loadTreeUnits));

  // unregister listeners on destroy
  this.$onDestroy = function $onDestroy() {
    $$listeners.forEach(function (unregister) {
      unregister();
    });
  };

  loadTreeUnits();
}
