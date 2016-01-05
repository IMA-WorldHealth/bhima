angular.module('bhima.controllers')
.controller('cotisations_management.menu', [
  '$scope',
  '$location',
  '$translate',
  function ($scope, $location, $translate) {

    var configuration = $scope.configuration = {};

    configuration.operations = [
      {
        key : $translate.instant('COTISATION_MANAGEMENT.CREATE_COTISATION'),
        link : '/cotisations_management/create/'
      },

      {
       key : $translate.instant('CONFIG_COTISATION.TITLE'),
       link : '/cotisations_management/config_cotisation/'
      }
    ];

    $scope.loadPath = function loadPath(path) {
      $location.path(path);
    };
  }
]);
