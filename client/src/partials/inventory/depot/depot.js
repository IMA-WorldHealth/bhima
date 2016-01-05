angular.module('bhima.controllers')
.controller('inventory.depot', [
  '$scope',
  '$translate',
  'validate',
  'connect',
  'messenger',
  'SessionService',
  'uuid',
  function ($scope, $translate, validate, connect, messenger, sessionService, uuid) {
    var dependencies = {},
        session = $scope.session = {};
    $scope.enterprise = sessionService.enterprise;

    dependencies.depots = {
      query : {
        identifier : 'uuid',
        tables : {
          'depot' : {
            columns : ['uuid', 'text', 'reference','is_warehouse']
          }
        }
      }
    };

    function startup (models) {
      angular.extend($scope, models);
    }

    validate.process(dependencies)
      .then(startup);

    $scope.delete = function (depot) {
      connect.delete('depot','uuid', depot.uuid)
      .then(function () {
        $scope.depots.remove(depot.uuid);
        messenger.info($translate.instant('DEPOT.DELETE_SUCCESS'));
      })
      .catch(function (err){
        messenger.danger($translate.instant('DEPOT.DELETE_FAIL'));
      });
    };

    $scope.edit = function (depot) {
      session.action = 'edit';
      session.edit = angular.copy(depot);
    };

    $scope.new = function () {
      session.action = 'new';
      session.new = {};
    };

    $scope.save = {};

    $scope.save.edit = function () {
      var record = connect.clean(session.edit);
      record.enterprise_id = $scope.enterprise.id;
      delete record.reference;
      connect.put('depot', [record], ['uuid'])
      .then(function () {
        messenger.info($translate.instant('DEPOT.EDIT_SUCCESS'));
        $scope.depots.put(record);
        session.action = '';
        session.edit = {};
      });
    };

    $scope.save.new = function () {
      var record = connect.clean(session.new);
      record.enterprise_id = $scope.enterprise.id;
      record.uuid = uuid();
      connect.post('depot', [record])
      .then(function () {
        messenger.info($translate.instant('DEPOT.NEW_SUCCESS'));
        record.reference = generateReference(); // this is simply to make the ui look pretty;
        $scope.depots.post(record);
        session.action = '';
        session.new = {};
      });
    };

    function generateReference () {
      window.data = $scope.depots.data;
      var max = Math.max.apply(Math.max, $scope.depots.data.map(function (o) { return o.reference; }));
      return Number.isNaN(max) ? 1 : max + 1;
    }

  }
]);
