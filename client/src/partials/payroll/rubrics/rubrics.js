angular.module('bhima.controllers')
.controller('rubric_management.menu', [
  '$scope',
  '$location',
  '$translate',
  function ($scope, $location, $translate) {

    var configuration = $scope.configuration = {};

    configuration.operations = [
      {
        key : $translate.instant('RUBRIC_PAYROLL.TITLE'),
        link : '/rubric_management/rubriques_payroll/'
      },

      {
       key : $translate.instant('CONFIG_RUBRIC.TITLE'),
       link : '/rubric_management/config_rubric/'
      }

    ];

    $scope.loadPath = function loadPath(path) {
      $location.path(path);
    };
  }
]);
