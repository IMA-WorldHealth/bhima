angular.module('bhima.controllers')
.controller('CashReceiptModalController', CashReceiptModalController);

CashReceiptModalController.$inject = [
  'uuid', '$uibModalInstance', 'CashService', 'ProjectService',
  'EnterpriseService', '$q', 'CashboxService', 'UserService', 'ExchangeRateService'
];

/**
 * @module cash/modals/CashReceiptModalController
 *
 * @description This controller is responsible for displaying a receipt for a
 * cash payment made from the auxillary cash box.
 */
function CashReceiptModalController(uuid, ModalInstance, Cash, Projects, Enterprises, $q, Cashboxes, Users, Exchange) {
  var vm = this;

  // bind close modal method
  vm.cancel = ModalInstance.dismiss;
  vm.isEnterpriseCurrency = isEnterpriseCurrency;

  // bind data
  vm.loading = false;

  /** generic error handler temporarily */
  function handler(error) {
    vm.error = error;
  }

  /** fired to start up the receipt module */
  function startup() {

    // turn loading indicator on
    toggleLoadingIndicator();

    Cash.read(uuid).then(function (receipt) {

      // bind the receipt
      vm.receipt = receipt;

      console.log('Got Receipt:', receipt);

      return $q.all([

        // read in the cashboxes to tell the user where it was created
        Cashboxes.read(receipt.cashbox_id),

        // find out who created the sale
        Users.read(receipt.user_id),

        // get the project information
        Projects.read(receipt.project_id),

        // ensure the exchange rates are loaded
        Exchange.read()
      ]);
    })
    .then(function (promises) {

      console.log('promises:', promises);

      // destruct the promises
      vm.cashbox = promises[0];
      vm.user    = promises[1];
      vm.project = promises[2];

      // for display purposes, convert the value to the payment value
      vm.receipt.total =
        Exchange.convertFromEnterpriseCurrency(vm.receipt.currency_id, vm.receipt.date, vm.receipt.amount);

      // calculate the exchange rate on the date of sale
      vm.rate =
        Exchange.getExchangeRate(vm.receipt.currency_id, vm.receipt.date);

      // still need to get the enterprise information
      return Enterprises.read(vm.project.enterprise_id);
    })
    .then(function (enterprise) {

      console.log('Read enterprise :', enterprise);
      vm.enterprise = enterprise;
    })
    .catch(handler)
    .finally(function () {
      toggleLoadingIndicator();
    });
  }

  /** toggle loading indicator on and off */
  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  /** this is to make HTML more readable */
  function isEnterpriseCurrency(id) {
    return vm.enterprise && vm.enterprise.currency_id === id;
  }

  // starts up the module
  startup();
}
