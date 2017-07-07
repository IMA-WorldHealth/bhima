angular.module('bhima.controllers')
  .controller('UpdateDebtorGroup', UpdateDebtorGroup);

UpdateDebtorGroup.$inject = [
  '$uibModalInstance', 'DebtorService', 'patient', 'updateModel', 'NotifyService'
];

function UpdateDebtorGroup($uibModalInstance, debtors, patient, updateModel, Notify) {
  var viewModel = this;
  var originalGroupUuid;

  viewModel.patient = patient;

  // Set up page elements data (debtor select data)
  viewModel.onSelectDebtor = onSelectDebtor;

  function onSelectDebtor(debtorGroup) {
    originalGroupUuid = viewModel.patient.debtor_group_uuid;
    viewModel.debtor_group_uuid = debtorGroup.uuid;
    viewModel.debtorGroup = debtorGroup;
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
        updateModel(viewModel.debtor_group_uuid, viewModel.debtorGroup.name);
        closeModal();
      });
  };

  viewModel.closeModal = closeModal;

  function closeModal() {
    $uibModalInstance.close();
  }
}
