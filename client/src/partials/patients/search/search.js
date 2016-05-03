angular.module('bhima.controllers')
.controller('PatientSearchController', PatientSearchController);

PatientSearchController.$inject = [
  '$translate', 'PatientService', 'DateService'
];

/** 
 * Users and Permission Controller 
 * 
 * This module is responsible for handling the creation
 * of users and assigning permissions to existing modules.
 *
 * @todo Password insecure alert or not
 */
function PatientSearchController($translate, Patients, dateService) {
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

  /** @todo manage state without strings */
  vm.state = 'default'; // this is default || create || update


  // TODO
  function handler(error) {
    throw error;
  }

  // load user grid
  function loadGrid() {
    Patients.detail().then(function (patients) {

      patients.forEach(function (patient) {
        var patientAge = dateService.getAge(patient.dob,'simple');
        patient.patientAge = patientAge.duration + ' ' + $translate.instant(patientAge.period); 
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