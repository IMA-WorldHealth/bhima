angular.module('bhima.components')
  .component('bhPatientGroupSelect', {
    templateUrl : 'modules/templates/bhPatientGroupSelect.tmpl.html',
    controller  : PatientGroupSelectController,
    transclude  : true,
    bindings    : {
      patientGroupUuid : '<',
      onSelectCallback : '&',
      label            : '@?',
      required         : '<?',
      validateTrigger  : '<?',      
    },
  });

PatientGroupSelectController.$inject = [
  'PatientGroupService'
];

/**
 * Patient Group selection component
 *
 */
function PatientGroupSelectController(PatientGroups) {
  var $ctrl = this;

  $ctrl.$onInit = function onInit() {    
    // fired when a patient group has been selected
    $ctrl.onSelectCallback = $ctrl.onSelectCallback || angular.noop;

    // default for label
    $ctrl.label = $ctrl.label || 'PATIENT_GROUP.PATIENT_GROUP';

    // load all patient groups
    PatientGroups.read()
      .then(function (pgs) {        
        $ctrl.patientGroups = pgs;
      });
  };

  $ctrl.onSelect = function ($item, $model) {
    $ctrl.onSelectCallback({ patientGroup : $item });
  };
}