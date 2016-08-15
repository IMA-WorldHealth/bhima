angular.module('bhima.routes')
  .config([ '$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('fiscal', {
        url : '/fiscal/:id',
        abstract : true,
        params : {
          id : { squash : true, value : null }
        },
        controller: 'FiscalController as FiscalCtrl',
        templateUrl: 'partials/fiscal/fiscal.html'
      })
        .state('fiscal.list', {
          url : '',
          templateUrl : 'partials/fiscal/fiscal.list.html'
        })
        .state('fiscal.create', {
          url : '/create/new',
          controller : 'FiscalCreateController as FiscalManageCtrl',
          templateUrl : 'partials/fiscal/fiscal.manage.html'
        })
        .state('fiscal.update', {
          url : '/update',
          controller : 'FiscalUpdateController as FiscalManageCtrl',
          templateUrl : 'partials/fiscal/fiscal.manage.html',
          data : { label : null }
        });
  }]);
