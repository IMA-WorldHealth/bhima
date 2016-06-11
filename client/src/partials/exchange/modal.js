angular.module('bhima.controllers')
.controller('ExchangeRateModalController', ExchangeModalController);

ExchangeModalController.$inject = [
  'ExchangeRateService', 'CurrencyService', 'SessionService',
  '$uibModalInstance', 'NotifyService', 'data'
];

/**
 * @class ExchangeRateModalController
 *
 * @description
 * This controller is responsible for both creating and updating
 * exchange rates.
 */
function ExchangeModalController(Rates, Currencies, Session, ModalInstance, Notify, data) {
  var vm = this;

  // bind variables
  vm.data = data;

  vm.submit = submit;
  vm.cancel = cancel;

  vm.enterpriseId = Session.enterprise.id;
  vm.enterpriseCurrency = Currencies.format(Session.enterprise.currency_id);
  vm.selectedCurrency = Currencies.format(data.currency_id);
  vm.today = new Date();

  if (vm.data.id) {
    vm.text = 'EXCHANGE.REVIEW_RATE';
    vm.action = 'update';
  } else {
    vm.text = 'EXCHANGE.NEW_RATE';
    vm.action = 'create';
  }

  // bind methods
  vm.submit = submit;
  vm.cancel = cancel;

  // submit to the server
  function submit(form) {
    if (form.$invalid) { return; }

    vm.data.enterprise_id = vm.enterpriseId;

    var rate = angular.copy(vm.data);
    var creation = (vm.action === 'create');
    var promise;

    if (creation) {
      delete vm.data.id;
    }

    promise = (creation) ?
      Rates.create(rate) :
      Rates.update(rate.id, rate);

    return promise
      .then(function (data) {
        var operation = creation ? 'create_success' : 'update_success';
        return ModalInstance.close(operation);
      })
      .catch(Notify.handleError);
  }

  function cancel() {
    ModalInstance.dismiss();
  }
}
