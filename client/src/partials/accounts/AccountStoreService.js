angular.module('bhima.services')
.service('AccountStoreService', AccountStoreService);

AccountStoreService.$inject = ['$q', 'AccountService', 'Store'];

// Temporary service until caching API services is well designed
function AccountStoreService($q, Accounts, Store) { 
  var service = this;
  var initialLoad = true;
  
  var accounts = new Store();
  
  var request = Accounts.read(null, {detailed : 1})
    .then(function (result) { 
      accounts.setData(result);
      initialLoad = false;
      console.log('returning newly set cache');
      return accounts.data;
    });
  
  service.readCache = readCache;
  service.store = store;
  
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
  
  window.serv = this;
  console.log('account store service');
}