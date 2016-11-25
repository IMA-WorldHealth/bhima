angular.module('bhima.controllers')
  .controller('InventoryUnitsController', InventoryUnitsController);

// dependencies injection
InventoryUnitsController.$inject = [
  'InventoryUnitService', 'NotifyService', 'ModalService'
];

/**
 * Inventory Unit Controller
 * This controller is responsible for handling inventory unit module
 */
function InventoryUnitsController(InventoryUnit, Notify, Modal) {
  var vm = this;

  // expose to the view
  vm.addInventoryUnit = addInventoryUnit;
  vm.editInventoryUnit = editInventoryUnit;

  // startup
  startup();

  /** add inventory unit */
  function addInventoryUnit() {
    var request = { action : 'add' };

    Modal.openInventoryUnitActions(request)
      .then(function (res) {
        if (res.id) {
          Notify.success('FORM.INFO.CREATE_SUCCESS');
        }
      })
      .then(startup)
      .catch(Notify.errorHandler);
  }

  /** edit inventory unit */
  function editInventoryUnit(id) {
    var request = { action : 'edit', identifier : id };

    Modal.openInventoryUnitActions(request)
      .then(function (res) {
        Notify.success('FORM.INFO.UPDATE_SUCCESS');
      })
      .then(startup)
      .catch(Notify.errorHandler);
  }

  /** initializes the view */
  function startup() {
    // get inventory units
    InventoryUnit.read()
      .then(function (list) {
        vm.unitList = list;
      })
      .catch(Notify.errorHandler);
  }
}
