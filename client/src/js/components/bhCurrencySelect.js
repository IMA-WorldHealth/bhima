angular.module('bhima.components')
  .component('bhCurrencySelect', {
    controller  : bhCurrencySelect,
    templateUrl : 'modules/templates/bhCurrencySelect.tmpl.html',
    bindings    : {
      currencyId        : '=',
      validationTrigger : '<',
      disableIds        : '<?',
      onChange          : '&?',
      cashboxId         : '<?',
    },
  });

bhCurrencySelect.$inject = ['CurrencyService'];

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
 *
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
 *
 * @requires services/CurrencyService
 */
function bhCurrencySelect(Currencies) {
  var $ctrl = this;
  var isArray = angular.isArray;

  $ctrl.$onInit = function onInit() {
    // load all the available currencies
    Currencies.read()
      .then(function (currencies) {
        // cache a label for faster view rendering
        currencies.forEach(function (currency) {
          currency.label = Currencies.format(currency.id);
        });

        $ctrl.currencies = currencies;
      });

    $ctrl.valid = true;

    // default to noop() if an onChange() method was not passed in
    $ctrl.onChange = $ctrl.onChange || angular.noop;
  };

  $ctrl.$onChanges = function onChanges(changes) {
    if (changes.disableIds) {
      digestDisableIds(changes.disableIds.currentValue);
    }

    if (changes.onChange) {
      $ctrl.onChange = changes.onChange.currentValue;
    }
  };

  function digestDisableIds(disabledIds) {

    // make sure there is something to digest
    if (!isArray(disabledIds)) { return; }
    if (!isArray($ctrl.currencies)) { return; }

    // loop through the currencies, disabling the currencies with ids in the
    // disableIds array.
    $ctrl.currencies.forEach(function (currency) {
      var disabled = disabledIds.indexOf(currency.id) > -1;
      currency.disabled = disabled;
      currency.title = disabled ?  'FORM.INFO.DISABLED_CURRENCY' : '';
    });

    // make sure we haven't defaulted to a currency that is not allowed by this casbhox
    // if so, delete it
    if (disabledIds.indexOf($ctrl.currencyId) > -1) {
      delete $ctrl.currencyId;
    }

    // if the two array lengths are equal, it means every currency is disabled.
    // there is no possible $valid state.
    $ctrl.valid = ($ctrl.currencies.length !== disabledIds.length);
    $ctrl.form.currency.$setValidity('currency', $ctrl.valid);
  }
}
