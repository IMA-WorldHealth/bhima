var bhima = angular.module('bhima', [
  'bhima.controllers', 'bhima.services', 'bhima.directives', 'bhima.filters',
  'bhima.components', 'bhima.routes', 'ui.bootstrap',
  'pascalprecht.translate', 'ngStorage', 'chart.js',
  'tmh.dynamicLocale', 'ngFileUpload', 'ui.grid',
  'ui.grid.selection', 'ui.grid.autoResize', 'ui.grid.resizeColumns',
  'ui.grid.edit', 'ui.grid.grouping', 'ui.grid.treeView', 'ui.grid.cellNav',
  'ui.grid.pagination', 'ui.grid.moveColumns', 'angularMoment', 'ngMessages',
  'growlNotifications', 'ngAnimate', 'ngSanitize', 'ui.select', 'ngTouch',
  'ui.router.state.events',
]);

function bhimaConfig($urlMatcherFactoryProvider) {
  // allow trailing slashes in routes
  $urlMatcherFactoryProvider.strictMode(false);
}

function translateConfig($translateProvider) {
  // TODO Review i18n and determine if this it the right solution/grade_employers/
  $translateProvider.useStaticFilesLoader({
    prefix : '/i18n/',
    suffix : '.json',
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

  var loginStateRegexp = /#!\/login$/;
  var rootStateRegexp = /#!\/$|\/$|#!$/;

  // make sure the user is logged in and allowed to access states when
  // navigating by URL.  This is pure an authentication issue.
  $rootScope.$on('$locationChangeStart', function (event, next)  {
    var isLoggedIn = !!SessionService.user;

    var isLoginState = loginStateRegexp.test(next);
    var isRootState = rootStateRegexp.test(next);

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

      if (!isRootState) {
        Notify.warn('AUTH.UNAUTHENTICATED');
      }

      $state.go('login');
    }

    // else, the user is free to continue as they wish
  });

  // the above $locationChangeStart is not enough in the case that $state.go()
  // is used (as it is on the /settings page).  If an attacker manages to
  // trigger a $state.go() to the login state, it will not be stopped - the
  // $locationChangeStart event will only prevent the URL from changing ... not
  // the actual state transition!  So, we need this to stop $stateChange events.
  // TODO - migrate this to $transitions.on()
  $rootScope.$on('$stateChangeStart', function (event, next) {
    var isLoggedIn = !!SessionService.user;
    var isLoginState = next.name.indexOf('login') !== -1;

    if (isLoggedIn && isLoginState) {
      event.preventDefault();
      Notify.warn('AUTH.CANNOT_RETURN_TO_LOGIN');
      return;
    }

    // check if we are going to an error state;
    var isErrorState = (
      next.name.indexOf('404') !== -1 ||
      next.name.indexOf('403') !== -1
    );

    // pass through to error state
    if (isErrorState) {
      return;
    }

    // verify that the user is authorized to go to the next state
    var path = $location.path();

    var paths = SessionService.paths;
    var publicRoutes = ['/', '/settings', '/login', '/landing/stats'];

    var isPublicPath = publicRoutes.indexOf(path) > -1;

    // pass through
    if (!paths || isPublicPath) { return; }

    // check if the user is authorized to access this route.
    var authorized = paths.some(function (data) {
      return path.indexOf(data.path) === 0 && data.authorized;
    });

    // if the user is not authorized, go to the 403 state instead
    if (!authorized) {
      event.preventDefault();
      $state.go('403');
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
  var UTIL_BAR_HEIGHT = '106px';

  return {
    accounts : {
      ROOT  : 0,
      TITLE : 4,
    },
    purchase : {
      GRID_HEIGHT : 200,
      TITLE : 4,
    },
    settings : {
      CONTACT_EMAIL : 'developers@imaworldhealth.org',
    },
    dates : {
      minDOB : new Date('1900-01-01'),
      format         : 'dd/MM/yyyy',
    },
    yearOptions : {
      format         : 'yyyy',
      datepickerMode : 'year',
      minMode        : 'year',
    },
    dayOptions : {
      format         : 'dd/MM/yyyy',
      datepickerMode : 'day',
      minMode        : 'day',
    },
    lengths : {
      maxTextLength   : 1000,
      minDecimalValue : 0.0001,
    },
    grid : {
      ROW_HIGHLIGHT_FLAG : '_highlight',
      ROW_ERROR_FLAG     : '_error',
      FILTER_BAR_HEIGHT  : { height: 'calc(100vh - 105px)' },
    },
    transactions : {
      ROW_EDIT_FLAG      : '_edit',
      ROW_HIGHLIGHT_FLAG : '_highlight',
      ROW_INVALID_FLAG   : '_invalid',
    },
    barcodes : {
      LENGTH : 10,
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
      EXPENSE            : 'expense',
    },
    reports : {
      AGED_DEBTOR    : 'AGED_DEBTOR',
      CASHFLOW       : 'CASHFLOW',
      INCOME_EXPENSE : 'INCOME_EXPENSE',
    },
    precision : {
      MAX_DECIMAL_PRECISION : 4,
    },
    utilBar : {
      height : UTIL_BAR_HEIGHT,
      expandedHeightStyle : { 'height' : 'calc(100vh - '.concat(UTIL_BAR_HEIGHT, ')') },
      collapsedHeightStyle : {}
    },
    identifiers : {
      PATIENT : {
        key : 'PA',
        table : 'patient'
      }
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
  var PRODUCTION = true;

  if (PRODUCTION) {
    $compileProvider.debugInfoEnabled(false);

    // available in angular:1.6.x
    $compileProvider.commentDirectivesEnabled(false);
    $compileProvider.cssClassDirectivesEnabled(false);
  }
}

/**
 * Configure global properties about ui-select
 */
function uiSelectConfig(uiSelectConfig) {
  uiSelectConfig.theme = 'bootstrap';
}

// TODO - remove this
function qConfig($qProvider) {
  $qProvider.errorOnUnhandledRejections(false);
}

bhima.constant('bhConstants', constantConfig());

// configure services, providers, factories
bhima.config(['$urlMatcherFactoryProvider', bhimaConfig]);
bhima.config(['$translateProvider', translateConfig]);
bhima.config(['uiSelectConfig', uiSelectConfig]);
bhima.config(['tmhDynamicLocaleProvider', localeConfig]);
bhima.config(['$localStorageProvider', localStorageConfig]);
bhima.config(['$httpProvider', httpConfig]);
bhima.config(['$animateProvider', animateConfig]);
bhima.config(['$compileProvider', compileConfig]);
bhima.config(['$qProvider', qConfig]);

// run the application
bhima.run(['$rootScope', '$state', '$uibModalStack', 'SessionService', 'amMoment', 'NotifyService', '$location', startupConfig]);
