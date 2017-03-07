angular.module('bhima.controllers')
.controller('InventoryServiceModalController', InventoryServiceModalController);

InventoryServiceModalController.$inject = [
  '$uibModalInstance', 'params', 'InventoryService'
];

/**
 * @class InventoryServiceModalController
 *
 * @description
 * This controller is responsible for setting up the filters for the Inventory
 * search functionality on the Inventory list.  Filters that are already
 * applied to the grid can be passed in via the params inject.
 */
function InventoryServiceModalController(ModalInstance, params, Inventory) {
  var vm = this;

  // bind filters if they have already been applied.  Otherwise, default to an
  // empty object.
  vm.params = params || {};

  // bind methods
  vm.submit = submit;
  vm.cancel = cancel;
  vm.clear = clear;

  Inventory.Groups.read()
    .then(function (result) {
      vm.inventoryGroups = result;
    });

  // returns the parameters to the parent controller
  function submit(form) {
    if (form.$invalid) { return; }

    var parameters = angular.copy(vm.params);

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
}