angular.module('bhima.controllers')
  .controller('TypesController', TypesController);

TypesController.$inject = [
  '$translate', 'LocationService', 'util', 'NotifyService',
  'ModalService', '$uibModal', 'uiGridConstants',
];

function TypesController($translate, locationService, util, Notify,
  Modal, $uibModal, uiGridConstants) {

  const vm = this;
  vm.session = {};
  vm.state = {};

  vm.maxLength = util.maxTextLength;

  // fired on startup
  function startup() {
    // start up loading indicator
    vm.session.loading = true;
    // load Provinces
    refreshTypes();
  }

  // refresh the displayed Provinces
  function refreshTypes() {
    return locationService.types().then((types) => {
      types.forEach(type => {
        type.typeLabel = $translate.instant(type.translation_key);
      });

      types.sort((a, b) => {
        return a.typeLabel - b.typeLabel;
      });

      vm.gridOptions.data = types;
      vm.session.loading = false;
    });
  }

  vm.createUpdateModal = (selectedType = {}) => {
    return $uibModal.open({
      templateUrl : 'modules/locations/types/modal/createUpdate.html',
      controller : 'CreateUpdateTypeController as ModalCtrl',
      resolve : { data : () => selectedType },
    }).result.then(result => {
      if (result) refreshTypes();
    });
  };

  const columns = [{
    field : 'typeLabel',
    displayName : 'TABLE.COLUMNS.LABEL',
    headerCellFilter : 'translate',
    cellTemplate : '/modules/locations/types/templates/typeLabel.cell.html',
  }, {
    field : 'label_name',
    displayName : 'FORM.LABELS.NAME',
    headerCellFilter : 'translate',
  }, {
    field : 'is_leaves',
    displayName : 'FORM.LABELS.TREE_LEAVES',
    headerCellFilter : 'translate',
    cellTemplate : '/modules/locations/types/templates/tree_leave.cell.html',
  }, {
    field : 'actions',
    enableFiltering : false,
    width : 100,
    displayName : '',
    headerCellFilter : 'translate',
    cellTemplate : 'modules/locations/types/templates/action.cell.html',
  }];

  // ng-click="
  vm.gridOptions = {
    appScopeProvider : vm,
    enableColumnMenus : false,
    columnDefs : columns,
    enableSorting : true,
    fastWatch : true,
    flatEntityAccess : true,
    onRegisterApi : (gridApi) => {
      vm.gridApi = gridApi;
    },
  };

  vm.remove = function remove(id) {
    const message = 'FORM.DIALOGS.CONFIRM_DELETE';
    Modal.confirm(message)
      .then(confirmResponse => {
        if (!confirmResponse) {
          return;
        }

        locationService.delete.type(id)
          .then(() => {
            Notify.success('FORM.INFO.DELETE_SUCCESS');
            refreshTypes();
          })
          .catch(Notify.handleError);
      });
  };

  /**
   * @function toggleInlineFilter
   *
   * @description
   * Switches the inline filter on and off.
   */
  vm.toggleInlineFilter = function toggleInlineFilter() {
    vm.gridOptions.enableFiltering = !vm.gridOptions.enableFiltering;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  };
  startup();
}
