angular.module('bhima.controllers')
  .controller('LocationsConfigController', LocationsConfigController);

LocationsConfigController.$inject = [
  '$translate', 'LocationConfigurationService', 'NotifyService', 'uiGridConstants', 'ModalService',
  'FormatTreeDataService',
];

/**
 * Locations configuration Controller
 * This module is responsible for handling the CRUD operation on Locations management
 */

function LocationsConfigController($translate, LocationConfiguration, Notify, uiGridConstants, ModalService,
  FormatTreeData) {
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
    showTreeExpandNoChildren : false,
    enableSorting     : true,
    onRegisterApi     : onRegisterApiFn,
    columnDefs : [
      {
        field : 'name',
        displayName : 'FORM.LABELS.LOCATION',
        enableFiltering : 'true',
        headerCellFilter : 'translate',
        cellTemplate : '/modules/locations/configurations/templates/gridName.tmpl.html',
      },
      {
        field : 'typeLabel',
        displayName : 'TABLE.COLUMNS.TYPE',
        headerCellFilter : 'translate',
        cellTemplate : '/modules/locations/types/templates/typeLabel.cell.html',
      },
      {
        field : 'addChildren',
        displayName : '',
        enableFiltering : 'true',
        width : '40',
        headerCellFilter : 'translate',
        cellTemplate : '/modules/locations/configurations/templates/addChildren.tmpl.html',
      },
      {
        field : 'action',
        displayName : '',
        enableFiltering : 'false',
        cellTemplate : '/modules/locations/configurations/templates/action.cell.tmpl.html',
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
  vm.remove = remove;

  function remove(id) {
    ModalService.confirm('FORM.DIALOGS.CONFIRM_DELETE')
      .then(() => {
        LocationConfiguration.delete(id)
          .then(() => {
            Notify.success('FORM.INFO.DELETE_SUCCESS');
            loadGrid();
          })
          .catch(Notify.handleError);
      });
  }
  function handleError(error) {
    vm.hasError = true;
    Notify.handleError(error);
  }

  // load user grid
  function loadGrid() {
    vm.hasError = false;
    vm.loading = true;

    LocationConfiguration.read()
      .then((data) => {
        data.forEach(type => {
          type.typeLabel = $translate.instant(type.translation_key);
        });

        data.sort((a, b) => {
          return a.typeLabel - b.typeLabel;
        });

        const treeData = FormatTreeData.formatStore(data);

        vm.gridOptions.data = treeData;
      })
      .catch(handleError)
      .finally(toggleLoadingIndicator);
  }

  function toggleLoadingIndicator() {
    vm.loading = false;
  }

  loadGrid();
}
