angular.module('bhima.components')
.component('bhLatestPatientInvoice', {
  controller   : LatestInvoice,
  controllerAs : '$ctrl',
  templateUrl  : 'modules/patients/record/bh-latest-patient-invoice.html',
  bindings     : {
    patientUuid : '<',  // Required patient uuid
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
    if (!vm.patientUuid) { return; }
    vm.loading = true;

    var requests = $q.all([
      Patient.latest(vm.patientUuid),
      Patient.balance(vm.patientUuid)
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
