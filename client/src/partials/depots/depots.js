angular.module('bhima.controllers')
.controller('DepotController', DepotController);

DepotController.$inject = [
  '$location', '$translate', '$window', 'messenger',
  'appcache', 'StockDataService'
];

/**
* Depot Controller
*
* This module is the main depot controller. It allows a user to choose a depot
* (persistent across sessions), and perform actions relative to that selection.
* It also provides a list of links to other modules that contain depot-specific
* actions or reports.
*
* To add links to this module, consider the following flowchart:
*   Action specific to a warehouse? - add to warehouseModules object
*   Action shared between all pharmacies? - add to sharedModules object
*   Report? - add to reports object
*/
function DepotController($location, $translate, $window, messenger, AppCache, StockDataService) {
  var vm = this,
      cache = new AppCache('depots');

  // bind variables to view
  vm.config = {};

  // bind methods
  vm.reconfigure = reconfigure;
  vm.setDepot = setDepot;
  vm.loadPath = loadPath;

  /* ------------------------------------------------------------------------ */

  // these modules are shared between warehouses and regular pharmacies
  vm.config.sharedModules = [{
    key : 'STOCK.INTEGRATION.KEY',
    ico : 'glyphicon-th-large',
    link : '/depots/:uuid/integrations'
  }, {
    key : 'STOCK.EXIT.KEY',
    ico : 'glyphicon-export',
    link : '/depots/:uuid/distributions/patients'
  }, {
    key : 'STOCK.EXIT_SERVICE.KEY',
    ico : 'glyphicon-export',
    link : '/depots/:uuid/distributions/services'
  }, {
    key : 'STOCK.RETURN_SERVICE.KEY',
    ico : 'glyphicon-arrow-left',
    link : '/depots/:uuid/service_return_stock'
  }, {
    key : 'DEPOT.DISTRIBUTION.LOSS.KEY',
    ico : 'glyphicon-cloud',
    link : '/depots/:uuid/losses'
  }, {
    key : 'STOCK.MOVEMENT.KEY',
    ico : 'glyphicon-transfer',
    link : '/depots/:uuid/movements'
  }, {
    key : 'STOCK.SEARCH.KEY', 
    ico : 'glyphicon-search',
    link : '/depots/:uuid/search'
  }];

  // these will be concatenated with the config modules if the depot chosen is
  // a warehouse, since they present warehouse-specific functionality
  vm.config.warehouseModules = [{
    key  : 'STOCK.ENTRY.KEY',
    ico  : 'glyphicon-import',
    link : '/depots/:uuid/entry'
  }, {
    key  : 'STOCK.DONATION.KEY',
    ico  : 'glyphicon-heart',
    link : '/donations/:uuid'
  }];

  // repots modules
  vm.config.reports = [{
    key  : 'DEPOT.DISTRIBUTION.PATIENTS',
    ico  : 'glyphicon-th-list',
    link : '/depots/:uuid/reports/distributions/patients'
  }, {
    key : 'DEPOT.DISTRIBUTION.SERVICES',
    ico : 'glyphicon-th-list',
    link : '/depots/:uuid/reports/distributions/services'
  }, {
    key : 'DEPOT.DISTRIBUTION.RUMMAGE',
    ico : 'glyphicon-th-list',
    link : '/depots/:uuid/reports/distributions/rummage'
  }, {
    key : 'DEPOT.DISTRIBUTION.LOSSES',
    ico : 'glyphicon-th-list',
    link : '/depots/:uuid/reports/distributions/losses'
  }, {
    key : 'STOCK_STATUS.TITLE',
    ico : 'glyphicon-th-list',
    link : '/reports/stock_store/:uuid'
  }];

  // generic error handler
  function handler(err) {
    messenger.danger(JSON.stringify(err));
  }

  function initialise() {
    StockDataService.getDepots()
    .then(function (response) {
      vm.depots = response.data;
      loadDefaultDepot();
    })
    .catch(handler);
  }

  // fetch the cached depot from appcache
  function loadDefaultDepot() {
    cache.fetch('depot')
    .then(function (depot) {
      if (!depot) { return; }

      vm.depot = depot;

      // add warehouse modules to view in necessary
      addWarehouseModules();
    })
    .catch(handler);
  }


  // load in warehouse modules, if appropriate.  Otherwise, just load
  // the shared modules
  function addWarehouseModules() {
    if (vm.depot && vm.depot.is_warehouse) {
      vm.config.modules = vm.config.warehouseModules.concat(vm.config.sharedModules);
    } else {
      vm.config.modules = vm.config.sharedModules;
    }
  }

  // better version of load path, allows uuid to be in arbitrary places.
  function loadPath(defn) {
    var path = defn.link.replace(':uuid', vm.depot.uuid);
    $location.path(path);
  }

  // set the depot for the session in appcache
  function setDepot(depot) {

    // are you sure you want to select %depot%?
    var tmpl = $translate.instant('DEPOT.CONFIRM_SELECTION'),
        bool = $window.confirm(tmpl.replace('%depot%', depot.text));

    if (!bool) { return; }

    vm.depot = depot;
    cache.put('depot', depot);
    addWarehouseModules();
  }

  // remove the depot from appcache
  function reconfigure() {

    // are you sure you want to change depots?  The current depot is %depot%.
    var tmpl = $translate.instant('DEPOT.CHANGE_DEPOT'),
        bool = $window.confirm(tmpl.replace('%depot%', vm.depot.text));

    if (!bool) { return; }

    cache.remove('depot');
    vm.depot = null;
  }

  // startup the controller
  initialise();
}
