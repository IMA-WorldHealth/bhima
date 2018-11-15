angular.module('bhima.controllers')
  .controller('BreackDownModalController', BreackDownModalController);

BreackDownModalController.$inject = [
  '$state', 'NotifyService', 'DistributionCenterService', 'PayrollConfigurationService',
  'ExchangeRateService', 'SessionService', 'data', '$uibModalInstance', 'PatientInvoiceService',
  'FeeCenterService', 'util', '$translate',
];

function BreackDownModalController(
  $state, Notify, DistributionCenter, Configuration,
  Exchange, Session, data, ModalInstance, Invoices, FeeCenters, util, $translate,
) {
  const vm = this;
  vm.transaction = data.transactions;
  vm.feeCenter = vm.transaction[0];

  vm.cancel = cancel;
  vm.enterprise = Session.enterprise;

  let sumDebits = 0;
  let sumCredits = 0;

  vm.transaction.forEach(item => {
    sumDebits += item.debit_equiv;
    sumCredits += item.credit_equiv;
  });

  vm.sumDebits = sumDebits;
  vm.sumCredits = sumCredits;

  // exposed methods
  vm.submit = submit;

  FeeCenters.read()
    .then((feeCenter) => {
      vm.principalFeeCenter = feeCenter.filter(item => {
        return item.is_principal;
      });

      if (!vm.principalFeeCenter.length) {
        vm.noPrincilFeeCenter = true;
      }
    })
    .catch(Notify.handleError);

  function submit(DistributionForm) {
    let sumDistributed = 0;

    Object.keys(vm.percentage.values).forEach((key) => {
      sumDistributed += vm.percentage.values[key];
    });

    vm.invalidBreackDown = sumDistributed !== 100;
    vm.diffPercentage = (sumDistributed < 100) ? 100 - sumDistributed : sumDistributed - 100;

    vm.errorMessage = (sumDistributed < 100)
      ? $translate.instant('FORM.WARNINGS.REMAINS_DISTRIBUTION', { value : `${vm.diffPercentage} %` })
      : $translate.instant('FORM.WARNINGS.OVERRUN_DISTRIBUTION', { value : `${vm.diffPercentage} %` });

    if (DistributionForm.$invalid || vm.invalidBreackDown) {
      return Notify.danger('FORM.ERRORS.INVALID');
    }

    vm.percentage.transactions = vm.transaction;
    vm.percentage.fee_center_id = vm.feeCenter.fee_center_id;
    vm.percentage.is_cost = data.isCost;

    return DistributionCenter.proceedBreackDownPercent(vm.percentage)
      .then(() => {
        Notify.success('FORM.INFO.DISTRIBUTION_SUCCESSFULLY');
        cancel();
        $state.go('distribution_center', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function cancel() {
    ModalInstance.close();
  }
}
