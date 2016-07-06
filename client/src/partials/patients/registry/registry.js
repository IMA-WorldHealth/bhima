angular.module('bhima.controllers')
.controller('PatientRegistryController', PatientRegistryController);

PatientRegistryController.$inject = [
  'PatientService', 'NotifyService', 'moment', 'AppCache', 'util'
];

/**
 * Patient Registry Controller
 *
 * This module is responsible for the management of Patient Registry.
 */
function PatientRegistryController(Patients, Notify, moment, AppCache, util) {
  var vm = this;

  var cache = AppCache('PatientRegistry');

  var patientDetailActionTemplate =
      '<div class="ui-grid-cell-contents"> ' +
        '<a ui-sref="patientRecord.details({patientID : row.entity.uuid})"> ' +
          '<span class="fa fa-book"></span> {{ "PATIENT_REGISTRY.RECORD" | translate }} ' +
        '</a>' +
      '</div>';

  var patientEditActionTemplate =
      '<div class="ui-grid-cell-contents"> ' +
        '<a ui-sref="patientEdit({uuid : row.entity.uuid})"> ' +
          '<span class="fa fa-edit"></span> {{ "TABLE.COLUMNS.EDIT" | translate }} ' +
        '</a> ' +
      '</div>';

  vm.search = search;

  vm.onRemoveFilter = onRemoveFilter;
  vm.clearFilters = clearFilters;


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
      { name : 'actionsDetail', displayName : '', cellTemplate : patientDetailActionTemplate },
      { name : 'actionsEdit', displayName : '', cellTemplate : patientEditActionTemplate }
    ],
    enableSorting : true
  };

  // error handler
  function handler(error) {
    vm.hasError = true;
    Notify.handleError(error);
  }

  // this uses function loads patients from the database with search parameters
  // if passed in.
  function load(parameters) {

    // flush error and loading states
    vm.hasError = false;
    toggleLoadingIndicator();

    // if we have search parameters, use search.  Otherwise, just read all
    // patients.
    var request = angular.isDefined(parameters) ?
      Patients.search(parameters) :
      Patients.read();

    // hook the returned patients up to the grid.
    request.then(function (patients) {

      patients.forEach(function (patient) {
        patient.patientAge = util.getMomentAge(patient.dob, 'years');
      });

      // put data in the grid
      vm.uiGridOptions.data = patients;
    })
    .catch(handler)
    .finally(function () {
      toggleLoadingIndicator();
    });
  }

  // search and filter data in Patient Registry
  function search() {
    Patients.openSearchModal(vm.filters)
      .then(function (parameters) {

        // no parameters means the modal was dismissed.
        if (!parameters) { return; }

        cacheFilters(parameters);
        return load(vm.filters);
      });
  }

  // save the parameters to use later.  Formats the parameters in filtersFmt for the filter toolbar.
  function cacheFilters(filters) {
    vm.filters = cache.filters = filters;
    vm.filtersFmt = Patients.formatFilterParameters(filters);
  }

  // remove a filter with from the filter object, save the filters and reload
  function onRemoveFilter(key) {
    delete vm.filters[key];
    cacheFilters(vm.filters);
    load(vm.filters);
  }

  // clears the filters by forcing a cache of an empty array
  function clearFilters() {
    cacheFilters({});
    load();
  }

  // toggles the loading indicator on or off
  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }


  // startup function. Checks for cached filters and loads them.  This behavior could be changed.
  function startup() {
    vm.filters = cache.filters;
    vm.filtersFmt = Patients.formatFilterParameters(cache.filters || {});
    load(vm.filters);
  }

  // fire up the module
  startup();
}
