angular.module('bhima.controllers')
  .controller('MergePatientsModalController', MergePatientsModalController);

MergePatientsModalController.$inject = [
  'PatientService', '$state', 'NotifyService',
];

function MergePatientsModalController(Patients, $state, Notify) {
  const vm = this;

  vm.patients = $state.params.patients;
  vm.submit = submit;

  vm.selectPatient = uuid => {
    vm.selected = uuid;
  };

  function submit() {
    const params = {
      selected : vm.selected,
      other : vm.patients.filter(p => p.uuid === vm.selected).map(p => p.uuid),
    };

    return Patients.merge(params)
      .then(res => {
        console.log(res);
      })
      .catch(Notify.handleError);
  }
}
