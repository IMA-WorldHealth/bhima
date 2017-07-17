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
  'PatientService', 'moment', 'NotifyService', 'SessionService', '$q'
];

/**
 * This component is responsible for displaying the Latest Invoice
 */
function LatestInvoice(Patient, moment, Notify, Session, $q) {
  var vm = this;

  this.$onInit = function $onInit() {
    vm.enterprise = Session.enterprise;
    startup();
  };


  /** getting patient document */
  function startup() {
    if (!vm.debtorUuid) { return; }
    vm.loading = true;

    var requests = $q.all([
      Patient.latest(vm.debtorUuid),
      Patient.balance(vm.debtorUuid)
    ]);

    requests.then(function (results) {
      vm.patientInvoice = results[0];  // returned from the latest() call
      vm.patientInvoice.durationDays = moment().diff(vm.patientInvoice.date, 'days');

      vm.patientBalance = results[1]; // returned from balance() call
    })
     .catch(Notify.handleError)
     .finally(function () {
       vm.loading = false;
      });
 
  }
}
