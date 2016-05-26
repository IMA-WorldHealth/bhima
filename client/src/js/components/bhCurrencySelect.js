angular.module('bhima.components')
.component('bhCurrencySelect', {
  controller : bhCurrencySelect,
  templateUrl : 'partials/templates/bhCurrencySelect.tmpl.html',
  bindings : {
    validationTrigger: '<',
    currencyId: '=',
    disableIds: '<?',
    onChange: '&?',
    cashboxId: '<?'
  }
});

bhCurrencySelect.$inject = [ '$scope', 'CurrencyService' ];

/**
 * @class bhCurrencySelect
 *
 * @description
 * This is a radio button currency selection component for choosing currencies
 * in a form.  If a list of currencies are passed in, these are used instead of
 * the application's currencies.
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
 *  - [cashbox-id]
 *      the cashbox id of the bound cashbox
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
 */
function bhCurrencySelect($scope, Currencies) {
  var $ctrl = this;

  // bind the currency service to the view
  $ctrl.service = Currencies;
  $ctrl.valid = true;

  // default currencies to an empty list
  $ctrl.currencies = [];

  // default to noop() if an onChange() method was not passed in
  $ctrl.onChange = $ctrl.onChange || angular.noop();

  // load all the available currencies
  Currencies.read()
  .then(function (currencies) {

    // cache a label for faster view rendering
    currencies.forEach(function (currency) {
      currency.label = Currencies.format(currency.id);
    });

    $ctrl.currencies = currencies;
  });

  // watch the disabledIds array for changes, and disable the ids in the the
  // view based on which ids are present in it
  $scope.$watchCollection('$ctrl.disableIds', function (array) {
    if (!array) { return; }

    // loop through the currencies, disabling the currencies with ids in the
    // disabledIds array.
    $ctrl.currencies.forEach(function (currency) {
      currency.disabled = array.indexOf(currency.id) > -1;
    });

    // if the two array lengths are equal, it means every currency is disabled
    $ctrl.valid = ($ctrl.currencies.length !== array.length);
    $ctrl.form.currency.$setValidity('currency', $ctrl.valid);
  });
}
