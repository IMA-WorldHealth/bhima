angular.module('bhima.controllers')
.controller('InventoryServiceModalController', InventoryServiceModalController);

InventoryServiceModalController.$inject = [
  '$uibModalInstance', 'NotifyService', 'params', 'InventoryService', 'AppCache',
];

/**
 * @class InventoryServiceModalController
 *
 * @description
 * This controller is responsible for setting up the filters for the Inventory
 * search functionality on the Inventory list.  Filters that are already
 * applied to the grid can be passed in via the params inject.
 */
function InventoryServiceModalController(ModalInstance, Notify, params, Inventory, AppCache) {
  var vm = this;
  var cache = new AppCache('InventorySearchCache');

  // bind filters if they have already been applied.  Otherwise, default to an
  // empty object.
  vm.params = params || {};

  // bind methods
  vm.submit = submit;
  vm.cancel = cancel;
  vm.clear = clear;
  vm.types = {};

  loadCachedParameters();

  Inventory.Groups.read()
    .then(function (result) {
      vm.inventoryGroups = result;
    });

    // Inventory Type
  Inventory.Types.read()
    .then(function (types) {
      vm.types = types;
    })
    .catch(Notify.handleError);

  // returns the parameters to the parent controller
  function submit(form) {
    var parameters;

    if (form.$invalid) { return 0; }

    cache.params = vm.params;
    parameters = angular.copy(cache.params);

      // make sure we don't have any undefined or empty parameters
    angular.forEach(parameters, function (value, key) {
      if (value === null || value === '') {
        delete parameters[key];
      }
    });

    return ModalInstance.close(parameters);
  }

  // clears search parameters.  Custom logic if a date is used so that we can
  // clear two properties.
  function clear(value) {
    delete vm.params[value];
  }

  // dismiss the modal
  function cancel() {
    ModalInstance.close();
  }

  // load cached data
  function loadCachedParameters() {
    if (cache.params) {
      vm.params = cache.params;
    }
  }
}
