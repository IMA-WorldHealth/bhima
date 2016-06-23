/** @todo there are performance issues on this page - this should be because of  row/ cell templates, informally investigate */
/** @todo you should not be able to change the type of a title account with children */
/** @todo you cannot update the number or type of an account */
/** @todo business logic for deleting an account */

/**
 * Business rules implemented
 * 1. you cannot update an account number
 * 2. you cannot update an account type
 * 3. you can only delete an ccount if it is unused
 */
angular.module('bhima.controllers')
.controller('AccountsController', AccountsController);

AccountsController.$inject = [
  '$rootScope', 'AccountGridService', 'NotifyService'
];

function AccountsController($rootScope, AccountGrid, Notify) {
  var vm = this;

  /** @todo get this from constant definition */
  vm.TITLE_ACCOUNT = 4;
  vm.ROOT_ACCOUNT = 0;

  vm.indentTitleSpace = 20; // indent value in pixels
  vm.initialDataSet = true;

  vm.Accounts = new AccountGrid();

  vm.Accounts.settup()
    .then(bindGridData)
    .catch(Notify.handleError);

  var columns = [
    { field : 'number', displayName : '', cellClass : 'text-right', width : 70},
    { field : 'label', displayName : 'FORM.LABELS.ACCOUNT', cellTemplate : '/partials/accounts/templates/grid.indentCell.tmpl.html', headerCellFilter : 'translate' },
    { name : 'actions', displayName : '', cellTemplate : '/partials/accounts/templates/grid.actionsCell.tmpl.html', headerCellFilter : 'translate', width : 140 }
  ];

  vm.gridOptions = {
    appScopeProvider : vm,
    enableSorting : false,
    showTreeExpandNoChildren : false,
    enableColumnMenus : false,
    rowTemplate : '/partials/accounts/templates/grid.leafRow.tmpl.html',
    onRegisterApi : registerAccountEvents,
    columnDefs : columns
  };

  // because the modal is instantiated on onEnter in the ui-router configuration the
  // $parent $scope for the modal is $rootScope, it is impossible to inject the $scope of the
  // parent state into the onEnter callback. for this reason $rootScope is used for now
  $rootScope.$on('ACCOUNT_CREATED', vm.Accounts.updateViewInsert.bind(vm.Accounts));
  $rootScope.$on('ACCOUNT_UPDATED', handleUpdatedAccount);

  function handleUpdatedAccount(event, account) {
    var forceRefresh = vm.Accounts.updateViewEdit(event, account);

    if (forceRefresh) {
      vm.initialDataSet = true;
      bindGridData();
    }
  }

  function registerAccountEvents(api) {
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
}
