angular.module('bhima.controllers')
  .controller('TrialBalanceErrorBodyController', TrialBalanceErrorBodyController);

TrialBalanceErrorBodyController.$inject = [
  'SessionService', 'JournalPostingModalService', 'GridGroupingService', 'GridColumnService',
  'NotifyService', '$state', '$timeout'
];

/**
 * @module journal/modals/trialBalanceMain.body.js
 *
 * @description
 * This controller provides a tool to view the main state of trial balance
 * The main state let you post transaction into the general ledger
 */
function TrialBalanceErrorBodyController(Session, journalPostingModalService, Grouping, Columns, Notify, $state, $timeout) {
  var vm = this;
  var columns = [
    { field : 'code', displayName : 'TABLE.COLUMNS.ERROR_TYPE', headerCellFilter : 'translate', visible : false},
    {field : 'transaction', displayName : 'TABLE.COLUMNS.TRANSACTION', headerCellFilter : 'translate', visible : false}
  ];

  vm.gridOptions = {
    enableColumnMenus: false,
    treeRowHeaderAlwaysVisible: false,
    appScopeProvider: vm,
    columnDefs : columns
  };
  vm.grouping = new Grouping(vm.gridOptions, false);

  /**
   * @function cancel
   * @description
   * closes the modal and stop the posting process
   **/
  function cancel() {
    $state.transitionTo('journal');
  }


  vm.cancel = cancel;

}
