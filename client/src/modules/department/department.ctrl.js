
angular.module('bhima.controllers')
  .controller('DepartementController', DepartementController);

DepartementController.$inject = [
  'DepartmentService', '$uibModal', 'ModalService',
  'NotifyService', 'uiGridConstants', 'SessionService',
];

function DepartementController(Department, Modal, ModalService, Notify, uiGridConstants, Session) {
  const vm = this;
  const { enterprise } = Session;
  // global variables
  vm.gridApi = {};
  vm.toggleFilter = toggleFilter;
  vm.createDepartement = createDepartement;
  vm.deleteDepartment = deleteDepartment;

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
        field : 'action',
        width : 80,
        displayName : '',
        cellTemplate : '/modules/department/templates/action.tmpl.html',
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

  // get all enterprise's depatments
  function loadDepartments() {
    Department.read(null, { enterprise_id : enterprise.id })
      .then(departments => {
        vm.gridOptions.data = departments;
      })
      .catch(Notify.handleError);
  }

  function openCreateUpdateModal(uuid) {
    return Modal.open({
      templateUrl : 'modules/department/modals/createUpdate.html',
      controller :  'CreateUpdateDepartmentController as ModalCtrl',
      backdrop : 'static',
      resolve : {
        uuid : () => uuid,
      },
    }).result;
  }


  function createDepartement(uuid) {
    openCreateUpdateModal(uuid).then(result => {
      if (result) {
        loadDepartments();
      }
    });
  }

  // switch to delete warning mode
  function deleteDepartment(uuid) {
    ModalService.confirm('FORM.DIALOGS.CONFIRM_DELETE')
      .then(bool => {
        if (!bool) { return; }

        Department.delete(uuid)
          .then(() => {
            Notify.success('FORM.INFO.OPERATION_SUCCESS');
            loadDepartments();
          })
          .catch(Notify.handleError);
      });
  }


  loadDepartments();
}
