angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {
    
    $stateProvider
      .state('cashboxes', { 
        abstract : true, 
        url : '/cashboxes', 
        controller : 'CashboxController as CashCtrl', 
        templateUrl : 'partials/cash/cashboxes/cashboxes.html'
      })

      .state('cashboxes.list', { 
        url : '', 
        templateUrl : 'partials/cash/cashboxes/cashboxes.list.html'
      })

      .state('cashboxes.create', { 
        url : '/create',
        templateUrl : 'partials/cash/cashboxes/update/add.html', 
        controller : 'CashboxUpdateController as UpdateCtrl'
      })

      .state('cashboxes.edit', {
        url : '/:uuid/edit', 
        params : { 
          id : { squash : true, value : null }
        }, 
        templateUrl : 'partials/cash/cashboxes/update/edit.html',
        controller : 'CashboxUpdateController as UpdateCtrl'
      });

  }]);

function addModal($modal) { 
  $modal.open({ 
    keyboard : false,
    backdrop : 'static', 
    templateUrl : 'partials/cash/cashboxes/update/add.modal.html', 
    controller : 'CashboxUpdateController as UpdateCtrl'
  });
}

function closeModal($uibModalStack) { 
  $uibModalStack.dismissAll();
}
