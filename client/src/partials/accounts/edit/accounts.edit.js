/** @todo server should not accept not a number */
/** @todo server shouldn't allow bigger than an integer */
angular.module('bhima.controllers')
.controller('AccountEditController', AccountEditController);

AccountEditController.$inject = ['$rootScope', '$state', 'AccountStoreService', 'AccountService', 'NotifyService', 'util'];

/** @todo use loading button */
/** @todo re-factor account store (cache) + type API */
function AccountEditController($rootScope, $state, AccountStore, Accounts, Notify, util) {
  var vm = this;
  var id = $state.params.id;
  var parentId = $state.params.parentId;

  vm.close = close;
  vm.setRootAccount = setRootAccount;
  vm.updateAccount = updateAccount;

  vm.batchCreate = false;
  vm.account = null;

  vm.states = {
    create : 'accounts.create'
  };

  /** @todo this should be defined as an application wide constant */
  vm.ROOT_ACCOUNT = 0;
  vm.accountFailed = null;

  settupAccount();

  function settupAccount() {
    var cacheType = null;

    // alias this comparison as it is used many times in the template
    AccountStore.store()
        .then(function (store) {

          vm.store = angular.copy(store);
          vm.store.post({
            id : 0,
            label : 'ROOT ACCOUNT',
            hrlabel : '0 ROOT ACCOUNT'
          });

          vm.accounts = vm.store.data;

          /** @todo move to another function */
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

            vm.account = angular.copy(account);

            var accountParentId = vm.account.parent.id || vm.account.parent;
            vm.account.parent = vm.store.get(accountParentId);
            // vm.account.parent =

          } else {

            if (vm.account) {
              cacheType = vm.account.type_id;
            }

            vm.account = {};
            // the account does not already exist - check to see if there is a predefined parent
            if (parentId) {
              vm.account.parent = vm.store.get(parentId);
              // vm.account.parent = parentId;
            } else {
              // set root account
              vm.account.parent = vm.store.get(0);
            }
          }

          AccountStore.typeStore()
            .then(function (result) {
              vm.typeStore = angular.copy(result);

              vm.types = vm.typeStore.data;


              if (id) {
                // var accountId = vm.account.type_id.id || vm.account.type_id;
                // vm.account.type_i;
              } else {

                vm.account.type_id = cacheType || vm.types[0].id;
              }

              console.log('using account', account);
            })


        })
        .catch(function (error) {
          // All modals of this type will need to handle this error - as this is not done through the Notify
          // service this should be designed
          vm.accountFailed = error.data;
        });

  }
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

  function updateAccount(accountForm) {

    var requireDirty = !vm.isCreateState;

    accountForm.$setSubmitted();
    if (accountForm.$invalid) {
      return;
    }

    if (!accountForm.$dirty) {
      return;
    }

    var submit = util.filterFormElements(accountForm, requireDirty);

    // filter parent
    if (submit.parent) {
      delete submit.account;
      submit.parent = vm.account.parent.id;
    }

    if (vm.isCreateState) {

      console.log('submitting account', submit);
      Accounts.create(submit)
        .then(function (result) {
          vm.error = null;

          // update the id so this account can be directly edited
          submit.id = result.id;
          $rootScope.$broadcast('ACCOUNT_CREATED', submit);
          Notify.success('account made');

          if (vm.batchCreate) {
            settupAccount();
            accountForm.$setPristine();
            accountForm.$setUntouched();
          } else {
            close();
          }
        })
        .catch(handleModalError);

    } else {
      Accounts.update(vm.account.id, submit)
        .then(function (result) {
          vm.error = null;
          $rootScope.$broadcast('ACCOUNT_UPDATED', result);
          Notify.success('Update success');
          close();
        })
        .catch(handleModalError);
    }
  }

  function setRootAccount(accountForm) {
    accountForm.parent.$setDirty();
    vm.account.parent = vm.store.get(0);
  }

  function close() {
    // transition to the overall UI grid state - this modal will be cleaned up on state change
    $state.go('^.list');
  }

  function handleModalError(error) {
    vm.error = error;
  }
}
