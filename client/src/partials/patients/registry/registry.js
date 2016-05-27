angular.module('bhima.controllers')
.controller('PatientRegistryController', PatientRegistryController);

PatientRegistryController.$inject = [
  'PatientService', '$uibModal', 'NotifyService', 'moment'
];

/**
 * Patient Registry Controller
 *
 * This module is responsible for the management
 * of Patient Registry.
 *
 */
function PatientRegistryController(Patients, $uibModal, Notify, moment) {
  var vm = this;

  var patientActionsTemplate =
    '<div style="padding : 5px"><a ui-sref="patientRecord({patientID : row.entity.uuid})"><span class="glyphicon glyphicon-list-alt"></span> {{ "PATIENT_REGISTRY.RECORD" | translate }}</a> <a ui-sref="patientEdit({uuid : row.entity.uuid})"><span class="glyphicon glyphicon-edit"></span> {{ "TABLE.COLUMNS.EDIT" | translate }}</a></div>';

  vm.search = search;
  vm.momentAge = momentAge;

  // track if module is making a HTTP request for patients
  vm.loading = false;

  /** TODO manage column : last_transaction */
  // the column attribute `displayName` must be used in favour of `name` in order to allow `headerCellFilter` to function
  vm.uiGridOptions = {
    appScopeProvider : vm,
    enableColumnMenus : false,
    columnDefs : [
      { field : 'reference', displayName : 'TABLE.COLUMNS.REFERENCE', headerCellFilter: 'translate' },
      { field : 'patientName', displayName : 'TABLE.COLUMNS.NAME', headerCellFilter : 'translate' },
      { field : 'patientAge', displayName : 'TABLE.COLUMNS.AGE', headerCellFilter : 'translate' },
      { field : 'sex', displayName : 'TABLE.COLUMNS.GENDER', headerCellFilter : 'translate'  },
      { field : 'hospital_no', displayName : 'TABLE.COLUMNS.HOSPITAL_FILE_NR', headerCellFilter : 'translate'  },
      { field : 'registration_date', cellFilter:'date', displayName : 'TABLE.COLUMNS.DATE_REGISTERED', headerCellFilter : 'translate' },
      { field : 'last_visit', cellFilter:'date', displayName : 'TABLE.COLUMNS.LAST_VISIT', headerCellFilter : 'translate' },
      { field : 'dob', cellFilter:'date', displayName : 'TABLE.COLUMNS.DOB', headerCellFilter : 'translate' },
      { name : 'Actions', displayName : '', cellTemplate : patientActionsTemplate }
    ],
    enableSorting : true
  };

  function handler(error) {
    vm.hasError = true;
    Notify.handleError(error);
  }

  // load Patient Registry Grid
  function loadGrid() {
    vm.loading = true;
    vm.hasError = false;

    Patients.read()
      .then(function (patients) {
        patients.forEach(function (patient) {
          patient.patientAge = momentAge(patient.dob);
        });
        vm.uiGridOptions.data = patients;
      })
      .catch(handler)
      .finally(function () {
        vm.loading = false;
      });
  }

  // Search and filter data in Patiens Registry
  function search() {
    vm.loading = true;
    vm.hasError = false;
    Patients.openSearchModal()
      .then(function (data) {
        var response = data.response;
        vm.filters = data.filters;
        response.forEach(function (patient) {
          patient.patientAge = momentAge(patient.dob);
        });
        vm.uiGridOptions.data = response;
      })
      .catch(handler)
      .finally(function () {
        vm.loading = false;
      });
  }

  // moment() provides the current date, similar to the new Date() API. This requests the difference between two dates
  function momentAge(dateOfBirth){
    return moment().diff(dateOfBirth, 'years');
  }

  // fire up the module
  loadGrid();
}
