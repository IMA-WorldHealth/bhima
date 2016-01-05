angular.module('bhima.controllers')
.controller('report.prices', [
  '$scope',
  '$window',
  'connect',
  'appstate',
  function ($scope, $window, connect, appstate) {

    $scope.timestamp = new Date();

    appstate.register('enterprise', function (enterprise) {
      $scope.enterprise = enterprise;

      connect.fetch('reports/prices/')
      .then(function (data) {
        for (var k in data) {
          data[k].code = Number(data[k].code);
        }
        $scope.groups = data;
      })
      .finally();
    });

    $scope.print = function print () {
      $window.print();
    };

  }
]);
