// TODO Known bug: If a patients hospital number is updated the original registered value will still 
// be the only value ignored by the validation - the new value will be reported as an error if changed 'already registered'

// TODO Refactor patient find directive to not use $scope.watch
// TODO No action is taken if default parameter is not a valid patient

// FIXME Patient UUID reference downloads and searches for patient redundantly 
// this should be addressed by updating the find patient directive to only return a UUID
// and have the page responsible for using the UUID as required (potentially optionally?)

// TODO Address location/ routing hack, deep linking functionality should not be implemented 
// in a different way by every controller - apply uniform (routing?) standards across pages
angular.module('bhima.controllers')
.controller('PatientEdit', PatientEdit);

PatientEdit.$inject = ['$scope', '$translate', '$stateParams', '$location', '$anchorScroll', '$uibModal', 'PatientService', 'util', 'moment'];

function PatientEdit($scope, $translate, $stateParams, $location, $anchorScroll, $uibModal, patients, util, moment) { 
  var viewModel = this;
  var referenceId = $stateParams.patientID;

  viewModel.patient = null;
  viewModel.unknownId = false;
  viewModel.minDOB = util.minDOB;
  viewModel.maxDOB = util.maxDOB;

  if (referenceId) { 
    buildPage(referenceId);
  }

  function buildPage(patientId) { 
    collectPatient(patientId)
      .then(function (result) { 
        
        return collectGroups(patientId); 
      })
      .catch(function (error) { 

        viewModel.unknownId = true;        
      });
  }

  function collectPatient(patientId) { 
    
    // TODO Full patient/details object should be passed through find patient directive
    // 1. Only download id + name in patient directive
    // 2. Download full patients/details on selection
    return patients.detail(patientId)
      .then(function (patient) { 
        
        formatPatientAttributes(patient);
        viewModel.medical = patient;
      });
  }
  
  function formatPatientAttributes(patient) { 
    
    // Sanitise DOB for HTML Date Input 
    patient.dob = new Date(patient.dob);

    // Assign name
    patient.name = patient.first_name.concat(
          ' ', patient.middle_name, 
          ' ', patient.last_name);

    // Assign age 
    // FIXME Translate value is not returned unless page is fully initialised - this will usually fail on refresh
    /*$translate('PATIENT_EDIT.'.concat(patient.sex))
      .then(function (res) { patient.displayGender = res; });*/
    
    patient.displayGender = patient.sex;
    patient.displayAge = moment().diff(patient.dob, 'years');
  }
  
  function collectGroups(patientId) { 
    patients.groups(patientId)
      .then(function (result) { 
        viewModel.finance = {patientGroups : result};
      });
  }
  
  // Update the view to reflect changes made in update modal
  function updateDebtorModel(debtorGroupUuid, debtorGroupName) { 
    viewModel.medical.debitor_group_uuid = debtorGroupUuid;
    viewModel.medical.debitor_group_name = debtorGroupName;
    viewModel.updatedDebtorGroup = true;
  }
  
  // Update the view to reflect changes made in update modal
  function updatePatientGroupsModel(updated) { 
    viewModel.updatedPatientGroups = true;
    viewModel.finance.patientGroups = [];
  
    viewModel.finance.patientGroups = updated;
  }
  
  // TODO Clearer naming conventions
  // submit a request to change patient details
  viewModel.updatePatient = function updatePatient(patient) { 
    var patientIsUpdated = $scope.details.$dirty || $scope.optional.$dirty;
    var changedDetails, changedOptional, changedDefinition;

    viewModel.updatedPatientDetails = false;
    
    $scope.details.$setSubmitted();

    if (!patientIsUpdated) { 

      // No updates need to happen - save HTTP requests
      // TODO Inform user of early exit state
      return;
    }

    if ($scope.details.$invalid) { 
      
      // Form is not ready to be submitted to the server
      return;
    }
    
    changedDetails = util.filterDirtyFormElements($scope.details);
    changedOptional = util.filterDirtyFormElements($scope.optional);

    changedDefinition = angular.extend(changedDetails, changedOptional);
      
    // TODO Use latest data formatting/ sanitastion standards
    // Ensure date is submitted in a valid format
    if (changedDefinition.dob) { 
      changedDefinition.dob = util.sqlDate(changedDefinition.dob);
    }

    patients.update(patient.uuid, changedDefinition)
      .then(function (updatedPatient) { 
        
        // Update status
        viewModel.updatedPatientDetails = true;
  
        // Update view
        formatPatientAttributes(updatedPatient);
        viewModel.medical = updatedPatient;

        // Reset forms dirty values
        $scope.details.$setPristine();
        $scope.optional.$setPristine();
        $scope.details.$submitted = false;
      });
  };
  
  // Callback passed to find patient directive 
  /*viewModel.confirmPatient = function confirmPatient(patient) {  
    var pageReferred = angular.isDefined(referenceId);
    
    if (pageReferred) { 
      
      // Build the page given a correctly linked patient UUID
      // TODO Catch 404 patient not found response and show meaningful error
      buildPage(patient.uuid);
    } else { 

      // Navigate correctly using patient as reference
      $location.path('/patients/edit/'.concat(patient.uuid));
    }
  };*/

  viewModel.updateDebtorGroup = function updateDebtorGroup() { 

    // Reset updated flag 
    viewModel.updatedDebtorGroup = false;
  
    // Provide modal
    var modalInstance = $uibModal.open({
      animation : true,
      templateUrl : 'partials/patients/edit/updateDebtorGroup.tmpl.html',
      controller : 'UpdateDebtorGroup as UpdateDebtorGroupCtrl',
      size : 'md', 
      keyboard : false,
      backdrop : 'static',
      resolve : {
        patient : function () { 
          return viewModel.medical;
        }, 
        updateModel : function () { 
          return updateDebtorModel;
        }
      }
    });
  };

  viewModel.updatePatientGroups = function updatePatientGroups() { 
    
    // Reset updated flag 
    viewModel.updatedPatientGroups = false;
  
    var modalInstance = $uibModal.open({
      animation : true,
      templateUrl : 'partials/patients/edit/updatePatientGroups.tmpl.html',
      controller : 'UpdatePatientGroups as UpdatePatientGroupsCtrl',
      size : 'md',
      keyboard : false,
      backdrop : 'static',
      resolve : {
        sessionPatient : function () { 
          return viewModel.medical;
        }, 
        sessionGroups : function () { 
          return viewModel.finance.patientGroups;
        },
        updateModel : function () { 
          return updatePatientGroupsModel;
        }
      }
    });
  };

  viewModel.scrollToSubmission = function scrollToSubmission() { 
    $location.hash('submission');
    $anchorScroll();
  };
}
