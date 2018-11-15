angular.module('bhima.controllers')
  .controller('DistributionKeyModalController', DistributionKeyModalController);

DistributionKeyModalController.$inject = [
  '$state', 'NotifyService', 'DistributionCenterService', 'PayrollConfigurationService',
  'ExchangeRateService', 'SessionService', '$uibModalInstance', 'PatientInvoiceService',
  'FeeCenterService', 'util', 'settings', '$translate',
];

function DistributionKeyModalController(
  $state, Notify, DistributionCenter, Configuration,
  Exchange, Session, ModalInstance, Invoices, FeeCenters, util, settings, $translate,
) {
  const vm = this;

  vm.settings = settings;
  vm.cancel = cancel;
  vm.enterprise = Session.enterprise;
  vm.settings.values = {};

  // exposed methods
  vm.submit = submit;

  FeeCenters.read()
    .then((feeCenter) => {
      vm.principalFeeCenter = feeCenter.filter(item => {
        return item.is_principal;
      });

      if (vm.principalFeeCenter.length && vm.settings.settingsValues.length) {
        vm.principalFeeCenter.forEach(item => {
          vm.settings.settingsValues.forEach(values => {
            if (item.id === parseInt(values.principal_fee_center_id, 10)) {
              vm.settings.values[item.id] = values.rate;
            }
          });
        });
      }

      if (!vm.principalFeeCenter.length) {
        vm.noPrincilFeeCenter = true;
      }

    })
    .catch(Notify.handleError);

  function submit(DistributionKeyForm) {
    let sumDistributed = 0;

    Object.keys(vm.settings.values).forEach((key) => {

      console.log('ACCCcccccccc');
      console.log(vm.settings.values[key]);

      sumDistributed += vm.settings.values[key];
    });

    vm.invalidBreackDown = sumDistributed !== 100;
    vm.diffPercentage = (sumDistributed < 100) ? 100 - sumDistributed : sumDistributed - 100;

    console.log('PLUSSSSSsssssssss');
    console.log(sumDistributed);

    vm.errorMessage = (sumDistributed < 100)
      ? $translate.instant('FORM.WARNINGS.REMAINS_DISTRIBUTION', { value : `${vm.diffPercentage} %` })
      : $translate.instant('FORM.WARNINGS.OVERRUN_DISTRIBUTION', { value : `${vm.diffPercentage} %` });

    if (DistributionKeyForm.$invalid || vm.invalidBreackDown) {
      return Notify.danger('FORM.ERRORS.INVALID');
    }

    return DistributionCenter.proceedDistributionKey(vm.settings)
      .then(() => {
        Notify.success('FORM.INFO.DISTRIBUTION_SUCCESSFULLY');
        cancel();
        $state.go('distribution_key', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function cancel() {
    ModalInstance.close();
  }
}
