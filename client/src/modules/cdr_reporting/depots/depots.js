angular.module('bhima.controllers')
  .controller('CDRReportingDepotController', CDRReportingDepotController);

CDRReportingDepotController.$inject = [
  'CdrDepotService', 'ModalService', 'NotifyService', 'uiGridConstants', '$state',
];

function CDRReportingDepotController(
  Depots, ModalService, Notify, uiGridConstants, $state,
) {
  const vm = this;

  // bind methods
  vm.deleteDepot = deleteDepot;
  vm.editDepot = editDepot;
  vm.createDepot = createDepot;
  vm.toggleFilter = toggleFilter;

  // global variables
  vm.gridApi = {};

  // options for the UI grid
  vm.gridOptions = {
    appScopeProvider  : vm,
    enableColumnMenus : false,
    showColumnFooter  : true,
    fastWatch         : true,
    flatEntityAccess  : true,
    enableSorting     : true,
    showTreeExpandNoChildren : false,
    onRegisterApi     : onRegisterApiFn,
    columnDefs : [
      {
        field : 'text',
        displayName : 'CDR_REPORTING.DEPOT_LABEL',
        headerCellFilter : 'translate',
        cellTemplate : '/modules/cdr_reporting/depots/templates/label.tmpl.html',
        aggregationType : uiGridConstants.aggregationTypes.count,
        aggregationHideLabel : true,
      },
      {
        field : 'last_movement_date',
        displayName : 'CDR_REPORTING.DATABASE',
        headerCellFilter : 'translate',
        cellTemplate : '/modules/cdr_reporting/depots/templates/version.tmpl.html',
      },
      {
        field : 'action',
        width : 80,
        displayName : '',
        cellTemplate : '/modules/cdr_reporting/depots/templates/action.tmpl.html',
        enableSorting : false,
        enableFiltering : false,
      },
    ],
  };

  function onRegisterApiFn(gridApi) {
    vm.gridApi = gridApi;
  }

  function toggleFilter() {
    vm.gridOptions.enableFiltering = !vm.gridOptions.enableFiltering;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  }

  function load() {
    vm.loading = true;

    Depots.read()
      .then(data => {
        vm.gridOptions.data = data.map(item => {
          item.last_movement_date = new Date(item.last_movement_date);
          return item;
        });
      })
      .catch(Notify.handleError)
      .finally(() => {
        vm.loading = false;
      });
  }

  // switch to delete warning mode
  function deleteDepot(uuid) {
    ModalService.confirm('FORM.DIALOGS.CONFIRM_DELETE')
      .then(bool => {
        if (!bool) { return; }

        Depots.delete(uuid)
          .then(() => {
            Notify.success('DEPOT.DELETED');
            load();
          })
          .catch(Notify.handleError);
      });
  }

  // update an existing depot
  function editDepot(uuid) {
    $state.go('cdrReportingDepots.edit', { uuid });
  }

  // create a new depot
  function createDepot() {
    $state.go('cdrReportingDepots.create');
  }

  // initialize module
  function startup() {
    load();
  }

  startup();
}
