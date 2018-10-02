angular.module('bhima.components')
  .component('bhAccountConfigSelect', {
    templateUrl : 'modules/templates/bhAccountConfigSelect.tmpl.html',
    controller  : AccountConfigSelectController,
    transclude  : true,
    bindings    : {
      configAccountingId : '<',
      onSelectCallback : '&',
      required         : '<?',
      label            : '@?',
      name             : '@?',
      validationTrigger :  '<?',
    },
  });

AccountConfigSelectController.$inject = [
  'ConfigurationAccountService', '$timeout', '$scope', 'NotifyService',
];

/**
 * Account Configuration Select Controller
 */
function AccountConfigSelectController(AccountConfigs, $timeout, $scope, Notify) {
  const $ctrl = this;

  // fired at the beginning of the account configuration select
  $ctrl.$onInit = function $onInit() {
    // translated label for the form input
    $ctrl.label = $ctrl.label || 'FORM.LABELS.ACCOUNT_CONFIGURATION';

    // fired when an account configuration has been selected
    $ctrl.onSelectCallback = $ctrl.onSelectCallback || angular.noop;

    // default for form name
    $ctrl.name = $ctrl.name || 'AccountConfigForm';


    if (!angular.isDefined($ctrl.required)) {
      $ctrl.required = true;
    }

    AccountConfigs.read()
      .then(accountConfigs => {
        $ctrl.accountConfigs = accountConfigs;
      })
      .catch(Notify.handleError);


    // alias the name as AccountConfigForm
    $timeout(aliasComponentForm);
  };

  // this makes the HTML much more readable by reference AccountConfigForm instead of the name
  function aliasComponentForm() {
    $scope.AccountConfigForm = $scope[$ctrl.name];
  }

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = function onSelect($item) {
    $ctrl.onSelectCallback({ accountConfig : $item });

    // alias the AccountConfigForm name so that we can find it via filterFormElements
    $scope[$ctrl.name].$bhValue = $item.id;
  };
}
