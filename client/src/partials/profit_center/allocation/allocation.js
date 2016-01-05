angular.module('bhima.controllers')
.controller('ProfitCenterAllocationController', ProfitCenterAllocationController);

ProfitCenterAllocationController.$inject = [
  '$q', 'connect', 'appstate', 'validate', 'SessionService'
];

/**
* Profit Center Allocation Controller
* This module is responsible of allocating accounts to profit center
*/
function ProfitCenterAllocationController ($q, connect, appstate,validate, SessionService) {
  var vm            = this,
      dependencies  = {},
      configuration = vm.configuration = {};

  dependencies.profit_centers = {
    query : {
      tables : {
        'profit_center' : {
          columns : ['id', 'text', 'note']
        }
      }
    }
  };

  vm.checkAllAvailable  = checkAllAvailable;
  vm.checkAllAssociated = checkAllAssociated;
  vm.performChange      = performChange;
  vm.assign             = assign;
  vm.remove             = remove;
  vm.isAssignable       = isAssignable;
  vm.isRemovable        = isRemovable;
  vm.state              = 'loading';

  startup();

  function startup() {
    vm.state = 'loading';
    vm.project = SessionService.project;
    validate.process(dependencies)
    .then(init)
    .catch(error);
  }

  function init(models) {
    angular.extend(vm, models);
    vm.checkAvailable = { all : false };
    vm.checkAssociated = { all : false };

    connect.req('/availableAccounts_profit/' + vm.project.enterprise_id + '/')
    .then(function (records) {
      vm.availableAccounts = records;
      vm.state = 'loaded';
    })
    .catch(error);
  }

  function checkAllAvailable() {
    vm.availableAccounts.data.forEach(function (item) {
      item.checked = vm.checkAvailable.all;
    });
  }

  function checkAllAssociated() {
    vm.associatedAccounts.data.forEach(function (item) {
      item.checked = vm.checkAssociated.all;
    });
  }

  function performChange() {
    vm.selectedProfitCenter = configuration.profitCenter;
    loadCenterAccount()
    .then(function (results) {
      vm.associatedAccounts = results;
    })
    .catch(error);
  }

  function assign() {
    var accounts = sanitize(); // accounts to associate
    updateAccounts(accounts)
    .then(function () {
      vm.selectedAccounts.forEach(function (item) {
        vm.availableAccounts.remove(item.id);
        item.checked = false;
        vm.associatedAccounts.post(item);
      });
    })
    .catch(error);
  }

  function remove() {
    // finds all accounts marked for removal and removes them
    var marked = filterSelectedInArray(vm.associatedAccounts.data);
    removeFromProfitCenter(marked)
    .then(function () {
      marked.forEach(function (account) {
        vm.associatedAccounts.remove(account.id);
        vm.availableAccounts.post(account);
      });
    })
    .catch(error);
  }

  function filterSelectedInArray(array) {
    return array.filter(function (item) {
      return item.checked;
    });
  }

  function removeFromProfitCenter (data) {
    return connect.req('/removeFromProfitCenter/'+JSON.stringify(data));
  }

  function updateAccounts(accounts) {
    return $q.all(
      accounts.map(function (account) {
        return connect.put('account', [account], ['id']);
      })
    );
  }

  function sanitize () {
    vm.selectedAccounts = filterSelectedInArray(vm.availableAccounts.data);
    return vm.selectedAccounts.map(function (account) {
      return { pc_id : vm.selectedProfitCenter.id, id : account.id };
    });
  }

  function loadCenterAccount () {
    return connect.req('/profitCenterAccount/'+ vm.project.enterprise_id + '/'+vm.selectedProfitCenter.id);
  }

  function hasSelectedItems(array) {
    return array.some(function (item) {
      return item.checked;
    });
  }

  function isAssignable () {
    if (!configuration.profitCenter) { return false; }
    if (!vm.availableAccounts.data.length) { return false; }
    return hasSelectedItems(vm.availableAccounts.data);
  }

  function isRemovable () {
    if (!configuration.profitCenter) { return false; }
    if (!vm.associatedAccounts) { return false; }
    if (!vm.associatedAccounts.data.length) { return false; }
    return hasSelectedItems(vm.associatedAccounts.data);
  }

  function error(err) {
    console.error(err);
  }
}
