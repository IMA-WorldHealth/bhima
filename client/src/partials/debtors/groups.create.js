angular.module('bhima.controllers')
.controller('DebtorGroupCreateController', DebtorGroupCreateController);

DebtorGroupCreateController.$inject = [
  '$state', 'ScrollService', 'SessionService', 'DebtorGroupService', 'uuid'
];

function DebtorGroupCreateController($state, ScrollTo, SessionService, DebtorGroups, Uuid) { 
  var vm = this;

  // default new group policies
  var policies = { 
    subsidies : true,
    discounts : true,
    billingServices : false
  };

  settupDefaults();

  console.log(this);
  
  function settupDefaults() { 
   
    vm.createSessionId = Uuid();

    /* object to collect all form model values */
    vm.group = {};
    
    vm.group.uuid = vm.createSessionId;

    // set default values 
    vm.group.location_id = SessionService.enterprise.location_id;

    vm.group.apply_discounts = policies.subsidies;
    vm.group.apply_subsidies = policies.discounts;
    vm.group.apply_billing_services = !policies.billingServices;
    
    vm.group.max_credit = 0;

    vm.submit = submit;
  }
  
  function submit(groupForm) { 
    groupForm.$setSubmitted();
  
        console.log(groupForm);
    // ensure all Angular form validation checks have passed
    if (groupForm.$invalid) { 
      return;
    }

    DebtorGroups.create(vm.group)
      .then(function (result) { 
        
        vm.written = true;

        // Debtor group created
        if (vm.resetOnCompletion) { 
          // settupDefaults();
          // groupForm.$setUntouched();
          // groupForm.$setPristine();
          ScrollTo('anchor');
        }
      })
      .catch(handleRequestError);
  }

  function handleRequestError(error) { 
    vm.exception = error;
    ScrollTo('groupException');
  }
}
