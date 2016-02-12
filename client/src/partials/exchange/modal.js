angular.module('bhima.controllers')
.controller('ExchangeRateModalController', ExchangeModalController);

ExchangeModalController.$inject = [
  'ExchangeRateService', 'CurrencyService',
  'SessionService', '$uibModalInstance', 'data', 'exchange'
];

function ExchangeModalController(Rates, Currencies, Session, $uibModalInstance, data, exchange) {
  var vm = this;

  // bind variables
  vm.data = data;

  vm.submit = submit;
  vm.cancel = cancel;
  vm.enterpriseCurrencyId = Session.enterprise.currency_id;
  vm.enterpriseCurrency = format(Session.enterprise.currency_id);
  vm.selectedCurrency = format(data.currency_id);
  vm.today = new Date();

  vm.hasDailyRate = Rates.hasDailyRate(vm.data.currency_id,vm.data.date);

  vm.exchangeRate = vm.hasDailyRate ? true : false;
  
  if(vm.exchangeRate){
    vm.text = 'EXCHANGE.REVIEW';
    vm.action = 'update';
  } else {
    vm.text = 'EXCHANGE.NEW_RATE';
    vm.action = 'create';
  } 


  // bind methods
  vm.submit = submit;
  vm.cancel = cancel;

  function handler(error) {
    throw error;
  }

  function submit(invalid) {
    if (invalid) { return; }
    vm.data.enterprise_id = vm.enterpriseCurrencyId;

    var rate = angular.copy(vm.data),
      creation = (vm.action === 'create'),
      promise;

    if(creation){
      delete vm.data.id;
    }  

    promise = (creation) ?
      Rates.create(rate) :
      Rates.update(rate.id, rate);

    promise
    .then(function (data) {
      var operation = creation ? 'create_success' : 'update_success';
      return $uibModalInstance.close(operation);
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
