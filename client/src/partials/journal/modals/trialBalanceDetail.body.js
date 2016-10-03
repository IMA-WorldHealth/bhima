angular.module('bhima.controllers')
  .controller('TrialBalanceDetailBodyController', TrialBalanceDetailBodyController);

TrialBalanceDetailBodyController.$inject = [
  'SessionService', 'JournalPostingModalService', 'GridGroupingService', 'GridColumnService',
  'NotifyService', '$state', '$timeout', '$stateParams'
];

/**
 * @module journal/modals/JournalPoster.modal
 *
 * @description
 * This controller provides a tool to do trial balance
 */
function TrialBalanceDetailBodyController(Session, journalPostingModalService, Grouping, Columns, Notify, $state, $timeout, $stateParams) {
  var vm = this;
  var cssClass = journalPostingModalService.getCSSClass($stateParams.feedBack);
  var columns = [
    { field : 'trans_id', displayName : 'TABLE.COLUMNS.TRANSACTION', headerCellFilter: 'translate', headerCellClass : cssClass},
    { field : 'account_number', displayName : 'TABLE.COLUMNS.ACCOUNT', headerCellFilter: 'translate', headerCellClass : cssClass},
    {
      field : 'debit_equiv',
      displayName : 'TABLE.COLUMNS.DEBIT',
      headerCellFilter: 'translate',
      cellTemplate : '/partials/templates/grid/debit_equiv.cell.html',
      headerCellClass : cssClass
    },
    {
      field : 'credit_equiv',
      displayName : 'TABLE.COLUMNS.CREDIT',
      headerCellFilter: 'translate',
      cellTemplate : '/partials/templates/grid/credit_equiv.cell.html',
      headerCellClass : cssClass
    }
  ];

  vm.state = $state;
  vm.gridOptions = {
    enableColumnMenus: false,
    treeRowHeaderAlwaysVisible: false,
    appScopeProvider: vm,
    columnDefs : columns
  };
  vm.grouping = new Grouping(vm.gridOptions, false);
  vm.enterprise = Session.enterprise;
  vm.gridOptions.data = $stateParams.lines;

  /**
   * @function cancel
   * @description
   * This function is responsible of switching the view from detail to main
   **/
  function cancel() {
    // FIX ME : what is the good way? storing original data in appcache?
    $state.go('trialBalanceMain', {records : vm.state.params.records}, {reload : true});
  }

  vm.cancel = cancel;
}
