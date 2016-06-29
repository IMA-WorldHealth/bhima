angular.module('bhima.controllers')
.controller('PatientRegistrationController', PatientRegistrationController);

PatientRegistrationController.$inject = [
  '$location', 'PatientService', 'DebtorService', 'SessionService', 'util',
  'NotifyService', 'ReceiptModal', 'ScrollService', 'bhConstants'
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
function PatientRegistrationController($location, Patients, Debtors, Session, util, Notify, Receipts, ScrollTo, bhConstants) {
  var vm = this;

  vm.submit = submit;
  vm.enableFullDate = enableFullDate;
  vm.calculateYOB = calculateYOB;

  // maxlength field for Patient Registration
  vm.maxLength = bhConstants.lengths.maxTextLength;
  vm.length150 = util.length150;
  vm.length100 = util.length100;
  vm.length50 = util.length50;
  vm.length30 = util.length30;

  // Set up page elements data (debtor select data)
  Debtors.groups()
    .then(function (results) {
      vm.debtorGroups = results;
    })
    .catch(Notify.handleError);

  // define limits for DOB
  vm.datepickerOptions = {
    maxDate : bhConstants.dates.maxDOB,
    minDate : bhConstants.dates.minDOB
  };

  settupRegistration();

  function submit(RegistrationForm) {

    if (RegistrationForm.$invalid) {
      // end propagation for invalid state - this could scroll to an $invalid element on the form
      Notify.danger('FORM.ERRORS.INVALID');
      return;
    }

    return Patients.create(vm.medical, vm.finance)
      .then(function (confirmation) {
        Receipts.patient(confirmation.uuid, true);

        // reset form state
        RegistrationForm.$setPristine();
        RegistrationForm.$setUntouched();
        settupRegistration();

        ScrollTo('anchor');
      })
      .catch(Notify.handleError);
  }

  function settupRegistration() {
    vm.finance = {};
    vm.medical = {};

    vm.fullDateEnabled = false;
    vm.yob = null;

    vm.medical.origin_location_id = Session.enterprise.location_id;
    vm.medical.current_location_id = Session.enterprise.location_id;
  }

  /*
   * Date and location utility methods
   */
  function enableFullDate() {
    vm.fullDateEnabled = true;
  }

  function calculateYOB(value) {
    vm.medical.dob = value && value.length === 4 ? new Date(value + '-' + util.defaultBirthMonth) : undefined;
  }
}
