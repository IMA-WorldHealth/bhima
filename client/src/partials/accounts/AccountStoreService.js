/** @todo rename read cache and store to specifically be about accounts */
/** @todo
 *  cache service should be able to be defined with the following
 *  - function to use to populate the store 
 *  - store to use 
 *  
 *  it should expose the store and the data through different methods
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
      console.log('returning newly set cache');
      return accounts.data;
    });
  
  var typeRequest = AccountTypes.getAccountType()
    .then(function (result) {
      accountTypes.setData(result);
      initTypeLoad = false;
      return accountTypes.data;
    });
  
  service.readCache = readCache;
  service.readTypes = readTypes;
  service.store = store;
  service.typeStore = typeStore;
  
  function readTypes() {
    if (initTypeLoad) { 
      console.log('types not cachced - returning promise');
      return typeRequest;
    }
    console.log('types cached - data resolved');
    return $q.resolve(accountTypes.data);
  }
  
  // returns a promise containing an account store
  function readCache() { 
    if (initialLoad) { 
      console.log('cache request - not ready');
      return request;
    } 
    console.log('returning cached version');
    return $q.resolve(accounts.data);
  }
  
  function store() { 
    if (initialLoad) { 
      console.log('store request - not ready');
      return request.then(function () { 
        console.log('returning accounts');
        return accounts;
      });
    }
    
    console.log('returning cached store');
    return $q.resolve(accounts);
  }
  
  function typeStore() { 
    if (initTypeLoad) { 
      console.log('store request - not ready');
      return typeRequest.then(function () { 
        console.log('returning account types');
        return accountTypes;
      });
    }
    
    console.log('returning cached store');
    return $q.resolve(accountTypes);
  }
}