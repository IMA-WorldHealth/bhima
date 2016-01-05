angular.module('bhima.controllers')
.controller('message', [
  '$scope',
  'messenger',
  function ($scope, messenger) {
    // Binds the message service to the DOM
    $scope.messages = messenger.messages;
    $scope.close = messenger.close;
  }
]);
