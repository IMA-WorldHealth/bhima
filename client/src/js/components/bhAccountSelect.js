angular.module('bhima.components')
  .component('bhAccountSelect', {
    templateUrl : 'modules/templates/bhAccountSelect.tmpl.html',
    controller : AccountSelectController,
    bindings: {
      accountId        : '<',
      disable          : '<',
      onSelectCallback : '&?',
      required         : '<?',
      label            : '@?',
      name             : '@?',
    }
  });

AccountSelectController.$inject = [
  'AccountService', 'appcache', '$timeout', 'bhConstants', '$scope',
];

/**
 * Account selection component
 *
 */
function AccountSelectController(Accounts, AppCache, $timeout, bhConstants, $scope) {
  var $ctrl = this;

  var hasCachedAccounts = false;
  var cache = new AppCache('bhAccountSelect');

  // cache accounts locally for three seconds
  var CACHE_TIMEOUT = 3000;

  // fired at the beginning of the account select
  $ctrl.$onInit = function () {
    // load accounts
    loadAccounts();

    // cache the title account ID for convenience
    $ctrl.TITLE_ACCOUNT_ID = bhConstants.accounts.TITLE;

    // translated label for the form input
    $ctrl.label = $ctrl.label || 'FORM.LABELS.ACCOUNT';

    // fired when an account has been selected
    $ctrl.onSelectCallback = $ctrl.onSelectCallback || angular.noop;

    // used to disable title accounts in the select list
    $ctrl.disableTitleAccounts = $ctrl.disableTitleAccounts || true;

    // default for form name
    $ctrl.name = $ctrl.name || 'AccountForm';

    if (!angular.isDefined($ctrl.required)) {
      $ctrl.required = true;
    }


    // alias the name as AccountForm
    $timeout(aliasComponentForm);
  };

  // this makes the HTML much more readable by reference AccountForm instead of the name
  function aliasComponentForm() {
    $scope.AccountForm = $scope[$ctrl.name];
  }

  /**
   * Checks if there the accounts have been updated recently and loads
   * the cached versions if so.  Otherwise, it fetches the accounts from
   * the server and caches them locally.
   */
  function loadAccounts() {
    if (hasCachedAccounts) {
      loadCachedAccounts();
    } else {
      loadHttpAccounts();
    }
  }

  // simply reads the accounts out of localstorage
  function loadCachedAccounts() {
    $ctrl.accounts = cache.accounts;
  }

  // loads accounts from the server
  function loadHttpAccounts() {

    // load accounts
    Accounts.read()
      .then(function (elements) {

        // bind the accounts to the controller
        $ctrl.accounts = Accounts.order(elements);

        // writes the accounts into localstorage
        //cacheAccounts($ctrl.accounts);

        // set the timeout for removing cached accounts
        //$timeout(removeCachedAccounts, CACHE_TIMEOUT);
      });
  }

  // write the accounts to localstorage
  function cacheAccounts(accounts) {
    hasCachedAccounts = true;
    cache.accounts = accounts;
  }

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = function ($item, $model) {
    $ctrl.onSelectCallback({ account : $item });

    // alias the AccountForm name so that we can find it via filterFormElements
    $scope[$ctrl.name].$bhValue = $item.id;
  };

  // removes the accounts from localstorage
  function removeCachedAccounts() {
    hasCachedAccounts = false;
    delete cache.accounts;
  }
}
