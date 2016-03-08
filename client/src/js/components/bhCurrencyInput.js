/**
 * Currency Input Component
 *
 * This is a currency input form based on <input type="number">, with specific
 * validation based on the currency being validated.
 */

function CurrencyInputController() {
  var ctrl = this;

  /**the currency input component can update this object, to manage his own view**/

  function handleCurrencyChange (currency){
    ctrl.currency = currency; 
    ctrl.onCurrencyChange({currency : currency});    
  }

  ctrl.handleCurrencyChange = handleCurrencyChange;
}

CurrencyInputController.$inject =  ['CurrencyService', 'AppCache', 'SessionService', '$scope'];

angular.module('bhima.components')
.component('bhCurrencyInput', {
  templateUrl : 'partials/templates/bhCurrencyInput.tmpl.html',
  controller: CurrencyInputController,
  bindings : {
    onCurrencyChange : '&', //external method
    currencyId : '<',       // one-way binding
    persistCurrency : '<',  // one way binding
    model : '=',            // two way binding
    maxValue : '<',         // one way binding
    form : '<',             // one-way binding
    validationTrigger : '<' // one-way binding
  }
});
