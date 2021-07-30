angular.module('bhima.controllers')
  .controller('HomeController', HomeController);

HomeController.$inject = [
  'CurrencyService', 'ExchangeRateService', 'SessionService',
  'NotifyService', 'FiscalService', 'DashboardService', 'moment',
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
  const vm = this;

  vm.today = new Date();

  vm.primaryExchange = {};

  // this limits the number of places that the page displays for the exchange rate
  vm.EXCHANGE_RATE_DISPLAY_SIZE = 6;

  // bind the session information
  vm.project = Session.project;
  vm.user = Session.user;
  vm.enterprise = Session.enterprise;
  /*
    vm.isFirstCurencyLabel is used to check the exchange Rate
    is lower then 1  the program show display something
    much better for reading
  */
  vm.isFirstCurencyLabel = false;

  // load exchange rates
  Currencies.read(true)
    .then((currencies) => {
      vm.currencies = currencies.filter((currency) => {
        return currency.id !== Session.enterprise.currency_id;
      });
      // format the enterprise currency
      vm.enterprise.currencyLabel = Currencies.format(vm.enterprise.currency_id);
      // load supported rates
      return Rates.read(true);
    })
    .then(() => {
      vm.currencies.forEach((currency) => {
        const exchange = Rates.getCurrentExchange(currency.id);
        currency.rate = exchange.rate;
        currency.date = exchange.date;
        /*
          Let check is the currency rate is lower the 1
          so that we could format it in a readable way
        */

        if (currency.rate < 1) {
          currency.rate = (1 / currency.rate);
          vm.isFirstCurencyLabel = true;
        }

        currency.formattedDate = new Moment(currency.date).format('LL');
      });

      // @TODO Method for selecting primary exchange
      [vm.primaryExchange] = vm.currencies;

    })
    .catch(err => {
      if (err.message === 'EXCHANGE.MUST_DEFINE_RATES_FIRST') {
        Rates.warnMissingExchangeRates(err.missing);
      } else {
        Notify.handleError(err);
      }
    });

  Fiscal.getFiscalYearByDate({ date : vm.today })
    .then(([year]) => {
      vm.year = year;
      vm.year.percentage *= 100;
    })
    .catch(Notify.handleError);
}
