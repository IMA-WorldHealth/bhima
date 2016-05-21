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
  
  vm.search = search;
  vm.momentAge = momentAge;
 
  // track if module is making a HTTP request for patients
  vm.loading = false;
  
  /** TODO MANAGE COLUMN : LAST_TRANSACTION */
  // the column attribute `displayName` must be used in favour of `name` in order to allow `headerCellFilter` to function
  vm.uiGridOptions = {
    appScopeProvider : vm,
    enableColumnMenus : false,
    headerCellFilter: 'translate',
    columnDefs : [
      { field : 'reference', displayName : 'TABLE.COLUMNS.REFERENCE', headerCellFilter: 'translate' },
      { field : 'patientName', displayName : 'TABLE.COLUMNS.NAME', headerCellFilter : 'translate' },
      { field : 'patientAge', displayName : 'TABLE.COLUMNS.AGE', headerCellFilter : 'translate'  },
      { field : 'sex', displayName : 'TABLE.COLUMNS.GENDER', headerCellFilter : 'translate'  },
      { field : 'hospital_no', displayName : 'TABLE.COLUMNS.HOSPITAL_FILE_NR', headerCellFilter : 'translate'  },
      { field : 'registration_date', cellFilter:'date', displayName : 'TABLE.COLUMNS.DATE_REGISTERED', headerCellFilter : 'translate'  },
      { field : 'last_visit', cellFilter:'date', displayName : 'TABLE.COLUMNS.LAST_VISIT', headerCellFilter : 'translate'  },
      { field : 'dob', cellFilter:'date', displayName : 'TABLE.COLUMNS.DOB', headerCellFilter : 'translate'  },
      { name : 'Actions', displayName : '', cellTemplate : '<div style="padding : 5px"><a ui-sref="patientRecord({patientID : row.entity.uuid})"><span class="glyphicon glyphicon-list-alt"></span> Record</a> <a ui-sref="patientEdit({uuid : row.entity.uuid})"><span class="glyphicon glyphicon-edit"></span> Edit</a></div>'}
    ],
    enableSorting : true
  };
  
  // load Patient Registry Grid
  function loadGrid() {
    vm.loading = true;
    Patients.read().then(function (patients) {
      vm.loading = false;
      patients.forEach(function (patient) {
        patient.patientAge = momentAge(patient.dob); 
      });      
      vm.uiGridOptions.data = patients;
    });
  }

  // Search and filter data in Patiens Registry
  function search() {
    vm.loading = true; 
    Patients.openSearchModal()
    .then(function (data) {
      var response = data.response;
      vm.loading = false;
      vm.filters = data.filters;
      response.forEach(function (patient) {
        patient.patientAge = momentAge(patient.dob); 
      });      
      vm.uiGridOptions.data = response;
    })
    .catch(function () { 
        vm.loading = false;
    });
  }

  function momentAge(patientAge){
    // moment() provides the current date, similar to the new Date() API. This requests the difference between two dates
    return moment().diff(patientAge, 'years');
  }

  // fire up the module
  loadGrid();
}
