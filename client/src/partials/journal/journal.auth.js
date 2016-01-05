angular.module('bhima.controllers')
.controller('journal.auth', [
  '$scope',
  '$modalInstance',
  'connect',
  'uuid',
  function ($scope, $modalInstance, connect, uuid) {
    var session = $scope.session = {};

    session.timestamp = new Date();
    session.uuid = uuid();
    session.$invalid = true;
    session.attempts = 5;

    $scope.$watch('session.justification', function () {
      if (!session.justification) { return; }
      session.$invalid = session.justification.length < 10;
    });

    $scope.$watch('session.pin', function () {
      if (!session.pin || !session.$error) { return; }
      session.$error = false;
    });

    $scope.$watch('session.attempts', function () {
      if (session.attempts === 0) { session.$invalid = true; }
    });

    $scope.submit = function () {
      var pin = session.pin << 5;
      connect.fetch('/editsession/authenticate/' + pin)
      .then(function (data) {
        if (!data.authenticated) {
          session.$error = true;
          session.attempts -= 1;
        } else {
          session.authenticated = true;
          $modalInstance.close(session);
        }
      });
    };

    $scope.cancel = function () {
      $modalInstance.dismiss();
    };

  }
]);
