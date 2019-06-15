angular.module('bhima.controllers')
  .controller('StaffModalController', StaffModalController);

StaffModalController.$inject = [
  '$state', 'IndicatorsDashboardService', 'NotifyService',
];

function StaffModalController(
  $state, IndicatorsDashboard, Notify
) {
  const vm = this;

  vm.file = { type_id : IndicatorsDashboard.STAFF_TYPE_ID };
  vm.indicators = {};

  const { uuid } = $state.params;
  vm.isCreating = !!($state.params.creating);

  vm.onSelectPeriod = selected => {
    vm.fiscal_year_id = selected.fiscal && selected.fiscal.id ? selected.fiscal.id : undefined;
    vm.file.period_id = selected.period && selected.period.id ? selected.period.id : undefined;
    vm.selectedPeriod = selected.period && selected.period.id ? selected.period.hrLabel : undefined;
    doesIndicatorsFileExists();
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
    IndicatorsDashboard.clean(vm.indicators);

    vm.file.status_id = IndicatorsDashboard.isFormCompleted(vm.indicators)
      ? IndicatorsDashboard.COMPLETE_STATUS_ID
      : IndicatorsDashboard.INCOMPLETE_STATUS_ID;

    vm.indicators = IndicatorsDashboard.handleNullString(vm.indicators);

    return checkDuplicated()
      .then(isExisting => {
        if (isExisting && vm.isCreating) {
          vm.isExisting = true;
          return null;
        }

        // hack for server match
        const bundle = { indicator : vm.file, personel : vm.indicators };
        const promise = (vm.isCreating)
          ? IndicatorsDashboard.staff.create(bundle)
          : IndicatorsDashboard.staff.update(uuid, bundle);
        return promise;
      })
      .then(() => {
        if (vm.isExisting) { return; }

        const translateKey = (vm.isCreating)
          ? 'DASHBOARD.INDICATORS_FILES.SUCCESSFULLY_ADDED'
          : 'DASHBOARD.INDICATORS_FILES.SUCCESSFULLY_UPDATED';
        Notify.success(translateKey);
        $state.go('indicatorsFilesRegistry', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function doesIndicatorsFileExists() {
    if (!vm.file.period_id) { return; }

    vm.isExisting = false;
    vm.loading = true;
    checkDuplicated()
      .then(isExisting => {
        if (isExisting) {
          vm.isExisting = true;
        }
      })
      .catch(Notify.handleError)
      .finally(() => {
        vm.loading = false;
      });
  }

  function checkDuplicated() {
    return IndicatorsDashboard.indicatorsFiles.read(null, {
      period_id : vm.file.period_id,
      service_id : vm.file.service_id,
      type_id : vm.file.type_id,
    }).then(rows => {
      return rows.length > 0;
    });
  }

  function cancel() {
    $state.go('indicatorsFilesRegistry');
  }
}
