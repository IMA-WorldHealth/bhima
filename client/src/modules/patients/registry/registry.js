angular.module('bhima.controllers')
  .controller('PatientRegistryController', PatientRegistryController);

PatientRegistryController.$inject = [
  '$state', 'PatientService', 'NotifyService', 'AppCache',
  'util', 'ReceiptModal', 'uiGridConstants', '$translate',
  'GridColumnService', 'GridSortingService', 'bhConstants',
  'GridStateService', 'LanguageService', 'ExportService'];

/**
 * Patient Registry Controller
 *
 * This module is responsible for the management of Patient Registry.
 */
function PatientRegistryController($state, Patients, Notify, AppCache,
  util, Receipts, uiGridConstants, $translate,
  Columns, Sorting, bhConstants, GridState, Languages, Export) {
  var vm = this;

  var cacheKey = 'PatientRegistry';
  var cache = AppCache(cacheKey);
  var state;

  vm.search = search;
  vm.patientCard = patientCard;
  vm.openColumnConfiguration = openColumnConfiguration;
  vm.gridApi = {};
  vm.onRemoveFilter = onRemoveFilter;
  vm.download = Patients.download;

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
  state = new GridState(vm.uiGridOptions, cacheKey);

  vm.saveGridState = state.saveGridState;
  vm.clearGridState = function clearGridState() {
    state.clearGridState();
    $state.reload();
  }

  // error handler
  function handler(error) {
    vm.hasError = true;
    Notify.handleError(error);
  }

  function isEmpty(object) {
    return Object.keys(object).length === 0;
  }

  // this function loads patients from the database with search filters, if passed in.
  function load(filters) {

    // flush error and loading states
    vm.hasError = false;
    toggleLoadingIndicator();

    var request = Patients.read(null, filters);

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

  function search() {
    var filtersSnapshot = Patients.filters.formatHTTP();

    Patients.openSearchModal(filtersSnapshot)
      .then(function (changes) {
        Patients.filters.replaceFilters(changes);

        Patients.cacheFilters();
        vm.latestViewFilters = Patients.filters.formatView();
        return load(Patients.filters.formatHTTP(true));
      });
  }

  // remove a filter with from the filter object, save the filters and reload
  function onRemoveFilter(key) {
    Patients.removeFilter(key);
    Patients.cacheFilters();
    vm.latestViewFilters = Patients.filters.formatView();
    return load(Patients.filters.formatHTTP(true));
  }

  function openColumnConfiguration() {
    columnConfig.openConfigurationModal();
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

    if($state.params.filters) {
      var changes = [{ key : $state.params.filters.key, value : $state.params.filters.value }]
      Patients.filters.replaceFilters(changes);		
      Patients.cacheFilters();
    }

    load(Patients.filters.formatHTTP(true));
    vm.latestViewFilters = Patients.filters.formatView();
  }

  // fire up the module
  startup();
}
