angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) { 
    
    $stateProvider
      .state('accounts', {
        abstract : true,
        url : '/accounts',
        controller: 'AccountsController as AccountsCtrl',
        templateUrl: 'partials/accounts/accounts.html'
      })
    
      .state('accounts.create', {
        url : '/create',
        onEnter :['$state', '$uibModal', function ($state, $modal) { 
          $modal.open({
            template : '<p>Create mate</p>',
            controller : function () { console.log('modal controller') }
          });
          window.modal = $modal;
          console.log('on enter create', $modal);  
        }],
        onExit : ['$uibModal', '$uibModalStack', function ($modal, stack) { console.log('on exit'); stack.dismissAll();}]
      })
      .state('accounts.list', {
        url : '/:id',
        params : { 
          id : { squash : true, value : null }
        }
      })
    
      .state('accounts.edit', { 
        url : '/:id/edit',
        params : { 
          id : { squash : true, value : null }
        },
        onEnter :['$state', '$uibModal', function ($state, $modal) { 
          
          $modal.open({
            template : '<p>Edit mate -- {{targetId}}</p>',
            controller : ['$scope', '$state', function ($scope, $state) { $scope.targetId = $state.params.id; console.log('modal controller') }]
          });
          window.modal = $modal;
          console.log('on enter create', $modal);  
        }],
        onExit : ['$uibModal', '$timeout', '$uibModalStack', '$state', function ($modal, $timeout, stack, $state) { console.log('on exit'); stack.dismissAll(); /*$state.go('^.list');*/ }]
      })
  }])
