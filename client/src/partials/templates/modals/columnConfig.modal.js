angular.module('bhima.controllers')
  .controller('ColumnsConfigModalController', ColumnsConfigModalController);

ColumnsConfigModalController.$inject = [ '$uibModalInstance', 'Columns' ];

/**
 * @module ColumnConfigModal
 *
 * @description
 * This controller powers a generic modal that is used from the GridColumnService
 * to toggle column visibilities.
 */
function ColumnsConfigModalController(ModalInstance, Columns) {
  var vm = this;

  // make sure we do not have any blank columns
  vm.columns = Columns.getColumns().filter(function (column) {
    return column.displayName !== '';
  });

  // visibility map
  vm.map = Columns.getColumnVisibilityMap();

  // the middle of the list to print elements in two columns
  vm.middle = Math.round(Object.keys(vm.columns).length / 2);

  /**
   * @function submit
   * @description for submitting a dialog content
   */
  function submit() {
    if (vm.hasTooFewColumns) { return; }

    Columns.setVisibleColumns(vm.map);
    ModalInstance.close();
  }

  // reset the column visibility to their default configuration
  function resetDefaults() {
    vm.hasTooFewColumns = false;
    Columns.resetDefaultVisibility();
    vm.map = Columns.getColumnVisibilityMap();
  }

  // dismiss the modal, canceling column updates
  function cancel() {
    ModalInstance.dismiss();
  }

  function checkVisible(){
    var columnNumber = Columns.hasEnoughColumns(vm.map);
    vm.hasTooFewColumns = !columnNumber ? true : false; 

  }

  vm.submit = submit;
  vm.cancel = cancel;
  vm.resetDefaults = resetDefaults;
  vm.checkVisible = checkVisible;
}
