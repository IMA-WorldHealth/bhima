angular.module('bhima.controllers')
.controller('ApplicationController', ApplicationController);

ApplicationController.$inject = [
  '$location', '$timeout', '$translate', 'AppCache', 'appstate',
  'connect', 'util', 'SessionService', 'tmhDynamicLocale', 'amMoment'
];

function ApplicationController($location, $timeout, $translate, AppCache, appstate, connect, util, Session, tmhDynamicLocale, amMoment) {
  var vm = this;

  // load in the application cache
  var cache = AppCache('preferences');

  // Default sidebar state
  /** @todo Load sidebar state before angular is bootstraped to remove 'flicker' */
  vm.sidebarExpanded = false;

  // setup the language
  if (cache.language) {
    var language = cache.language;
    $translate.use(language.translateKey);
    tmhDynamicLocale.set(language.localeKey);
  }

  vm.isLoggedIn = function isLoggedIn() {
    return Session.user;
  };

  if (vm.isLoggedIn()) {
    vm.sidebarExpanded = cache.sidebar && cache.sidebar.expanded;
  }

  // on refresh, if we have a session load the rest of the state
  if (vm.isLoggedIn()) { loadState(); }

  // on login, load the state
  appstate.register('login', function (bool) {
    if (bool) { loadState(); }
  });

  // loads dependencies used by the application during runtime
  //   FiscalYear
  //   ExchangeRate
  //   Currencies
  // Also contains a hack to make sure the appstate has the correct
  // enterprise, user, and project from SessionService
  function loadState() {
    var currencies, exchangeRate, fiscalYear;

    exchangeRate = {
      'tables' : {
        'exchange_rate' : {'columns' : ['id', 'enterprise_id', 'currency_id', 'rate', 'date'] },
        'enterprise'  : {'columns' : ['id', 'currency_id::enterprise_currency_id']}
      },
      join : ['exchange_rate.enterprise_id=enterprise.id']
    };

    fiscalYear = {
      'tables' : {
        'period' : { 'columns' : ['id', 'period_start', 'period_stop', 'fiscal_year_id'] },
        'fiscal_year' : { 'columns': ['fiscal_year_txt', 'start_month', 'start_year', 'previous_fiscal_year', 'enterprise_id'] }
      },
      join : ['period.fiscal_year_id=fiscal_year.id'],
      where : ['period.period_start<=' + util.sqlDate(), 'AND', 'period.period_stop>=' + util.sqlDate()]
    };

    currencies = {
      'tables' : {
        'currency' : {
          'columns' : ['id', 'name', 'symbol', 'min_monentary_unit']
        }
      }
    };

    // set appstate variables
    // TODO : Loading exchange rates should be moved into a service
    // where only the pages needing exchange rates load them.
    setEnvironmentVariable('fiscalYears', fiscalYear);
    setEnvironmentVariable('currencies', currencies);
    setEnvironmentVariable('exchange_rate', exchangeRate);

    // FIXME hack to make sure that appstate has user,
    // project, and enterprise defined
    $timeout(function () {

      // FIXME hack to make receipts work with locations
      var project = Session.project;
      project.location_id = Session.enterprise.location_id;

      appstate.set('enterprise', Session.enterprise);
      appstate.set('project', Session.project);
      appstate.set('user', Session.user);

      // TODO Position this to gaurantee the project is populated
      vm.projectName = Session.project.name;
    });

    // FIXME
    // set DEPRECATED appstate variables until we can change them
    // throughout the application.
    appstate.register('fiscalYears', function (data) {
      var currentFiscal = data[0];
      if (currentFiscal) {
        currentFiscal.period_id = currentFiscal.id;
        currentFiscal.id = currentFiscal.fiscal_year_id;
        appstate.set('fiscal', currentFiscal);
      }
    });

    // Optionally expand sidebar
    // vm.sidebarExpanded = true;
  }

  // utility function to set appstate() variables
  function setEnvironmentVariable(key, data) {
    connect.fetch(data)
    .then(function (values) {
      $timeout(function () {
        appstate.set(key, values);
      });
    });
  }

  /**
   * Application Structure methods
   */
  vm.toggleSidebar = function toggleSidebar() {
    if (vm.isLoggedIn()) {
      vm.sidebarExpanded = !vm.sidebarExpanded;
      cache.sidebar = { expanded : vm.sidebarExpanded };
    }
  };

  vm.settings = function settings() {
    $location.path('/settings');
  };
}
