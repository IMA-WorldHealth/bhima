angular.module('bhima.controllers')
.controller('CashReceiptModalController', CashReceiptModalController);

CashReceiptModalController.$inject = [
  'uuid', '$uibModalInstance', 'CashService', 'ProjectService', 'EnterpriseService'
];

/**
 * @module cash/modals/CashReceiptModalController
 *
 * @description This controller is responsible for displaying a receipt for a
 * cash payment made from the auxillary cash box.
 */
function CashReceiptModalController(uuid, ModalInstance, Cash, Project, Enterprise) {
  var vm = this;

  // bind methods
  vm.cancel = ModalInstance.dismss;
  
  // bind data
  vm.loading = false;

  /** generic error handler temporarily */
  function handler(error) {
    throw error;
  }

  function startup() {
    vm.loading = false;

    Cash.read(uuid).then(function (record) {

    })
    .catch(handler);
  }


  startup();
}
