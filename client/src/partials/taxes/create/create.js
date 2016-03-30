angular.module('bhima.controllers')
.controller('CreateTaxController', CreateTaxController);

CreateTaxController.$inject = [
  '$scope', '$translate', 'validate', 'messenger',
  'connect', 'appstate'
];

function CreateTaxController($scope, $translate, validate, messenger, connect, appstate) {
  var dependencies = {},
      session = $scope.session = {};

  dependencies.taxes = {
    query : {
      identifier : 'id',
      tables : {
        'tax' : { columns : ['id', 'label', 'abbr', 'is_employee', 'is_ipr', 'is_percent', 'four_account_id', 'six_account_id', 'value'] }
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

  $scope.delete = function (taxes) {
    var result = confirm($translate.instant('TAXES.CONFIRM'));
    if (result) {
      connect.delete('tax', 'id', taxes.id)
      .then(function () {
        $scope.taxes.remove(taxes.id);
        messenger.info($translate.instant('TAXES.DELETE_SUCCESS'));
      });
    }
  };

  $scope.edit = function (taxes) {
    session.action = 'edit';
    session.edit = angular.copy(taxes);
  };

  $scope.new = function () {
    session.action = 'new';
    session.new = {};
  };

  $scope.save = {};

  $scope.save.edit = function () {
    var taxes = $scope.taxes.data,
      ipr_exist = 0;

    if (taxes.length) {
      taxes.forEach(function (tax) {
        if (tax.is_ipr && tax.id !== $scope.session.edit.id) {
          ipr_exist = 1;
        }
      });
    }

    if ($scope.session.edit.is_ipr && ipr_exist) {
      messenger.danger($translate.instant('TAXES.NOT_IPR'));
      $scope.session.edit.is_ipr = null;
    } else {
      var record = angular.copy(connect.clean(session.edit));
      record.six_account_id = session.edit.six_account_id;

      delete record.reference;
      delete record.number;
      delete record.label;

      if (record.abbr) {
        if (record.abbr.length <= 4) {
          connect.put('tax', [record], ['id'])
          .then(function () {
            validate.refresh(dependencies)
            .then(function (models) {
              angular.extend($scope, models);
              messenger.success($translate.instant('TAXES.UPDATE_SUCCES'));
              session.action = '';
              session.edit = {};
            });
          });
        } else if (record.abbr.length > 4) {
          messenger.danger($translate.instant('TAXES.NOT_SUP4'));
        }
      }  else {
        messenger.danger($translate.instant('TAXES.NOT_EMPTY'));
      }
    }
  };

  $scope.save.new = function () {
    var taxes = $scope.taxes.data,
      ipr_exist = 0;

    if (taxes.length) {
      taxes.forEach(function (tax) {
        if (tax.is_ipr) {
          ipr_exist = 1;
        }
      });
    }

    if ($scope.session.new.is_ipr && ipr_exist) {
      messenger.danger($translate.instant('TAXES.NOT_IPR'));
      $scope.session.new.is_ipr = null;
    } else {
      var record = connect.clean(session.new);
      record.six_account_id = session.new.six_account_id;

      if (record.abbr) {
        if (record.abbr.length <= 4) {
          connect.post('tax', [record])
          .then(function (res) {

            validate.refresh(dependencies)
            .then(function (models) {
              angular.extend($scope, models);
            });
            session.action = '';
            session.new = {};
          });
        } else if (record.abbr.length > 4) {
          messenger.danger($translate.instant('TAXES.NOT_SUP4'));
        }
      }  else {
        messenger.danger($translate.instant('TAXES.NOT_EMPTY'));
      }
    }
  };
}
