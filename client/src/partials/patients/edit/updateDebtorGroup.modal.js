angular.module('bhima.controllers')
.controller('UpdateDebtorGroup', UpdateDebtorGroup);

UpdateDebtorGroup.$inject = ['$scope', '$uibModalInstance', 'DebtorService',  'patient', 'updateModel'];

function UpdateDebtorGroup($scope, $uibModalInstance, debtors, patient, updateModel) { 
  var viewModel = this;
  
  // TODO Handle errors with generic modal exception display (inform system administrator)
  debtors.groups()
    .then(function (debtorGroups) { 
  
      viewModel.debtor_group_uuid = patient.debtor_group_uuid;

      // setDebtorGroup(patient.debtor_group_uuid);

      viewModel.debtorGroups = debtorGroups;
    });

  // TODO Refactor - use stores?
  function fetchGroupName(uuid) { 
    var name;
    viewModel.debtorGroups.some(function (debtorGroup) { 
      if (debtorGroup.uuid === uuid) { 
        name = debtorGroup.name;
        return true;
      }
    });
    return name;
  }

  viewModel.confirmGroup = function confirmGroup() { 
    var formIsUpdated = $scope.groupForm.$dirty;
    var updateRequest;

    // Simply exit the modal
    if (!formIsUpdated) { 
      closeModal(); 
      return;
    }
  
    updateRequest = { 
      group_uuid : viewModel.debtor_group_uuid
    };
    
    debtors.update(patient.debtor_uuid, updateRequest)
      .then(function (result) { 
      
        updateModel(
          viewModel.debtor_group_uuid,
          fetchGroupName(viewModel.debtor_group_uuid));
        
        closeModal();
      });
     
  };
  
  viewModel.closeModal = closeModal;

  function closeModal() { 
    $uibModalInstance.dismiss();
  }
}
