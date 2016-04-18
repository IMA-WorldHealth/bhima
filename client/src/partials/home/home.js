angular.module('bhima.controllers')
.controller('HomeController', HomeController);

HomeController.$inject = [
  '$translate', 'CurrencyService', 'ExchangeRateService', 'SessionService', 'SessionService'
];

function HomeController($translate, Currencies, Rates, SessionService, Session) {
  var vm = this;

  vm.today = new Date();
  vm.project = SessionService.project;
  vm.user = SessionService.user;
  vm.enterprise = SessionService.enterprise;
  vm.symbolCurrency = symbolCurrency;
  // generic error handler
  function handler(error) {
    console.log(error);
  }

  Currencies.read().then(function (data) {
    vm.currencies = data;

    // filter out the enteprise currency
    vm.outCurrencies = vm.currencies.filter(function (currency) {
      return currency.id !== Session.enterprise.currency_id;
    });
    vm.rates = null;
    vm.current = null;
    // load supported rates
    return Rates.read(true);
  })
  .then(function (data) {
    vm.rates = data;
    vm.current = calculateCurrentRates(data);
  })
  .catch(handler);

  function symbolCurrency(id) {
    return Currencies.symbol(id);
  }

  // NOTE -- this is very similar code to some in the ExchangeRateService.
  // It doesn't seem to make sense to expose this functionality from the
  // service API, so this is a duplicate.
  function calculateCurrentRates(rates) {
    // initially sort the rates by date in reverse order
    rates.sort(function (a,b) {
      return (a.date < b.date) ? 1 : (a.date === b.date ? 0 : -1);
    });

    // take the first rate matching the currency (since we reversed the
    // rate orders, this is the most recent rate).
    return rates.reduce(function (map, row) {
      if (!map[row.currency_id]) { map[row.currency_id] = { rate: row.rate, rowid : row.id }; }
      return map;
    }, {});
  }
}
