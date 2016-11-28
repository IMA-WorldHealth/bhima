angular.module('bhima.controllers')
.controller('HomeController', HomeController);

HomeController.$inject = [
  'CurrencyService', 'ExchangeRateService', 'SessionService',
  'NotifyService', 'FiscalService', 'DashboardService', 'moment'
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
function HomeController(Currencies, Rates, Session, Notify, Fiscal, DashboardService, Moment) {
  var vm = this;

  vm.today = new Date();

  vm.primaryExchange = {};

  // this limits the number of places that the page displays for the exchange rate
  vm.EXCHANGE_RATE_DISPLAY_SIZE = 6;

  // bind the session information
  vm.project = Session.project;
  vm.user = Session.user;
  vm.enterprise = Session.enterprise;

  // load exchange rates
  Currencies.read(true)
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
    })
    .catch(Notify.handleError);

  Fiscal.fiscalYearDate({ date : vm.today })
    .then(function (year) {
      vm.year = year[0];
      vm.year.percentage = vm.year.percentage * 100;
    })
    .catch(Notify.handleError);
}
