angular.module('bhima.controllers')
.controller('ColumnsConfigModalController', ColumnsConfigModalController);

ColumnsConfigModalController.$inject = [
  '$uibModalInstance', 'Columns'
];

/**
 * @module journal/modals/columnConfig.modal
 *
 * @description
 * This controller provides the column configuration for the posting journal
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
    Columns.setVisibleColumns(vm.map);
    ModalInstance.close();
  }

  // reset the column visibility to their default configuration
  function resetDefaults() {
    Columns.resetDefaultVisibility();
    vm.map = Columns.getColumnVisibilityMap();
  }

  // dismiss the modal, canceling column updates
  function cancel() {
    ModalInstance.dismiss();
  }

  vm.submit = submit;
  vm.cancel = cancel;
  vm.resetDefaults = resetDefaults;
}
