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
      filter            : '<',
    },
  });

DebtorGroupSelectController.$inject = [
  'DebtorGroupService',
];

/**
 * Debtor Group selection component
 *
 */
function DebtorGroupSelectController(DebtorGroup) {
  var $ctrl = this;

  $ctrl.$onInit = function onInit() {
    var filters = $ctrl.filter || {};

    // fired when a Debtor Group has been selected
    $ctrl.onSelectCallback = $ctrl.onSelectCallback || angular.noop;

    // default for form name
    $ctrl.name = $ctrl.name || 'DebtorForm';

    // translated label for the form input
    $ctrl.label = $ctrl.label || 'FORM.LABELS.DEBTOR_GROUP';

    // load all Debtor Group
    DebtorGroup.read(null, filters)
      .then(function (debtorGroups) {
        $ctrl.debtorGroups = debtorGroups;
      });

    $ctrl.valid = true;
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = function ($item) {
    $ctrl.onSelectCallback({ debtorGroup : $item });
  };
}