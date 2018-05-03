angular.module('bhima.controllers')
.controller('IprTaxManagementController', IprTaxManagementController);

IprTaxManagementController.$inject = [
  'IprTaxService', 'ModalService',
  'NotifyService', 'uiGridConstants', '$state', 'SessionService',
];

/**
 * IprTax Management Controller
 *
 * This controller is about the IprTax management module in the admin zone
 * It's responsible for creating, editing and updating a IprTax
 */
function IprTaxManagementController(IprTaxes, ModalService,
  Notify, uiGridConstants, $state, Session) {
  var vm = this;

  // bind methods
  vm.deleteIprTax = deleteIprTax;
  vm.editIprTax = editIprTax;
  vm.toggleFilter = toggleFilter;

  // global variables
  vm.gridApi = {};
  vm.filterEnabled = false;

  var gridColumn =
    [
    
      { field : 'label', displayName : 'FORM.LABELS.DESIGNATION', headerCellFilter : 'translate' },
      { field : 'description', displayName : 'FORM.LABELS.DESCRIPTION', headerCellFilter : 'translate' },
      { field : 'currency_name', displayName : 'FORM.LABELS.CURRENCY', headerCellFilter : 'translate' },
      { field : 'action',
        width : 80,
        displayName : '',
        cellTemplate : '/modules/ipr_tax/templates/action.tmpl.html',
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

  function loadIprTaxes() {
    vm.loading = true;

    IprTaxes.read()
    .then(function (data) {
      vm.gridOptions.data = data;
    })
    .catch(Notify.handleError)
    .finally(function () {
      vm.loading = false;
    });
  }

  // switch to delete warning mode
  function deleteIprTax(title) {
    ModalService.confirm('FORM.DIALOGS.CONFIRM_DELETE')
    .then(function (bool) {
      if (!bool) { return; }

      IprTaxes.delete(title.id)
      .then(function () {
        Notify.success('FORM.INFO.DELETE_SUCCESS');
        loadIprTaxes();
      })
      .catch(Notify.handleError);
    });
  }

  // update an existing IprTax
  function editIprTax(title) {
    $state.go('ipr_tax.edit', { id : title.id });
  }

  loadIprTaxes();
}