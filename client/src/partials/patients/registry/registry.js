angular.module('bhima.controllers')
.controller('PatientRegistryController', PatientRegistryController);

PatientRegistryController.$inject = [
  '$translate', 'PatientService', '$uibModal'
];

/**
 * Patient Registry Controller
 *
 * This module is responsible for the management
 * of Patient Registry.
 *
 */
function PatientRegistryController($translate, Patients, $uibModal) {
  var vm = this;
  // options for the UI grid
  
  vm.search = search;
  vm.momentAge = momentAge;
    
  /** TODO MANAGE COLUMN : LAST_TRANSACTION */
  vm.uiGridOptions = {
    appScopeProvider : vm, // ensure that the controller's `this` variable is bound to appScope
    enableColumnMenus : false,
    columnDefs : [
      { field : 'reference', name : $translate.instant('TABLE.COLUMNS.REFERENCE') },
      { field : 'patientName', name : $translate.instant('TABLE.COLUMNS.NAME') },
      { field : 'patientAge', name : $translate.instant('TABLE.COLUMNS.AGE') },
      { field : 'sex', name : $translate.instant('TABLE.COLUMNS.GENDER') },
      { field : 'hospital_no', name : $translate.instant('TABLE.COLUMNS.HOSPITAL_FILE_NR') },
      { field : 'registration_date', cellFilter:'date', name : $translate.instant('TABLE.COLUMNS.DATE_REGISTERED') },
      { field : 'last_visit', cellFilter:'date', name : $translate.instant('TABLE.COLUMNS.LAST_VISIT') },
      { field : 'dob', cellFilter:'date', name : $translate.instant('TABLE.COLUMNS.DOB') }  
    ],
    enableSorting : true
  };

  // load Patient Registry Grid
  function loadGrid() {
    Patients.read().then(function (patients) {
      patients.forEach(function (patient) {
        patient.patientAge = momentAge(patient.dob); 
      });      
      vm.uiGridOptions.data = patients;
    });
  }

  // called on modules start
  function startup() {
    loadGrid();
  }

  // Search and filter data in Patiens Registry
  function search() {
    $uibModal.open({
      templateUrl : 'partials/patients/registry/modal.html',
      size : 'md',
      animation : true,
      controller : 'PatientRegistryModalController as ModalCtrl'
    }).result
    .then(function (data) {
      var response = data.response;
      vm.filters = data.filters

      response.forEach(function (patient) {
        patient.patientAge = momentAge(patient.dob); 
      });      
      vm.uiGridOptions.data = response;
    });       
  }

  function momentAge(patientAge){
    return moment(patientAge).fromNow();
  }

  // fire up the module
  startup();
}
