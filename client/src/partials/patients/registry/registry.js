angular.module('bhima.controllers')
.controller('PatientRegistryController', PatientRegistryController);

PatientRegistryController.$inject = [
  '$translate', 'PatientService',
];

/** 
 * Patient Registry Controller 
 * 
 * This module is responsible for the management
 * of Patient Registry.
 *
 */
function PatientRegistryController($translate, Patients) {
  var vm = this;
  // options for the UI grid
  
  /** TODO MANAGE COLUMN : LAST_TRANSACTION */
  vm.uiGridOptions = {
    appScopeProvider : vm, // ensure that the controller's `this` variable is bound to appScope
    enableColumnMenus : false,
    columnDefs : [
      { field : 'patientRef', name : $translate.instant('TABLE.COLUMNS.PATIENT_ID') },
      { field : 'patientName', name : $translate.instant('TABLE.COLUMNS.NAME') },
      { field : 'patientAge', name : $translate.instant('TABLE.COLUMNS.AGE') },
      { field : 'sex', name : $translate.instant('TABLE.COLUMNS.GENDER') },
      { field : 'registration_date', cellFilter:'date', name : $translate.instant('TABLE.COLUMNS.DATE_REGISTERED') },
      { field : 'last_visit', cellFilter:'date', name : $translate.instant('TABLE.COLUMNS.LAST_VISIT') },
      { field : '', name : $translate.instant('TABLE.COLUMNS.LAST_TRANSACTION') }  
    ],
    enableSorting : true
  };

  // load Patient Registry Grid
  function loadGrid() {
    Patients.list().then(function (patients) {

      patients.forEach(function (patient) {
        var patientAge = moment(patient.dob).fromNow();
        patient.patientAge = patientAge; 
      });      
      vm.uiGridOptions.data = patients;
    });
  }

  // called on modules start
  function startup() {
    loadGrid();
  }

  // fire up the module
  startup();
}