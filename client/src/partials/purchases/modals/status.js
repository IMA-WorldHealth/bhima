angular.module('bhima.controllers')
.controller('PurchaseOrderStatusModalController', PurchaseOrderStatusModalController);

PurchaseOrderStatusModalController.$inject = [
  '$uibModalInstance', 'NotifyService', 'PurchaseOrderService', 'data'
];

function PurchaseOrderStatusModalController(Instance, Notify, PurchaseOrder, Data) {
    var vm = this;

    // global variables 
    vm.purchase = Data;

    vm.status = vm.purchase.is_confirmed ? 'confirmed' : 'not_confirmed';

    // expose to view 
    vm.close = Instance.close;
    vm.submit = submit;

    // submit the choice 
    function submit(status) {
        
        switch(status) {
            case 'confirmed' : 
                var data = { is_confirmed: 1 };
                updateOrder(vm.purchase.uuid, data);
            break;

            case 'not_confirmed' : 
                var data = { is_confirmed: 0 };
                updateOrder(vm.purchase.uuid, data);
            break;
        };

        var data = { is_cancelled: vm.purchase.is_cancelled };
        updateOrder(vm.purchase.uuid, data);
    }

    // update the purchase order 
    function updateOrder(uuid, params) {
        PurchaseOrder.update(uuid, params)
        .then(function () {
            Instance.close();
        })
        .catch(Notify.handleError);
    }
}