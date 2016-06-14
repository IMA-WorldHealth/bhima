angular.module('bhima.controllers')
.controller('AccountEditController', AccountEditController);

AccountEditController.$inject = ['$state', 'AccountService', 'NotifyService'];

function AccountEditController($state, Accounts) {
  var vm = this;
  var id = $state.params.id;
  
  vm.close = close;

  vm.states = {
    create : 'accounts.create'
  };
  
  vm.accountFailed = null;
   
  // alias this comparison as it is used many times in the template
  console.log(id);
  
  if (angular.isDefined(id)) { 
    Accounts.read(id)
      .then(function (result) { 
        console.log('got', result);
        vm.account = result;
      })
      .catch(function (error) { 
        // All modals of this type will need to handle this error - as this is not done through the Notify 
        // service this should be designed 
        vm.accountFailed = error.data;
      });
  }

  vm.state = angular.copy($state.current.name);
  vm.isCreateState = vm.state === vm.states.create;
  
  function close() {
    // transition to the overall UI grid state - this modal will be cleaned up on state change 
    $state.go('^.list');
  }
}
