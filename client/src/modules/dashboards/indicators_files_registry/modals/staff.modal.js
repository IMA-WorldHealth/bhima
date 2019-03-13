angular.module('bhima.controllers')
  .controller('StaffModalController', StaffModalController);

StaffModalController.$inject = [
  '$state', 'IndicatorsDashboardService', 'NotifyService',
];

function StaffModalController(
  $state, IndicatorsDashboard, Notify
) {
  const vm = this;
  const STAFF_TYPE_ID = 2;
  const INCOMPLETE_STATUS_ID = 1;
  const COMPLETE_STATUS_ID = 2;

  vm.statusOptions = IndicatorsDashboard.statusOptions;

  vm.file = { type_id : STAFF_TYPE_ID };
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

  // exposed methods
  vm.submit = submit;

  // load details
  loadDetails();

  function loadDetails() {
    if (uuid) {
      IndicatorsDashboard.staff.read(uuid)
        .then(details => {
          vm.indicators = details;
          vm.fiscal_year_id = details.fiscal_year_id;
          vm.file.period_id = details.period_id;
        })
        .catch(Notify.errorHandler);
    }
  }

  // submit the data to the server from all two forms (update, create)
  function submit(staffForm) {
    if (staffForm.$invalid) {
      return 0;
    }

    if (staffForm.$pristine) {
      cancel();
      return 0;
    }

    // remove before submit
    delete vm.indicators.uuid;
    delete vm.indicators.fiscal_year_id;

    vm.file.status_id = isFormCompleted() ? COMPLETE_STATUS_ID : INCOMPLETE_STATUS_ID;
    // hack for server match
    const bundle = { indicator : vm.file, personel : vm.indicators };
    const promise = (vm.isCreating)
      ? IndicatorsDashboard.staff.create(bundle)
      : IndicatorsDashboard.staff.update(uuid, bundle);

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
