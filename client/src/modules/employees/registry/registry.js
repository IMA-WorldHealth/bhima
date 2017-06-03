angular.module('bhima.controllers')
  .controller('EmployeeRegistryController', EmployeeRegistryController);

EmployeeRegistryController.$inject = [
  'EmployeeService', 'NotifyService',
  'util', 'ReceiptModal', 'uiGridConstants',
  'GridColumnService', 'bhConstants', 'FilterService'
];

/**
 * Employee Registry Controller
 *
 * This module is responsible for the management of Employe Registry.
 */
function EmployeeRegistryController(Employees, Notify,
  util, Receipts, uiGridConstants,
  Columns, bhConstants, Filters) {
  var vm = this;

  var filter = new Filters();
  vm.filter = filter;
  vm.filtersFmt = [];

  var cacheKey = 'EmployeeRegistry';
  var FILTER_BAR_HEIGHT = bhConstants.grid.FILTER_BAR_HEIGHT;

  vm.search = search;
  vm.onRemoveFilter = onRemoveFilter;
  vm.openPatientCard = openPatientCard;
  vm.filterBarHeight = {};
  vm.openColumnConfiguration = openColumnConfiguration;

  // track if module is making a HTTP request for employees
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
    { field            : 'sex',
      displayName      : 'TABLE.COLUMNS.GENDER',
      headerCellFilter : 'translate',
    },
    { field            : 'dob',
      displayName      : 'TABLE.COLUMNS.DOB',
      headerCellFilter : 'translate',
      type             : 'date',  
    },
    { field            : 'date_embauche',
      displayName      : 'FORM.LABELS.DATE_EMBAUCHE',
      headerCellFilter : 'translate',
      type             : 'date',
      visible          : false  
    },
    { field            : 'text',
      displayName      : 'TABLE.COLUMNS.GRADE',
      headerCellFilter : 'translate',
    },
    { field            : 'nb_spouse',
      displayName      : 'FORM.LABELS.NB_SPOUSE',
      headerCellFilter : 'translate',
      type             : 'number',
      visible          : false
    },
    { field            : 'nb_enfant',
      displayName      : 'FORM.LABELS.NB_CHILD',
      headerCellFilter : 'translate',
      type             : 'number',
      visible          : false
    },
    { field            : 'daily_salary',
      displayName      : 'FORM.LABELS.DAILY_SALARY',
      headerCellFilter : 'translate',
      visible          : false
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
      displayName      : 'FORM.LABELS.FUNCTION',
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
      cellTemplate  : '/modules/employees/templates/action.cell.html'
    }
  ];

  vm.uiGridOptions = {
    appScopeProvider  : vm,
    showColumnFooter  : true,
    enableColumnMenus : false,
    flatEntityAccess  : true,
    fastWatch         : true,
    columnDefs        : columnDefs
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
    // flush error and loading states
    vm.hasError = false;
    toggleLoadingIndicator();

    // hook the returned patients up to the grid.
    Employees.read(null, parameters)
      .then(function (employees) {
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

  // search and filter data in employee Registry
  function search() {
    var filtersSnapshot = Employees.filters.formatHTTP();

    Employees.openSearchModal(filtersSnapshot)
      .then(function (parameters) {
        // no parameters means the modal was dismissed.
        if (!parameters) { return; }

        Employees.filters.replaceFilters(parameters);
        Employees.cacheFilters();
        vm.latestViewFilters = Employees.filters.formatView();

        return load(Employees.filters.formatHTTP(true));
      })
      .catch(handler);
  }

  function openColumnConfiguration() {
    columnConfig.openConfigurationModal();
  }

  // remove a filter with from the filter object, save the filters and reload
  function onRemoveFilter(key) {
    Employees.removeFilter(key);

    Employees.cacheFilters();
    vm.latestViewFilters = Employees.filters.formatView();

    return load(Employees.filters.formatHTTP(true));
  }

  // toggles the loading indicator on or off
  function toggleLoadingIndicator() {
    vm.loading = !vm.loading;
  }

  // employee patient card
  function openPatientCard(uuid) {
    Receipts.patient(uuid);
  }

  // startup function. Checks for cached filters and loads them.  This behavior could be changed.
  function startup() {
    load(Employees.filters.formatHTTP(true));
    vm.latestViewFilters = Employees.filters.formatView();
  }

  // fire up the module
  startup();
}
