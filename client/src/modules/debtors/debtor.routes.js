
angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('debtorGroups', {
        url : '/debtors/groups/:uuid',
        abstract : true,
        params : {
          uuid : { squash : true, value : null }
        },
        controller : 'DebtorGroupController as GroupCtrl',
        templateUrl: 'modules/debtors/groups.html'
      })
      .state('debtorGroups.create', {

        // setting the URL as simply create matches as a :uuid - there should be a way to set orders
        // this should ideally route to /create
        url : '/create',
        templateUrl : 'modules/debtors/groups.update.html',
        controller : 'DebtorGroupCreateController as GroupUpdateCtrl'
      })
      .state('debtorGroups.list', {
        url : '',
        templateUrl : 'modules/debtors/groups.list.html'
      })
      .state('debtorGroups.update', {
        url : '/update',
        templateUrl : 'modules/debtors/groups.update.html',
        controller : 'DebtorGroupUpdateController as GroupUpdateCtrl',
        data : { label : null }
      });
  }]);
