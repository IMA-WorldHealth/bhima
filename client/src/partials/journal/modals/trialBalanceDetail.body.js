angular.module('bhima.controllers')
  .controller('TrialBalanceDetailBodyController', TrialBalanceDetailBodyController);

TrialBalanceDetailBodyController.$inject = [
  'SessionService', 'TrialBalanceService', 'GridGroupingService', '$state', '$stateParams'
];

/**
 * @module journal/modals/trialBalanceDetail.body.js
 *
 * @description
 * handles the modal body in the trialBalanceDetail state
 */
function TrialBalanceDetailBodyController(Session, trialBalanceService, Grouping, $state, $stateParams) {
  var vm = this;
  var cssClass = trialBalanceService.getCSSClass($stateParams.feedBack);

  var columns = [
    { field : 'trans_id', displayName : 'TABLE.COLUMNS.TRANSACTION', headerCellFilter: 'translate', headerCellClass : cssClass},
    { field : 'account_number', displayName : 'TABLE.COLUMNS.ACCOUNT', headerCellFilter: 'translate', headerCellClass : cssClass},
    {
      field            : 'debit_equiv',
      displayName      : 'TABLE.COLUMNS.DEBIT',
      headerCellFilter : 'translate',
      headerCellClass  : cssClass,
      cellFilter       : 'currency:' + Session.enterprise.currency_id,
      cellClass        : 'text-right',
    },
    {
      field            : 'credit_equiv',
      displayName      : 'TABLE.COLUMNS.CREDIT',
      headerCellFilter : 'translate',
      headerCellClass  : cssClass,
      cellFilter       : 'currency:' + Session.enterprise.currency_id,
      cellClass        : 'text-right',
    }
  ];

  vm.stateParams = $stateParams;

  vm.gridOptions = {
    enableColumnMenus          : false,
    treeRowHeaderAlwaysVisible : false,
    appScopeProvider           : vm,
    columnDefs                 : columns,
    flatEntityAccess           : true,
    fastWatch                  : true,
  };

  vm.grouping = new Grouping(vm.gridOptions, false);
  vm.enterprise = Session.enterprise;
  vm.gridOptions.data = $stateParams.lines;

  /**
   * @function viewErrorList
   * @description
   * This function is responsible of switching the view from trialBalanceDetail to trialBalanceError
   **/
  function viewErrorList() {
    // FIX ME : what is the good way? storing original data in appcache?
    var lines = trialBalanceService.parseErrorRecord($stateParams.errors);
    $state.go('trialBalanceErrors', { lines: lines, feedBack: $stateParams.feedBack, records: $stateParams.records }, { reload : false });
  }

  vm.viewErrorList = viewErrorList;
}
