angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('creditorGroups', {
        url         : '/creditor_groups',
        controller  : 'CreditorGroupController as CreditorGroupCtrl',
        templateUrl : 'modules/creditor_groups/creditor_groups.html',
      })

      .state('creditorGroups.create', {
        url         : '/create',
        controller  : 'CreditorGroupController as CreditorGroupCtrl',
        templateUrl : 'modules/creditor_groups/creditor_groups.manage.html',
      })

      .state('creditorGroups.list', {
        url         : '/',
        controller  : 'CreditorGroupController as CreditorGroupCtrl',
        templateUrl : 'modules/creditor_groups/creditor_groups.list.html',
      })

      .state('creditorGroups.update', {
        url         : '/:uuid/update',
        controller  : 'CreditorGroupController as CreditorGroupCtrl',
        templateUrl : 'modules/creditor_groups/creditor_groups.manage.html',
      });
  }]);
