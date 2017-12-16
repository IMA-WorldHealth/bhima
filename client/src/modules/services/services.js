angular.module('bhima.controllers')
.controller('ServicesController', ServicesController);

ServicesController.$inject = [
  'ServiceService', 'ModalService', 'NotifyService', 'uiGridConstants', '$state',
];

function ServicesController(Services, ModalService, Notify, uiGridConstants, $state) {
  var vm = this;

  // bind methods
  vm.deleteService = deleteService;
  vm.editService = editService;
  vm.createService = createService;
  vm.toggleFilter = toggleFilter;

  // global variables
  vm.gridApi = {};
  vm.filterEnabled = false;

  // options for the UI grid
  vm.gridOptions = {
    appScopeProvider  : vm,
    enableColumnMenus : false,
    fastWatch         : true,
    flatEntityAccess  : true,
    enableSorting     : true,
    onRegisterApi     : onRegisterApiFn,
    columnDefs : [
      { field : 'name', displayName : 'FORM.LABELS.SERVICE', headerCellFilter : 'translate' },
      { field : 'action',
        width : 80,
        displayName : '',
        cellTemplate : '/modules/services/templates/action.tmpl.html',
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

  function loadServices() {
    vm.loading = true;

    Services.read(null, { full : 1 })
    .then(function (data) {
      vm.gridOptions.data = data;
    })
    .catch(Notify.handleError)
    .finally(function () {
      vm.loading = false;
    });
  }

  // switch to delete warning mode
  function deleteService(service) {
    ModalService.confirm('FORM.DIALOGS.CONFIRM_DELETE')
    .then(function (bool) {
      if (!bool) { return; }

      Services.delete(service.id)
      .then(function () {
        Notify.success('SERVICE.DELETED');
        loadServices();
      })
      .catch(Notify.handleError);
    });
  }

  // update an existing service
  function editService(serviceObject) {
    $state.go('services.edit', { service : serviceObject });
  }

  // create a new service
  function createService() {
    $state.go('services.create');
  }

  loadServices();
}
