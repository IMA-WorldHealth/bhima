/* eslint no-console:"off" */
const bhima = angular.module('bhima', [
  'bhima.controllers', 'bhima.services', 'bhima.directives', 'bhima.filters',
  'bhima.components', 'bhima.routes', 'bhima.constants', 'ui.bootstrap',
  'pascalprecht.translate', 'ngStorage',
  'tmh.dynamicLocale', 'ngFileUpload', 'ui.grid', 'ui.grid.saveState',
  'ui.grid.selection', 'ui.grid.autoResize', 'ui.grid.resizeColumns',
  'ui.grid.edit', 'ui.grid.grouping', 'ui.grid.treeView', 'ui.grid.cellNav',
  'ui.grid.pagination', 'ui.grid.moveColumns', 'ui.grid.exporter',
  'ui.grid.expandable', 'angularMoment', 'ngMessages',
  'growlNotifications', 'ngAnimate', 'ngSanitize', 'ui.select', 'ngTouch',
  'ui.router.state.events', 'webcam',
]);

function bhimaConfig($urlMatcherFactoryProvider) {
  // allow trailing slashes in routes
  $urlMatcherFactoryProvider.strictMode(false);
}

function translateConfig($translateProvider) {
  // TODO Review i18n and determine if this it the right solution
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
function startupConfig(
  $rootScope, $state, $uibModalStack, SessionService, amMoment, Notify,
  $location, InstallService
) {
  const installStateRegexp = /#!\/install$/;
  const loginStateRegexp = /#!\/login$/;

  // make sure the user is logged in and allowed to access states when
  // navigating by URL.  This is pure an authentication issue.
  $rootScope.$on('$locationChangeStart', onLocationChangeStart);

  function onLocationChangeStart(event, next) {
    const isLoggedIn = !!SessionService.user;
    const isLoginState = loginStateRegexp.test(next);
    const isInstallState = installStateRegexp.test(next);

    // if the user is logged in and trying to access the login state, deny the
    // attempt with a message "Cannot return to login.  Please log out from the
    // Settings Page.
    if (isLoggedIn && isLoginState) {
      event.preventDefault();
      Notify.warn('AUTH.CANNOT_RETURN_TO_LOGIN');

    // if the user is not logged in and trying to access any other state, deny
    // the attempt with a message that their session expired and redirect them
    // to the login page.
    } else if (!isLoggedIn && !isLoginState && !isInstallState) {
      event.preventDefault();
      $state.go('login');

      // if user is logged in and trying to access install keep the user in
      // the current state.
    } else if (isLoggedIn && isInstallState) {
      event.preventDefault();

      // goto install state if it is possible
    } else if (!isLoggedIn && isInstallState) {
      event.preventDefault();
      InstallService.checkBasicInstallExist()
        .then(handleInstallExist);
    }

    function handleInstallExist(res) {
      if (res.isInstalled) { $state.go('login'); }
    }

    // else, the user is free to continue as they wish
  }

  // the above $locationChangeStart is not enough in the case that $state.go()
  // is used (as it is on the /settings page).  If an attacker manages to
  // trigger a $state.go() to the login state, it will not be stopped - the
  // $locationChangeStart event will only prevent the URL from changing ... not
  // the actual state transition!  So, we need this to stop $stateChange events.
  // TODO - migrate this to $transitions.on()
  $rootScope.$on('$stateChangeStart', onStateChangeStart);

  function onStateChangeStart(event, next) {
    const isLoggedIn = !!SessionService.user;
    const isLoginState = next.name.indexOf('login') !== -1;

    if (isLoggedIn && isLoginState) {
      event.preventDefault();
      Notify.warn('AUTH.CANNOT_RETURN_TO_LOGIN');
      return;
    }

    // check if we are going to an error state;
    const isErrorState = (
      next.name.indexOf('404') !== -1
      || next.name.indexOf('403') !== -1
    );

    const isSettingsState = next.name.indexOf('settings') !== -1;

    // pass through to error state or settings state
    if (isErrorState || isSettingsState) {
      return;
    }

    // verify that the user is authorized to go to the next state
    const path = $location.path();
    const { paths } = SessionService;

    const publicRoutes = ['/', '/settings', '/login', '/landing/stats', '/install'];

    const isPublicPath = publicRoutes.indexOf(path) > -1;

    // pass through
    if (!paths || isPublicPath) { return; }

    // check if the user is authorized to access this route.
    const authorized = paths.some(checkUserAuthorization);

    // if the user is not authorized, go to the 403 state instead
    if (!authorized) {
      event.preventDefault();
      $state.go('403');
    }

    /**
     * @method checkUserAuthorization
     *
     * @description
     * Simple method to check the current path the user is accessing against the
     * users known permissions.
     *
     * Checks one known permission (data) against the path the user is accessing (path).
     *
     * @param {Object} data - a route object containing a known route path as well as
     *                        information on if this user is authorised, route
     *                        objects passed in that match the target path will be aproved
     */
    function checkUserAuthorization(data) {
      // check to see if the route permission object (data) passed in begins with the path being accessed
      // only do more expensive check if the path is a valid partial match
      if (path.indexOf(data.path) === 0) {
        // split the current target path and the role permission object path into sections
        const rolePermissionPathSections = data.path.split('/');
        const targetPathSections = path.split('/');

        // ensure that EVERY section on the role permission path matches the target path
        // this allows for additional routing beyond exact matching however the base of the
        // path must EXACTLY match the permission object
        const targetPathMatches = rolePermissionPathSections.every((permissionPathSection, index) => {
          // check that this section of the target path exactly matches the required route permission object
          // at the same index
          const targetPathSection = targetPathSections[index];
          return permissionPathSection === targetPathSection;
        });

        return targetPathMatches && data.authorized;
      }

      // this was not a valid partial match - the route cannot be authorised with this permission
      return false;
    }
  }

  // make sure $stateChangeErrors are emitted to the console.
  $rootScope.$on('$stateChangeError', console.log.bind(console));

  // TODO Hardcoded default translation/ localisation
  amMoment.changeLocale('fr');
}

// set the proper key prifix
function localStorageConfig($localStorageProvider) {
  const PREFIX = 'bhima-';
  $localStorageProvider.setKeyPrefix(PREFIX);
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

  // perf - applyAsync
  $httpProvider.useApplyAsync(true);
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
  const PRODUCTION = true;

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
function uiSelectConfig(config) {
  config.theme = 'bootstrap';
}

// configures the modals with default values
function uiModalConfig($uibModalProvider) {
  $uibModalProvider.options.size = 'md';
  $uibModalProvider.options.backdrop = 'static';
  $uibModalProvider.options.keyboard = false;
}

// configure services, providers, factories
bhima.config(['$urlMatcherFactoryProvider', bhimaConfig]);
bhima.config(['$translateProvider', translateConfig]);
bhima.config(['uiSelectConfig', uiSelectConfig]);
bhima.config(['tmhDynamicLocaleProvider', localeConfig]);
bhima.config(['$localStorageProvider', localStorageConfig]);
bhima.config(['$httpProvider', httpConfig]);
bhima.config(['$animateProvider', animateConfig]);
bhima.config(['$uibModalProvider', uiModalConfig]);
bhima.config(['$compileProvider', compileConfig]);

// run the application
bhima.run([
  '$rootScope', '$state', '$uibModalStack', 'SessionService',
  'amMoment', 'NotifyService', '$location', 'InstallService', startupConfig,
]);
