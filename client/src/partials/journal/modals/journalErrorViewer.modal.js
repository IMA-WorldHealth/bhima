angular.module('bhima.controllers')
  .controller('JournalErrorViewerModalController', JournalErrorViewerModalController);

JournalErrorViewerModalController.$inject = [
  '$uibModalInstance', 'GridColumnService', 'GridGroupingService', 'JournalErrorViewerService', 'params'
];

/**
 * @module journal/modals/journalErrorViewer.modal
 *
 * @description
 * This controller provides an error report relative to the posting operation
 */
function JournalErrorViewerModalController (ModalInstance, Columns, Grouping, JournalErrorViewerService, Params) {
  var vm = this;
  var cacheKey = 'errorReport';
  var columns = [
    { field : 'code', displayName : 'TABLE.COLUMNS.ERROR_TYPE', headerCellFilter : 'translate', enableCellEdit : false, allowCellFocus : false},
    {field : 'transaction', displayName : 'TABLE.COLUMNS.TRANSACTION', headerCellFilter : 'translate', enableCellEdit : false, allowCellFocus : false}
  ];
  var records = JournalErrorViewerService.parseGridRecord(Params.errors.data);


  vm.groupingDetail = { 'initial' : 'code', 'selected' : 'code'};
  vm.gridOptions = {
    enableColumnMenus : false,
    treeRowHeaderAlwaysVisible: false,
    appScopeProvider : vm
  };
  vm.columns = new Columns(vm.gridOptions, cacheKey);
  vm.grouping  = new Grouping(vm.gridOptions, false, vm.groupingDetail.initial);
  vm.gridOptions.columnDefs = columns;
  vm.gridOptions.data = records;
  
  console.log(Params);

  /**
   * @function cancel
   * @description
   * closes the modal
   **/
  function close() {
    ModalInstance.close();
  }

  vm.close = close;
}

