angular.module('bhima.components')
.component('bhCurrencyInput', {
  templateUrl : 'partials/templates/bhCurrencyInput.tmpl.html',
  controller: CurrencyInputController,
  bindings : {
    currencyId : '<',       // one-way binding
    model : '=',            // two way binding
    form : '<',             // one-way binding,
    validationTrigger : '<' // one-way binding
  }
});

CurrencyInputController.$inject = [ 'CurrencyService', '$scope' ];

/**
 * Currency Input Component
 *
 * This is a currency input form based on <input type="number">, with specific
 * validation based on the currency being validated.
 */
function CurrencyInputController(Currencies, $scope) {
  var ctrl = this;

  // update bindings when someone changes the currency
  $scope.$watch('$ctrl.currencyId', loadCurrency);

  /** @private loads a particular currency from the server */
  function loadCurrency() {

    // if the currency id doesn't exist, exit
    if (!ctrl.currencyId) { return; }

    // load currency from the currency service
    Currencies.detail(ctrl.currencyId)
      .then(function (currency) {

        // bind the currency to the controller
        ctrl.currency = currency;
      });
  }
}
