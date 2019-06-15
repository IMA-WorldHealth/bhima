angular.module('bhima.controllers')
  .controller('MergePatientsModalController', MergePatientsModalController);

MergePatientsModalController.$inject = [
  'PatientService', '$state', 'NotifyService', '$uibModalInstance',
];

function MergePatientsModalController(Patients, $state, Notify, Instance) {
  const vm = this;

  vm.patients = $state.params.patients;
  vm.submit = submit;

  vm.selectPatient = uuid => {
    vm.selected = uuid;
  };

  function init() {
    const params = vm.patients.map(p => p.uuid);
    Patients.countEmployees(params)
      .then(data => {
        vm.allAreEmployees = data.total_employees === params.length;
      })
      .catch(Notify.handleError);
  }

  function submit() {
    if (vm.allAreEmployees) { return null; }

    const params = {
      selected : vm.selected,
      other : vm.patients.filter(p => p.uuid !== vm.selected).map(p => p.uuid),
    };

    return Patients.merge(params)
      .then(() => {
        Notify.success('PATIENT_REGISTRY.MERGE_SUCCESS');
        Instance.close();
        $state.go('patientRegistry', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  init();
}
