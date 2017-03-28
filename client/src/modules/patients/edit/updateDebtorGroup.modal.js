angular.module('bhima.controllers')
  .controller('UpdateDebtorGroup', UpdateDebtorGroup);

UpdateDebtorGroup.$inject = [
  '$uibModalInstance', 'DebtorService',  'patient', 'updateModel', 'NotifyService'
];

function UpdateDebtorGroup($uibModalInstance, debtors, patient, updateModel, Notify) {
  var viewModel = this;
  var originalGroupUuid;

  viewModel.patient = patient;
  debtors.groups()
    .then(function (debtorGroups) {
      originalGroupUuid = patient.debtor_group_uuid;
      viewModel.debtor_group_uuid = patient.debtor_group_uuid;
      viewModel.debtorGroups = debtorGroups;
    })
    .catch(Notify.handleError);

  // TODO Refactor - use stores?
  function fetchGroupName(uuid) {
    var name;
    var groups = viewModel.debtorGroups;
    var i = groups.length;

    while (i--) {
      if (groups[i].uuid === uuid) {
        name = groups[i].name;
        break;
      }
    }

    return name;
  }

  // form submission
  viewModel.confirmGroup = function confirmGroup(groupForm) {
    var updateRequest;
    var noGroupChange = (originalGroupUuid === viewModel.debtor_group_uuid);

    // if there was no change in the groups, just close the modal.
    if (noGroupChange) {
      closeModal();
      return;
    }

    updateRequest = {
      group_uuid : viewModel.debtor_group_uuid
    };

    return debtors.update(patient.debtor_uuid, updateRequest)
      .then(function () {

        updateModel(
          viewModel.debtor_group_uuid,
          fetchGroupName(viewModel.debtor_group_uuid)
        );

        closeModal();
      });

  };

  viewModel.closeModal = closeModal;

  function closeModal() {
    $uibModalInstance.close();
  }
}
