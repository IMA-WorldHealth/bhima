var bhima = angular.module('bhima', [
  'bhima.controllers', 'bhima.services', 'bhima.directives', 'bhima.filters',
  'bhima.components', 'bhima.routes', 'ui.bootstrap',
  'pascalprecht.translate', 'ngStorage', 'chart.js',
  'tmh.dynamicLocale', 'ngFileUpload', 'ui.grid',
  'ui.grid.selection', 'ui.grid.autoResize', 'ui.grid.resizeColumns',
  'ui.grid.edit', 'ui.grid.grouping', 'ui.grid.treeView', 'ui.grid.cellNav',
  'ui.grid.pagination', 'ui.grid.moveColumns', 'angularMoment', 'ngMessages',
  'growlNotifications', 'ngAnimate', 'ngSanitize', 'ui.select'
]);

function bhimaConfig($stateProvider, $urlRouterProvider, $urlMatcherFactoryProvider) {

  // allow trailing slashes in routes
  $urlMatcherFactoryProvider.strictMode(false);

  $stateProvider
  .state('index', {
    url : '/',
    controller : 'HomeController as HomeCtrl',
    templateUrl : 'partials/home/home.html'
  })
  .state('login', {
    url : '/login',
    controller : 'LoginController as LoginCtrl',
    templateUrl : 'partials/login/login.html'
  })
  .state('enterprises', {
    url : '/enterprises',
    controller: 'EnterpriseController as EnterpriseCtrl',
    templateUrl: 'partials/enterprises/enterprises.html'
  })
  .state('exchange', {
    url : '/exchange',
    controller : 'ExchangeRateController as ExchangeCtrl',
    templateUrl: 'partials/exchange/exchange.html'
  })
  .state('settings', {
    url : '/settings?previous',
    controller: 'settings as SettingsCtrl',
    templateUrl: 'partials/settings/settings.html'
  })
  .state('services', {
    url : '/services',
    controller : 'ServicesController as ServicesCtrl',
    templateUrl : 'partials/services/services.html'
  })

  .state('invoiceRegistry', {
    url  : '/invoices',
    controller: 'InvoiceRegistryController as InvoiceRegistryCtrl',
    templateUrl: '/partials/patient_invoice/registry/registry.html'
  })
  .state('configBilan', {
    url: '/section_bilan',
    controller : 'sectionBilanController as sectionBilanCtrl',
    templateUrl : 'partials/section_bilan/section_bilan.html'
  })
  .state('configResultat', {
    url : '/section_resultat',
    controller : 'sectionResultatController as sectionResultatCtrl',
    templateUrl : 'partials/section_resultat/section_resultat.html'
  })
  .state('subsidies', {
    url : '/subsidies',
    controller : 'SubsidyController as SubsidyCtrl',
    templateUrl : 'partials/subsidies/subsidies.html'
  })

  /* admin : depot management */
  .state('depots', {
    url : '/depots',
    controller : 'DepotManagementController as DepotCtrl',
    templateUrl : 'partials/depots/depots.html'
  })

  /* employees routes */
  .state('employees', {
    url : '/employees',
    controller : 'EmployeeController as EmployeeCtrl',
    templateUrl : 'partials/employees/employees.html'
  })
  /* location routes */

  .state('locations', {
    url : '/locations',
    controller : 'LocationController as LocationCtrl',
    templateUrl: 'partials/locations/locations.html'
  })
  .state('locationsVillage', {
    url : '/locations/village',
    controller : 'VillageController as VillageCtrl',
    templateUrl: 'partials/locations/village/village.html'
  })
  .state('locationsSector', {
    url : '/locations/sector',
    controller : 'SectorController as SectorCtrl',
    templateUrl: 'partials/locations/sector/sector.html'
  })
  .state('locationsProvince', {
    url : '/locations/province',
    controller : 'ProvinceController as ProvinceCtrl',
    templateUrl: 'partials/locations/province/province.html'
  })
  .state('locationsCountry', {
    url : '/locations/country',
    controller : 'CountryController as CountryCtrl',
    templateUrl: 'partials/locations/country/country.html'
  })


  /* journal routes */

  .state('journalPrint', {
    controller : 'journal.print',
    templateUrl : 'partials/journal/print.html'
  })
  .state('journalVoucher', {
    controller: 'JournalVoucherController as JournalVoucherCtrl',
    templateUrl: 'partials/journal/voucher/voucher.html'
  })
  .state('simpleVouchers', {
    url : '/vouchers/simple',
    controller: 'SimpleJournalVoucherController as SimpleVoucherCtrl',
    templateUrl: 'partials/vouchers/simple.html'
  })
  .state('vouchersComplex', {
    url : '/vouchers/complex',
    controller: 'ComplexJournalVoucherController as ComplexVoucherCtrl',
    templateUrl: 'partials/vouchers/complex.html'
  })
  .state('vouchers', {
    url : '/vouchers',
    controller: 'VoucherController as VoucherCtrl',
    templateUrl: 'partials/vouchers/index.html'
  })
    
  /** General ledger routes**/
  .state('generalLedger', {
    url : '/general_ledger',
    controller : 'GeneralLedgerController as GeneralLedgerCtrl',
    templateUrl : 'partials/general_ledger/general_ledger.html'
  })

  /* debtors routes */
  .state('debtorGroups', {
    url : '/debtors/groups/:uuid',
    abstract : true,
    params : {
      uuid : { squash : true, value : null }
    },
    controller : 'DebtorGroupController as GroupCtrl',
    templateUrl: 'partials/debtors/groups.html'
  })

    .state('debtorGroups.list', {
      url : '',
      templateUrl : 'partials/debtors/groups.list.html'
    })

    .state('debtorGroups.create', {

      // setting the URL as simply create mathces as a :uuid - there should be a way to set orders
      // this should ideally route to /create
      url : '/create/new',
      templateUrl : 'partials/debtors/groups.edit.html',
      controller : 'DebtorGroupCreateController as GroupEditCtrl'
    })
    .state('debtorGroups.update', {
      url : '/update',
      templateUrl : 'partials/debtors/groups.edit.html',
      controller : 'DebtorGroupUpdateController as GroupEditCtrl',
      data : { label : null }
    })


  /* references routes */

  .state('references', {
    url : '/references',
    controller: 'ReferenceController as ReferenceCtrl',
    templateUrl: 'partials/references/references.html'
  })

  .state('referenceGroups', {
    url : '/references/groups',
    controller: 'ReferenceGroupController as ReferenceGroupCtrl',
    templateUrl: 'partials/references/groups/groups.html'
  })

  /* inventory routes */

  .state('inventory', {
    controller: 'inventory',
    templateUrl: '/partials/inventory/index.html'
  })
  .state('inventoryList', {
    url : '/inventory/list',
    controller : 'InventoryListController as InventoryCtrl',
    templateUrl : 'partials/inventory/list/list.html'
  })
  .state('inventoryConfiguration', {
    url : '/inventory/configuration',
    views : {
      '' : {
        templateUrl : 'partials/inventory/configuration/configuration.html',
        controller : 'InventoryConfigurationController as InventoryCtrl'
      },
      'groups@inventoryConfiguration' : {
        templateUrl : 'partials/inventory/configuration/groups/groups.html',
        controller : 'InventoryGroupsController as GroupsCtrl'
      },
      'types@inventoryConfiguration' : {
        templateUrl : 'partials/inventory/configuration/types/types.html',
        controller : 'InventoryTypesController as TypesCtrl'
      },
      'units@inventoryConfiguration' : {
        templateUrl : 'partials/inventory/configuration/units/units.html',
        controller : 'InventoryUnitsController as UnitsCtrl'
      }
    }
  })
  // @TODO IMPLEMENT THEM
  // .state('/inventory/types',  {
  //   url : '/inventory/types',
  //   controller : 'InventoryTypesController as InventoryCtrl',
  //   templateUrl : 'partials/inventory/types/types.html'
  // })
  .state('prices', {
    url : '/prices',
    controller: 'PriceListController as PriceListCtrl',
    templateUrl: 'partials/price_list/pricelist.html'
  })

  /* creditor routes */
  .state('suppliers', {
    url : '/suppliers',
    controller: 'SupplierController as SupplierCtrl',
    templateUrl: '/partials/suppliers/suppliers.html'
  })

  /* purchase routes */
  .state('purchasesCreate', {
    url : '/purchases/create',
    controller : 'PurchaseOrderController as PurchaseCtrl',
    templateUrl : 'partials/purchases/create/create.html'
  })

  /* cashbox routes */
  .state('cashboxes', {
    url : '/cashboxes',
    controller : 'CashboxController as CashCtrl',
    templateUrl : 'partials/cash/cashboxes/cashboxes.html'
  })
  .state('cashboxes.currencies', {
    url : '/cashboxes/:uuid/currencies',
    controller : 'cash.cashbox_account',
    templateUrl : 'partials/cash/cashboxes/currencies/currencies.html'
  })

  /* transaction type */
  .state('transactionType', {
    url: '/admin/transaction_type',
    controller: 'TransactionTypeController as TypeCtrl',
    templateUrl: 'partials/admin/transaction_type/transaction_type.html'
  })

  .state('error403', {
    url : '/error403',
    templateUrl : 'partials/error403/error403.html'
  })
  .state('error404', {
    url : '/error404',
    templateUrl : 'partials/error404/error404.html'
  });

  $urlRouterProvider.otherwise('error404');
}

