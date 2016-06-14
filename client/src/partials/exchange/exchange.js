angular.module('bhima.controllers')
.controller('ExchangeRateController', ExchangeRateController);

ExchangeRateController.$inject = [
  'SessionService', 'DateService', 'CurrencyService', 'ExchangeRateService',
  '$uibModal', '$translate', 'ModalService', 'NotifyService'
];

/**
* This controller works in tandem with the ExchangeRateService to allow a user to
* set an exchange rate for a given day.
*
* @controller ExchangeRateController
*/
function ExchangeRateController(Session, Dates, Currencies, Rates, $uibModal, $translate, ModalService, Notify) {
  var vm = this;

  // bind data
  vm.view = 'default';
  vm.today      = new Date();
  vm.tomorrow   = Dates.next.day();
  vm.enterprise = Session.enterprise;
  vm.form       = { date : vm.today };
  vm.create     = create;
  vm.update     = update;
  vm.delete = remove;

  vm.Currencies = Currencies;

  // bind methods
  vm.setExchangeRate = setExchangeRate;

  /* ------------------------------------------------------------------------ */

  // start up the module
  function startup() {

    // load supported currencies
    Currencies.read()
      .then(function (data) {
        vm.currencies = data;

        // filter out the enterprise currency
        vm.outCurrencies = vm.currencies.filter(function (currency) {
          return currency.id !== Session.enterprise.currency_id;
        });

        vm.form.id = null;
        vm.rates = null;
        vm.current = null;

        // load supported rates
        return Rates.read(true);
      })
      .then(function (data) {
        vm.form.date = vm.today;
        vm.rates = data;
        vm.current = calculateCurrentRates(data);
      })
      .catch(Notify.handleError);
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

  // set the exchange rate for a currency id in a new modal
  function setExchangeRate(id, row) {
    if (!vm.form.date) {
      Notify.danger('FORM.VALIDATIONS.INVALID_DATE');
      return;
    }

    var identifiant = vm.form.id || '';

    var instance = $uibModal.open({
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
      },
    }).result;

    instance.then(function () {
      vm.view = 'default';
      startup();
    });
  }

  function update(data) {
    vm.view = 'update';
    vm.form = data;
  }

  function create() {
    vm.form = { date : new Date() };
    vm.view = 'default';
  }

  // switch to delete warning mode
  function remove(id) {
    ModalService.confirm('FORM.DIALOGS.CONFIRM_DELETE')
    .then(function (bool) {
      if (!bool) { return; }

      Rates.delete(id)
        .then(function () {
          Notify.success('FORM.INFOS.DELETE_SUCCESS');
          vm.view = 'default';
          startup();
        })
        .catch(Notify.handleError);
    });
  }

  // startup the module
  startup();
}
