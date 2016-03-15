angular.module('bhima.components')
.component('bhCurrencySelect', {
  controller : bhCurrencySelect,
  templateUrl : 'partials/templates/bhCurrencySelect.tmpl.html',
  bindings : {
    disableIds : '<',
    errorMessage : '@',
    currencyId : '<',
    validationTrigger : '<',
    onChange : '&'
  }
});

bhCurrencySelect.$inject = [ 'CurrencyService', 'AppCache' ];

/**
 * Currency Selection Component
 *
 * This is a radio button currency selection component for choosing currencies
 * in a form.  If a list of currencies are passed in, these are used instead of
 * the application's currencies.
 *
 * @module components/bhCurrencySelect
 *
 * @example
 * <!-- simple usage -->
 * <bh-currency-select
 *   currency-id="ParentCtrl.model.currencyId"
 *   validation-trigger="ParentForm.$submitted"
 *   >
 * </bh-currency-select>
 *
 * <!--
 *   complex usage: filter the currencies and register an onChange event
 * -->
 * <bh-currency-select
 *   currency-id="ParentCtrl.model.currencyId"
 *   on-change="ParentCtrl.currencyChangeEvent()"
 *   disable-ids="ParentCtrl.disabledIds"
 *   validation-trigger="ParentForm.$submitted"
 *   >
 * </bh-currency-select>
 *
 * BINDINGS
 *  - [currency-id]
 *      The model value for the underlying `<input>`s.  This
 *      is two-way bound to the parent controller.
 *
 *  - [validation-trigger]
 *      a boolean that can be passed in
 *      to show validation messages will only show if this boolean is true.  It
 *      is useful to bind `ParentForm.$submitted` value to this attribute.
 *
 *  - [on-change]
 *      a callback bound the `ng-change` event on the `<input>`s.
 *
 *  - [disable-ids]
 *      an array of currency ids to be disabled as required.
 */
function bhCurrencySelect(Currencies, AppCache) {
  var ctrl = this;  
  var cache = AppCache('CurrencySelectComponent');

  /****/
  // ctrl.block = false;

  // default currencies to an empty list
  ctrl.currencies = [];

  // default to noop() if an onChange() method was not passed in
  ctrl.onChange = ctrl.onChange || angular.noop();

  init(cache.defaultCurrency);  

  function init (defaultCurrency){
    if(defaultCurrency) { ctrl.onChange({currency : defaultCurrency}); }   
  }

  function handleChange (){
    if(!ctrl.currencyId){ return; }

    var currencies = ctrl.currencies.filter(function (currency){
      return currency.id === ctrl.currencyId;
    });

    /** calling the callback**/      
    ctrl.onChange({ currency : currencies[0] });

    /** persist the selected currency as default**/
    cache.defaultCurrency = currencies[0];     
  }

  // load all the available currencies
  Currencies.read()
  .then(function (currencies) {

    // cache a label for faster view rendering
    currencies.forEach(function (currency) {
      currency.label = Currencies.format(currency.id);
      currency.disabled = (ctrl.disableIds.indexOf(currency.id) > -1) ? true : false;
    });

    ctrl.currencies = currencies;
  });

  ctrl.handleChange = handleChange;
}