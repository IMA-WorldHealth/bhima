angular.module('bhima.controllers')
  .controller('RequisitionStatusModalController', RequisitionStatusModalController);

RequisitionStatusModalController.$inject = [
  '$uibModalInstance', 'NotifyService', 'StockService', 'data',
];

function RequisitionStatusModalController(Instance, Notify, Stock, Data) {
  const vm = this;

  // global variables
  vm.requisition = Data;

  // expose to view
  vm.close = Instance.close;
  vm.submit = submit;

  // submit the choice
  function submit() {
    const data = { status_id : vm.status };

    Stock.stockRequisition.update(vm.requisition.uuid, data)
      .then(() => {
        Instance.close();
      })
      .catch(Notify.handleError);
  }

}
