angular.module('bhima.controllers')
  .controller('PurchaseOrderStatusModalController', PurchaseOrderStatusModalController);

PurchaseOrderStatusModalController.$inject = [
  '$uibModalInstance', 'NotifyService', 'PurchaseOrderService', 'data',
];

function PurchaseOrderStatusModalController(Instance, Notify, PurchaseOrder, Data) {
  const vm = this;

  // global variables
  vm.purchase = Data;

  // expose to view
  vm.close = Instance.close;
  vm.submit = submit;

  vm.isStored = vm.purchase.status_id === 3 || vm.purchase.status_id === 4;

  // submit the choice
  function submit() {
    const data = { status_id : vm.status };

    PurchaseOrder.update(vm.purchase.uuid, data)
      .then(() => {
        Instance.close();
      })
      .catch(Notify.handleError);
  }

}
