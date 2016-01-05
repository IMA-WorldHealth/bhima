// TODO Handle no patient groups case
angular.module('bhima.controllers')
.controller('UpdatePatientGroups', UpdatePatientGroups);

UpdatePatientGroups.$inject = ['$scope', '$uibModalInstance', 'Patients', 'sessionPatient', 'sessionGroups', 'updateModel'];

function UpdatePatientGroups($scope, $uibModalInstance, patients, sessionPatient, sessionGroups, updateModel) { 
  var viewModel = this;
  
  // TODO move to method
  viewModel.subscribedGroups = {};
  sessionGroups.forEach(function (patientGroup) { 
    viewModel.subscribedGroups[patientGroup.uuid] = true; 
  });
  // /TODO
  
  console.log('session', sessionGroups);

  // TODO Handle errors with generic modal exception display (inform system administrator)
  patients.groups()
    .then(function (result) { 
      console.log('got results', result);
      viewModel.patientGroups = result;
    });

  viewModel.confirmGroups = function confirmGroup() { 
    var formIsUpdated = $scope.groupForm.$dirty;
    var updateRequest;

    console.log($scope.groupForm);
    
    // Simply exit the modal
    if (!formIsUpdated) { 
      closeModal(); 
      return;
    }

    console.log(viewModel.subscribedGroups);
    patients.updateGroups(sessionPatient.uuid, viewModel.subscribedGroups)
      .then(function (result) { 

        // TODO move to method
        var formatControllerResponse = [];

        // Fetch each of the updated group definitions and collect them in an array 
        Object.keys(viewModel.subscribedGroups).forEach(function (groupKey) { 
          
          console.log('checking key', groupKey);
          console.log(viewModel.subscribedGroups[groupKey]);
          if (viewModel.subscribedGroups[groupKey]) { 
            formatControllerResponse.push(fetchGroupObject(groupKey));
          }
        });
        // /TODO 
        
        updateModel(formatControllerResponse);
        closeModal();
      });
  };

  // TODO Refactor - use stores?
  function fetchGroupObject(uuid) { 
    var groupObject;
    console.log('fetch', uuid);
    viewModel.patientGroups.some(function (patientGroup) { 
      if (patientGroup.uuid === uuid) {
        groupObject = patientGroup;
        return true;
      }
    });
    console.log('return', groupObject);
    return groupObject;
  }
  
  viewModel.closeModal = closeModal;

  function closeModal() { 
    $uibModalInstance.dismiss();
  }
}
