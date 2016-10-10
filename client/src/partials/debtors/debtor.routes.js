
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
        templateUrl: 'partials/debtors/groups.html'
      })
      .state('debtorGroups.list', {
        url : '',
        templateUrl : 'partials/debtors/groups.list.html'
      })
      .state('debtorGroups.create', {

        // setting the URL as simply create mathces as a :uuid - there should be a way to set orders
        // this should ideally route to /create
        url : '/create/new',
        templateUrl : 'partials/debtors/groups.edit.html',
        controller : 'DebtorGroupCreateController as GroupEditCtrl'
      })
      .state('debtorGroups.update', {
        url : '/update',
        templateUrl : 'partials/debtors/groups.edit.html',
        controller : 'DebtorGroupUpdateController as GroupEditCtrl',
        data : { label : null }
      });
  }]);