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
  var $ctrl = this;

  $ctrl.$onInit = function onInit() {
    // label to display
    $ctrl.label = $ctrl.label || 'FORM.LABELS.CASHBOX';

    // fired when a Cashbox has been selected or removed from the list
    $ctrl.onChange = $ctrl.onChange;

    // init the model
    $ctrl.cashboxIds = $ctrl.cashboxIds || [];

    // load all Cashbox
    Cashbox.read()
      .then(function (cashboxes) {
        $ctrl.cashboxes = cashboxes;
      })
      .catch(Notify.handleError);
  };

  // fires the onSelectCallback bound to the component
  $ctrl.handleChange = function (models) {
    $ctrl.onChange({ cashboxes : models });
  };
}