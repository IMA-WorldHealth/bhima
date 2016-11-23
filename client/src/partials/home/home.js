angular.module('bhima.controllers')
.controller('HomeController', HomeController);

HomeController.$inject = [
  'CurrencyService', 'ExchangeRateService', 'SessionService', 'SystemService',
  '$translate', '$scope', 'NotifyService', 'FiscalService', 'moment'
];

/**
 * Home Controller (system dashboard)
 *
 * This controller powers the system dashboard shown by default when the user
 * signs in. This is currently not very informative since the system is missing
 * the infrastructure to power the dashboard completely.
 *
 * @todo - implement actual system activity, such as patient registrations.
 * @todo - implement fiscal year client-side services to get relevant fiscal year
 * services and information.
 */
function HomeController(Currencies, Rates, Session, System, $translate, $scope, Notify, Fiscal, Moment) {
  var vm = this;

  vm.today = new Date();

  vm.primaryExchange = {};

  // bind the session information
  vm.project = Session.project;
  vm.user = Session.user;
  vm.enterprise = Session.enterprise;
  vm.graph = {};

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
        currency.formattedDate = new Moment(currency.date).format('LL');
      });

      // @TODO Method for selecting primary exchange
      vm.primaryExchange = vm.currencies[0];
      console.log(vm.primaryExchange);
    })
    .catch(Notify.handleError);

  // loads system information from the server
  function loadSystemInformation() {
    System.information()
      .then(function (data) {
        vm.system = data;
      });
  }

  Fiscal.fiscalYearDate({ date : vm.today })
    .then(function (year) {
      vm.year = year[0];
      vm.year.percentage = vm.year.percentage * 100;
    })
    .catch(Notify.handleError);


  // initialize with data
  loadSystemInformation();
}
