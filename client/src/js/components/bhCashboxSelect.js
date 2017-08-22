angular.module('bhima.components')
  .component('bhCashboxSelect', {
    templateUrl : 'modules/templates/bhCashboxSelect.tmpl.html',
    controller  : CashboxSelectController,
    // transclude  : true,
    bindings    : {
      cashboxId         : '<',
      disable           : '<?',
      onSelectCallback  : '&',
      name              : '@?',
      label             : '@?',
      required          : '<?',
      validationTrigger : '<',
    },
  });

CashboxSelectController.$inject = [
  'CashboxService', 'NotifyService'
];

/**
 * Cashbox selection component
 *
 */
function CashboxSelectController(Cashbox, Notify) {
  var $ctrl = this;

  $ctrl.$onInit = function onInit() {
    // fired when a Cashbox has been selected
    $ctrl.onSelectCallback = $ctrl.onSelectCallback || angular.noop;

    // default for form name
    $ctrl.name = $ctrl.name || 'CashboxForm';

    // translated label for the form input
    $ctrl.label = $ctrl.label || 'FORM.SELECT.CASHBOX';

    // load all Cashbox
    Cashbox.read(null, { detailed: 1 })
      .then(function (cashboxes) {
        cashboxes.forEach(function (cashbox) {
          cashbox.hrlabel = cashbox.label + ' ' + cashbox.symbol;
        });
        
        $ctrl.cashboxes = cashboxes;
      })
      .catch(Notify.handleError);

    $ctrl.valid = true;
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = function ($item) {
    $ctrl.onSelectCallback({ cashbox : $item });
  };
}    