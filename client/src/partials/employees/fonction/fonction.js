angular.module('bhima.controllers')
.controller('FonctionController', FonctionController);

FonctionController.$inject = [
  '$scope', '$translate', 'validate', 'messenger', 'connect', 'appstate'
];

function FonctionController($scope, $translate, validate, messenger, connect, appstate) {
  var dependencies = {},
      session = $scope.session = {};

  dependencies.fonctions = {
    query : {
      identifier : 'id',
      tables : {
        'fonction' : {
          columns : ['id', 'fonction_txt']
        }
      }
    }
  };

  dependencies.enterprise = {
    query : {
      tables : {
        'enterprise' : {
          columns : ['currency_id']
        },
        'currency' : {
          columns : ['id', 'symbol']
        }
      },
      join : [
          'enterprise.currency_id=currency.id'
        ]
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

  $scope.delete = function (fonction) {
    var result = confirm($translate.instant('FONCTION.CONFIRM'));
    if (result) {
      connect.delete('fonction', 'id', fonction.id)
      .then(function () {
        $scope.fonctions.remove(fonction.id);
        messenger.info($translate.instant('FONCTION.DELETE_SUCCESS'));
      });
    }
  };

  $scope.edit = function (fonction) {
    session.action = 'edit';
    session.edit = angular.copy(fonction);
  };

  $scope.new = function () {
    session.action = 'new';
    session.new = {};
  };

  $scope.save = {};

  $scope.save.edit = function () {
    var record = connect.clean(session.edit);
    delete record.reference;
    connect.put('fonction', [record], ['id'])
    .then(function () {
      messenger.success($translate.instant('FONCTION.UPDATE_SUCCES'));
      $scope.fonctions.put(record);
      session.action = '';
      session.edit = {};
    });
  };

  $scope.save.new = function () {
    var record = connect.clean(session.new);
    connect.post('fonction', [record])
    .then(function () {
      messenger.success($translate.instant('FONCTION.SAVE_SUCCES'));
      record.reference = generateReference(); // this is simply to make the ui look pretty;
      $scope.fonctions.post(record);
      session.action = '';
      session.new = {};
    });
  };

  function generateReference () {
    var max = Math.max.apply(Math.max, $scope.fonctions.data.map(function (o) { return o.reference; }));
    return Number.isNaN(max) ? 1 : max + 1;
  }
}
