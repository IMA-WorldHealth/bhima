angular.module('bhima.controllers')
.controller('PatientRegistrationController', PatientRegistrationController);

PatientRegistrationController.$inject = [
  '$location', 'ScrollService', 'PatientService', 'DebtorService',  
  'SessionService', 'util'
];

/** 
 * Patient Registration Controller
 *
 * This controller is responsible for collecting data and providing utility
 * methods for the patient registration client side module. It provides basic 
 * methods for handling dates of birth as well as wrappers to communicate with 
 * the server. 
 *
 * @module controllers/PatientRegistrationController
 */
function PatientRegistrationController($location, ScrollTo, Patients, Debtors, Session, util) {
  var viewModel = this;

  // models for collecting patient data in logical groups
  viewModel.finance = {};
  viewModel.medical = {};
  viewModel.options = {}; 
  
  // bind default villages 
  viewModel.medical.origin_location_id = Session.enterprise.location_id;
  viewModel.medical.current_location_id = Session.enterprise.location_id;
  
  viewModel.registerPatient = registerPatient;
  viewModel.enableFullDate = enableFullDate;
  viewModel.calculateYOB = calculateYOB;
  
  // Set up page elements data (debtor select data)
  Debtors.groups()
    .then(function (results) {
      viewModel.options.debtorGroups = results;
    })
    .catch(handleServerError);
  
  // Define limits for DOB
  viewModel.minDOB = util.minDOB;
  viewModel.maxDOB = util.maxDOB;

  function registerPatient(patientDetailsForm) {

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
        //var patientCardPath = '/invoices/patient/';
        /** @fixme -  temporary path for end to end tests while we develop receipts */
        var patientCardPath = '/patients/edit/';

        //TODO Hospital card should receive a value that notifies the user of register success
        $location.path(patientCardPath.concat(confirmation.uuid));
      })
      .catch(handleServerError);
  }

  /**
   * Date and location utility methods
   */
  function enableFullDate() {
    viewModel.fullDateEnabled = true;
  }

  function calculateYOB(value) {
    viewModel.medical.dob = value && value.length === 4 ? new Date(value + '-' + util.defaultBirthMonth) : undefined;
  }
  
  /** 
   * This method is responsible for handling exceptions thrown by the server 
   * that the client has not anticipated. 
   * 
   * @todo  Discuss if this should be a library to account for standard client side errors,
   *        -1 for offline etc. This should not have to be done everywhere. 
   *        This could be implemented with an $http interceptor. 
   * @params  {object}  error   An Error object that has been sent from the server. 
   */
  function handleServerError(error) {
    viewModel.exception = error; 
    ScrollTo('exceptionAlert');
  }
}
