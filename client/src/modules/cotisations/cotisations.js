angular.module('bhima.controllers')
.controller('CotisationManagementController', CotisationManagementController);

CotisationManagementController.$inject = [
  'CotisationService', 'ModalService',
  'NotifyService', 'uiGridConstants', '$state', 'SessionService',
];

/**
 * Cotisation Management Controller
 *
 * This controller is about the Job Title management module in the admin zone
 * It's responsible for creating, editing and updating a Job Title
 */
function CotisationManagementController(Cotisations, ModalService,
  Notify, uiGridConstants, $state, Session) {
  var vm = this;

  // bind methods
  vm.deleteCotisation = deleteCotisation;
  vm.editCotisation = editCotisation;
  vm.createCotisation = createCotisation;
  vm.toggleFilter = toggleFilter;

  // global variables
  vm.gridApi = {};
  vm.filterEnabled = false;

  var gridColumn =
    [
      { field : 'label', displayName : 'FORM.LABELS.DESIGNATION', headerCellFilter : 'translate' },
      { field : 'abbr', displayName : 'FORM.LABELS.ABBREVIATION', headerCellFilter : 'translate' },
      { field : 'is_employee', displayName : '', cellTemplate : '/modules/cotisations/templates/costpart.tmpl.html', headerCellFilter : 'translate' },
      { field : 'four_account_id', displayName : 'FORM.LABELS.FOUR_ACCOUNT', cellTemplate : '/modules/cotisations/templates/four.tmpl.html', headerCellFilter : 'translate' },
      { field : 'six_account_id', displayName : 'FORM.LABELS.SIX_ACCOUNT', cellTemplate : '/modules/cotisations/templates/six.tmpl.html', headerCellFilter : 'translate' },
      { field : 'value', displayName : 'FORM.LABELS.VALUE', headerCellFilter : 'translate' },  
      { field : 'is_percent', displayName : '', cellTemplate : '/modules/cotisations/templates/percent.tmpl.html', headerCellFilter : 'translate' },
      { field : 'action',
        width : 80,
        displayName : '',
        cellTemplate : '/modules/cotisations/templates/action.tmpl.html',
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

  function loadCotisations() {
    vm.loading = true;

    Cotisations.read(null, { detailed : 1 })
    .then(function (data) {
      vm.gridOptions.data = data;
    })
    .catch(Notify.handleError)
    .finally(function () {
      vm.loading = false;
    });
  }

  // switch to delete warning mode
  function deleteCotisation(title) {
    ModalService.confirm('FORM.DIALOGS.CONFIRM_DELETE')
    .then(function (bool) {
      if (!bool) { return; }

      Cotisations.delete(title.id)
      .then(function () {
        Notify.success('COTISATION.DELETED');
        loadCotisations();
      })
      .catch(Notify.handleError);
    });
  }

  // update an existing Cotisation
  function editCotisation(title) {
    $state.go('cotisations.edit', { id : title.id });
  }

  // create a new Cotisation
  function createCotisation() {
    $state.go('cotisations.create');
  }

  loadCotisations();
}
