angular.module('bhima.controllers')
.controller('DebtorGroupCreateController', DebtorGroupCreateController);

DebtorGroupCreateController.$inject = ['SessionService', 'DebtorGroupService'];

function DebtorGroupCreateController(SessionService, DebtorGroups) { 
  var vm = this;
  
  /* object to collect all form model values */
  vm.group = {};

  // set default values 
  vm.group.location = SessionService.enterprise.location_id;
  
  vm.group.policies = { 
    subsidies : true,
    discounts : true,
    billingServices : false
  };
  vm.group.maxCredit = 0;

  vm.submit = submit;

  function submit(groupForm) { 
    groupForm.$setSubmitted();
  
    // ensure all Angular form validation checks have passed
    if (groupForm.$invalid) { 
      return;
    }

    DebtorGroups.create(vm.group)
      .then(function (result) { 

        // Debtor group created
      })
      .catch(handleRequestError);
  }

  function handleRequestError(error) { 
    vm.exception = error;
  }
}
