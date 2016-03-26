// TODO Handle HTTP exception errors (displayed contextually on form)
angular.module('bhima.controllers')
.controller('PatientRegistrationController', PatientRegistrationController);

PatientRegistrationController.$inject = [
  '$location', 'ScrollService', 'PatientService', 'DebtorService', 'util', 'SessionService'
];

function PatientRegistrationController($location, ScrollTo, Patients, Debtors, util, Session) {
  var viewModel = this;

  // Models for collecting patient data in logical groups
  viewModel.finance = {};
  viewModel.medical = {};
  viewModel.options = {}; 
  
  // bind default villages 
  viewModel.medical.origin_location_id = Session.enterprise.location_id;
  viewModel.medical.current_location_id = Session.enterprise.location_id;

  // Set up page elements data (debtor select data)
  Debtors.groups()
    .then(function (results) {
      viewModel.options.debtorGroups = results;
    })
    .catch(handleServerError);
  
  // Define limits for DOB
  viewModel.minDOB = util.minDOB;
  viewModel.maxDOB = util.maxDOB;

  viewModel.registerPatient = function registerPatient(patientDetailsForm) {

    // Register submitted action - explicit as the button is outside of the scope of the form
    patientDetailsForm.$setSubmitted();

    if (patientDetailsForm.$invalid) {

      // End propegation for invalid state - this could scroll to an $invalid element on the form
      return;
    }
   
    Patients.create(viewModel.medical, viewModel.finance)
      .then(function (result) {

        // create patient success - mark as visiting
        return Patients.logVisit(result.uuid);
      })
      .then(function (confirmation) {
        var patientCardPath = '/invoice/patient/';

        //TODO Hospital card should recieve a value that notifies the user of register success
        $location.path(patientCardPath.concat(confirmation.uuid));
      })
      .catch(handleServerError);
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
  
  /** 
   * This method is responsible for handling exceptions thrown by the server 
   * that the client has not anticipated. 
   * 
   * @todo  Discuss if this should be a library to account for standard client side errors,
   *        -1 for offline etc. This should not have to be done everywhere. 
   * @params  {object}  error   An Error object that has been sent from the server. 
   */
  function handleServerError(error) {
    var NO_INTERNET_CONNECTION = -1;
  
    // case - there is no internet connection 
    if (error.status === NO_INTERNET_CONNECTION) { 
      viewModel.exception = { 
        status : -1,
        data : { 
          code : 'ERRORS.NO_CONNECTION',
          description : 'No internet connection found - please contact your system administrator'
        }
      };
    } else { 
      
      // No cases have been matched - provide error details to the UI 
      viewModel.exception = error; 
    }
    
    ScrollTo('exceptionAlert');
  }
}
