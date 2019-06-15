angular.module('bhima.components')
  .component('bhAccountReferenceSelect', {
    templateUrl : 'modules/templates/bhAccountReferenceSelect.tmpl.html',
    controller  : AccountReferenceSelectController,
    transclude  : true,
    bindings    : {
      accountReferenceId : '<',
      onSelectCallback : '&',
      required         : '<?',
      label            : '@?',
    },
  });

AccountReferenceSelectController.$inject = [
  'AccountReferenceService', 'NotifyService',
];

/**
 * Account Reference Select Controller
 */
function AccountReferenceSelectController(AccountReferences, Notify) {
  const $ctrl = this;

  // fired at the beginning of the account Reference select
  $ctrl.$onInit = function $onInit() {

    // translated label for the form input
    $ctrl.label = $ctrl.label || 'FORM.LABELS.REFERENCE';


    if (!angular.isDefined($ctrl.required)) {
      $ctrl.required = true;
    }
    $ctrl.accountLoading = true;
    AccountReferences.read()
      .then(accountReferences => {
        $ctrl.accountReferences = accountReferences;
      })
      .catch(Notify.handleError).finaly(() => {
        $ctrl.accountLoading = false;
      });
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = accountReference => $ctrl.onSelectCallback({ accountReference });
}
