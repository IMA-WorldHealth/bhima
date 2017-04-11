angular.module('bhima.components')
  .component('bhCurrencyInput', {
    templateUrl : 'modules/templates/bhCurrencyInput.tmpl.html',
    controller: CurrencyInputController,
    bindings : {
      currencyId : '<',       // one-way binding
      model : '=',            // two way binding
      validationTrigger : '<' // one-way binding
    }
  });

CurrencyInputController.$inject = [ 'CurrencyService' ];

/**
 * Currency Input Component
 *
 * This is a currency input form based on <input type="number">, with specific
 * validation based on the currency being validated.
 */
function CurrencyInputController(Currencies) {
  var $ctrl = this;
  var isDefined = angular.isDefined;

  $ctrl.$onChanges = function onChanges(changes) {
    if (changes.currencyId) {
      loadCurrency(changes.currencyId.currentValue);
    }
  };

  /* @private loads a particular currency from the server */
  function loadCurrency(id) {
    if (!isDefined(id)) { return; }

    // load currency from the currency service
    Currencies.detail(id)
      .then(function (currency) {
        $ctrl.currency = currency;
      });
  }
}
