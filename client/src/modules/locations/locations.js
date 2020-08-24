// TODO Handle HTTP exception errors (displayed contextually on form)
angular.module('bhima.controllers')
  .controller('LocationController', LocationController);

LocationController.$inject = [
  'LocationService', 'NotifyService', '$translate', 'GridColumnService', 'GridStateService',
];

function LocationController(LocationService, Notify, $translate, Columns, GridState) {
  const vm = this;
  const session = {};
  vm.openColumnConfigModal = openColumnConfigModal;

  vm.session = session;

  session.loading = false;
  vm.view = 'default';
  const cacheKey = 'locationGrid';

  // fired on startup
  function startup() {
    // start up loading indicator
    session.loading = true;

    // load location
    LocationService.locations({ is_leave : true }).then((locations) => {
      locations.data.forEach(location => {
        location.typeLabel = $translate.instant(location.translation_key);
      });

      const columns = [{
        field : 'name',
        displayName : 'FORM.LABELS.LOCATION',
        headerCellFilter : 'translate',
      }, {
        field : 'typeLabel',
        displayName : 'TABLE.COLUMNS.TYPE',
        headerCellFilter : 'translate',
        cellTemplate : '/modules/locations/types/templates/typeLabel.cell.html',
      }];

      vm.gridOptions.columnDefs = columns.concat(locations.columns);
      vm.gridOptions.data = locations.data;
      session.loading = false;
    }).catch(Notify.handleError);
  }

  // ng-click="
  vm.gridOptions = {
    appScopeProvider : vm,
    enableColumnMenus : false,
    enableSorting : true,
    fastWatch : true,
    flatEntityAccess : true,
    onRegisterApi : (gridApi) => {
      vm.gridApi = gridApi;
    },
  };

  const columnConfig = new Columns(vm.gridOptions, cacheKey);
  const state = new GridState(vm.gridOptions, cacheKey);

  vm.saveGridState = state.saveGridState;

  vm.clearGridState = function clearGridState() {
    state.clearGridState();
  };

  function openColumnConfigModal() {
    // column configuration has direct access to the grid API to alter the current
    // state of the columns - this will be saved if the user saves the grid configuration
    columnConfig.openConfigurationModal();
  }

  startup();
}
