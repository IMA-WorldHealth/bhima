angular.module('bhima.controllers')
  .controller('ExchangeRateModalController', ExchangeRateModalController);

ExchangeRateModalController.$inject = [
  '$uibModalInstance', 'ExchangeRateService', 'CurrencyService', 'SessionService', 'NotifyService'
];

/**
 * This modal is a generic exchange rate modal that allows a user to
 * set the exchange rate from virtually anywhere in the application.
 *
 */
function ExchangeRateModalController(ModalInstance, Exchange, Currencies, Session, Notify) {
  var vm = this;

  // bind defaults
  vm.timestamp = new Date();
  vm.date = new Date();
  vm.enterprise = Session.enterprise;

  vm.rate = {
    date : new Date(),
  };

  vm.submit = submit;
  vm.format = Currencies.format;
  vm.cancel = function () { ModalInstance.dismiss(); };

  Currencies.read()
    .then(function (currencies) {
      vm.currencies = currencies
        .filter(function (currency) {
          return currency.id !== Session.enterprise.currency_id;
        });

      // use the first currency in the list
      vm.rate.currency_id = vm.currencies[0];
    })
    .catch(Notify.handleError);

  function submit(form) {
    if (form.$invalid) { return; }

    vm.rate.enterprise_id = Session.enterprise.id;

    // TODO clean this up with proper Ui-select syntax when internet available
    var currency = vm.rate.currency_id;
    vm.rate.currency_id = currency.id;

    return Exchange.create(vm.rate)
      .then(function () {
        ModalInstance.close();
      });
  }
}

