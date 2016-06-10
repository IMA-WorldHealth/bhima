angular.module('bhima.controllers')
.controller('PatientRegistrationController', PatientRegistrationController);

PatientRegistrationController.$inject = [
  '$location', 'PatientService', 'DebtorService',
  'SessionService', 'util', 'NotifyService', 'ReceiptModal', 'ScrollService'
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
function PatientRegistrationController($location, Patients, Debtors, Session, util, Notify, Receipts, ScrollTo) {
  var viewModel = this;

  viewModel.options = {};

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
    .catch(Notify.handleError);

  // Define limits for DOB
  viewModel.minDOB = util.minDOB;
  viewModel.maxDOB = util.maxDOB;

  settupRegistration();

  function registerPatient(patientDetailsForm) {

    // Register submitted action - explicit as the button is outside of the scope of the form
    patientDetailsForm.$setSubmitted();

    /** @todo once the bh-submit directive supports controller overriden $invalid handling this should be udpated */
    patientDetailsForm.$loading = true;

    if (patientDetailsForm.$invalid) {
      // End propegation for invalid state - this could scroll to an $invalid element on the form
      Notify.danger('FORM.ERRORS.INVALID');
      patientDetailsForm.$loading = false;
      return;
    }

    Patients.create(viewModel.medical, viewModel.finance)
      .then(function (confirmation) {
        Receipts.patient(confirmation.uuid, true);

        // reset form state
        patientDetailsForm.$setPristine();
        patientDetailsForm.$setUntouched();
        settupRegistration();

        ScrollTo('anchor');
      })
      .catch(Notify.handleError)
      .finally(function () {
        patientDetailsForm.$loading = false;
      });
  }

  function settupRegistration() {
    viewModel.finance = {};
    viewModel.medical = {};

    viewModel.fullDateEnabled = false;
    viewModel.yob = null;

    viewModel.medical.origin_location_id = Session.enterprise.location_id;
    viewModel.medical.current_location_id = Session.enterprise.location_id;
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
