angular.module('bhima.components')
  .component('bhAccountSelect', {
    templateUrl : 'modules/templates/bhAccountSelect.tmpl.html',
    controller  : AccountSelectController,
    transclude  : true,
    bindings    : {
      accountId        : '<',
      onSelectCallback : '&',
      disable          : '<?',
      required         : '<?',
      accountTypeId :  '<?',
      label            : '@?',
      excludeTitleAccounts : '@?',
    },
  });

AccountSelectController.$inject = [
  'AccountService', 'FormatTreeDataService', 'bhConstants', '$scope',
];

/**
 * Account selection component
 */
function AccountSelectController(Accounts, FormatTreeData, bhConstants, $scope) {
  const $ctrl = this;

  // fired at the beginning of the account select
  $ctrl.$onInit = function $onInit() {

    // cache the title account ID for convenience
    $ctrl.TITLE_ACCOUNT_ID = bhConstants.accounts.TITLE;

    // translated label for the form input
    $ctrl.label = $ctrl.label || 'FORM.LABELS.ACCOUNT';

    if (!angular.isDefined($ctrl.required)) {
      $ctrl.required = true;
    }

    $ctrl.excludeTitleAccounts = angular.isDefined($ctrl.excludeTitleAccounts)
      ? $ctrl.excludeTitleAccounts : true;

    // load accounts
    loadHttpAccounts();
  };

  // loads accounts from the server
  function loadHttpAccounts() {
    const detail = $ctrl.accountTypeId;
    const detailed = detail ? 1 : 0;
    const params = { detailed };

    if ($ctrl.accountTypeId) {
      params.type_id = $ctrl.accountTypeId
        .split(',')
        .map(num => parseInt(num, 10));
    }

    // NOTE: this will hide all "hidden" accounts
    params.hidden = 0;

    // load accounts
    Accounts.read(null, params)
      .then(elements => {
        // bind the accounts to the controller
        let accounts = FormatTreeData.order(elements);

        if ($ctrl.excludeTitleAccounts) {
          accounts = Accounts.filterTitleAccounts(accounts);
        }

        $ctrl.accounts = accounts;
      });
  }

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = function onSelect($item) {
    $ctrl.onSelectCallback({ account : $item });

    // alias the AccountForm name so that we can find it via filterFormElements
    $scope.AccountForm.$bhValue = $item.id;
  };
}