function translateConfig($translateProvider) {
  //TODO Review i18n and determine if this it the right solution/grade_employers/
  $translateProvider.useStaticFilesLoader({
    prefix: '/i18n/',
    suffix: '.json'
  });

  $translateProvider.useSanitizeValueStrategy('escape');

  $translateProvider.preferredLanguage('fr');
}

function localeConfig(tmhDynamicLocaleProvider) {

  // TODO Hardcoded default translation/ localisation
  tmhDynamicLocaleProvider.localeLocationPattern('/i18n/locale/angular-locale_{{locale}}.js');
  tmhDynamicLocaleProvider.defaultLocale('fr-be');
}

// redirect to login if not signed in.
function startupConfig($rootScope, $state, $uibModalStack, SessionService, amMoment, Notify, $location) {

  // make sure the user is logged in and allowed to access states when
  // navigating by URL.  This is pure an authentication issue.
  $rootScope.$on('$locationChangeStart', function (event, next) {
    var isLoggedIn = !!SessionService.user;
    var isLoginState = next.indexOf('#/login') !== -1;

    if (next.indexOf('/error403') !== -1) {
      $state.go('/error403');
    }

    // if the user is logged in and trying to access the login state, deny the
    // attempt with a message "Cannot return to login.  Please log out from the
    // Settings Page."
    if (isLoggedIn && isLoginState) {
      event.preventDefault();
      Notify.warn('AUTH.CANNOT_RETURN_TO_LOGIN');

    // if the user is not logged in and trying to access any other state, deny
    // the attempt with a message that their session expired and redirect them
    // to the login page.
    } else if (!isLoggedIn && !isLoginState) {
      event.preventDefault();
      Notify.warn('AUTH.UNAUTHENTICATED');
      $state.go('login');
    }

    // else, the user is free to continue as they wish
  });

  // the above $locationChangeStart is not enough in the case that $state.go()
  // is used (as it is on the /settings page).  If an attacker manages to
  // trigger a $state.go() to the login state, it will not be stopped - the
  // $locationChangeStart event will only prevent the URL from changing ... not
  // the actual state transition!  So, we need this to stop $stateChange events.

  // var paths recovered all the path that the user is allowed to enter
  // Tests if the path has elements and other common paths are not called
  // if the test is positive, the current path is verified in the path list
  // if the current path does not exist in the path list in this case the user will rédirrigé to error403 page

  $rootScope.$on('$stateChangeStart', function (event, next) {
    var isLoggedIn = !!SessionService.user;
    var isLoginState = next.name.indexOf('login') !== -1;

    if (isLoggedIn && isLoginState) {
      event.preventDefault();
      Notify.warn('AUTH.CANNOT_RETURN_TO_LOGIN');
    }


    var currentPath = $location.$$path;
    var paths = SessionService.path;

    var publicRoutes = ['/', '/settings', '/login', '/error404', '/error403'];

    if (paths && publicRoutes.indexOf(currentPath) === -1) {
      var authorized = paths.some(function (data) {
        return currentPath.indexOf(data.path) === 0;
      });

      if (!authorized) {
        $location.path('/error403');
      }
    }
  });

  // make sure $stateChangeErrors are emitted to the console.
  $rootScope.$on('$stateChangeError', console.log.bind(console));

  // TODO Hardcoded default translation/ localisation
  amMoment.changeLocale('fr');
}

