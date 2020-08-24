angular.module('bhima.controllers')
  .controller('LocationsConfigController', LocationsConfigController);

LocationsConfigController.$inject = [
  '$translate', 'LocationService', 'NotifyService', 'uiGridConstants', 'ModalService',
  'FormatTreeDataService', '$uibModal',
];

/**
 * Locations configuration Controller
 * This module is responsible for handling the CRUD operation on Locations management
 */

function LocationsConfigController($translate, LocationService, Notify, uiGridConstants, ModalService,
  FormatTreeData, $uibModal) {
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
        width : '40',
        headerCellFilter : 'translate',
        cellTemplate : '/modules/locations/configurations/templates/addChildren.tmpl.html',
      },
      {
        field : 'action',
        displayName : '',
        cellTemplate : '/modules/locations/configurations/templates/action.cell.tmpl.html',
      },
    ],
  };

  function onRegisterApiFn(gridApi) {
    vm.gridApi = gridApi;
    gridApi.grid.registerDataChangeCallback(expandOnSetData);
  }

  function expandOnSetData(grid) {
    if (grid.options.data.length > 0) {
      grid.api.treeBase.expandAllRows();
    }
  }

  console.log('ICI NOUSSSSssssssss');

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
        LocationService.delete(id)
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

    LocationService.read()
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

  vm.mergeLocations = function mergeLocations() {
    const selectedLocations = vm.gridApi.selection.getSelectedRows();
    if (selectedLocations.length) {
      if (selectedLocations.length === 2) {
        const locations = selectedLocations.map(l => l);

        $uibModal.open({
          templateUrl : 'modules/locations/modals/mergeLocations.modal.html',
          controller : 'MergeLocationsModalController as MergeLocationsModalCtrl',
          resolve : { data : () => locations },
        }).result.then(result => {
          if (result) loadGrid();
        });

      } else {
        Notify.warn('FORM.WARNINGS.ONLY_TWO_LOCATIONS');
      }
    } else {
      Notify.warn('FORM.WARNINGS.NO_LOCATIONS_HAS_SELECTED');
    }
  };

  function toggleLoadingIndicator() {
    vm.loading = false;
  }

  loadGrid();
}
