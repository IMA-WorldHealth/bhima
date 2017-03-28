angular.module('bhima.controllers')
  .controller('ExchangeController', ExchangeController);

ExchangeController.$inject = [
  'SessionService', 'ExchangeRateService', 'NotifyService', 'CurrencyService', '$uibModal'
];

// this powers the exchange rate ui-view in the enterprise page
function ExchangeController(Session, Exchange, Notify, Currencies, $uibModal) {
  var vm = this;

  vm.loading = true;
  vm.enterpriseCurrencyId = Session.enterprise.currency_id;

  // load the exchange rates
  function loadRates() {
    Exchange.read({ limit : 5 })
      .then(function (rates) {
        vm.rates = rates;
      })
      .catch(Notify.handleError)
      .finally(function () {
        vm.loading = false;
      });
  }

  // formats the currency nicely
  vm.formatCurrency = Currencies.format;

  // opens a modal to set a new exchange rate
  vm.setNewExchangeRate = function setNewExchangeRate() {
    var instance = $uibModal.open({
      templateUrl : 'modules/enterprises/exchange/exchange.modal.html',
      controller : 'ExchangeRateModalController as ModalCtrl'
    }).result;

    instance
      .then(loadRates);
  };

  loadRates();
}
