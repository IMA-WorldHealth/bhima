/**
 * Patient Registry Controller
 *
 * This module is responsible for the management of Patient Registry.
 */
function PatientRegistryController(Patients, Notify, moment, Receipt, util) {
  var vm = this;

  var patientActionsTemplate =
      '<div style="padding : 5px"><a ui-sref="patientRecord.details({patientID : row.entity.uuid})"><span class="glyphicon glyphicon-list-alt"></span> {{ "PATIENT_REGISTRY.RECORD" | translate }}</a> <a ui-sref="patientEdit({uuid : row.entity.uuid})"><span class="glyphicon glyphicon-edit"></span> {{ "TABLE.COLUMNS.EDIT" | translate }}</a></div>';

  vm.search = search;

  vm.momentAge = util.getMomentAge;
  vm.print = print;


  // track if module is making a HTTP request for patients
  vm.loading = false;

  /** TODO manage column : last_transaction */
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
    vm.hasError = false;
    toggleLoadingIndicator();

    Patients.read()
        .then(function (patients) {
          patients.forEach(function (patient) {
            patient.patientAge = util.getMomentAge(patient.dob);
          });
          vm.uiGridOptions.data = patients;
        })
        .catch(handler)
        .finally(function () {
          toggleLoadingIndicator();
        });
  }

  // search and filter data in Patient Registry
  function search() {
    vm.hasError = false;
    toggleLoadingIndicator();

    Patients.openSearchModal()
        .then(function (data) {
          var response = data.response;
          vm.filters = data.filters;
          console.log(data.filters);
          response.forEach(function (patient) {
            patient.patientAge = util.getMomentAge(patient.dob);
          });
          vm.uiGridOptions.data = response;
        })
        .catch(handler)
        .finally(function () {
          toggleLoadingIndicator();
        });
  }

  // open a print modal to print all patient registrations to date
  function print() {

    // @todo(jniles): eventually, we would like to populate this with the
    // filters before sending the report request.  However, the client-side
    // modeling of filters is not up to par yet.
    var options = {};

    // @todo(jniles): Make reports and receipts use the same rendering modal
    Receipt.patientRegistrations(options);
  }

  // toggles the loading indicator on or off
  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  // fire up the module
  loadGrid();
}

angular.module('bhima.controllers')
.controller('PatientRegistryController', PatientRegistryController);

PatientRegistryController.$inject = [
  'PatientService', 'NotifyService', 'moment', 'ReceiptModal', 'util'
];
