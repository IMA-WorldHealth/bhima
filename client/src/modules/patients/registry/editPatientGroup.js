angular.module('bhima.controllers')
  .controller('EditPatientGroupModalController', EditPatientGroupModalController);

EditPatientGroupModalController.$inject = [
  'data', '$uibModalInstance', 'NotifyService',
  'PatientGroupService', 'PatientService',
];

/**
 * @class EditPatientGroupModalController
 */
function EditPatientGroupModalController(data, Instance, Notify, PatientGroups, Patients) {
  const vm = this;
  vm.cancel = () => Instance.close();
  vm.submit = submit;
  vm.subscribedGroups = {};

  PatientGroups.read().then(sessionGroups => {
    vm.patientGroups = sessionGroups;
    sessionGroups.forEach((patientGroup) => {
      vm.subscribedGroups[patientGroup.uuid] = false;
    });
  }).catch(Notify.handleError);

  function getGroups() {
    const subscribedGroups = [];
    const keys = Object.keys(vm.subscribedGroups);

    keys.forEach(groupUuid => {
      if (vm.subscribedGroups[groupUuid]) {
        subscribedGroups.push(groupUuid);
      }
    });

    return subscribedGroups;
  }

  function submit() {
    if (vm.patient_group_uuid) {
      Notify.danger('FORM.ERRORS.HAS_ERRORS');
    } else {
      const subscribedGroups = getGroups();
      if (subscribedGroups.length > 0) {
        const options = {
          subscribedGroups,
          patientUuids : data,
          removeAssignedGroups : vm.removeAssignedGroups,
        };

        Patients.bulkUpdateGroups(options)
          .then(() => Instance.close(true))
          .catch(Notify.handleError);
      }
    }
  }
}//
