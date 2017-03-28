angular.module('bhima.controllers')
  .controller('UpdatePatientGroups', UpdatePatientGroups);

UpdatePatientGroups.$inject = [
  '$uibModalInstance', 'PatientService', 'sessionPatient', 'sessionGroups',
  'updateModel', 'NotifyService'
];

function UpdatePatientGroups($uibModalInstance, patients, sessionPatient, sessionGroups, updateModel, Notify) {
  var viewModel = this;

  // TODO move to method
  viewModel.subscribedGroups = {};
  viewModel.patient = sessionPatient;

  sessionGroups.forEach(function (patientGroup) {
    viewModel.subscribedGroups[patientGroup.uuid] = true;
  });

  // TODO Handle errors with generic modal exception display (inform system administrator)
  patients.groups()
    .then(function (groups) {
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
      .then(function () {

        // TODO move to method
        var formatControllerResponse = [];

        // Fetch each of the updated group definitions and collect them in an array
        Object.keys(viewModel.subscribedGroups).forEach(function (groupKey) {
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
    var groups = viewModel.patientGroups;
    var i = groups.length;
    var groupObject;

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
