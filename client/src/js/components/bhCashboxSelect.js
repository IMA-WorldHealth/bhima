angular.module('bhima.components')
  .component('bhCashboxSelect', {
    templateUrl : 'modules/templates/bhCashboxSelect.tmpl.html',
    controller  : CashboxSelectController,
    transclude  : true,
    bindings    : {
      cashboxId         : '<',
      onSelectCallback  : '&',
      disable           : '<?',
      name              : '@?',
      label             : '@?',
      required          : '<?',
      validationTrigger : '<?',
      restrictToUser    : '<?',
    },
  });

CashboxSelectController.$inject = [
  'CashboxService', 'NotifyService', 'SessionService',
];

/**
 * Cashbox selection component
 *
 */
function CashboxSelectController(Cashbox, Notify, Session) {
  const $ctrl = this;

  $ctrl.$onInit = function onInit() {
    // default for form name
    $ctrl.name = $ctrl.name || 'CashboxForm';

    // translated label for the form input
    $ctrl.label = $ctrl.label || 'FORM.SELECT.CASHBOX';

    const restrictCashboxList = angular.isDefined($ctrl.restrictToUser)
      ? $ctrl.restrictToUser : true;

    const params = { detailed : 1 };
    if (restrictCashboxList) {
      params.user_id = Session.user.id;
    }

    // load all Cashbox
    Cashbox.read(null, params)
      .then(cashboxes => {
        cashboxes.forEach(cashbox => {
          cashbox.hrlabel = `${cashbox.label} ${cashbox.symbol}`;
        });

        $ctrl.cashboxes = cashboxes;
      })
      .catch(Notify.handleError);

    $ctrl.valid = true;
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = ($item) => {
    $ctrl.onSelectCallback({ cashbox : $item });
  };
}
