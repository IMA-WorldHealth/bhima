angular.module('bhima.components')
.component('bhLatestInvoice', {
  controller   : LatestInvoice,
  controllerAs : '$ctrl',
  templateUrl  : 'partials/templates/bhLatestInvoice.tmpl.html',
  bindings: {
    enablePatientDetails : '<',  // bind boolean (true|false) : Enable patient details option
    enableOptionBar      : '<',  // bind boolean (true|false) : Enable option for add, display list or display thumbnail in a bar
    enableSearch         : '<',  // bind boolean (true|false) : Enable search bar option
    display              : '@',  // bind (list|thumbnail)  : Display either in list or thumbnail mode
    height               : '@',  // bind the height of list of contents
    debtorUuid          : '<'  // Required patient uuid
  }
});

LatestInvoice.$inject = [
  'PatientService', 'NotifyService'
];

/**
 * Find Document Component
 * This component is responsible for displaying the Latest Invoice 
 */
function LatestInvoice(Patient, Notify) {
  var vm = this;

  /** global variables */
  vm.session = {
    debtorUuid     : this.debtorUuid,
    enableOptionBar : Boolean(this.enableOptionBar),
    enableSearch    : Boolean(this.enableSearch),
    display         : this.display,
    height          : this.height,
    showAction      : false
  };

  // startup the component
  startup();

  /** getting patient document */
  function startup() {
    if (!vm.session.debtorUuid) { return; }

    Patient.latest(vm.session.debtorUuid)
    .then(function (patient) {
      vm.session.patientInvoice = patient;          
      vm.session.patientInvoice.durationDays = moment().diff(vm.session.patientInvoice.date, 'days');
    })
    .catch(Notify.handleError);
  }

}
