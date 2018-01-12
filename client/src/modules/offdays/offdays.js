angular.module('bhima.controllers')
.controller('OffdayManagementController', OffdayManagementController);

OffdayManagementController.$inject = [
  'OffdayService', 'ModalService',
  'NotifyService', 'uiGridConstants', '$state', 'SessionService',
];

/**
 * Offday Management Controller
 *
 * This controller is about the Offday management module in the admin zone
 * It's responsible for creating, editing and updating a Offday
 */
function OffdayManagementController(Offdays, ModalService,
  Notify, uiGridConstants, $state, Session) {
  var vm = this;

  // bind methods
  vm.deleteOffday = deleteOffday;
  vm.editOffday = editOffday;
  vm.createOffday = createOffday;
  vm.toggleFilter = toggleFilter;

  // global variables
  vm.gridApi = {};
  vm.filterEnabled = false;

  var gridColumn =
    [
    
      { field : 'label', displayName : 'FORM.LABELS.DESIGNATION', headerCellFilter : 'translate' },
      { field : 'date', displayName : 'FORM.LABELS.DATE', cellFilter : 'date:"mediumDate"', headerCellFilter : 'translate' },
      { field : 'percent_pay', displayName : 'FORM.LABELS.PERCENTAGE', headerCellFilter : 'translate' },
      { field : 'action',
        width : 80,
        displayName : '',
        cellTemplate : '/modules/offdays/templates/action.tmpl.html',
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

  function loadOffdays() {
    vm.loading = true;

    Offdays.read(null, { detailed : 1 })
    .then(function (data) {
      vm.gridOptions.data = data;
    })
    .catch(Notify.handleError)
    .finally(function () {
      vm.loading = false;
    });
  }

  // switch to delete warning mode
  function deleteOffday(title) {
    ModalService.confirm('FORM.DIALOGS.CONFIRM_DELETE')
    .then(function (bool) {
      if (!bool) { return; }

      Offdays.delete(title.id)
      .then(function () {
        Notify.success('FORM.INFO.DELETE_SUCCESS');
        loadOffdays();
      })
      .catch(Notify.handleError);
    });
  }

  // update an existing Offday
  function editOffday(title) {
    $state.go('offdays.edit', { id : title.id });
  }

  // create a new Offday
  function createOffday() {
    $state.go('offdays.create');
  }

  loadOffdays();
}