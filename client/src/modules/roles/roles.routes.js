angular.module('bhima.routes')
  .config(['$stateProvider', ($stateProvider) => {

    $stateProvider.state('roles', {
      url : '/roles',
      templateUrl : 'modules/roles/roles.html',
      controller : 'RolesController as RolesCtrl',
    });
  }]);
