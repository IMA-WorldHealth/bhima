angular.module('bhima.controllers')
.controller('ApplicationController', ApplicationController);

ApplicationController.$inject = [
  '$location', '$timeout', '$translate', 'appcache', 'appstate',
  'connect', 'util', 'SessionService', 'tmhDynamicLocale',
];

function ApplicationController($location, $timeout, $translate, Appcache, appstate, connect, util, Session, tmhDynamicLocale) {
  var vm = this;

  // useful for loading the language
  var cache = new Appcache('preferences');

  cache.fetch('language')
  .then(function (language) {
    if (language) {
      $translate.use(language.translateKey);
      tmhDynamicLocale.set(language.localeKey);
    }
  });

  vm.isLoggedIn = function () {
    return Session.user;
  };

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
        'exchange_rate' : {
          'columns' : ['id', 'enterprise_currency_id', 'foreign_currency_id', 'rate', 'date']
        }
      }
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
}
