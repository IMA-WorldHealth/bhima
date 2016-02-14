angular.module('bhima.controllers')
.controller('ExchangeRateController', ExchangeRateController);

ExchangeRateController.$inject = [
  'SessionService', 'DateService', 'CurrencyService', 'ExchangeRateService', '$uibModal', '$window', '$translate'
];

/**
* This controller works in tandem with the ExchangeRateService to allow a user to
* set an exchange rate for a given day.
*
* @controller ExchangeRateController
*/
function ExchangeRateController(Session, Dates, Currencies, Rates, $uibModal, $window, $translate) {
  var vm = this;

  // bind data
  vm.view = 'default';
  vm.today      = new Date();
  vm.tomorrow   = Dates.next.day();
  vm.enterprise = Session.enterprise;
  vm.form       = { date : vm.today };
  vm.create     = create;
  vm.update     = update;
  vm.del = del;  
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
    vm.feedback = null;
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
  function setExchangeRate(id, row) {
    if(vm.form.date){
      vm.feedback = 'default';
      var identifiant = vm.form.id ? vm.form.id : row.rowid; 
      $uibModal.open({
        templateUrl : 'partials/exchange/modal.html',
        size : 'md',
        animation : true,
        controller : 'ExchangeRateModalController as ModalCtrl',
        resolve : {
          data : {
            id : identifiant,
            date : vm.form.date,
            currency_id : id
          }
        }
      }).result
      .then(function (operation) {
        vm.view = 'default';
        startup();
        vm.feedback = operation;
      });        
    } else {
      vm.feedback = 'invalid-date';
    }
  }

  function update(data){
    vm.view = 'update';
    vm.form = data;
  }

  function create(){
    vm.form = { date : vm.today };
    vm.view = 'default';
    vm.feedback = null;
  }

  // switch to delete warning mode
  function del(id) {
    var result = $window.confirm($translate.instant('EXCHANGE.CONFIRM'));
    if (!result) {
      vm.view = 'default';
      return
    } else {
      vm.view = 'delete_confirm';
      Rates.delete(id)
      .then(function (response) {
        startup();
        vm.feedback = 'delete_success';
      }).catch(function (error) {
        vm.feedback = 'delete_error';
        vm.HTTPError = error;
      });
    }
  }

  // startup the module
  startup();
}
