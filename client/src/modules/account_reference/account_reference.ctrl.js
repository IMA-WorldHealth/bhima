angular.module('bhima.controllers')
  .controller('AccountReferenceController', AccountReferenceController);

AccountReferenceController.$inject = [
  '$state', 'AccountReferenceService', 'NotifyService', 'uiGridConstants',
];

/**
 * AccountReference Controller
 * This module is responsible for handling the CRUD operation on the account references
 */
function AccountReferenceController($state, AccountReferences, Notify, uiGridConstants) {
  const vm = this;
  vm.gridApi = {};
  vm.filterEnabled = false;
  vm.toggleFilter = toggleFilter;

  // options for the UI grid
  vm.gridOptions = {
    appScopeProvider  : vm,
    enableColumnMenus : false,
    fastWatch         : true,
    flatEntityAccess  : true,
    enableSorting     : true,
    onRegisterApi     : onRegisterApiFn,
    columnDefs : [
      {
        field : 'abbr',
        displayName : 'ACCOUNT.REFERENCE.REFERENCE',
        headerCellFilter : 'translate',
        enableFiltering : true,
      },
      {
        field : 'accounts',
        displayName : 'ACCOUNT.REFERENCE.ACCOUNT_LIST',
        headerCellFilter : 'translate',
        enableFiltering : true,
      },
      {
        field : 'credits',
        displayName : 'FORM.LABELS.CREDIT_BALANCE',
        headerCellFilter : 'translate',
        enableFiltering : true,
      },
      {
        field : 'debits',
        displayName : 'FORM.LABELS.DEBIT_BALANCE',
        headerCellFilter : 'translate',
        enableFiltering : true,
      },
      {
        field : 'description',
        displayName : 'ACCOUNT.REFERENCE.DESCRIPTION',
        headerCellFilter : 'translate',
        enableFiltering : true,
      },
      {
        field : 'parent_abbr',
        displayName : 'ACCOUNT.REFERENCE.PARENT_REFERENCE',
        headerCellFilter : 'translate',
        enableFiltering : true,
      },
      {
        field : 'is_amo_dep',
        displayName : 'ACCOUNT.REFERENCE.AMO_DEP',
        headerCellFilter : 'translate',
        cellTemplate : '/modules/account_reference/templates/is_amo_dep.cell.html',
        enableFiltering : true,
      },
      {
        field : 'action',
        displayName : '',
        cellTemplate : '/modules/account_reference/templates/action.cell.html',
        enableSorting : false,
        enableFiltering : false,
      },
    ],
  };

  function onRegisterApiFn(gridApi) {
    vm.gridApi = gridApi;
  }

  function toggleFilter() {
    vm.filterEnabled = !vm.filterEnabled;
    vm.gridOptions.enableFiltering = vm.filterEnabled;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  }

  // bind methods
  vm.edit = edit;
  vm.remove = remove;

  function edit(accountReference) {
    $state.go('account_reference.edit', { id : accountReference.id });
  }

  function remove(id) {
    AccountReferences.delete(id)
      .then(() => {
        Notify.success('ACCOUNT.REFERENCE.DELETED');
        loadGrid();
      })
      .catch(Notify.handleError);
  }

  function handleError(error) {
    vm.hasError = true;
    Notify.handleError(error);
  }

  // load user grid
  function loadGrid() {
    toggleLoadingIndicator();
    vm.hasError = false;

    AccountReferences.read()
      .then((references) => {
        vm.gridOptions.data = references;
      })
      .catch(handleError)
      .finally(toggleLoadingIndicator);
  }

  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  loadGrid();
}
