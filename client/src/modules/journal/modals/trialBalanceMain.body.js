angular.module('bhima.controllers')
  .controller('TrialBalanceMainBodyController', TrialBalanceMainBodyController);

TrialBalanceMainBodyController.$inject = [
  'SessionService', 'TrialBalanceService', 'NotifyService',
  '$state', 'uiGridConstants', 'uiGridGroupingConstants', '$filter',
  'AccountService',
];

/**
 * @module journal/modals/trialBalanceMain.body.js
 *
 * @description
 * This controller provides a tool to view the main state of trial balance
 * The main state let you post transaction into the general ledger
 */
function TrialBalanceMainBodyController(Session, TrialBalance, Notify, $state, uiGridConstants, uiGridGroupingConstants, $filter, Accounts) {
  var vm = this;
  var currencyId = Session.enterprise.currecny_id;
  var $currency = $filter('currency');

  var errorList = null;
  var records = $state.params.records;

  var gridApi;

  // expose to the view
  vm.viewErrorList = viewErrorList;
  vm.viewDetailByAccount = viewDetailByAccount;

  function render(aggregation) {
    aggregation.rendered = $currency(aggregation.value, currencyId);
  }

  var columns = [{
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
    cellFilter       : 'currency:' + currencyId,
  }, {
    field                            : 'debit_equiv',
    type                             : 'number',
    displayName                      : 'TABLE.COLUMNS.DEBIT',
    headerCellFilter                 : 'translate',
    footerCellClass                  : 'text-right text-danger',
    cellClass                        : 'text-right',
    cellFilter                       : 'currency:' + currencyId,
    treeAggregationType              : uiGridGroupingConstants.aggregation.SUM,
    customTreeAggregationFinalizerFn : render,
  }, {
    field                            : 'credit_equiv',
    type                             : 'number',
    displayName                      : 'TABLE.COLUMNS.CREDIT',
    headerCellFilter                 : 'translate',
    footerCellClass                  : 'text-right text-danger',
    cellFilter                       : 'currency:' + currencyId,
    cellClass                        : 'text-right',
    treeAggregationType              : uiGridGroupingConstants.aggregation.SUM,
    customTreeAggregationFinalizerFn : render,
  }, {
    field            : 'balance_final',
    type             : 'number',
    displayName      : 'TABLE.COLUMNS.AFTER',
    headerCellFilter : 'translate',
    cellClass        : 'text-right',
    cellFilter       : 'currency:' + currencyId,
  }, {
    field            : 'actions',
    displayName      : '',
    headerCellFilter : 'translate',
    cellTemplate     : '/modules/journal/templates/details-link.cell.html',
  }];

  vm.enterprise = Session.enterprise;
  vm.dataByTrans = records;
  vm.hasError = false;

  vm.gridOptions = {
    enableColumnMenus          : false,
    showColumnFooter           : true,  // default to true so that grid knows how to draw
    treeRowHeaderAlwaysVisible : false,
    flatEntityAccess           : true,
    fastWatch                  : true,
    appScopeProvider           : vm,
    columnDefs                 : columns,
    onRegisterApi              : function (api) { gridApi = api; },
  };

  /**
   * @function : fetchDataByAccount
   * @description :
   * This function fetch data by account from the server
   * through the trial balance service module
   **/
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

  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  /**
   * @function : accountView
   * @description :
   * This function is responsible of felling the grid data by account
   *
   * - It begins by configuring column visibility
   * - Fill the data through the fetchDataByAccount function
   * - Removing grouping because data are aggregated from database server
   *
   * This view is one of the two mains views because from this view you can post to the general ledger
   **/
  function accountView() {
    toggleLoadingIndicator();

    vm.columns.setVisibleColumns({
      balance_before : true,
      balance_final  : true,
      actions        : true,
      debit_equiv    : true,
      credit_equiv   : true,
      account_number : true,
      trans_id       : false,
    });

    fetchDataByAccount()
      .finally(function () {
        toggleLoadingIndicator();
      });
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
   **/
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
   **/
  function viewErrorList() {
    var lines = TrialBalance.parseErrorRecord(errorList);
    // FIX ME : what is the good way of keeping records? using appcache?
    $state.go('trialBalanceErrors', { lines: lines, feedBack: vm.feedBack, records: records }, { reload: false });
  }


  /**
   *  @function errorHandler
   * @description
   * This method handle correctly error by notifying the user through
   * the NotifyService and by setting to true the error flag
   **/
  function errorHandler(error) {
    vm.hasError = true;
    Notify.handleError(error);
  }

  function startup() {
    vm.loading = true;

    TrialBalance.checkTransactions(vm.dataByTrans)
      .then(function (error) {
        var cssClass = null;

        errorList = error.data;

        vm.feedBack = TrialBalance.getFeedBack(errorList); // getting a feedback object to customize the grid
        vm.isInvalid = vm.feedBack.hasError || vm.feedBack.hasWarning;

        cssClass = TrialBalance.getCSSClass(vm.feedBack);

        $state.current.data.checkingData = { errors: errorList, feedBack: vm.feedBack, cssClass: cssClass };
        $state.current.data.checked = true;

        // @todo - this should probably be done with the grid's header row template.
        columns.forEach(function (col) {
          col.headerCellClass = cssClass;
        });

        // only show the footer if the amounts are invalid
        if (!vm.isInvalid) {
          vm.gridOptions.showColumnFooter = false;
        }

        // make sure the column footer is processed + column css classes
        gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
      })
      .catch(errorHandler)
      .finally(function () {
        vm.loading = false;
        vm.showErrorButton = vm.isInvalid && !vm.loading;
      });

    fetchDataByAccount();
  }

  startup();
}
