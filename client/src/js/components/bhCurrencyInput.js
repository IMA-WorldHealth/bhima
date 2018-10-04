angular.module('bhima.components')
  .component('bhCurrencyInput', {
    templateUrl : 'modules/templates/bhCurrencyInput.tmpl.html',
    controller : CurrencyInputController,
    bindings : {
      currencyId : '<', // one-way binding
      model : '=', // two way binding
      validationTrigger : '<', // one-way binding
      label : '@?',
      disabled : '<?',
      min   : '@?',
    },
  });

CurrencyInputController.$inject = ['CurrencyService'];

/**
 * Currency Input Component
 *
 * This is a currency input form based on <input type="number">, with specific
 * validation based on the currency being validated.
 */
function CurrencyInputController(Currencies) {
  const $ctrl = this;
  const isDefined = angular.isDefined;

  // translated label for the form input
  $ctrl.label = $ctrl.label || 'FORM.LABELS.AMOUNT';

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
      .then((currency) => {
        $ctrl.currency = currency;
      });
  }
}
