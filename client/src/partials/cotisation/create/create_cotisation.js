angular.module('bhima.controllers')
.controller('cotisations_management.create', [
  '$scope',
  '$translate',
  '$http',
  'validate',
  'messenger',
  'connect',
  'appstate',
  function ($scope, $translate, $http, validate, messenger, connect, appstate) {
    var dependencies = {},
        session = $scope.session = {};

    dependencies.cotisations = {
      query : {
        identifier : 'id',
        tables : {
          'cotisation' : { columns : ['id', 'label', 'abbr', 'is_employee', 'is_percent', 'four_account_id', 'six_account_id', 'value'] }
        }
      }
    };

    dependencies.accounts = {
      query : {
        tables : {
          'account' : {
            columns : ['id', 'number', 'label']
          }
        },
        where : ['account.is_ohada=1', 'AND', 'account.type_id<>3']
      }
    };

    function startup (models) {
      angular.extend($scope, models);
    }

    appstate.register('enterprise', function (enterprise) {
      $scope.enterprise = enterprise;
      validate.process(dependencies)
      .then(startup);
    });

    $scope.delete = function (cotisations) {
      var result = confirm($translate.instant('COTISATIONS.CONFIRM'));
      if (result) {
        connect.delete('cotisation', 'id', cotisations.id)
        .then(function () {
          $scope.cotisations.remove(cotisations.id);
          messenger.info($translate.instant('COTISATIONS.DELETE_SUCCESS'));
        });
      }
    };

    $scope.edit = function (cotisations) {
      session.action = 'edit';
      session.edit = angular.copy(cotisations);
    };

    $scope.new = function () {
      session.action = 'new';
      session.new = {};
    };

    $scope.save = {};

    $scope.save.edit = function () {
      var record = angular.copy(connect.clean(session.edit));
      delete record.reference;
      delete record.number;
      delete record.label;

      record.six_account_id = session.edit.six_account_id;

      if(record.abbr){
        if(record.abbr.length <= 4){
          connect.put('cotisation', [record], ['id'])
          .then(function () {
            validate.refresh(dependencies)
            .then(function (models) {
              angular.extend($scope, models);
              messenger.success($translate.instant('COTISATIONS.UPDATE_SUCCES'));
              session.action = '';
              session.edit = {};
            });
          });
        } else if (record.abbr.length > 4){
          messenger.danger($translate.instant('COTISATIONS.NOT_SUP4'));
        }
      }  else {
        messenger.danger($translate.instant('COTISATIONS.NOT_EMPTY'));
      }
    };

    $scope.save.new = function () {
      var record = connect.clean(session.new);

      // fail if no abbreviation
      if (!record.abbr) {
        return messenger.danger($translate.instant('COTISATIONS.NOT_EMPTY'));
      }

      // require small abbreviations
      if (record.abbr.length > 4) {
        return messenger.danger($translate.instant('COTISATIONS.NOT_SUP4'));
      }
      
      // all checks pass, we are free to post to the server!
      connect.post('cotisation', [record])
      .then(function (res) {

        // reload data (TODO - make this a simple addition to the client store)
        validate.refresh(dependencies)
        .then(function (models) {
          angular.extend($scope, models);
        });
        session.action = '';
        session.new = {};
      });
    };
  }
]);
