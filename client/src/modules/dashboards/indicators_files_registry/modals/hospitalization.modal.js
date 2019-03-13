angular.module('bhima.controllers')
  .controller('HospitalizationModalController', HospitalizationModalController);

HospitalizationModalController.$inject = [
  '$state', 'IndicatorsDashboardService', 'NotifyService',
];

function HospitalizationModalController(
  $state, IndicatorsDashboard, Notify
) {
  const vm = this;
  const HOSPITALIZATION_TYPE_ID = 1;
  const INCOMPLETE_STATUS_ID = 1;
  const COMPLETE_STATUS_ID = 2;

  vm.statusOptions = IndicatorsDashboard.statusOptions;

  vm.file = { type_id : HOSPITALIZATION_TYPE_ID };
  vm.indicators = {};

  const { uuid } = $state.params;
  vm.isCreating = !!($state.params.creating);

  vm.onSelectFiscalYear = fiscal => {
    vm.fiscal_year_id = fiscal.id;
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

  // load details
  loadDetails();

  function loadDetails() {
    if (uuid) {
      IndicatorsDashboard.hospitalization.read(uuid)
        .then(details => {
          vm.indicators = details;
          vm.fiscal_year_id = details.fiscal_year_id;
          vm.file.period_id = details.period_id;
          vm.file.service_id = details.service_id;
        })
        .catch(Notify.errorHandler);
    }
  }

  // submit the data to the server from all two forms (update, create)
  function submit(hospitalizationForm) {
    if (hospitalizationForm.$invalid) {
      return 0;
    }

    if (hospitalizationForm.$pristine) {
      cancel();
      return 0;
    }

    // remove before submit
    delete vm.indicators.uuid;
    delete vm.indicators.service_name;
    delete vm.indicators.fiscal_year_id;

    vm.file.status_id = isFormCompleted() ? COMPLETE_STATUS_ID : INCOMPLETE_STATUS_ID;
    // hack for server match
    const bundle = { indicator : vm.file, hospitalization : vm.indicators };
    const promise = (vm.isCreating)
      ? IndicatorsDashboard.hospitalization.create(bundle)
      : IndicatorsDashboard.hospitalization.update(uuid, bundle);

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
