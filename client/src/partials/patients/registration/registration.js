// TODO Handle HTTP exception errors (displayed contextually on form)
angular.module('bhima.controllers')
.controller('PatientRegistrationController', PatientRegistrationController);

PatientRegistrationController.$inject = [
  '$scope', '$location', 'Patients', 'Debtors', 'util', 'SessionService'
];

function PatientRegistrationController($scope, $location, patients, debtors, util, Session) {
  var viewModel = this;

  viewModel.format='yyyy/MM/dd';
  
  // Models for collecting patient data in logical groups
  viewModel.finance = {};
  viewModel.medical = {};
  viewModel.options = {};
  
  // Set up page elements data (debtor select data)
  debtors.groups()
    .then(function (results) { 
      viewModel.options.debtorGroups = results;
    }); 

  // Define limits for DOB
  viewModel.minDOB = util.minDOB;
  viewModel.maxDOB = util.maxDOB;
  
  viewModel.registerPatient = function registerPatient() {
    var createPatientDetails;

    // Register submitted action - explicit as the button is outside of the scope of the form 
    $scope.details.$setSubmitted(); 
  
    if ($scope.details.$invalid) { 
      
      // End propegation for invalid state - this could scroll to an $invalid element on the form
      return;
    }

    createPatientDetails = { 
      medical : viewModel.medical,
      finance : viewModel.finance
    };

    // Assign implicit information 
    createPatientDetails.medical.project_id = Session.project.id;
  
    patients.create(createPatientDetails)
      .then(function (result) { 
        
        // Create patient success - mark as visiting
        return patients.logVisit({
          uuid : result.uuid
        });
      })
      .then(function (confirmation) { 
        var patientCardPath = '/invoice/patient/';
        
        //TODO Hospital card should recieve a value that notifies the user of register success
        $location.path(patientCardPath.concat(confirmation.uuid));
      });
  };
  
  /**
   * Date and location utility methods
   */
  viewModel.enableFullDate = function enableFullDate() {
    viewModel.fullDateEnabled = true;
  };
  
  viewModel.calculateYOB = function calculateYOB(value) { 
    viewModel.medical.dob = value && value.length === 4 ? new Date(value + '-' + util.defaultBirthMonth) : undefined;
  };
  
  //FIXME Location directive relies on the $scope object
  $scope.setOriginLocation = function setOriginLocation(uuid) {
    viewModel.medical.origin_location_id = uuid;
  };

  $scope.setCurrentLocation = function setCurrentLocation(uuid) {
    viewModel.medical.current_location_id = uuid;
  };
}
