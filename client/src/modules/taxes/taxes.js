angular.module('bhima.controllers')
.controller('TaxManagementController', TaxManagementController);

TaxManagementController.$inject = [
  'TaxService', 'ModalService',
  'NotifyService', 'uiGridConstants', '$state', 'SessionService',
];

/**
 * Tax Management Controller
 *
 * This controller is about the Tax management module in the admin zone
 * It's responsible for creating, editing and updating a Tax
 */
function TaxManagementController(Taxes, ModalService,
  Notify, uiGridConstants, $state, Session) {
  var vm = this;

  // bind methods
  vm.deleteTax = deleteTax;
  vm.editTax = editTax;
  vm.createTax = createTax;
  vm.toggleFilter = toggleFilter;

  // global variables
  vm.gridApi = {};
  vm.filterEnabled = false;

  var gridColumn =
    [
      { field : 'label', displayName : 'FORM.LABELS.DESIGNATION', headerCellFilter : 'translate' },
      { field : 'abbr', displayName : 'FORM.LABELS.ABBREVIATION', headerCellFilter : 'translate' },
      { field : 'is_employee', displayName : '', cellTemplate : '/modules/taxes/templates/costpart.tmpl.html', headerCellFilter : 'translate' },
      { field : 'four_account_id', displayName : 'FORM.LABELS.FOUR_ACCOUNT', cellTemplate : '/modules/taxes/templates/four.tmpl.html', headerCellFilter : 'translate' },
      { field : 'six_account_id', displayName : 'FORM.LABELS.SIX_ACCOUNT', cellTemplate : '/modules/taxes/templates/six.tmpl.html', headerCellFilter : 'translate' },
      { field : 'value', displayName : 'FORM.LABELS.VALUE', headerCellFilter : 'translate' },  
      { field : 'is_percent', displayName : 'FORM.LABELS.IS_PERCENT', cellTemplate : '/modules/taxes/templates/percent.tmpl.html', headerCellFilter : 'translate' },
      { field : 'is_ipr', displayName : 'FORM.LABELS.IS_IPR', cellTemplate : '/modules/taxes/templates/ipr.tmpl.html', headerCellFilter : 'translate' },
      { field : 'action',
        width : 80,
        displayName : '',
        cellTemplate : '/modules/taxes/templates/action.tmpl.html',
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

  function loadTaxes() {
    vm.loading = true;

    Taxes.read(null)
    .then(function (data) {
      vm.gridOptions.data = data;
    })
    .catch(Notify.handleError)
    .finally(function () {
      vm.loading = false;
    });
  }

  // switch to delete warning mode
  function deleteTax(title) {
    ModalService.confirm('FORM.DIALOGS.CONFIRM_DELETE')
    .then(function (bool) {
      if (!bool) { return; }

      Taxes.delete(title.id)
      .then(function () {
        Notify.success('TAX.DELETED');
        loadTaxes();
      })
      .catch(Notify.handleError);
    });
  }

  // update an existing Tax
  function editTax(title) {
    $state.go('taxes.edit', { id : title.id });
  }

  // create a new Tax
  function createTax() {
    $state.go('taxes.create');
  }

  loadTaxes();
}