angular.module('bhima.components')
.component('bhLatestInvoice', {
  controller   : LatestInvoice,
  controllerAs : '$ctrl',
  templateUrl  : 'partials/templates/bhLatestInvoice.tmpl.html',
  bindings: {
    debtorUuid          : '<'  // Required patient uuid
  }
});

LatestInvoice.$inject = [
  'PatientService', 'moment'
];

/**
 * Find Document Component
 * This component is responsible for displaying the Latest Invoice 
 */
function LatestInvoice(Patient, moment) {
  var vm = this;

  /** global variables */
  vm.debtorUuid =  this.debtorUuid;

  // startup the component
  startup();

  /** getting patient document */
  function startup() {
    if (!vm.debtorUuid || !vm.patientInvoice) { return; }
    Patient.latest(vm.debtorUuid)
    .then(function (patient) {
      vm.patientInvoice = patient;          
      vm.patientInvoice.durationDays = moment().diff(vm.patientInvoice.date, 'days');
    });
  }

}
