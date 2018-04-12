angular.module('bhima.controllers')
  .controller('ExchangeController', ExchangeController);

ExchangeController.$inject = [
  'SessionService', 'ExchangeRateService', 'NotifyService', 'CurrencyService', '$uibModal',
];

// this powers the exchange rate ui-view in the enterprise page
function ExchangeController(Session, Exchange, Notify, Currencies, $uibModal) {
  const vm = this;

  vm.loading = true;
  vm.enterpriseCurrencyId = Session.enterprise.currency_id;

  // load the exchange rates
  function loadRates() {
    Exchange.read({ limit : 5 })
      .then((rates) => {
        vm.rates = rates;
      })
      .catch(Notify.handleError)
      .finally(() => {
        vm.loading = false;
      });
  }

  // formats the currency nicely
  vm.formatCurrency = Currencies.format;

  // opens a modal to set a new exchange rate
  vm.setNewExchangeRate = function setNewExchangeRate() {
    const instance = $uibModal.open({
      templateUrl : 'modules/enterprises/exchange/exchange.modal.html',
      controller : 'ExchangeRateModalController as ModalCtrl',
    }).result;

    instance
      .then(loadRates);
  };

  loadRates();
}
