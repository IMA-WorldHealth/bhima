angular.module('bhima.controllers')
.controller('ConfigurationAccountController', ConfigurationAccountController);

ConfigurationAccountController.$inject = [
  'ConfigurationAccountService', 'ModalService',
  'NotifyService', 'uiGridConstants', '$state', 'SessionService',
];

/**
 * Account Management Controller
 *
 * This controller is about the Account management module in the admin zone
 * It's responsible for creating, editing and updating a Account
 */
function ConfigurationAccountController(Configs, ModalService,
  Notify, uiGridConstants, $state, Session) {
  var vm = this;

  // bind methods
  vm.deleteConfig = deleteConfig;
  vm.editConfig = editConfig;
  vm.toggleFilter = toggleFilter;
  vm.currencySymbol = Session.enterprise.currencySymbol;

  // global variables
  vm.gridApi = {};
  vm.filterEnabled = false;

  var gridColumn =
    [
      { field : 'label', displayName : 'FORM.LABELS.DESIGNATION', headerCellFilter : 'translate' },
      { field : 'account_id', displayName : 'FORM.LABELS.ACCOUNT', cellTemplate : '/modules/payroll/account_configuration/templates/account.tmpl.html', headerCellFilter : 'translate' },
      { field : 'action',
        width : 80,
        displayName : '',
        cellTemplate : '/modules/payroll/account_configuration/templates/action.tmpl.html',
        enableSorting : false,
        enableFiltering : false,
      },
    ];

  // options for the UI grid
  vm.gridOptions = {
    appScopeProvider  : vm,
    enableColumnMenus : false,
    fastWatch         : true,
    flatEntityAccess  : true,
    enableSorting     : true,
    onRegisterApi     : onRegisterApiFn,
    columnDefs : gridColumn,
  };

  function onRegisterApiFn(gridApi) {
    vm.gridApi = gridApi;
  }

  function toggleFilter() {
    vm.filterEnabled = !vm.filterEnabled;
    vm.gridOptions.enableFiltering = vm.filterEnabled;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  }

  function loadConfigs() {
    vm.loading = true;

    Configs.read()
    .then(function (data) {
      vm.gridOptions.data = data;
    })
    .catch(Notify.handleError)
    .finally(function () {
      vm.loading = false;
    });
  }

  // switch to delete warning mode
  function deleteConfig(title) {
    ModalService.confirm('FORM.DIALOGS.CONFIRM_DELETE')
    .then(function (bool) {
      if (!bool) { return; }

      Configs.delete(title.id)
      .then(function () {
        Notify.success('FORM.INFO.DELETE_SUCCESS');
        loadConfigs();
      })
      .catch(Notify.handleError);
    });
  }

  // update an existing Account Configuration
  function editConfig(title) {
    $state.go('configurationAccount.edit', { id : title.id });
  }

  loadConfigs();
}