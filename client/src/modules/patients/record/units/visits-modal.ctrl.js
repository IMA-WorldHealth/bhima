angular.module('bhima.controllers')
.controller('VisitsAdmissionController', VisitsAdmissionController);

VisitsAdmissionController.$inject = ['$uibModalInstance', 'PatientService', 'patient', 'isAdmission', 'currentVisit'];

function VisitsAdmissionController(ModalInstance, Patients, patient, isAdmission, currentVisit) {
  var vm = this;

  vm.isAdmission = isAdmission;
  vm.currentVisit = currentVisit;

  // expose action methods
  vm.cancel = ModalInstance.close;
  vm.admit = admit;

  vm.visit = {};
  vm.$loading = false;

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

    if (form.$invalid) { return; }

    vm.$loading = true;

    // the columns updated on the patient visit table will depend on the admission/ discharge type
    submitMethod = vm.isAdmission ? Patients.Visits.admit : Patients.Visits.discharge;

    submitMethod(patient, vm.visit)
      .then(function (result) {
        ModalInstance.close();
      })
      .finally(function () {
        vm.$loading = false;
      });
  }
}

