
angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('feeCenter', {
        abstract : true,
        url : '/fee_center',
        controller : 'feeCenterController as feeCenterCtrl',
        templateUrl : 'partials/fee_center/fee_center.html'
      })
      .state('feeCenter.list', {
        url : '/:id',
        params : {
            id : {squash : true, value : null}
        }
      });
    }]);