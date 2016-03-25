// TODO Handle HTTP exception errors (displayed contextually on form)
angular.module('bhima.controllers')
.controller('PatientRegistrationController', PatientRegistrationController);

PatientRegistrationController.$inject = [
  '$location', 'Patients', 'Debtors', 'util'
];

function PatientRegistrationController($location, patients, debtors, util) {
  var viewModel = this;

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

  viewModel.registerPatient = function registerPatient(patientDetailsForm) {

    // Register submitted action - explicit as the button is outside of the scope of the form
    patientDetailsForm.$setSubmitted();

    if (patientDetailsForm.$invalid) {

      // End propegation for invalid state - this could scroll to an $invalid element on the form
      return;
    }
   
    patients.create(viewModel.medical, viewModel.finance)
      .then(function (result) {

        // create patient success - mark as visiting
        return patients.logVisit(result.uuid);
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
}
