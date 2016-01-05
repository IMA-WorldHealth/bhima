angular.module('bhima')
.controller('report.patientGroup', [
  '$scope',
  '$routeParams',
  'connect',
  'uuid',
  function ($scope, $routeParams, connect, uuid) {

    $scope.timestamp = new Date();
    $scope.uuid = uuid();

    connect.fetch('/reports/patient_group/?uuid=' + $routeParams.uuid)
    .then(function (res) {
      $scope.group = res.group;
      $scope.priceList = res.pricelist;
      $scope.priceListDetails = res.priceListDetails;
    });
  
    $scope.printReport = function () {
      print();
    };
  }
]);
