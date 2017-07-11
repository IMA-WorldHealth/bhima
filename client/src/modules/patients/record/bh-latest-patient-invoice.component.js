angular.module('bhima.components')
.component('bhLatestPatientInvoice', {
  controller   : LatestInvoice,
  controllerAs : '$ctrl',
  templateUrl  : 'modules/patients/record/bh-latest-patient-invoice.html',
  bindings     : {
    debtorUuid : '<',  // Required patient uuid
  },
});

LatestInvoice.$inject = [
  'PatientService', 'moment', 'NotifyService', 'SessionService',
];

/**
 * This component is responsible for displaying the Latest Invoice
 */
function LatestInvoice(Patient, moment, Notify, Session) {
  var vm = this;

  this.$onInit = function $onInit() {
    vm.enterprise = Session.enterprise;
    startup();
  };


  /** getting patient document */
  function startup() {
    if (!vm.debtorUuid) { return; }
    vm.loading = true;

    Patient.balance(vm.debtorUuid)
      .then(function (balance) {
        vm.balance = balance;
        return Patient.latest(vm.debtorUuid);
      })
      .then(function (patientInvoice) {
        vm.patientBalance = vm.balance;
        vm.patientInvoice = patientInvoice;
        vm.patientInvoice.durationDays = moment().diff(vm.patientInvoice.date, 'days');
      })      
      .catch(Notify.handleError)
      .finally(function () {
        vm.loading = false;
      });      
  }
}