// set the proper key prifix
function localStorageConfig($localStorageProvider) {
  var PREFIX = 'bhima-';
  $localStorageProvider.setKeyPrefix(PREFIX);
}

/**
 * @todo some of these constants are system standards, others should be
 * populated according to the enterprise configuration
 */
function constantConfig() {
  return {
    accounts : {
      ROOT : 0,
      TITLE : 4
    },
    purchase : {
      GRID_HEIGHT: 200
    },
    settings: {
      CONTACT_EMAIL : 'developers@imaworldhealth.org'
    },
    dates : {
      minDOB : new Date('1900-01-01'),
    },
    lengths : {
      maxTextLength : 1000
    },
    grid : {
      ROW_HIGHLIGHT_FLAG : '_highlight',
      ROW_ERROR_FLAG : '_error'
    },
    transactions : {
      ROW_EDIT_FLAG : '_edit',
      ROW_HIGHLIGHT_FLAG : '_highlight',
      ROW_INVALID_FLAG : '_invalid'
    },
    transactionType : {
      GENERIC_INCOME     : 1,
      CASH_PAYMENT       : 2,
      CONVENTION_PAYMENT : 3,
      SUPPORT_INCOME     : 4,
      TRANSFER           : 5,
      GENERIC_EXPENSE    : 6,
      SALARY_PAYMENT     : 7,
      CASH_RETURN        : 8,
      PURCHASES          : 9,
      CREDIT_NOTE        : 10,
      INCOME             : 'income',
      EXPENSE            : 'expense'
    },
    reports : {
      AGED_DEBTOR : 'AGED_DEBTOR',
      CASHFLOW : 'CASHFLOW'
    }
  };
}

