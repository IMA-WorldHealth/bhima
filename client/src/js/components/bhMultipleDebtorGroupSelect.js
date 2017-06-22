angular.module('bhima.components')
  .component('bhMultipleDebtorGroupSelect', {
    templateUrl : 'modules/templates/bhMultipleDebtorGroupSelect.tmpl.html',
    controller  : DebtorGroupSelectController,
    transclude  : true,
    bindings    : {
      label            : '@?',
      onSelectCallback : '&',
      formName         : '@?',
      required         : '<?'      
    },
  });

DebtorGroupSelectController.$inject = [
  'DebtorGroupService'
];

/**
 * User selection component
 *
 */
function DebtorGroupSelectController(DebtorGroups) {
  var $ctrl = this;

  $ctrl.$onInit = function onInit() {
    //label to display
    $ctrl.label = $ctrl.label || 'FORM.LABELS.DEBTOR_GROUP';

    // fired when an debtor group has been selected
    $ctrl.onSelectCallback = $ctrl.onSelectCallback || angular.noop;

    // default for form name
    $ctrl.formName = $ctrl.formName || 'DebtorGroupForm';

    // load all Debtor Group
    DebtorGroups.read()
      .then(function (dgs) {
        $ctrl.debtorGroups = dgs;
      });
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = function (models) {
    $ctrl.onSelectCallback({ debtorGroups : models });
  };
}
