
angular.module('bhima.controllers')
  .controller('WardController', WardController);

WardController.$inject = [
  'WardService', '$uibModal', 'ModalService',
  'NotifyService', 'uiGridConstants', 'SessionService',
];

function WardController(Ward, Modal, ModalService, Notify, uiGridConstants, Session) {
  const vm = this;
  const { enterprise } = Session;
  // global variables
  vm.gridApi = {};
  vm.filterEnabled = false;
  vm.toggleFilter = toggleFilter;
  vm.createWard = createWard;
  vm.deleteWard = deleteWard;

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
        field : 'name',
        displayName : 'FORM.LABELS.NAME',
        headerCellFilter : 'translate',
      },
      {
        field : 'nb_rooms',
        displayName : 'ROOM.NB_ROOMS',
        headerCellFilter : 'translate',
        type : 'number',
      },
      {
        field : 'serviceName',
        displayName : 'FORM.LABELS.SERVICE',
        headerCellFilter : 'translate',
      },
      {
        field : 'action',
        width : 80,
        displayName : '',
        cellTemplate : '/modules/ward_module/configuration/ward/templates/action.tmpl.html',
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

  // get all enterprise's depatments
  function loadWards() {
    Ward.read(null, { enterprise_id : enterprise.id })
      .then(Wards => {
        vm.gridOptions.data = Wards;
      })
      .catch(handleError);
  }

  function handleError(err) {
    vm.hasError = true;
    Notify.handleError(err);
  }

  function openCreateUpdateModal(uuid) {
    return Modal.open({
      templateUrl : 'modules/ward_module/configuration/ward/modals/createUpdate.html',
      controller :  'CreateUpdateWardController as ModalCtrl',
      backdrop : 'static',
      resolve : {
        uuid : () => uuid,
      },
    }).result;
  }

  function createWard(uuid) {
    openCreateUpdateModal(uuid).then(result => {
      if (result) {
        loadWards();
      }
    });
  }

  // switch to delete warning mode
  function deleteWard(uuid) {
    ModalService.confirm('FORM.DIALOGS.CONFIRM_DELETE')
      .then(bool => {
        if (!bool) { return; }

        Ward.delete(uuid)
          .then(() => {
            Notify.success('FORM.INFO.OPERATION_SUCCESS');
            loadWards();
          })
          .catch(Notify.handleError);
      });
  }

  loadWards();
}
