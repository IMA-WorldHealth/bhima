angular.module('bhima.controllers')
.controller('ApplicationController', ApplicationController);

ApplicationController.$inject = [
  '$timeout', 'AppCache', 'appstate', 'connect', 'util',
  'SessionService', 'LanguageService', '$state'
];

function ApplicationController($timeout, AppCache, appstate, connect, util, Session, Languages, $state) {
  var vm = this;

  // load in the application cache
  var cache = AppCache('preferences');

  // Default sidebar state
  /** @todo Load sidebar state before angular is bootstraped to remove 'flicker' */
  vm.sidebarExpanded = false;

  // set up the languages for the application, including default languages
  // the 'true' parameter forces refresh
  Languages.read(true);

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

    fiscalYear = {
      'tables' : {
        'period' : { 'columns' : ['id', 'start_date', 'end_date', 'fiscal_year_id'] },
        'fiscal_year' : { 'columns': ['label', 'start_date', 'previous_fiscal_year_id', 'enterprise_id'] }
      },
      join : ['period.fiscal_year_id=fiscal_year.id'],
      where : ['period.start_date<=' + util.sqlDate(), 'AND', 'period.end_date>=' + util.sqlDate()]
    };

    // set appstate variables
    setEnvironmentVariable('fiscalYears', fiscalYear);

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
    vm.projectName = Session.project.name;
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
    $state.go('settings', { previous : $state.$current.name });
  };
}
