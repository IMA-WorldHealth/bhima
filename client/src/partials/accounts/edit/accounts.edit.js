angular.module('bhima.controllers')
.controller('AccountEditController', AccountEditController);

AccountEditController.$inject = ['$state', 'AccountStoreService', 'NotifyService'];

function AccountEditController($state, AccountStore) {
  var vm = this;
  var id = $state.params.id;
  
  vm.close = close;
  vm.account = {};
  
  vm.states = {
    create : 'accounts.create'
  };
  
  vm.accountFailed = null;
   
  // alias this comparison as it is used many times in the template
  console.log(id);
  AccountStore.store()
      .then(function (store) {

        vm.store = angular.copy(store);
        vm.store.post({
          id : 0,
          label : 'ROOT ACCOUNT',
          hrlabel : '0 ROOT ACCOUNT'
        });
        
        vm.accounts = store.data;

        console.log('acc', vm.accounts);
        
        if (angular.isDefined(id)) {
          var account = store.get(id);
          if (!account) {
            
            /** @todo fake not found - this should be handled in the store */
            var notfound = new Error('Not Found');
            notfound.data = {}; 
            notfound.data.status = 404;
            notfound.data.code = 'ERRORS.NOT_FOUND';
            throw notfound;
          }
          
          vm.account = account;
          vm.account.parent = vm.store.get(vm.account.parent);
        } else {
          console.log('set root', vm.account.parent);
          setRootAccount();
          console.log('root root', vm.account.parent);
        }
      })
      .catch(function (error) { 
        // All modals of this type will need to handle this error - as this is not done through the Notify 
        // service this should be designed 
        vm.accountFailed = error.data;
      });
  
  
 /* 
  AccountStore.readCache()
    .then(function (result) {

      vm.accounts = angular.copy(result);
      vm.accounts.push({
        id : 0,
        label : 'ROOT ACCOUNT',
        hrlabel : '0 ROOT ACCOUNT'
      });
    
      console.log(vm.accounts);
      
      if (!id) {
        setRootAccount()
      } else { 
        
      }
    });*/
  
  vm.state = angular.copy($state.current.name);
  vm.isCreateState = vm.state === vm.states.create;
  
  function setRootAccount() { 
    console.log('st', vm.store);
    var root = vm.store.get(0);
    console.log('root', root);
    vm.account.parent = vm.store.get(0); 
  }
  
  function close() {
    // transition to the overall UI grid state - this modal will be cleaned up on state change 
    $state.go('^.list');
  }
}
