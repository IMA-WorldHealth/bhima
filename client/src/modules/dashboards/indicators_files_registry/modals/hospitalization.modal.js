angular.module('bhima.controllers')
  .controller('HospitalizationModalController', HospitalizationModalController);

HospitalizationModalController.$inject = [
  '$state', 'IndicatorsDashboardService', 'ModalService', 'NotifyService',
];

function HospitalizationModalController($state, IndicatorsDashboard, ModalService, Notify) {
  const vm = this;

  const { IndicatorsFile } = IndicatorsDashboard;

  vm.file = {};
  vm.hospitalization = $state.params.hospitalization;
  vm.isCreating = !!($state.params.creating);

  vm.onSelectFiscalYear = fiscal => {
    vm.file.fiscal_year_id = fiscal.id;
  };

  vm.onSelectPeriod = period => {
    vm.file.period_id = period.id;
    vm.selectedPeriod = period.hrLabel;
  };

  vm.onSelectService = service => {
    vm.file.service_id = service.id;
    vm.selectedService = service.name;
  };

  // exposed methods
  vm.submit = submit;

  // submit the data to the server from all two forms (update, create)
  function submit(hospitalizationForm) {
    if (hospitalizationForm.$invalid) {
      return 0;
    }

    if (hospitalizationForm.$pristine) {
      cancel();
      return 0;
    }

    const promise = (vm.isCreating)
      ? IndicatorsFile.create(vm.hospitalization)
      : IndicatorsFile.update(vm.hospitalization.uuid, vm.hospitalization);

    return promise
      .then(() => {
        const translateKey = (vm.isCreating) ? 'DEPOT.CREATED' : 'DEPOT.UPDATED';
        Notify.success(translateKey);
        $state.go('indicatorsFilesRegistry', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function cancel() {
    $state.go('indicatorsFilesRegistry');
  }
}
