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
      name             : '@?',
      validationTrigger :  '<?',
    },
  });

AccountReferenceSelectController.$inject = [
  'AccountReferenceService', '$timeout', '$scope', 'NotifyService',
];

/**
 * Account Reference Select Controller
 */
function AccountReferenceSelectController(AccountReferences, $timeout, $scope, Notify) {
  const $ctrl = this;

  // fired at the beginning of the account configuration select
  $ctrl.$onInit = function $onInit() {
    // translated label for the form input
    $ctrl.label = $ctrl.label || 'FORM.LABELS.ACCOUNT_CONFIGURATION';

    // fired when an account configuration has been selected
    $ctrl.onSelectCallback = $ctrl.onSelectCallback || angular.noop;

    // default for form name
    $ctrl.name = $ctrl.name || 'AccountReferenceForm';


    if (!angular.isDefined($ctrl.required)) {
      $ctrl.required = true;
    }

    AccountReferences.read()
      .then(accountReferences => {
        $ctrl.accountReferences = accountReferences;
      })
      .catch(Notify.handleError);

    // alias the name as AccountReferenceForm
    $timeout(aliasComponentForm);
  };

  // this makes the HTML much more readable by reference AccountReferenceForm instead of the name
  function aliasComponentForm() {
    $scope.AccountReferenceForm = $scope[$ctrl.name];
  }

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = function onSelect($item) {
    $ctrl.onSelectCallback({ accountReference : $item });

    // alias the AccountReferenceForm name so that we can find it via filterFormElements
    $scope[$ctrl.name].$bhValue = $item.id;
  };
}
