/**
 * Currency Input Component
 *
 * This is a currency input form based on <input type="number">, with specific
 * validation based on the currency being validated.
 */

function CurrencyInputController(precision) {
  var ctrl = this;

  /** atach empty function if no callback is provided**/
  ctrl.onCurrencyChange = ctrl.onCurrencyChange || angular.noop();  

  function handleCurrencyChange (currency){
    /**the currency input component can update this object, to manage his own view**/
    ctrl.currency = currency; 

    /**the currency input component can not update the currencyId, it is not his responsability**/
    ctrl.onCurrencyChange({currency : currency});    
  }

  /** this is a custom form validation just for checking step**/
  function validate (){
    delete ctrl.form.currencyInputValue.$error.step;
    ctrl.form.currencyInputValue.$invalid = false;
    ctrl.form.currencyInputValue.$valid = true;
    ctrl.form.$valid = true;
    ctrl.form.$invalid = false;
  }

  /** this is a custom form validation just for checking step**/
  function invalidate (){
    ctrl.form.currencyInputValue.$error.step = true;
    ctrl.form.currencyInputValue.$invalid = true;
    ctrl.form.currencyInputValue.$valid = false;
    ctrl.form.$valid = false;
    ctrl.form.$invalid = true;
  }

  function checkModel() {
    (precision.scale(ctrl.model) % precision.scale(ctrl.currency.min_monentary_unit) !== 0) ?
      invalidate() : validate(); 
  }
  
  ctrl.handleCurrencyChange = handleCurrencyChange;
  ctrl.checkModel = checkModel;
}

CurrencyInputController.$inject = [ 'precision' ];

angular.module('bhima.components')
.component('bhCurrencyInput', {
  templateUrl : 'partials/templates/bhCurrencyInput.tmpl.html',
  controller: CurrencyInputController,
  bindings : {
    onCurrencyChange : '&', //external method
    currencyId : '<',       // one-way binding
    model : '=',            // two way binding
    maxValue : '<',         // one way binding
    form : '=',             // one-way binding
    validationTrigger : '<' // one-way binding
  }
});
