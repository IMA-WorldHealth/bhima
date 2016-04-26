angular.module('bhima.controllers')
.controller('DebtorGroupUpdateController', DebtorGroupsUpdateController);

DebtorGroupsUpdateController.$inject = ['$state', 'DebtorGroupService', 'AccountService', 'PriceListService', 'ScrollService', 'util'];

function DebtorGroupsUpdateController($state, DebtorGroups, Accounts, Prices, ScrollTo, util) { 
  var vm = this;
  var target = $state.params.uuid;
  
  vm.submit = submit;
  vm.addNotification = addNotification;
  vm.notifications = [];
  vm.state = $state;
  
  // reset name attribute to ensure no UI glitch
  $state.current.data.label = null;

  Prices.read()
    .then(function (priceLists) { 
      vm.priceLists = priceLists;
    });
  
  Accounts.list()
    .then(function (accounts) { 
      vm.accounts = accounts
     
      return DebtorGroups.read(target)
    })
    .then(function (result) { 
      vm.group = result;  
      
      $state.current.data.label = vm.group.name;

      /** @todo work around for checkboxes (use value='' instead) */
      vm.group.apply_billing_services = Boolean(vm.group.apply_billing_services);
      vm.group.apply_subsidies = Boolean(vm.group.apply_subsidies);
      vm.group.apply_discounts = Boolean(vm.group.apply_discounts);
      
      /** @todo work around to correctly display the account - this should be re-factorered */
      vm.group.account_id = selectAccount(vm.accounts, vm.group.account_id);
    });
  
  function submit(debtorGroupForm) { 
    var submitDebtorGroup;
    debtorGroupForm.$setSubmitted(); 

    // ensure we don't make HTTP requests if the form is invalid - exit early
    if (debtorGroupForm.$invalid) { 
      return false;
    }
    
    /** @todo filterDirtyFormElements should be updated to factor in nested forms */
    // submitDebtorGroup = util.filterDirtyFormElements(debtorGroupForm);
    submitDebtorGroup = angular.copy(vm.group);

    // temporary work-around for displaying an entire account in the typeahead
    if (submitDebtorGroup.account_id) { 
      submitDebtorGroup.account_id = vm.group.account_id.id;
    }
  
    console.log('[submit]', submitDebtorGroup);
    DebtorGroups.update(target, submitDebtorGroup)
      .then(function (result) { 
        addNotification('Debtor group updated mate');      
        $state.go('debtorGroups.list', null, {reload : true});
      })
      .catch(handleRequestError); 
  }
  
  /**
   * @deprecated
   * This method returns an account from a flat list of accounts given an ID. 
   * This is a temporary solution to the typeahead model value requiring the full
   * account object. 
   * 
   * @param {Array}   accounts  List of accounts to search 
   * @param {Number}  id        ID to match on
   * @returns                   Account given ID if it exists, null if it does not
   */
  function selectAccount(accounts, id) { 
    var accountResult;
    accounts.some(function (account) { 
      
      if (account.id === id) { 
        
        // found the target account - end array propegation 
        accountResult = account;
        return true;
      }
      return false;
    });
    return accountResult;
  }

  /** @todo Move this method into a service */
  vm.addNotification = addNotification;
  function addNotification (message) { 
    vm.notifications.shift();
    vm.notifications.push({ 
      message : message
    });
  }

  /** @todo Move this method into a service */
  function handleRequestError(error) { 
    vm.exception = error;
    ScrollTo('groupException');
  }
}
