angular.module('bhima.controllers')
.controller('location', [
  '$scope',
  'connect',
  'store',
  function ($scope, connect, Store) {

    connect.fetch('/location/villages')
    .then(function (data) {
      $scope.locations = data;
    });
  }
]);
