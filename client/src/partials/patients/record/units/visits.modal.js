angular.module('bhima.controllers')
.controller('VisitsAdmissionController', VisitsAdmissionController);

VisitsAdmissionController.$inject = ['$uibModalInstance', 'PatientService', 'patient', 'isAdmission', 'currentVisit'];

function VisitsAdmissionController(ModalInstance, Patients, patient, isAdmission, currentVisit) {
  var vm = this;

  vm.visit = {};
  vm.isAdmission = isAdmission;

  vm.cancel = ModalInstance.close;
  vm.admit = admit;

  vm.$loading = false;

  vm.currentVisit = currentVisit;

  console.log(vm.currentVisit);

  Patients.Visits.diagnoses()
    .then(function (results) {
      vm.diagnoses = results;
    });

  // assign current visit uuid to dischare values
  if (!vm.isAdmission) {
    vm.visit.uuid = currentVisit.uuid;
  }

  function admit(form) {

    var submitMethod;

    if (form.$invalid) {
      return;
    }

    vm.$loading = true;

    submitMethod = vm.isAdmission ? Patients.Visits.admit : Patients.Visits.discharge;

    // with admit
    // date -> start_date
    // diagnosis_id -> start_diagnosis_id
    // if (vm.isAdmisssion) {
      // Patients.Visits.admit(patient, vm.visit);
    // } else {
      // vm.visit.uuid = currentVisit.uuid;
    submitMethod(patient, vm.visit)
      .then(function (result) {
        ModalInstance.close();
      });
      // patient is being discharged
      // Patients.Visits.discharge(patient, vm.visit);
    // }
  }
}

