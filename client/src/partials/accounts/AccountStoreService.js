/** @todo
 *  cache service should be able to be defined with the following
 *  - function to use to populate the store
 *  - store to use
 */
angular.module('bhima.services')
.service('AccountStoreService', AccountStoreService);

AccountStoreService.$inject = ['$q', 'AccountService', 'AccountTypeService', 'Store'];

// Temporary service until caching API services is well designed
function AccountStoreService($q, Accounts, AccountTypes, Store) {
  var service = this;
  var initialLoad = true;
  var initTypeLoad = true;

  var accounts = new Store();
  var accountTypes = new Store();

  var request = Accounts.read(null, {detailed : 1})
    .then(function (result) {
      accounts.setData(result);
      initialLoad = false;
      return accounts.data;
    });

  var typeRequest = AccountTypes.getAccountType()
    .then(function (result) {
      accountTypes.setData(result);
      initTypeLoad = false;
      return accountTypes.data;
    });

  service.accounts = accountStore;
  service.types = typeStore;

  function accountStore() {
    if (initialLoad) {
      return request.then(function () {
        return accounts;
      });
    }
    return $q.resolve(accounts);
  }

  function typeStore() {
    if (initTypeLoad) {
      return typeRequest.then(function () {
        return accountTypes;
      });
    }
    return $q.resolve(accountTypes);
  }
}
