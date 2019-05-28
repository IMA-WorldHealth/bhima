angular.module('bhima.controllers')
  .controller('StaffingIndiceController', StaffingIndiceController);

StaffingIndiceController.$inject = [
  '$uibModal', 'StaffingIndiceService', 'SessionService', 'ModalService',
  'NotifyService', 'bhConstants', 'uiGridConstants',
];

function StaffingIndiceController($uibModal, StaffingIndice, Session, Modal, Notify, bhConstants, uiGridConstants) {
  const vm = this;


  vm.remove = function remove(uuid) {
    const message = 'FORM.DIALOGS.CONFIRM_DELETE';
    Modal.confirm(message)
      .then(confirmResponse => {
        if (!confirmResponse) {
          return;
        }

        StaffingIndice.delete(uuid)
          .then(() => {
            Notify.success('FORM.INFO.DELETE_SUCCESS');
            loadIndexes();
          })
          .catch(Notify.handleError);
      });
  };

  function loadIndexes() {
    vm.loading = true;
    StaffingIndice.read()
      .then(indexes => {
        vm.gridOptions.data = indexes;
      })
      .catch(Notify.handleError)
      .finally(() => {
        vm.loading = false;
      });
  }

  const columns = [
    {
      field : 'created_at',
      displayName : 'TABLE.COLUMNS.DATE',
      headerCellFilter : 'translate',
      cellFilter : 'date:"'.concat(bhConstants.dates.format, '"'),

    },
    {
      field : 'display_name',
      displayName : 'FORM.LABELS.EMPLOYEE_NAME',
      headerCellFilter : 'translate',
    },
    {
      field : 'text',
      displayName : 'FORM.LABELS.LEVEL_OF_STUDY',
      headerCellFilter : 'translate',
    },
    {
      field : 'fonction_txt',
      displayName : 'FORM.LABELS.RESPONSABILITY',
      headerCellFilter : 'translate',
    },
    {
      field : 'function_indice',
      displayName : 'FORM.LABELS.ENROLLMENT_BONUS',
      headerCellFilter : 'translate',
    },
    {
      field : 'grade_indice',
      displayName : 'FORM.LABELS.FUNCTION_BONUS',
      headerCellFilter : 'translate',
    },
    {
      field : 'actions',
      enableFiltering : false,
      width : 100,
      displayName : '',
      headerCellFilter : 'translate',
      cellTemplate : 'modules/payroll/staffing_index/templates/action.cell.html',
    }];

  // ng-click="
  vm.gridOptions = {
    appScopeProvider : vm,
    enableColumnMenus : false,
    columnDefs : columns,
    enableSorting : true,
    data : [],
    fastWatch : true,
    flatEntityAccess : true,
    onRegisterApi : (gridApi) => {
      vm.gridApi = gridApi;
    },
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

  vm.createUpdateModal = function createUpdateRoleModal(index = {}) {
    $uibModal.open({
      templateUrl : 'modules/payroll/staffing_indice/modal/createUpdate.html',
      controller : 'StaffingIndiceModalController as $ctrl',
      resolve : { data : () => index },
    }).result.then(change => {
      if (change) loadIndexes();
    });
  };

  loadIndexes();
}
