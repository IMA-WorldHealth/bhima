angular.module('bhima.controllers')
  .controller('TrialBalanceMainBodyController', TrialBalanceMainBodyController);

TrialBalanceMainBodyController.$inject = [
  'SessionService', 'TrialBalanceService', 'NotifyService',
  '$state', 'uiGridConstants', 'uiGridGroupingConstants', '$filter',
  'AccountService', 'GridExportService',
];

/**
 * @module journal/modals/trialBalanceMain.body.js
 *
 * @description
 * This controller provides a tool to view the main state of trial balance
 * The main state let you post transaction into the general ledger
 */
function TrialBalanceMainBodyController(Session, TrialBalance, Notify,
  $state, uiGridConstants, uiGridGroupingConstants, $filter,
  Accounts, GridExport) {
  var vm = this;
  var currencyId = Session.enterprise.currecny_id;
  var $currency = $filter('currency');

  var errorList = null;
  var records = $state.params.records;


  var gridApi;
  var columns;

  // expose to the view
  vm.viewErrorList = viewErrorList;
  vm.viewDetailByAccount = viewDetailByAccount;

  function render(aggregation) {
    aggregation.rendered = $currency(aggregation.value, currencyId);
  }

  columns = [{
    field            : 'trans_id',
    displayName      : 'TABLE.COLUMNS.TRANSACTION',
    headerCellFilter : 'translate',
    visible          : false,
  }, {
    field            : 'account',
    displayName      : 'TABLE.COLUMNS.ACCOUNT',
    headerCellFilter : 'translate',
  }, {
    field            : 'code',
    displayName      : 'TABLE.COLUMNS.ERROR_TYPE',
    headerCellFilter : 'translate',
    visible          : false,
  }, {
    field            : 'transaction',
    displayName      : 'TABLE.COLUMNS.TRANSACTION',
    headerCellFilter : 'translate',
    visible          : false,
  }, {
    field            : 'balance_before',
    type             : 'number',
    displayName      : 'TABLE.COLUMNS.BEFORE',
    headerCellFilter : 'translate',
    cellClass        : 'text-right',
    cellFilter       : 'currency:'.concat(currencyId),
  }, {
    field                            : 'debit_equiv',
    type                             : 'number',
    displayName                      : 'TABLE.COLUMNS.DEBIT',
    headerCellFilter                 : 'translate',
    footerCellClass                  : 'text-right text-danger',
    cellClass                        : 'text-right',
    cellFilter                       : 'currency:'.concat(currencyId),
    treeAggregationType              : uiGridGroupingConstants.aggregation.SUM,
    customTreeAggregationFinalizerFn : render,
  }, {
    field                            : 'credit_equiv',
    type                             : 'number',
    displayName                      : 'TABLE.COLUMNS.CREDIT',
    headerCellFilter                 : 'translate',
    footerCellClass                  : 'text-right text-danger',
    cellFilter                       : 'currency:'.concat(currencyId),
    cellClass                        : 'text-right',
    treeAggregationType              : uiGridGroupingConstants.aggregation.SUM,
    customTreeAggregationFinalizerFn : render,
  }, {
    field            : 'balance_final',
    type             : 'number',
    displayName      : 'TABLE.COLUMNS.AFTER',
    headerCellFilter : 'translate',
    cellClass        : 'text-right',
    cellFilter       : 'currency:'.concat(currencyId),
  }, {
    field            : 'actions',
    displayName      : '',
    headerCellFilter : 'translate',
    cellTemplate     : '/modules/journal/templates/details-link.cell.html',
  }];

  vm.enterprise = Session.enterprise;
  vm.dataByTrans = records;
  vm.exportGrid = exportGrid;
  vm.hasError = false;

  vm.gridOptions = {
    enableColumnMenus          : false,
    showColumnFooter           : true,
    treeRowHeaderAlwaysVisible : false,
    flatEntityAccess           : true,
    fastWatch                  : true,
    appScopeProvider           : vm,
    columnDefs                 : columns,
    onRegisterApi              : function (api) { gridApi = api; },
  };

  var exportation = new GridExport(vm.gridOptions, 'all', 'visible');

  /**
  * @function : fetchDataByAccount
  * @description :
  * This function fetch data by account from the server
  * through the trial balance service module
  */
  function fetchDataByAccount() {
    return TrialBalance.getDataByAccount(vm.dataByTrans)
      .then(function (data) {

        data.forEach(function (row) {
          row.account = Accounts.label(row);
        });

        vm.gridOptions.data = data;
        gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
      })
      .catch(errorHandler);
  }

  /**
  * @function : viewDetailByAccount
  *
  * @param {Integer) accountId, the account ID
  *
  * @description :
  * From the account view, this function help to see every transaction relative to one account,
  * in order to understand the amounts listed.
  *
  * The state is switched from trialBalanceMain to trialBalanceDetail, three objects are encapsulated in the params
  * object :
  * lines : line for filling the detail grid
  * feedBack : contains the result of transaction checking
  * records : lines to fill the main grid when the state will be switched back
  *
  * The target view is not the main view, because you can not post to the general ledger from this view,
  * you have to reset the view to the main view first, this view is just giving complementary information to the user.
  */
  function viewDetailByAccount(accountId) {
    var lines = TrialBalance.getRelatedTransaction(accountId, vm.dataByTrans);
    // FIX ME : what is the good way of keeping records? using appcache?
    $state.go('trialBalanceDetail', { lines: lines, feedBack: vm.feedBack, records: records, errors: errorList }, { reload: false });
  }

  /**
  * @function : viewErrorList
  *
  * @description :
  * From whatever view, this function help to see every errors and warnings relative to a selected set of transaction
  *
  * The state is switched from trialBalanceMain to trialBalanceErrors, three objects are encapsulated in the params
  * object :
  * lines : line for filling the error grid
  * feedBack : contains the result of transaction checking
  * records : lines to fill the main grid when the state will be switched back
  *
  * The target view is not the main view, because you can not post to the general ledger from this view,
  * you have to reset the view to the main view first, this view is just giving complementary information to the user.
  */
  function viewErrorList() {
    var lines = TrialBalance.parseErrorRecord(errorList);
    // FIX ME : what is the good way of keeping records? using appcache?
    $state.go('trialBalanceErrors', { lines: lines, feedBack: vm.feedBack, records: records }, { reload: false });
  }


  /**
   * @function errorHandler
   * @description
   * This method handle correctly error by notifying the user through
   * the NotifyService and by setting to true the error flag
   */
  function errorHandler(error) {
    vm.hasError = true;
    Notify.handleError(error);
  }

  function startup() {
    vm.loading = true;

    TrialBalance.checkTransactions(vm.dataByTrans)
      .then(function (error) {
        errorList = error.data;

        vm.feedBack = TrialBalance.getFeedBack(errorList); // getting a feedback object to customize the grid
        vm.isInvalid = vm.feedBack.hasError || vm.feedBack.hasWarning;
        vm.hasTrialBalanceErrors = vm.isInvalid;

        $state.current.data.checkingData = { errors : errorList, feedBack: vm.feedBack };
        $state.current.data.checked = true;

        // only show the footer if the amounts are invalid
        if (!vm.isInvalid) {
          vm.gridOptions.showColumnFooter = false;
        }

        // make sure the cell classes are properly assigned.
        angular.forEach(columns, function (col) {
          col.headerCellClass = vm.isInvalid ? 'ui-grid-header-cell-error' : 'ui-grid-header-cell-primary';
        });

        // make sure the column footer is processed + column css classes
        gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
      })
      .catch(errorHandler)
      .finally(function () {
        vm.loading = false;
      });

    fetchDataByAccount();
  }

  /**
   * Export to csv
   */
  function exportGrid() {
    exportation.run();
  }

  startup();
}
