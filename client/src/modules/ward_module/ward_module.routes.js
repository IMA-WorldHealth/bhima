angular.module('bhima.routes')
  .config(['$stateProvider', wardModuleStateProvider]);

function wardModuleStateProvider($stateProvider) {
  $stateProvider
    .state('wardModuleConfiguration', {
      url : '/ward_module/configuration',
      views : {
        '' : {
          templateUrl : 'modules/ward_module/configuration/configuration.html',
        },
        'ward@wardModuleConfiguration' : {
          templateUrl : 'modules/ward_module/configuration/ward/ward.html',
          controller : 'WardController as WardCtrl',
        },
        'room@wardModuleConfiguration' : {
          templateUrl : 'modules/ward_module/configuration/room/room.html',
          controller : 'RoomController as RoomCtrl',
        },
        'bed@wardModuleConfiguration' : {
          templateUrl : 'modules/ward_module/configuration/bed/bed.html',
          controller : 'BedController as BedCtrl',
        },
      },
    });
}
