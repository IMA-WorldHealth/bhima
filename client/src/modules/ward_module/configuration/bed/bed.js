
angular.module('bhima.controllers')
  .controller('BedController', BedController);

BedController.$inject = [
  'BedService', '$uibModal', 'ModalService',
  'NotifyService', 'uiGridConstants', 'SessionService',
];

function BedController(Bed, Modal, ModalService, Notify, uiGridConstants, Session) {
  const vm = this;
  const { enterprise } = Session;
  // global variables
  vm.gridApi = {};
  vm.filterEnabled = false;
  vm.toggleFilter = toggleFilter;
  vm.createBed = createBed;
  vm.deleteBed = deleteBed;

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
        field : 'label',
        displayName : 'BED.TITLE',
        headerCellFilter : 'translate',
      },
      {
        field : 'room_label',
        displayName : 'ROOM.TITLE',
        headerCellFilter : 'translate',
      },
      {
        field : 'ward_name',
        displayName : 'WARD.TITLE',
        headerCellFilter : 'translate',
      },
      {
        field : 'action',
        width : 80,
        displayName : '',
        cellTemplate : '/modules/ward_module/configuration/bed/templates/action.tmpl.html',
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
  function loadBeds() {
    Bed.read(null, { enterprise_id : enterprise.id })
      .then(Beds => {
        vm.gridOptions.data = Beds;
      })
      .catch(handleError);
  }

  function handleError(err) {
    vm.hasError = true;
    Notify.handleError(err);
  }

  function openCreateUpdateModal(uuid) {
    return Modal.open({
      templateUrl : 'modules/ward_module/configuration/bed/modals/createUpdate.html',
      controller :  'CreateUpdateBedController as ModalCtrl',
      backdrop : 'static',
      resolve : {
        uuid : () => uuid,
      },
    }).result;
  }

  function createBed(uuid) {
    openCreateUpdateModal(uuid).then(result => {
      if (result) {
        loadBeds();
      }
    });
  }

  // switch to delete warning mode
  function deleteBed(uuid) {
    ModalService.confirm('FORM.DIALOGS.CONFIRM_DELETE')
      .then(bool => {
        if (!bool) { return; }

        Bed.delete(uuid)
          .then(() => {
            Notify.success('FORM.INFO.OPERATION_SUCCESS');
            loadBeds();
          })
          .catch(Notify.handleError);
      });
  }

  loadBeds();
}
