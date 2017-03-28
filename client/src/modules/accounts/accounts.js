angular.module('bhima.controllers')
.controller('AccountsController', AccountsController);

AccountsController.$inject = [
  '$rootScope', '$timeout', 'AccountGridService', 'NotifyService', 'bhConstants',
  'LanguageService', 'uiGridConstants'
];

/**
 * @module AccountsController
 *
 * @todo there are performance issues on this page - this should be because of  row/cell templates, investigate
 *
 * @description
 * This controller is responsible for configuring the Accounts Management UI grid
 * and connecting it with the Accounts data model.
 */
function AccountsController($rootScope, $timeout, AccountGrid, Notify, Constants, Language, uiGridConstants) {

  var vm = this;
  vm.Constants = Constants;

  // account title indent value in pixels
  vm.indentTitleSpace = 20;

  // this flag will determine if the grid should expand the rows on data change
  vm.initialDataSet = true;

  // lang parameter for document
  vm.parameter = { lang: Language.key };
  vm.loading = true;

  vm.Accounts = new AccountGrid();
  vm.Accounts.settup()
    .then(bindGridData)
    .catch(Notify.handleError)
    .finally(toggleLoadingIndicator);

  var columns = [
    { field : 'number', displayName : '', cellClass : 'text-right', width : 80},
    { field : 'label', displayName : 'FORM.LABELS.ACCOUNT', cellTemplate : '/modules/accounts/templates/grid.indentCell.tmpl.html', headerCellFilter : 'translate' },
    { name : 'actions', enableFiltering : false, displayName : '', cellTemplate : '/modules/accounts/templates/grid.actionsCell.tmpl.html', headerCellFilter : 'translate', width : 140 }
  ];

  vm.gridOptions = {
    appScopeProvider : vm,
    enableSorting : false,
    enableFiltering : false,
    flatEntityAccess : true,
    showTreeExpandNoChildren : false,
    enableColumnMenus : false,
    rowTemplate : '/modules/accounts/templates/grid.leafRow.tmpl.html',
    onRegisterApi : registerAccountEvents,
    columnDefs : columns
  };

  // because the modal is instantiated on onEnter in the ui-router configuration the
  // $parent $scope for the modal is $rootScope, it is impossible to inject the $scope of the
  // parent state into the onEnter callback. for this reason $rootScope is used for now
  $rootScope.$on('ACCOUNT_CREATED', vm.Accounts.updateViewInsert.bind(vm.Accounts));
  $rootScope.$on('ACCOUNT_DELETED', vm.Accounts.updateViewDelete.bind(vm.Accounts));
  $rootScope.$on('ACCOUNT_UPDATED', handleUpdatedAccount);

  function handleUpdatedAccount(event, account) {
    var scrollDelay = 200;

    // check to see if the underlying accounts model requires a grid refresh
    // it will return true if it is required
    var forceRefresh = vm.Accounts.updateViewEdit(event, account);

    if (forceRefresh) {
      vm.initialDataSet = true;
      bindGridData();

      // @todo delaying scroll removes a corner case where the grid hasn't yet
      //       fully processed the new data - this should probably follow an event
      $timeout(function () { scrollTo(account.id); }, scrollDelay);
    }
  }

  // scroll to a row given an account ID
  function scrollTo(accountId) {
    vm.api.core.scrollTo(getDisplayAccount(accountId));
  }

  function getDisplayAccount(id) {
    var account;

    // UI Grid uses the actual data object, pulling it directly from the account
    // store will not match UI grid's copy so this method iterates through grid
    // options data
    vm.gridOptions.data.some(function (row) {
      if (row.id === id) {
        account = row;
        return;
      }
      return false;
    });
    return account;
  }

  function registerAccountEvents(api) {
    vm.api = api;
    api.grid.registerDataChangeCallback(expandOnSetData);
  }

  function expandOnSetData(grid) {
    if (vm.initialDataSet && grid.options.data.length) {
      grid.api.treeBase.expandAllRows();
      vm.initialDataSet = false;
    }
  }

  function bindGridData() {
    vm.gridOptions.data = vm.Accounts.data;
  }

  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  vm.toggleInlineFilter = function toggleInlineFilter() {
    vm.gridOptions.enableFiltering = !vm.gridOptions.enableFiltering;
    vm.api.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  };

  $timeout(function () { vm.pageLoaded = true; });
}
