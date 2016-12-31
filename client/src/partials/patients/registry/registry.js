angular.module('bhima.controllers')
  .controller('PatientRegistryController', PatientRegistryController);

PatientRegistryController.$inject = [
  '$state', 'PatientService', 'NotifyService', 'AppCache', 'util', 'ReceiptModal', 'uiGridConstants', '$translate'
];

/**
 * Patient Registry Controller
 *
 * This module is responsible for the management of Patient Registry.
 */
function PatientRegistryController($state, Patients, Notify, AppCache, util, Receipts, uiGridConstants, $translate) {
  var vm = this;

  var cache = AppCache('PatientRegistry');

  var patientDetailActionTemplate =
      '<div class="ui-grid-cell-contents"> ' +
        '<a ui-sref="patientRecord.details({patientID : row.entity.uuid})"> ' +
          '<span class="fa fa-book"></span> {{ ::"PATIENT_REGISTRY.RECORD" | translate }} ' +
        '</a>' +
      '</div>';

  var patientEditActionTemplate =
      '<div class="ui-grid-cell-contents"> ' +
        '<a ui-sref="patientEdit({uuid : row.entity.uuid})"> ' +
          '<span class="fa fa-edit"></span> {{ ::"TABLE.COLUMNS.EDIT" | translate }} ' +
        '</a> ' +
      '</div>';

  var patientCardActionTemplate =
      '<div class="ui-grid-cell-contents"> ' +
        '<a href ng-click="grid.appScope.patientCard(row.entity.uuid)"> ' +
          '<span class="fa fa-user"></span> {{ ::"PATIENT_REGISTRY.CARD" | translate }} ' +
        '</a>' +
      '</div>';

  vm.search = search;
  vm.onRemoveFilter = onRemoveFilter;
  vm.clearFilters = clearFilters;
  vm.patientCard = patientCard;

  // track if module is making a HTTP request for patients
  vm.loading = false;

  var columnDefs = [
    { field : 'reference',
      displayName : 'TABLE.COLUMNS.REFERENCE',
      aggregationType: uiGridConstants.aggregationTypes.count,
      aggregationHideLabel : true, headerCellFilter: 'translate'
    },
    { field : 'display_name', displayName : 'TABLE.COLUMNS.NAME', headerCellFilter: 'translate' },
    { field : 'patientAge', displayName : 'TABLE.COLUMNS.AGE', headerCellFilter: 'translate' },
    { field : 'sex', displayName : 'TABLE.COLUMNS.GENDER', headerCellFilter: 'translate' },
    { field : 'hospital_no', displayName : 'TABLE.COLUMNS.HOSPITAL_FILE_NR', headerCellFilter: 'translate' },
    { field : 'registration_date', cellFilter:'date', displayName : 'TABLE.COLUMNS.DATE_REGISTERED', headerCellFilter: 'translate' },
    { field : 'last_visit', cellFilter:'date', displayName : 'TABLE.COLUMNS.LAST_VISIT', headerCellFilter: 'translate' },
    { field : 'dob', cellFilter:'date', displayName : 'TABLE.COLUMNS.DOB', headerCellFilter: 'translate' },
    { field : 'userName', displayName : 'TABLE.COLUMNS.USER', headerCellFilter: 'translate' },
    { name : 'actionsCard', displayName : '', cellTemplate : patientCardActionTemplate, enableSorting: false },
    { name : 'actionsDetail', displayName : '', cellTemplate : patientDetailActionTemplate, enableSorting: false },
    { name : 'actionsEdit', displayName : '', cellTemplate : patientEditActionTemplate, enableSorting: false }
  ];

  /** TODO manage column : last_transaction */
  vm.uiGridOptions = {
    appScopeProvider : vm,
    showColumnFooter : true,
    enableSorting : true,
    enableColumnMenus : false,
    flatEntityAccess : true,
    fastWatch: true,
    columnDefs : columnDefs
  };

  // error handler
  function handler(error) {
    vm.hasError = true;
    Notify.handleError(error);
  }

  function isEmpty(object) {
    return Object.keys(object).length === 0;
  }

  // this function loads patients from the database with search parameters
  // if passed in.
  function load(parameters) {

    // flush error and loading states
    vm.hasError = false;
    toggleLoadingIndicator();

    // if we have search parameters, use search.  Otherwise, just read all
    // patients.
    var request = angular.isDefined(parameters) && !isEmpty(parameters) ?
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

  // patient card
  function patientCard(uuid) {
    Receipts.patient(uuid);
  }

  // startup function. Checks for cached filters and loads them.  This behavior could be changed.
  function startup() {

    // if filters are directly passed in through params, override cached filters
    if ($state.params.filters) {
      cacheFilters($state.params.filters);
    }

    vm.filters = cache.filters;
    vm.filtersFmt = Patients.formatFilterParameters(cache.filters || {});
    load(vm.filters);
  }

  // fire up the module
  startup();
}
