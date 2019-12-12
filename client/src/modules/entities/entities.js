angular.module('bhima.controllers')
  .controller('EntityController', EntityController);

EntityController.$inject = [
  'EntityService', 'ModalService', 'NotifyService', 'uiGridConstants',
  '$state', '$translate',
];

/**
 * Entity Controller
 *
 * This controller is responsible of handling entities
 */
function EntityController(
  Entity, ModalService, Notify, uiGridConstants, $state, $translate
) {
  const vm = this;

  // bind methods
  vm.deleteEntity = deleteEntity;
  vm.editEntity = editEntity;
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
      {
        field : 'display_name',
        displayName : 'ENTITY.NAME',
        headerCellFilter : 'translate',
      },
      {
        field : 'phone',
        displayName : 'ENTITY.PHONE',
        headerCellFilter : 'translate',
      },
      {
        field : 'email',
        displayName : 'ENTITY.EMAIL',
        headerCellFilter : 'translate',
      },
      {
        field : 'address',
        displayName : 'ENTITY.ADDRESS',
        headerCellFilter : 'translate',
      },
      {
        field : 'translation_key',
        displayName : 'ENTITY.TYPE.LABEL',
        headerCellFilter : 'translate',
      },
      {
        field : 'action',
        width : 80,
        displayName : '',
        cellTemplate : '/modules/entities/templates/action.tmpl.html',
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

  function loadEntities() {
    vm.loading = true;

    Entity.read()
      .then(data => {
        // format location
        vm.gridOptions.data = data.map(entity => {
          entity.translation_key = $translate.instant(entity.translation_key);
          return entity;
        });
      })
      .catch(Notify.handleError)
      .finally(() => {
        vm.loading = false;
      });
  }

  // switch to delete warning mode
  function deleteEntity(entity) {
    ModalService.confirm('FORM.DIALOGS.CONFIRM_DELETE')
      .then(bool => {
        if (!bool) { return; }

        Entity.delete(entity.uuid)
          .then(() => {
            Notify.success('FORM.INFO.DELETE_SUCCESS');
            loadEntities();
          })
          .catch(Notify.handleError);
      });
  }

  // update an existing entity
  function editEntity(entityObject) {
    $state.go('entities.edit', { entity : entityObject });
  }

  loadEntities();
}
