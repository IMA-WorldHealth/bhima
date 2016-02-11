angular.module('bhima.controllers')
.controller('ExchangeRateController', ExchangeRateController);

ExchangeRateController.$inject = [
  'SessionService', 'DateService', 'CurrencyService', 'ExchangeRateService', '$uibModal'
];

/**
* This controller works in tandem with the ExchangeRateService to allow a user to
* set an exchange rate for a given day.
*
* @controller ExchangeRateController
*/
function ExchangeRateController(Session, Dates, Currencies, Rates, $uibModal) {
  var vm = this;

  // bind data
  vm.view = 'default';
  vm.today      = new Date();
  vm.tomorrow   = Dates.next.day();
  vm.enterprise = Session.enterprise;
  vm.form       = { date : vm.today };
  vm.create     = create;
  vm.update     = update;
  // bind methods
  vm.formatCurrency = formatCurrency;
  vm.setExchangeRate = setExchangeRate;

  /* ------------------------------------------------------------------------ */

  // generic error handler
  function handler(error) {
    console.log(error);
  }

  // start up the module
  function startup() {

    // load supported currencies
    Currencies.read().then(function (data) {
      vm.currencies = data;

      // load supported rates
      return Rates.read(true);
    })
    .then(function (data) {
      vm.rates = data;
      vm.current = calculateCurrentRates(data);
    })
    .catch(handler);
  }

  function formatCurrency(id) {
    return Currencies.name(id) + ' (' + Currencies.symbol(id) + ')';
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
      if (!map[row.currency_id]) { map[row.currency_id] = { rate: row.rate, rowid : row.id } }
      return map;
    }, {});
  }

  // set the exchange rate for a currency id in a new modal
  function setExchangeRate(id) {
    $uibModal.open({
      templateUrl : 'partials/exchange/modal.html',
      size : 'md',
      animation : true,
      controller : 'ExchangeRateModalController as ModalCtrl',
      resolve : {
        data : {
          id : vm.form.id,
          date : vm.form.date,
          currency_id : id
        }
      }
    }).result
    .then(function () {
      startup();
    });
  }

  function update(data){
    vm.view = 'update';
    vm.form = data;
  }

  function create(){
    vm.view = 'default';
  }

  // startup the module
  startup();
}
