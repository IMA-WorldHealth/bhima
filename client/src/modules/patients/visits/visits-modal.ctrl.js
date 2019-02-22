angular.module('bhima.controllers')
  .controller('VisitsAdmissionController', VisitsAdmissionController);

VisitsAdmissionController.$inject = [
  '$uibModalInstance', 'PatientService', 'patient', 'isAdmission', 'currentVisit',
];

function VisitsAdmissionController(ModalInstance, Patients, patient, isAdmission, currentVisit) {
  const vm = this;

  vm.isAdmission = isAdmission;
  vm.currentVisit = currentVisit;

  // TODO(@jniles) - move this into a user-configurable setting
  vm.REQUIRED_DIAGNOSES = false;

  // expose action methods
  vm.cancel = ModalInstance.close;
  vm.admit = admit;

  vm.visit = { hospitalized : 0 };
  vm.$loading = false;

  vm.onBedRoomSelect = bed => {
    vm.visit.bed = bed;
  };

  // TODO(@jniles) - load these asynchronously using a MySQL %LIKE% for perf
  Patients.Visits.diagnoses()
    .then(results => {
      vm.diagnoses = results;
    });

  // assign current visit uuid to discharge values
  if (!vm.isAdmission) {
    vm.visit.uuid = currentVisit.uuid;
  }

  function admit(form) {
    if (form.$invalid) { return; }

    vm.$loading = true;

    // the columns updated on the patient visit table will depend on the admission/ discharge type
    const submitMethod = vm.isAdmission ? Patients.Visits.admit : Patients.Visits.discharge;

    submitMethod(patient, vm.visit)
      .then(() => {
        ModalInstance.close();
      })
      .finally(() => {
        vm.$loading = false;
      });
  }
}
