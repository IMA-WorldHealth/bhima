angular.module('bhima.controllers')
  .controller('WarnExchangeMissingRateModalController', WarnExchangeMissingRateModalController);

WarnExchangeMissingRateModalController.$inject = [
  '$uibModalInstance', '$location', 'missing',
];

/**
 * This modal presents a blocking message to the user urging them to
 * add an exchange rate to a new currency that does not have one.
 */
function WarnExchangeMissingRateModalController(ModalInstance, $location, missing) {
  const vm = this;

  vm.missing = missing;

  vm.goToExchangePage = function goToExchangePage() {
    ModalInstance.dismiss();
    $location.path('/exchange');
  };

  vm.cancel = function cancel() {
    ModalInstance.dismiss();
  };
}
