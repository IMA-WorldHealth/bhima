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
  vm.symbol = Currencies.symbol;
  vm.cancel = function () { ModalInstance.dismiss(); };

  // this turns on and off the currency select input
  vm.hasMultipleCurrencies = false;

  Currencies.read()
    .then(function (currencies) {
      vm.currencies = currencies
        .filter(function (currency) {
          return currency.id !== Session.enterprise.currency_id;
        });

      // use the first currency in the list
      vm.rate.currency = vm.currencies[0];

      // if there are more than a single other currency (besides the enterprise currency)
      // show the currency selection input
      if (vm.currencies.length > 1) {
        vm.hasMultipleCurrencies = true;
      }
    })
    .catch(Notify.handleError);

  function submit(form) {
    if (form.$invalid) { return; }

    // gather form data for submission
    var data = angular.copy(vm.rate);

    data.enterprise_id = Session.enterprise.id;

    // TODO clean this up with proper ui-select syntax when internet available
    var currency = vm.rate.currency;
    data.currency_id = currency.id;

    return Exchange.create(data)
      .then(function () {
        ModalInstance.close();
      });
  }
}

