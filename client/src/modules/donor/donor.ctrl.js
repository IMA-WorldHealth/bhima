angular.module('bhima.controllers')
  .controller('DonorController', DonorController);

DonorController.$inject = [
  '$uibModal', 'DonorService', 'ModalService',
  'NotifyService', 'uiGridConstants',
];

function DonorController($uibModal, Donor, Modal, Notify, uiGridConstants) {
  const vm = this;

  vm.createUpdateDonorModal = (selectedRole = {}) => {
    $uibModal.open({
      templateUrl : 'modules/donor/modal/createUpdate.html',
      controller : 'DonorAddController as DonorAddCtrl',
      resolve : { data : () => selectedRole },
    });
  };

  vm.remove = function remove(id) {
    const message = 'FORM.DIALOGS.DELETE_DONOR';
    Modal.confirm(message)
      .then(confirmResponse => {
        if (!confirmResponse) {
          return;
        }
        Donor.delete(id)
          .then(() => {
            Notify.success('FORM.INFO.DELETE_SUCCESS');
            load();
          })
          .catch(Notify.handleError);
      });
  };

  function load() {
    vm.loading = true;

    Donor.read()
      .then(roles => {
        vm.gridOptions.data = roles;
      })
      .catch(Notify.handleError)
      .finally(() => {
        vm.loading = false;
      });
  }

  const columns = [{
    field : 'display_name',
    displayName : 'FORM.LABELS.NAME',
    headerCellFilter : 'translate',
  },
  {
    field : 'phone',
    displayName : 'FORM.LABELS.PHONE',
    headerCellFilter : 'translate',
  },
  {
    field : 'email',
    displayName : 'FORM.LABELS.EMAIL',
    headerCellFilter : 'translate',
  },
  {
    field : 'address',
    displayName : 'FORM.LABELS.ADDRESS',
    headerCellFilter : 'translate',
  },
  {
    field : 'actions',
    enableFiltering : false,
    width : 100,
    displayName : '',
    headerCellFilter : 'translate',
    cellTemplate : 'modules/donor/templates/action.cell.html',
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

  load();
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
}
