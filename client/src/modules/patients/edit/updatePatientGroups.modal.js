angular.module('bhima.controllers')
  .controller('UpdatePatientGroups', UpdatePatientGroups);

UpdatePatientGroups.$inject = [
  '$uibModalInstance', 'PatientService', 'sessionPatient', 'sessionGroups',
  'updateModel', 'NotifyService',
];

function UpdatePatientGroups($uibModalInstance, patients, sessionPatient, sessionGroups, updateModel, Notify) {
  const viewModel = this;

  // TODO move to method
  viewModel.subscribedGroups = {};
  viewModel.patient = sessionPatient;

  sessionGroups.forEach((patientGroup) => {
    viewModel.subscribedGroups[patientGroup.uuid] = true;
  });

  // TODO Handle errors with generic modal exception display (inform system administrator)
  patients.groups()
    .then((groups) => {
      viewModel.patientGroups = groups;
    })
    .catch(Notify.handleError);

  viewModel.confirmGroups = function confirmGroup(groupForm) {

    // if untouched, exit the modal
    if (groupForm.$pristine) {
      closeModal();
      return;
    }

    return patients.updateGroups(sessionPatient.uuid, viewModel.subscribedGroups)
      .then(() => {

        // TODO move to method
        const formatControllerResponse = [];

        // Fetch each of the updated group definitions and collect them in an array
        Object.keys(viewModel.subscribedGroups).forEach((groupKey) => {
          if (viewModel.subscribedGroups[groupKey]) {
            formatControllerResponse.push(fetchGroupObject(groupKey));
          }
        });

        updateModel(formatControllerResponse);
        closeModal();
      });
  };

  // TODO Refactor - use stores?
  function fetchGroupObject(uuid) {
    const groups = viewModel.patientGroups;
    let i = groups.length;
    let groupObject;

    while (i--) {
      if (groups[i].uuid === uuid) {
        groupObject = groups[i];
        break;
      }
    }

    return groupObject;
  }

  viewModel.closeModal = closeModal;

  function closeModal() {
    $uibModalInstance.dismiss();
  }
}
