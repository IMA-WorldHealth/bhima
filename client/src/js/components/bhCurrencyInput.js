/**
 * Currency Input Component
 *
 * This is a currency input form based on <input type="number">, with specific
 * validation based on the currency being validated.
 */

function CurrencyInputController(precision) {
  var ctrl = this;  
  ctrl.block = false;

  /** atach empty function if no callback is provided**/
  ctrl.onCurrencyChange = ctrl.onCurrencyChange || angular.noop();  

  function handleCurrencyChange (currency){  
    
    /**the currency input component can update this object, to manage his own view**/
    ctrl.currency = currency;     

    /** block the input if the currency can not be supported**/
    if(ctrl.unSupportedCurrencyIds){
      ctrl.block =  (ctrl.unSupportedCurrencyIds.indexOf(currency.id) > -1) ? true : false;
    }

    /** call the callback to handle currency change situation**/
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
    unSupportedCurrencyIds : '<',
    errorMessage : '@',
    currencyId : '=',       
    model : '=',            
    maxValue : '<',         
    form : '<',             
    validationTrigger : '<',
    onCurrencyChange  : '&'
  }
});
