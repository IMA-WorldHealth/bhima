angular.module('bhima.controllers')
.controller('DebtorGroupCreateController', DebtorGroupCreateController);

DebtorGroupCreateController.$inject = [
  '$state', 'ScrollService', 'SessionService', 'DebtorGroupService', 'uuid', '$uiViewScroll'
];

function DebtorGroupCreateController($state, ScrollTo, SessionService, DebtorGroups, Uuid, $uiViewScroll) { 
  var vm = this;

  // default new group policies
  var policies = { 
    subsidies : true,
    discounts : true,
    billingServices : false
  };
  
  // window.state = $state;
  vm.notifications = [];
  
  vm.addNotification = addNotification;
  function addNotification (message) { 

    if (vm.notifications.length) { 
      vm.notifications.shift();
      console.log(vm.notifications);
    }
  
    vm.notifications.push({ 
      message : message
    });
  }

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
    var submitGroup;

    groupForm.$setSubmitted();
  
        console.log(groupForm);
    // ensure all Angular form validation checks have passed
    if (groupForm.$invalid) { 
      return;
    }

    // in order to display account correctly the entire account is stored in the 
    // ng-model, we should extract this
    submitGroup = angular.copy(vm.group);
    submitGroup.account_id = vm.group.account_id.id;

    DebtorGroups.create(submitGroup)
      .then(function (result) { 
        
        // vm.written = true;
        
        addNotification('Debtor group recorded successfully');

        // Debtor group created
        if (vm.resetOnCompletion) { 

          // reset module state (model + form) 
          settupDefaults();
          groupForm.$setUntouched();
          groupForm.$setPristine();
  
          // move view to the top - ready to create another entity
          ScrollTo('anchor');
          // $state.reload();
        
        } else { 
        
          // navigate back to list view
          $state.go('debtorGroups.list', { created : submitGroup });
        }
      })
      .catch(handleRequestError);
  }

  function handleRequestError(error) { 
    vm.exception = error;
    ScrollTo('groupException');
  }
}
