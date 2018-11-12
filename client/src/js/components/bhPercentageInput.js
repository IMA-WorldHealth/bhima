angular.module('bhima.components')
  .component('bhPercentageInput', {
    templateUrl : 'modules/templates/bhPercentageInput.tmpl.html',
    controller : PercentageInputController,
    bindings : {
      currencyId : '<', // one-way binding
      model : '=', // two way binding
      validationTrigger : '<', // one-way binding
      label : '@?',
      symbol : '@?',
      disabled : '<?',
      min   : '@?',
      max   : '@?',
    },
  });

PercentageInputController.$inject = [];

/**
 * Percentage Input Component
 *
 * This is a Percentage input form based on <input type="number">, with specific
 * validation based on the min and max value.
 */
function PercentageInputController() {
  const $ctrl = this;

  // translated label for the form input
  $ctrl.label = $ctrl.label || 'FORM.LABELS.VALUE';
}
