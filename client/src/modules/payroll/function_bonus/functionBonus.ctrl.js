angular.module('bhima.controllers')
  .controller('FunctionBonusController', FunctionBonusController);

FunctionBonusController.$inject = [
  '$uibModal', 'FunctionBonusService', 'SessionService', 'ModalService',
  'NotifyService', 'bhConstants', 'uiGridConstants',
];

function FunctionBonusController($uibModal, FunctionBonus, Session, Modal, Notify, bhConstants, uiGridConstants) {
  const vm = this;


  vm.remove = function remove(uuid) {
    const message = 'FORM.DIALOGS.DELETE_ROLE';
    Modal.confirm(message)
      .then(confirmResponse => {
        if (!confirmResponse) {
          return;
        }

        FunctionBonus.delete(uuid)
          .then(() => {
            Notify.success('FORM.INFO.DELETE_SUCCESS');
            loadIndexes();
          })
          .catch(Notify.handleError);
      });
  };

  function loadIndexes() {
    vm.loading = true;
    FunctionBonus.read()
      .then(indexes => {
        vm.gridOptions.data = indexes;
      })
      .catch(Notify.handleError)
      .finally(() => {
        vm.loading = false;
      });
  }

  const columns = [{
    field : 'fonction_txt',
    displayName : 'FORM.LABELS.PROFESSION',
    headerCellFilter : 'translate',
  },
  {
    field : 'value',
    displayName : 'FORM.LABELS.FUNCTION_BONUS',
    headerCellFilter : 'translate',
  },
  {
    field : 'actions',
    enableFiltering : false,
    width : 100,
    displayName : '',
    headerCellFilter : 'translate',
    cellTemplate : 'modules/payroll/function_bonus/templates/action.cell.html',
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
      templateUrl : 'modules/payroll/function_bonus/modal/createUpdate.html',
      controller : 'FunctionBonusModalController as $ctrl',
      resolve : { data : () => index },
    }).result.then(change => {
      if (change) loadIndexes();
    });
  };

  loadIndexes();
}
