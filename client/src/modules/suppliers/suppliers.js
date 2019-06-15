angular.module('bhima.controllers')
  .controller('SupplierController', SupplierController);

SupplierController.$inject = [
  'SupplierService', 'CreditorGroupService',
  'NotifyService', '$uibModal', 'ModalService',
];

function SupplierController(Suppliers, CreditorGroups, Notify, $uibModal, Modal) {
  const vm = this;

  vm.view = 'default';
  vm.state = {};
  vm.loading = false;


  const columns = [{
    field : 'display_name',
    displayName : 'FORM.LABELS.NAME',
    headerCellFilter : 'translate',
  },

  {
    field : 'email',
    displayName : 'FORM.LABELS.EMAIL',
    headerCellFilter : 'translate',
  },
  {
    field : 'phone',
    displayName : 'FORM.LABELS.PHONE',
    headerCellFilter : 'translate',
  },
  {
    field : 'address_1',
    displayName : 'FORM.LABELS.ADDRESS1',
    headerCellFilter : 'translate',
  },
  {
    field : 'address_2',
    displayName : 'FORM.LABELS.ADDRESS2',
    headerCellFilter : 'translate',
  },

  {
    field : 'actions',
    enableFiltering : false,
    width : 100,
    displayName : 'FORM.BUTTONS.ACTIONS',
    headerCellFilter : 'translate',
    cellTemplate : '/modules/suppliers/templates/action.cell.html',
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


  // fired on startup
  function startup() {
    // load suppliers
    refreshSuppliers();
  }

  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }


  // refresh the displayed Suppliers
  function refreshSuppliers() {
    // start up loading indicator
    toggleLoadingIndicator();

    return Suppliers.read(null, { detailed : 1 })
      .then(suppliers => {
        vm.gridOptions.data = suppliers;
      })
      .catch(Notify.handleError)
      .finally(toggleLoadingIndicator);
  }


  vm.createUpdateModal = (selectedSupplier = {}) => {
    $uibModal.open({
      templateUrl : 'modules/suppliers/modal/createUpdate.html',
      controller : 'SupplierCreateUpdateController as ModalCtrl',
      size : 'lg',
      resolve : { data : () => selectedSupplier },
    }).result.then(response => {
      if (response) refreshSuppliers();
    });
  };

  vm.remove = function remove(uuid) {
    const message = 'FORM.DIALOGS.DELETE_SUPPLIER';
    Modal.confirm(message)
      .then(confirmResponse => {
        if (!confirmResponse) {
          return;
        }

        Suppliers.delete(uuid)
          .then(() => {
            Notify.success('FORM.INFO.DELETE_SUCCESS');
            refreshSuppliers();
          })
          .catch(Notify.handleError);
      });
  };

  startup();
}
