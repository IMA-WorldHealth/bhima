angular.module('bhima.controllers')
  .controller('EmployeeRegistryController', EmployeeRegistryController);

EmployeeRegistryController.$inject = [
  '$state', 'EmployeeService', 'NotifyService', 'AppCache',
  'util', 'ReceiptModal', 'uiGridConstants', '$translate',
  'GridColumnService', 'GridSortingService', 'bhConstants',
  'DepricatedFilterService',
];

/**
 * Employee Registry Controller
 *
 * This module is responsible for the management of Employe Registry.
 */
function EmployeeRegistryController($state, Employees, Notify, AppCache,
  util, Receipts, uiGridConstants, $translate,
  Columns, Sorting, bhConstants, Filters) {
  var vm = this;

  var filter = new Filters();
  vm.filter = filter;

  var cacheKey = 'EmployeeRegistry';
  var cache = AppCache(cacheKey);
  var FILTER_BAR_HEIGHT = bhConstants.grid.FILTER_BAR_HEIGHT;

  vm.search = search;
  vm.onRemoveFilter = onRemoveFilter;
  vm.clearFilters = clearFilters;
  // vm.patientCard = patientCard;
  vm.filterBarHeight = {};
  vm.openColumnConfiguration = openColumnConfiguration;

  // track if module is making a HTTP request for patients
  vm.loading = false;

  var columnDefs = [
    { field                : 'code',
      displayName          : 'TABLE.COLUMNS.CODE',
      aggregationType      : uiGridConstants.aggregationTypes.count,
      aggregationHideLabel : true, headerCellFilter     : 'translate',
      footerCellClass      : 'text-center',
    },
    { field            : 'display_name',
      displayName      : 'TABLE.COLUMNS.NAME',
      headerCellFilter : 'translate',
    },
    { field            : 'sexe',
      displayName      : 'TABLE.COLUMNS.GENDER',
      headerCellFilter : 'translate',
    },
    { field            : 'dob',
      displayName      : 'TABLE.COLUMNS.DOB',
      headerCellFilter : 'translate',
      type             : 'date',  
    },
    { field            : 'date_embauche',
      displayName      : 'TABLE.COLUMNS.DATE_EMBAUCHE',
      headerCellFilter : 'translate',
      type             : 'date',  
    },
    { field            : 'text',
      displayName      : 'TABLE.COLUMNS.GRADE',
      headerCellFilter : 'translate',
    },
    { field            : 'nb_spouse',
      displayName      : 'TABLE.COLUMNS.NB_SPOUSE',
      headerCellFilter : 'translate',
      type             : 'number',
    },
    { field            : 'nb_enfant',
      displayName      : 'TABLE.COLUMNS.NB_CHILD',
      headerCellFilter : 'translate',
      type             : 'number',
    },
    { field            : 'daily_salary',
      displayName      : 'TABLE.COLUMNS.DAILY_SALARY',
      headerCellFilter : 'translate',
    },
    { field            : 'bank',
      displayName      : 'FORM.LABELS.BANK',
      headerCellFilter : 'translate',
      visible          : false,
    },
    { field            : 'bank_account',
      displayName      : 'FORM.LABELS.BANK_ACCOUNT',
      headerCellFilter : 'translate',
      visible          : false 
    },
    { field            : 'adresse',
      displayName      : 'FORM.LABELS.ADDRESS',
      headerCellFilter : 'translate',
      visible          : false 
    },
    { field            : 'phone',
      displayName      : 'FORM.LABELS.PHONE',
      headerCellFilter : 'translate',
      visible          : false 
    },
    { field            : 'email',
      displayName      : 'FORM.LABELS.PHONE',
      headerCellFilter : 'translate',
      visible          : false 
    },
    { field            : 'fonction_txt',
      displayName      : 'FORM.LABELS.FONCTION',
      headerCellFilter : 'translate',
      visible          : false 
    },
    { field            : 'service_name',
      displayName      : 'FORM.LABELS.SERVICE',
      headerCellFilter : 'translate',
      visible          : false 
    },
    { name          : 'actions',
      displayName   : '',
      cellTemplate  : '/modules/patients/templates/action.cell.html',
      enableSorting : false 
    },
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

  // this function loads employees from the database with search parameters
  // if passed in.
  function load(parameters) {
    console.log('here are parameters', parameters);

    // flush error and loading states
    vm.hasError = false;
    toggleLoadingIndicator();

    // if we have search parameters, use search.  Otherwise, just read all
    // employees.
    var request = angular.isDefined(parameters) && !isEmpty(parameters) ?
      Employees.search(parameters) :
      Employees.read();

    // hook the returned patients up to the grid.
    request.then(function (employees) {
      console.log('employees are : ', employees);
      employees.forEach(function (employee) {
        employee.employeeAge = util.getMomentAge(employee.dob, 'years');
      });

      // put data in the grid
      vm.uiGridOptions.data = employees;
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
    // var filters = filter.applyDefaults(cache.filters);

    vm.filters = cache.filters;
    vm.filtersFmt = Employees.formatFilterParameters(vm.filters || {});
    load(vm.filters);

    // check if there are filters applied
    vm.filterBarHeight = (vm.filtersFmt.length > 0) ? FILTER_BAR_HEIGHT : {};
  }

  // fire up the module
  startup();
}
