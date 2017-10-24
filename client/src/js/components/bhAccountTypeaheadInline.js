angular.module('bhima.components')
  .component('bhAccountTypeaheadInline', {
    templateUrl : 'modules/templates/bhAccountTypeaheadInline.html',
    controller  : AccountTypeaheadInlineController,
    bindings    : {
      accountId        : '<',
      onSelectCallback : '&',
      name             : '@?',
    },
  });

AccountTypeaheadInlineController.$inject = [
  'AccountService', '$timeout', '$scope', 'Store',
];

/**
 * Inline Account Typeahead
 *
 * This component is much more limited in options compared to the bhAccountSelect.
 * It is intended to be used in ui-grids to facilitate entering accounts easily
 * without having a heavy uiSelect component.
 */
function AccountTypeaheadInlineController(Accounts, $timeout, $scope, Store) {
  var $ctrl = this;
  var store = new Store();

  // fired at the beginning of the account select
  $ctrl.$onInit = function $onInit() {
    // fired when an account has been selected
    $ctrl.onSelectCallback = $ctrl.onSelectCallback || angular.noop;

    // default for form name
    $ctrl.name = $ctrl.name || 'AccountForm';

    // load accounts
    loadAccounts();

    // alias the name as AccountForm
    $timeout(aliasComponentForm);
  };

  // this makes the HTML much more readable by reference AccountForm instead of the name
  function aliasComponentForm() {
    $scope.AccountForm = $scope[$ctrl.name];
  }

  // loads accounts from the server
  function loadAccounts() {
    Accounts.read()
      .then(function (elements) {
        // bind the accounts to the controller
        var accounts = Accounts.order(elements);
        $ctrl.accounts = Accounts.filterTitleAccounts(accounts);

        store.setData($ctrl.accounts);
      });
  }

  $ctrl.$onChanges = function $onChanges(changes) {
    var accountId = changes.accountId && changes.accountId.currentValue;
    if (accountId) {
      $ctrl.account = store.get(accountId);
    }
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = function onSelect($item) {
    $ctrl.onSelectCallback({ accountId : $item.id });

    // alias the AccountForm name so that we can find it via filterFormElements
    $scope[$ctrl.name].$bhValue = $item.id;
  };
}
