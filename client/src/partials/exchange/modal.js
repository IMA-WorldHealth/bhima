angular.module('bhima.controllers')
.controller('ExchangeRateModalController', ExchangeModalController);

ExchangeModalController.$inject = [
  'ExchangeRateService', 'CurrencyService',
  'SessionService', '$uibModalInstance', 'data'
];

function ExchangeModalController(Rates, Currencies, Session, $uibModalInstance, data) {
  var vm = this;

  // bind variables
  vm.data = data;
  vm.submit = submit;
  vm.cancel = cancel;
  vm.enterpriseCurrencyId = Session.enterprise.currency_id;
  vm.enterpriseCurrency = format(Session.enterprise.currency_id);
  vm.selectedCurrency = format(data.currency_id);

  // bind methods
  vm.submit = submit;
  vm.cancel = cancel;

  function handler(error) {
    throw error;
  }

  function submit(invalid) {
    if (invalid) { return; }

    Rates.create(vm.data)
    .then(function (data) {
      return $uibModalInstance.resolve(data);
    })
    .catch(handler);
  }

  function cancel() {
    $uibModalInstance.dismiss();
  }

  function format(id) {
    if (!id) { return ''; }
    return Currencies.name(id) + ' ' + '(' + Currencies.symbol(id) + ')';
  }
}
