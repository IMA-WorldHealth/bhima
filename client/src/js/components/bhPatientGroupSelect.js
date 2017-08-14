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
  'PatientGroupService', 'NotifyService'
];

/**
 * Patient Group selection component
 *
 */
function PatientGroupSelectController(PatientGroups, Notify) {
  var $ctrl = this;

  $ctrl.$onInit = function onInit() {  
    // default for label
    $ctrl.label = $ctrl.label || 'PATIENT_GROUP.PATIENT_GROUP';

    // load all patient groups
    PatientGroups.read()
      .then(function (pgs) {        
        $ctrl.patientGroups = pgs;
      })
      .catch(Notify.handleError);
  };

  $ctrl.onSelect = function ($item, $model) {
    $ctrl.onSelectCallback({ patientGroup : $item });
  };
}