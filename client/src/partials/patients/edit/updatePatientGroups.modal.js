// TODO Handle no patient groups case
angular.module('bhima.controllers')
.controller('UpdatePatientGroups', UpdatePatientGroups);

UpdatePatientGroups.$inject = ['$scope', '$uibModalInstance', 'PatientService', 'sessionPatient', 'sessionGroups', 'updateModel'];

function UpdatePatientGroups($scope, $uibModalInstance, patients, sessionPatient, sessionGroups, updateModel) { 
  var viewModel = this;
  
  // TODO move to method
  viewModel.subscribedGroups = {};
  sessionGroups.forEach(function (patientGroup) { 
    viewModel.subscribedGroups[patientGroup.uuid] = true; 
  });

  // TODO Handle errors with generic modal exception display (inform system administrator)
  patients.groups()
    .then(function (result) { 
      viewModel.patientGroups = result;
    });

  viewModel.confirmGroups = function confirmGroup() { 
    var formIsUpdated = $scope.groupForm.$dirty;
    
    // Simply exit the modal
    if (!formIsUpdated) { 
      closeModal(); 
      return;
    }

    patients.updateGroups(sessionPatient.uuid, viewModel.subscribedGroups)
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
    var groupObject;
    viewModel.patientGroups.some(function (patientGroup) { 
      if (patientGroup.uuid === uuid) {
        groupObject = patientGroup;
        return true;
      }
    });
    return groupObject;
  }
  
  viewModel.closeModal = closeModal;

  function closeModal() { 
    $uibModalInstance.dismiss();
  }
}
