angular.module('bhima.components')
  .component('bhMultipleCashboxSelect', {
    templateUrl : 'modules/templates/bhMultipleCashBoxSelect.tmpl.html',
    controller  : MultipleCashboxSelectController,
    bindings    : {
      onChange : '&',
      cashboxIds : '<?',
      label : '@?',
      required : '<?',
      validationTrigger : '<?',
    },
  });

MultipleCashboxSelectController.$inject = [
  'CashboxService', 'NotifyService',
];

/**
 * Multiple Cashbox Selection Component
 *
 */
function MultipleCashboxSelectController(Cashbox, Notify) {
  const $ctrl = this;

  $ctrl.$onInit = function onInit() {
    // label to display
    $ctrl.label = $ctrl.label || 'FORM.LABELS.CASHBOX';

    // init the model
    $ctrl.cashboxIds = $ctrl.cashboxIds || [];

    // load all Cashbox
    Cashbox.read()
      .then((cashboxes) => {
        $ctrl.cashboxes = cashboxes;
      })
      .catch(Notify.handleError);
  };

  // fires the onSelectCallback bound to the component
  $ctrl.handleChange = (models) => {
    $ctrl.onChange({ cashboxes : models });
  };
}
