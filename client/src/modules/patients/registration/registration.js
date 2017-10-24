angular.module('bhima.controllers')
  .controller('PatientRegistrationController', PatientRegistrationController);

PatientRegistrationController.$inject = [
  'PatientService', 'SessionService', 'util',
  'NotifyService', 'ReceiptModal', 'ScrollService', 'bhConstants'
];

/**
 * Patient Registration Controller
 *
 * @description
 * This controller is responsible for collecting data and providing utility
 * methods for the patient registration client side module. It provides basic
 * methods for handling dates of birth as well as wrappers to communicate with
 * the server.
 *
 * @module controllers/PatientRegistrationController
 */
function PatientRegistrationController(Patients, Session, util, Notify, Receipts, ScrollTo, bhConstants) {
  var vm = this;

  vm.submit = submit;
  vm.toggleFullDate = toggleFullDate;
  vm.calculateYOB = calculateYOB;
  vm.dateIndicatorLabel = 'FORM.LABELS.ENTER_BIRTH_DAY';
  vm.dateComponentLabel = 'FORM.LABELS.DOB';


  vm.maxLength = bhConstants.lengths.maxTextLength;

  // Set up page elements data (debtor select data)
  vm.onSelectDebtor = onSelectDebtor;

  function onSelectDebtor(debtorGroup) {
    vm.finance.debtor_group_uuid = debtorGroup.uuid;
  }

  // define limits for DOB
  vm.datepickerOptions = {
    maxDate : new Date(),
    minDate : bhConstants.dates.minDOB
  };

  var yearOptions = bhConstants.yearOptions;
  var dayOptions = bhConstants.dayOptions;

  setupRegistration();

  function submit(RegistrationForm) {

    // end propagation for invalid state - this could scroll to an $invalid element on the form
    if (RegistrationForm.$invalid) {
      return Notify.danger('FORM.ERRORS.INVALID');
    }

    return Patients.create(vm.medical, vm.finance)
      .then(function (confirmation) {
        Receipts.patient(confirmation.uuid, true);

        // reset form state
        RegistrationForm.$setPristine();
        RegistrationForm.$setUntouched();
        setupRegistration();

        ScrollTo('anchor');
      })
      .catch(Notify.handleError);
  }

  function setDateComponent() {
    var currentOptions = vm.fullDateEnabled ? dayOptions : yearOptions;

    // set the database flag to track if a date is set to JAN 01 or if the date is unknown
    vm.medical.dob_unknown_date = !vm.fullDateEnabled;
    angular.merge(vm.datepickerOptions, currentOptions);
  }

  function setupRegistration() {
    vm.finance = {};
    vm.medical = {};

    vm.fullDateEnabled = true;
    setDateComponent();
    vm.yob = null;

    vm.medical.origin_location_id = Session.enterprise.location_id;
    vm.medical.current_location_id = Session.enterprise.location_id;
  }

  /*
   * Date and location utility methods
   */
  function toggleFullDate() {
    vm.fullDateEnabled = !vm.fullDateEnabled;
    vm.dateIndicatorLabel = vm.fullDateEnabled ? 'FORM.LABELS.ENTER_BIRTH_YEAR' : 'FORM.LABELS.ENTER_BIRTH_DAY';
    vm.dateComponentLabel = vm.fullDateEnabled ? 'FORM.LABELS.DOB' : 'FORM.LABELS.YOB';
    setDateComponent();
  }

  function calculateYOB(value) {
    vm.medical.dob = (value && value.length === 4) ?
      new Date(value + '-' + util.defaultBirthMonth) :
      undefined;
  }
}
