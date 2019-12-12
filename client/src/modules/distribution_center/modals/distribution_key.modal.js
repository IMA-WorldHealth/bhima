angular.module('bhima.controllers')
  .controller('DistributionKeyModalController', DistributionKeyModalController);

DistributionKeyModalController.$inject = [
  '$state', 'NotifyService', 'DistributionCenterService',
  'SessionService', '$uibModalInstance', 'FeeCenterService', 'settings', '$translate', 'util',
];

function DistributionKeyModalController(
  $state, Notify, DistributionCenter, Session, ModalInstance,
  FeeCenters, settings, $translate, util,
) {
  const vm = this;

  vm.settings = settings;
  vm.cancel = cancel;
  vm.enterprise = Session.enterprise;
  vm.settings.values = {};

  // exposed methods
  vm.submit = submit;
  vm.reset = reset;

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
      sumDistributed += vm.settings.values[key];
    });

    // sumDistributed sum must always be 100 for 100%
    sumDistributed = util.roundDecimal(sumDistributed, 0);

    vm.invalidBreakDown = sumDistributed !== 100;
    vm.diffPercentage = Math.abs(sumDistributed - 100);

    vm.errorMessage = (sumDistributed < 100)
      ? $translate.instant('FORM.WARNINGS.REMAINS_DISTRIBUTION', { value : `${vm.diffPercentage} %` })
      : $translate.instant('FORM.WARNINGS.OVERRUN_DISTRIBUTION', { value : `${vm.diffPercentage} %` });

    if (DistributionKeyForm.$invalid || vm.invalidBreakDown) {
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

  function reset(auxiliaryFeeCenter) {
    return DistributionCenter.resetDistributionKey(auxiliaryFeeCenter)
      .then(() => {
        Notify.success('FORM.INFO.DISTRIBUTION_SUCCESSFULLY');
        cancel();
        $state.go('distribution_key', null, { reload : true });
      })
      .catch(Notify.handleError);
  }
}
