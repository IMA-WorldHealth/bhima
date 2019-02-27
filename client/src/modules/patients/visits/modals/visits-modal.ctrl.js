angular.module('bhima.controllers')
  .controller('VisitsAdmissionController', VisitsAdmissionController);

VisitsAdmissionController.$inject = [
  '$uibModalInstance', 'PatientService', 'VisitService', 'NotifyService',
  'patient', 'isAdmission', 'currentVisit',
];

function VisitsAdmissionController(ModalInstance, Patients, Visits, Notify,
  patient, isAdmission, currentVisit) {
  const vm = this;

  vm.isAdmission = isAdmission;
  vm.currentVisit = currentVisit;
  vm.patientUuid = patient;
  vm.hasPatient = !!patient;

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

  vm.onServiceSelect = service => {
    vm.visit.service = service;
  };

  vm.onSelectPatient = p => {
    Visits.admissionStatus(p.uuid)
      .then(result => {
        if (!result.is_admitted) {
          // eslint-disable-next-line no-param-reassign
          patient = p.uuid;
          vm.alreadyAdmitted = 0;
        } else {
          vm.alreadyAdmitted = 1;
        }
      })
      .catch(Notify.handleError);
  };

  // TODO(@jniles) - load these asynchronously using a MySQL %LIKE% for perf
  Patients.Visits.diagnoses()
    .then(results => {
      vm.diagnoses = results;
    });

  // assign current visit uuid to discharge values
  if (!vm.isAdmission && currentVisit) {
    vm.visit.uuid = currentVisit.uuid;
  }

  function admit(form) {
    if (form.$invalid || !patient) { return null; }

    vm.$loading = true;

    // the columns updated on the patient visit table will depend on the admission/ discharge type
    const submitMethod = vm.isAdmission ? Patients.Visits.admit : Patients.Visits.discharge;

    return submitMethod(patient, vm.visit)
      .then(() => {
        ModalInstance.close();
      })
      .finally(() => {
        vm.$loading = false;
      });
  }
}
