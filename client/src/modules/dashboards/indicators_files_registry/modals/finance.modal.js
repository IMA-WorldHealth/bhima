angular.module('bhima.controllers')
  .controller('FinanceModalController', FinanceModalController);

FinanceModalController.$inject = [
  '$state', 'IndicatorsDashboardService', 'ModalService', 'NotifyService',
];

function FinanceModalController(
  $state, IndicatorsDashboard, ModalService, Notify
) {
  const vm = this;

  const { IndicatorsFile } = IndicatorsDashboard;

  vm.statusOptions = IndicatorsDashboard.statusOptions;

  vm.file = {};
  vm.file.status = vm.file.status || vm.statusOptions[0].key;

  vm.finance = $state.params.finance;
  vm.isCreating = !!($state.params.creating);

  vm.onSelectFiscalYear = fiscal => {
    vm.file.fiscal_year_id = fiscal.id;
  };

  vm.onSelectPeriod = period => {
    vm.selectedPeriod = period.hrLabel;
  };

  // exposed methods
  vm.submit = submit;

  // submit the data to the server from all two forms (update, create)
  function submit(financeForm) {
    if (financeForm.$invalid) {
      return 0;
    }

    if (financeForm.$pristine) {
      cancel();
      return 0;
    }

    vm.file.status = isFormCompleted() ? 'complete' : 'incomplete';

    const promise = (vm.isCreating)
      ? IndicatorsFile.create(vm.finance)
      : IndicatorsFile.update(vm.finance.uuid, vm.finance);

    return promise
      .then(() => {
        const translateKey = (vm.isCreating)
          ? 'DASHBOARD.INDICATORS_FILES.SUCCESSFULLY_ADDED'
          : 'DASHBOARD.INDICATORS_FILES.SUCCESSFULLY_UPDATED';
        Notify.success(translateKey);
        $state.go('indicatorsFilesRegistry', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function cancel() {
    $state.go('indicatorsFilesRegistry');
  }

  function isFormCompleted() {
    return Object.keys(vm.indicators).every(indicator => typeof (indicator) !== 'undefined');
  }
}
