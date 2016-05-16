angular.module('bhima.controllers')
.controller('HomeController', HomeController);

HomeController.$inject = [
  'CurrencyService', 'ExchangeRateService', 'SessionService', 'SystemService'
];

/**
 * Home Controller (system dashboard)
 */
function HomeController(Currencies, Rates, Session, System) {
  var vm = this;

  vm.today = new Date();

  // bind the session information
  vm.project = Session.project;
  vm.user = Session.user;
  vm.enterprise = Session.enterprise;

  // load exchange rates
  Currencies.read()
    .then(function (currencies) {
      vm.currencies = currencies.filter(function (currency) {
        return currency.id !== Session.enterprise.currency_id;
      });

      // format the enterprise currency
      vm.enterprise.currencyLabel = Currencies.format(vm.enterprise.currency_id);

      // load supported rates
      return Rates.read(true);
    })
    .then(function () {
      vm.currencies.forEach(function (currency) {
        currency.rate = Rates.getCurrentRate(currency.id);
      });
    });

  // load system information
  System.information()
    .then(function (data) {
      vm.system = data;
    });

  System.events()
    .then(function (events) {
      vm.events = events;
    });
}
