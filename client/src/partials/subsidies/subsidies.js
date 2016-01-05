angular.module('bhima.controllers')
.controller('subsidy', [
  '$scope',
  '$translate',
  'validate',
  'messenger',
  'connect',
  'uuid',
  function ($scope, $translate, validate, messenger, connect, uuid) {
    var dependencies = {},
        session = $scope.session = {};

    dependencies.subsidies = {
      identifier:'uuid',
      query : '/getSubsidies/'
    };

    dependencies.debitorGroups = {
      query : {
        identifier : 'uuid',
        tables : {
          'debitor_group' : {columns : ['uuid', 'name']}
        }
      }
    };

    dependencies.enterprise = {
      query : {
        tables : {
          'enterprise' : { columns : ['id'] },
          'currency' : {columns : ['symbol']}
        },
        join : ['enterprise.currency_id=currency.id']
      }
    };

    function startup (models) {
      angular.extend($scope, models);
    }

    validate.process(dependencies).then(startup);

    $scope.delete = function (subsidy) {
      var result = confirm($translate.instant('SUBSIDY.CONFIRM'));
      if (result) {
        connect.delete('subsidy', 'uuid', [subsidy.uuid])
        .then(function () {
          $scope.subsidies.remove(subsidy.uuid);
          messenger.info($translate.instant('SUBSIDY.DELETE_SUCCESS'));
        });
      }
    };

    $scope.edit = function (subsidy) {
      session.action = 'edit';
      session.edit = angular.copy(subsidy);
    };

    $scope.new = function () {
      session.action = 'new';
      session.new = {};
    };

    $scope.save = {};

    $scope.save.edit = function () {

      var record = angular.copy(connect.clean(session.edit));
      var editedSubsidy = {
        uuid : record.uuid,
        is_percent : record.is_percent,
        value : record.value,
        text : record.text,
        debitor_group_uuid : record.debitor_group_uuid
      };
      connect.put('subsidy', [editedSubsidy], ['uuid'])
        .then(function (res) {
          $scope.subsidies.put(record);
          record = {};
          session.action = '';
          session.edit = {};
      });
    };

    $scope.save.new = function () {
      var record = connect.clean(session.new);
      if(record.value < 0 || (record.is_percent === 1 && record.value > 100)) {return messenger.danger($translate.instant('SUBSIDY.WRONG_VALUE'));}
      record.uuid = uuid();
      connect.post('subsidy', [record])
        .then(function (res) {
          record.name = $scope.debitorGroups.get(record.debitor_group_uuid).name;
          $scope.subsidies.post(record);
          record = {};
          session.action = '';
          session.new = {};
      });
    };
  }
]);
