angular.module('bhima.controllers')
  .controller('TrialBalanceMainBodyController', TrialBalanceMainBodyController);

TrialBalanceMainBodyController.$inject = [
  'SessionService', 'TrialBalanceService', 'GridGroupingService', 'GridColumnService',
  'NotifyService', '$state', '$timeout'
];

/**
 * @module journal/modals/trialBalanceMain.body.js
 *
 * @description
 * This controller provides a tool to view the main state of trial balance
 * The main state let you post transaction into the general ledger
 */
function TrialBalanceMainBodyController(Session, trialBalanceService, Grouping, Columns, Notify, $state, $timeout) {
  var vm = this;
  var columns = [
    { field : 'trans_id', displayName : 'TABLE.COLUMNS.TRANSACTION', headerCellFilter: 'translate', visible : false},
    { field : 'account_number', displayName : 'TABLE.COLUMNS.ACCOUNT', headerCellFilter: 'translate'},
    { field : 'code', displayName : 'TABLE.COLUMNS.ERROR_TYPE', headerCellFilter : 'translate', visible : false},
    { field : 'transaction', displayName : 'TABLE.COLUMNS.TRANSACTION', headerCellFilter : 'translate', visible : false},
    { field : 'balance_before',
      displayName : 'TABLE.COLUMNS.BEFORE',
      headerCellFilter : 'translate',
      cellFilter : 'currency:' + Session.enterprise.currency_id,
      visible : true
    },
    { field : 'debit_equiv', displayName : 'TABLE.COLUMNS.DEBIT', headerCellFilter: 'translate', cellTemplate : '/partials/templates/grid/debit_equiv.cell.html' },
    { field : 'credit_equiv', displayName : 'TABLE.COLUMNS.CREDIT', headerCellFilter: 'translate', cellTemplate : '/partials/templates/grid/credit_equiv.cell.html'},
    { field : 'balance_final',
      displayName : 'TABLE.COLUMNS.AFTER',
      headerCellFilter : 'translate',
      cellFilter : 'currency:' + Session.enterprise.currency_id,
      visible : true
    },
    { field : 'actions',
      displayName : '',
      headerCellFilter: 'translate',
      visible: true,
      enableCellEdit: false,
      cellTemplate: '/partials/journal/templates/error-link.cell.html',
      allowCellFocus: false
    }
  ];
  var errorList = null, records = $state.params.records;

  vm.enterprise = Session.enterprise;
  vm.dataByTrans = records;
  vm.viewDetail = {
    'trans' : transactionView,
    'account' : accountView,
    key : 'FORM.BUTTONS.GROUP_BY_TRANSACTION',
    selected : 'account'
  };
  vm.gridOptions = {
    enableColumnMenus: false,
    treeRowHeaderAlwaysVisible: false,
    appScopeProvider: vm,
    columnDefs : columns
  };
  vm.grouping = new Grouping(vm.gridOptions, false);
  vm.columns = new Columns(vm.gridOptions);
  vm.loading = true;

  /**
   * @function : fetchDataByAccount
   * @description :
   * This function fetch data by account from the server
   * through the trial balance service module
   **/
  function fetchDataByAccount(){
    return trialBalanceService.getDataByAccount(vm.dataByTrans);
  }

  /**
   * @function : transactionView
   * @description :
   * This function is responsible of felling the grid data and grouping them by transaction
   *
   * - It begins by configuring column visibility
   * - Fill the data
   * - Grouping the data by transaction
   *
   * This view is one of the two mains views because from this view you can post to the general ledger
   **/
  function transactionView() {
    vm.columns.setVisibleColumns({
      balance_before : false,
      balance_final : false,
      actions : false,
      debit_equiv : true,
      credit_equiv : true,
      trans_id : true,
      account_number : true
    });
    vm.gridOptions.data = vm.dataByTrans;
    vm.viewDetail.key = 'FORM.BUTTONS.GROUP_BY_ACCOUNT';
    vm.viewDetail.selected = 'trans';
    vm.grouping.changeGrouping('trans_id');
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
    vm.columns.setVisibleColumns({
      balance_before : true,
      balance_final : true,
      actions : true,
      debit_equiv : true,
      credit_equiv : true,
      account_number : true,
      trans_id : false
    });
    fetchDataByAccount()
      .then(function (data) {
        vm.gridOptions.data = data;
        vm.viewDetail.key = 'FORM.BUTTONS.GROUP_BY_TRANSACTION';
        vm.viewDetail.selected = 'account';
        vm.grouping.removeGrouping();
      })
      .catch(Notify.handleError);
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
    var lines = trialBalanceService.getRelatedTransaction(accountId, vm.dataByTrans);
    //FIX ME : what is the good way of keeping records? using appcache?
    $state.go('trialBalanceDetail', {lines : lines, feedBack : vm.feedBack, records: records, errors : errorList }, {reload : false});
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
  function viewErrorList () {
    var lines = trialBalanceService.parseErrorRecord(errorList);
    //FIX ME : what is the good way of keeping records? using appcache?
    $state.go('trialBalanceErrors', {lines : lines, feedBack : vm.feedBack, records : records}, {reload : false});
  }


  /**
   *  @function switchView
   * @description
   * This method can change the way data are filled in the grid, from transaction grouping to account grouping vice versa
   **/
  function switchView (){
    var newView = trialBalanceService.switchView(vm.viewDetail.selected);
    vm.viewDetail[newView]();
  }

  trialBalanceService.checkTransactions(vm.dataByTrans)
    .then(function(error) {
      var cssClass = null;

      errorList = error.data;
      vm.feedBack = trialBalanceService.getFeedBack(errorList); //getting a feedback object to customize the grid
      cssClass = trialBalanceService.getCSSClass(vm.feedBack);
      $state.current.data.checkingData = {errors : errorList, feedBack : vm.feedBack, cssClass : cssClass};
      $state.current.data.checked = true;

      columns.forEach(function (col) {
        col.headerCellClass = cssClass;
      });
    })
    .catch(Notify.handleError)
    .finally(function () {
      vm.loading = false;
    });

  fetchDataByAccount()
    .then(function (data) {
      vm.gridOptions.data = data;
      $timeout(vm.grouping.removeGrouping, 0, false);
    })
    .catch(Notify.handleError);

  vm.switchView = switchView;
  vm.viewErrorList = viewErrorList;
  vm.viewDetailByAccount = viewDetailByAccount;
}
