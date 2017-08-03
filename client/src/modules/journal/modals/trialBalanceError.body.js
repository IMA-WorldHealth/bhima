angular.module('bhima.controllers')
  .controller('TrialBalanceErrorBodyController', TrialBalanceErrorBodyController);

TrialBalanceErrorBodyController.$inject = [
  'TrialBalanceService', 'GridGroupingService', '$stateParams',
];

/**
 * @module journal/modals/trialBalanceMain.body.js
 *
 * @description
 * This controller provides a tool to view the main state of trial balance
 * The main state let you post transaction into the general ledger
 */
function TrialBalanceErrorBodyController(trialBalanceService, Grouping, $stateParams) {
  var vm = this;

  var hasErrorState = $stateParams.feedBack.hasError;
  var cssClass = hasErrorState ? 'ui-grid-header-cell-error' : 'ui-grid-header-cell-primary';

  var columns = [{
    field            : 'code',
    displayName      : 'TABLE.COLUMNS.ERROR_TYPE',
    headerCellFilter : 'translate',
    headerCellClass  : cssClass,
  }, {
    field            : 'trans_id',
    displayName      : 'TABLE.COLUMNS.TRANSACTION',
    headerCellFilter : 'translate',
    headerCellClass  : cssClass,
  }];

  vm.gridOptions = {
    enableColumnMenus          : false,
    treeRowHeaderAlwaysVisible : false,
    appScopeProvider           : vm,
    columnDefs                 : columns,
    flatEntityAccess           : true,
    fastWatch                  : true,
  };

  vm.grouping = new Grouping(vm.gridOptions, false, 'code');
  vm.gridOptions.data = $stateParams.lines;
}