/**
 * This function is responsible for configuring angular's $http service. Any
 * relevant services/ factories are registered at this point.
 *
 * @param {Object} $httpProvider   Angular provider inject containing
 *                                  'interceptors' that are chained on any HTTP request
 */
function httpConfig($httpProvider) {

  // register an auth injector, which logs $http errors to the console, even if
  // caught by a .catch() statement.
  // TODO - in production, we shouldn't log as many errors
  $httpProvider.interceptors.push('AuthInjectorFactory');

  // register error handling interceptor
  $httpProvider.interceptors.push('ErrorInterceptor');
}

/**
 * Configure ng-animate - currently this library tries to apply to all elements
 * which has significant performance implications. Filtering the scope to only
 * elements wit 'ng-animate-enabled' allows the library to be used without the
 * performance hit.
 */
function animateConfig($animateProvider) {
  $animateProvider.classNameFilter(/ng-animate-enabled/);
}

/**
 * Configure the $compiler with performance enhancing variables
 */
function compileConfig($compileProvider) {

  // switch this variable when going into production for an easy performance win.
  var PRODUCTION = false;

  if (PRODUCTION) {
    $compileProvider.debugInfoEnabled(false);

    // available in angular:1.6.x
    //$compileProvider.commentDirectivesEnabled(false);
    //$compileProvider.cssClassDirectivesEnabled(false);
  }
}

bhima.constant('bhConstants', constantConfig());

// configure services, providers, factories
bhima.config(['$stateProvider', '$urlRouterProvider', '$urlMatcherFactoryProvider', bhimaConfig]);
bhima.config(['$translateProvider', translateConfig]);
bhima.config(['tmhDynamicLocaleProvider', localeConfig]);
bhima.config(['$localStorageProvider', localStorageConfig]);
bhima.config(['$httpProvider', httpConfig]);
bhima.config(['$animateProvider', animateConfig]);
bhima.config(['$compileProvider', compileConfig]);

// run the application
bhima.run(['$rootScope', '$state', '$uibModalStack', 'SessionService', 'amMoment', 'NotifyService', '$location', startupConfig]);
