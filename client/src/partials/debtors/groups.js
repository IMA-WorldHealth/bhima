angular.module('bhima.controllers')
.controller('DebtorGroupController', DebtorGroupController);

DebtorGroupController.$inject = ['$state', 'DebtorGroupService', 'AccountService', 'PriceListService'];

/** @todo model groups in the Debtors service - even if it delegates to another file */
function DebtorGroupController($state, DebtorGroups, Accounts, Prices) { 
  var vm = this;

  // pagination configuration 
  vm.pageSize     = 10;
  vm.currentPage  = 1;
  vm.debtorGroups = [];
  
  vm.toggleFilter = toggleFilter;
  vm.setOrder = setOrder;
  
  vm.state = $state; 
  
  /* @todo This should be handled by the accounts directive - this controller should not be concerned with accounts */
  Accounts.list()
    .then(function (accounts) { 
      vm.accounts = accounts;
    });

  /* @todo This controller should not be concerned about individual price lists */
  /* @tood All read/ list API methods should be uniform on the client */
  Prices.read() 
    .then(function (priceLists) { 
      vm.priceLists = priceLists;
      console.log('got price lists', priceLists);
    });

  vm.sortOptions = [
    { attribute : 'name', key : 'COLUMNS.SORTING.NAME_ASC', reverse : false },
    { attribute : 'name', key : 'COLUMNS.SORTING.NAME_DSC', reverse : true },
    { attribute : 'createdAt', key : 'COLUMNS.SORTING.CREATED_ASC', reverse : false },
    { attribute : 'createdAt', key : 'COLUMNS.SORTING.CREATED_DSC', reverse : true }
  ];

  /** @todo rename read method */
  DebtorGroups.read()
    .then(function (result) { 
      vm.debtorGroups = result;   
    })
    .catch(handleException);

  function handleException(error) { 

    // expose error to view 
    vm.exception = error;
    
    /** @todo scroll to alert demonstrating error */
  }
  
  function toggleFilter() { 
    if (vm.filterActive) { 

      // clear the filter
      vm.filterActive = false;
      vm.filter = '';
    } else { 
      
      vm.filterActive = true;
    }
  }

  function setOrder(attribute) { 
    vm.sort = attribute;
  }
}
