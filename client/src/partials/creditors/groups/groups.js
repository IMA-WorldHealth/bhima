angular.module('bhima.controllers')
.controller('CreditorGroupController', CreditorGroupController);

CreditorGroupController.$inject = [
  '$scope', 'connect', 'appstate', 'messenger', 'validate', 'uuid'
];

function CreditorGroupController($scope, connect, appstate, messenger, validate, uuid) {
  var dependencies = {};

  dependencies.accounts = {
    required : true,
    query : {
      tables : {
        'account' : {
          columns: ['id', 'account_number', 'account_txt']
        },
        'account_type' : {
          columns : ['type']
        }
      },
      join : ['account.account_type_id=account_type.id'] // TODO: add order by for accounts
    }
  };

  dependencies.groups = {
    query : {
      identifier : 'uuid',
      tables: {
        'creditor_group' : {
          columns: ['uuid', 'name', 'account_id', 'locked']
        }
      }
    }
  };

  appstate.register('enterprise', function (enterprise) {
    $scope.enterprise = enterprise;
    dependencies.accounts.query.where =
      ['account.enterprise_id=' + enterprise.id, 'AND', 'account.is_ohada=1'];
    dependencies.groups.query.where =
      ['creditor_group.enterprise_id=' + enterprise.id];

    validate.process(dependencies)
    .then(buildModels)
    .catch(handleErrors);
  });

  function handleErrors (err) {
    messenger.danger('An error occured: ' + JSON.stringify(err));
  }

  function buildModels (models) {
    angular.extend($scope, models);
    $scope.action = '';
    $scope.data = {};

    // for the orderBy to work appropriately
    $scope.accounts.data.forEach(function (account) {
      account.account_number = String(account.account_number);
      account.label = account.account_number + ' -- ' + account.account_txt;
    });
  }

  // the 'new' namespace
  $scope.newGroup = function () {
    $scope.action = 'new';
    $scope.new = {};
  };

  $scope.saveNew = function () {
    var data = connect.clean($scope.new);
    data.enterprise_id = $scope.enterprise.id;
    data.uuid = uuid();
    connect.post('creditor_group', [data])
    .then(function () {
      $scope.groups.post(data);
      $scope.action = '';
    })
    .catch(function (err) {
      messenger.danger('Error in putting: ' + JSON.stringify(err));
    });
  };

  $scope.resetNew = function () {
    $scope.new = {};
  };

  // the 'edit' namespace
  $scope.editGroup = function (group) {
    $scope.action = 'edit';
    $scope.edit = angular.copy(group);
    $scope.edit_copy = group;
  };

  $scope.saveEdit = function () {
    var data = connect.clean($scope.edit);
    connect.put('creditor_group', [data], ['uuid'])
    .then(function () {
      $scope.groups.put(data);
      $scope.action = '';
    })
    .catch(function () {
      messenger.danger('Error in updating creditor group ' + data.uuid);
    });
  };

  $scope.resetEdit = function () {
    $scope.edit = angular.copy($scope.edit_copy);
  };

  $scope.lock = function lock (group) {
    connect.put('creditor_group', [{uuid: group.uuid, locked: group.locked}], ['uuid'])
    .catch(function () {
      group.locked = group.locked === 0 ? 1 : 0;
      messenger.danger('Lock operation failed');
    });
  };
}
