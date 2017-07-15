angular.module('bhima.components')
  .component('bhDebtorGroupSelect', {
    templateUrl : 'modules/templates/bhDebtorGroupSelect.tmpl.html',
    controller  : DebtorGroupSelectController,
    transclude  : true,
    bindings    : {
      debtorGroupUuid   : '<',
      disable           : '<?',
      onSelectCallback  : '&',
      name              : '@?',
      label             : '@?',
      required          : '<?',
      validationTrigger : '<',
    },
  });

DebtorGroupSelectController.$inject = [
  'DebtorService',
];

/**
 * Debtor Group selection component
 *
 */
function DebtorGroupSelectController(Debtors) {
  var $ctrl = this;

  $ctrl.$onInit = function onInit() {
    // fired when a Debtor Group has been selected
    $ctrl.onSelectCallback = $ctrl.onSelectCallback || angular.noop;

    // default for form name
    $ctrl.name = $ctrl.name || 'DebtorForm';

    // translated label for the form input
    $ctrl.label = $ctrl.label || 'FORM.LABELS.DEBTOR_GROUP';

    // load all Debtor Group
    Debtors.groups()
      .then(function (debtorGroups) {
        $ctrl.debtorGroups = debtorGroups;
      });

    $ctrl.valid = true;
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = function ($item, model) {
    $ctrl.onSelectCallback({ debtorGroup : $item });
  };
}