angular.module('bhima.controllers')
.controller('DebtorGroupController', DebtorGroupController);

DebtorGroupController.$inject = ['DebtorGroupService'];

/** @todo model groups in the Debtors service - even if it delegates to another file */
function DebtorGroupController(DebtorGroups) { 
  var vm = this;

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
}
