angular.module('bhima.controllers')
  .controller('PatientRegistryController', PatientRegistryController);

PatientRegistryController.$inject = [
  '$state', 'PatientService', 'NotifyService', 'AppCache',
  'util', 'ReceiptModal', 'uiGridConstants', '$translate',
  'GridColumnService', 'GridSortingService', 'bhConstants',
  'FilterService',
];

/**
 * Patient Registry Controller
 *
 * This module is responsible for the management of Patient Registry.
 */
function PatientRegistryController($state, Patients, Notify, AppCache,
  util, Receipts, uiGridConstants, $translate,
  Columns, Sorting, bhConstants, Filters) {
  var vm = this;

  var filter = new Filters();
  vm.filter = filter;

  var cacheKey = 'PatientRegistry';
  var cache = AppCache(cacheKey);
  var FILTER_BAR_HEIGHT = bhConstants.grid.FILTER_BAR_HEIGHT;

  vm.search = search;
  vm.onRemoveFilter = onRemoveFilter;
  vm.clearFilters = clearFilters;
  vm.patientCard = patientCard;
  vm.filterBarHeight = {};
  vm.openColumnConfiguration = openColumnConfiguration;

  // track if module is making a HTTP request for patients
  vm.loading = false;

  var columnDefs = [
    { field                : 'reference',
      displayName          : 'TABLE.COLUMNS.REFERENCE',
      aggregationType      : uiGridConstants.aggregationTypes.count,
      aggregationHideLabel : true, headerCellFilter     : 'translate',
      cellTemplate         : '/modules/templates/grid/patient.card.cell.html',
      footerCellClass      : 'text-center',
      sortingAlgorithm     : Sorting.algorithms.sortByReference,
    },
    { field            : 'display_name',
      displayName      : 'TABLE.COLUMNS.NAME',
      headerCellFilter : 'translate',
      cellTemplate     : '/modules/templates/grid/patient.cell.html',
    },
    { field            : 'patientAge',
      displayName      : 'TABLE.COLUMNS.AGE',
      headerCellFilter : 'translate',
      type             : 'number',
    },
    { field            : 'sex', 
      displayName      : 'TABLE.COLUMNS.GENDER',
      headerCellFilter : 'translate',
    },
    { field            : 'hospital_no',
      displayName      : 'TABLE.COLUMNS.HOSPITAL_FILE_NR',
      headerCellFilter : 'translate',
    },
    { field            : 'registration_date',
      cellFilter       : 'date',
      displayName      : 'TABLE.COLUMNS.DATE_REGISTERED',
      headerCellFilter : 'translate',
    },
    { field            : 'last_visit',
      cellFilter       : 'date',
      displayName      : 'TABLE.COLUMNS.LAST_VISIT',
      headerCellFilter : 'translate',
      type             : 'date',
    },
    { field            : 'dob',
      cellFilter       : 'date',
      displayName      : 'TABLE.COLUMNS.DOB',
      headerCellFilter : 'translate',
      type             : 'date',
    },
    { field            : 'userName',
      displayName      : 'TABLE.COLUMNS.USER',
      headerCellFilter : 'translate',
    },
    { field            : 'originVillageName',
      displayName      : 'FORM.LABELS.ORIGIN_VILLAGE',
      headerCellFilter : 'translate',
      visible          : false,
    },
    { field            : 'originSectorName',
      displayName      : 'FORM.LABELS.ORIGIN_SECTOR',
      headerCellFilter : 'translate',
      visible          : false },
    { name          : 'actions',
      displayName   : '',
      cellTemplate  : '/modules/patients/templates/action.cell.html',
      enableSorting : false },
  ];

  /** TODO manage column : last_transaction */
  vm.uiGridOptions = {
    appScopeProvider  : vm,
    showColumnFooter  : true,
    enableSorting     : true,
    enableColumnMenus : false,
    flatEntityAccess  : true,
    fastWatch         : true,
    columnDefs        : columnDefs,
  };

  var columnConfig = new Columns(vm.uiGridOptions, cacheKey);

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

        if (parameters.defaultPeriod) {
          delete parameters.defaultPeriod;
        }

        cacheFilters(parameters);
        return load(vm.filters);
      });
  }

  function openColumnConfiguration() {
    columnConfig.openConfigurationModal();
  }

  // save the parameters to use later.  Formats the parameters in filtersFmt for the filter toolbar.
  function cacheFilters(filters) {
    filters = filter.applyDefaults(filters);
    vm.filters = cache.filters = filters;
    vm.filtersFmt = Patients.formatFilterParameters(filters);

    // check if there are filters applied and show the filter bar
    vm.filterBarHeight = (vm.filtersFmt.length > 0) ?  FILTER_BAR_HEIGHT : {};
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
    load(vm.filters);
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

    if (!cache.filters) { cache.filters = {}; }
    var filters = filter.applyDefaults(cache.filters);
    
    vm.filters = filters;
    vm.filtersFmt = Patients.formatFilterParameters(vm.filters || {});
    load(vm.filters);

    // check if there are filters applied
    vm.filterBarHeight = (vm.filtersFmt.length > 0) ? FILTER_BAR_HEIGHT : {};
  }

  // fire up the module
  startup();
}
