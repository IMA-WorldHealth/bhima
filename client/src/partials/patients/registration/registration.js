angular.module('bhima.controllers')
.controller('PatientRegistrationController', PatientRegistrationController);

PatientRegistrationController.$inject = [
  '$location', 'PatientService', 'DebtorService',
  'SessionService', 'util', 'NotifyService'
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
function PatientRegistrationController($location, Patients, Debtors, Session, util, Notify) {
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

  // Maxlength field for Patient Registration 
  viewModel.maxLength = util.maxTextLength; 
  viewModel.length150 = util.length150;
  viewModel.length100 = util.length100;
  viewModel.length50 = util.length50;
  viewModel.length40 = util.length40;
  viewModel.length30 = util.length30;
  viewModel.length16 = util.length16;  
  viewModel.length12 = util.length12;

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
        var patientCardPath = '/patients/';

        //TODO Hospital card should receive a value that notifies the user of register success
        $location.path(patientCardPath.concat(confirmation.uuid, '/edit'));
      })
      .catch(Notify.handleError);
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
}
