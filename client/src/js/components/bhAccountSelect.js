angular.module('bhima.components')
  .component('bhAccountSelect', {
    templateUrl : 'modules/templates/bhAccountSelect.tmpl.html',
    controller  : bhAccountSelectController,
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

bhAccountSelectController.$inject = [
  'AccountService', 'FormatTreeDataService', 'bhConstants', '$scope',
];

/**
 * Account selection component
 */
function bhAccountSelectController(Accounts, FormatTreeData, bhConstants, $scope) {
  const $ctrl = this;

  const TITLE_ACCOUNT_TYPE_ID = bhConstants.accounts.TITLE;

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
    return loadHttpAccounts();
  };

  /**
   * @function parseAccountTypeIds
   *
   * @description
   * Parses the account type id binding if it is a string or integer and returns an array of
   * integers.  Also adds in the title account now matter what to the account type array shipped
   * to the server so that we can always build a tree.
   */
  function parseAccountTypeIds(types) {
    let parsed;
    if (Array.isArray(types)) {
      parsed = types.map(type => parseInt(type, 10));
    } else if (typeof types === 'string') {
      parsed = types.split(',')
        .filter(type => type !== '')
        .map(type => parseInt(type, 10));
    } else if (typeof types === 'number') {
      parsed = [types];
    } else {
      throw new Error('Cannot parse account types from '.concat(types));
    }
    return [TITLE_ACCOUNT_TYPE_ID, ...parsed];
  }

  // loads accounts from the server
  function loadHttpAccounts() {
    const params = {};

    if ($ctrl.accountTypeId) {
      params.detailed = 1;
      params.type_id = parseAccountTypeIds($ctrl.accountTypeId);
    } else {
      params.detailed = 0;
    }

    // NOTE: this will hide all "hidden" accounts
    params.hidden = 0;

    // load accounts
    return Accounts.read(null, params)
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
