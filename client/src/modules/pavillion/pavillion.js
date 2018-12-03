
angular.module('bhima.controllers')
  .controller('PavillionController', PavillionController);

PavillionController.$inject = [
  'PavillionService', '$uibModal', 'ModalService',
  'NotifyService', 'uiGridConstants', 'SessionService',
];

function PavillionController(Pavillion, Modal, ModalService, Notify, uiGridConstants, Session) {
  const vm = this;
  const { enterprise } = Session;
  // global variables
  vm.gridApi = {};
  vm.filterEnabled = false;
  vm.toggleFilter = toggleFilter;
  vm.createPavillion = createPavillion;
  vm.deletePavillion = deletePavillion;

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
        field : 'serviceName',
        displayName : 'FORM.LABELS.SERVICE',
        headerCellFilter : 'translate',
      },
      {
        field : 'action',
        width : 80,
        displayName : '',
        cellTemplate : '/modules/pavillion/templates/action.tmpl.html',
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
  function loadPavillions() {
    Pavillion.read(null, { enterprise_id : enterprise.id })
      .then(Pavillions => {
        vm.gridOptions.data = Pavillions;
      })
      .catch(Notify.handleError);
  }

  function openCreateUpdateModal(uuid) {
    return Modal.open({
      templateUrl : 'modules/pavillion/modals/createUpdate.html',
      controller :  'CreateUpdatePavillionController as ModalCtrl',
      backdrop : 'static',
      resolve : {
        uuid : () => uuid,
      },
    }).result;
  }


  function createPavillion(uuid) {
    openCreateUpdateModal(uuid).then(result => {
      if (result) {
        loadPavillions();
      }
    });
  }


  // switch to delete warning mode
  function deletePavillion(uuid) {
    ModalService.confirm('FORM.DIALOGS.CONFIRM_DELETE')
      .then(bool => {
        if (!bool) { return; }

        Pavillion.delete(uuid)
          .then(() => {
            Notify.success('FORM.INFO.OPERATION_SUCCESS');
            loadPavillions();
          })
          .catch(Notify.handleError);
      });
  }


  loadPavillions();
}
