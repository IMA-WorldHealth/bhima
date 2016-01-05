angular.module('bhima.controllers')
.controller('ReferenceGroupController', ReferenceGroupController);

ReferenceGroupController.$inject = [
  '$scope', '$translate', '$q', 'validate', 'messenger',
  'connect', 'appstate'
];

function ReferenceGroupController($scope, $translate, $q, validate, messenger, connect, appstate) {
  var dependencies = {},
      session = $scope.session = {};

  dependencies.reference_groups = {
    query : {
      identifier : 'id',
      tables : {
        'reference_group' : {
          columns : ['id', 'reference_group', 'text', 'position', 'section_bilan_id']
        }
      }
    }
  };

  dependencies.section_bilan = {
    query : {
      tables : {
        'section_bilan' : {
          columns : ['id', 'text']
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

  function checkingReferenceGroup (position,section_bilan_id) {
    var def = $q.defer();
    var query = {
      tables : {
        reference_group : { columns : ['id'] }
      },
      where  : ['reference_group.position=' + position,'AND','reference_group.section_bilan_id=' + section_bilan_id]
    };
    connect.fetch(query)
    .then(function (res) {
      def.resolve(res.length !== 0);
    });
    return def.promise;
  }

  function checkingReferenceGroupUpdate (id,position,section_bilan_id) {
    var def = $q.defer();

    var query = {
      tables : {
        reference_group : { columns : ['id'] }
      },
      where  : ['reference_group.id<>' + id, 'AND','reference_group.position=' + position,'AND','reference_group.section_bilan_id=' + section_bilan_id]
    };
    connect.fetch(query)
    .then(function (res) {
      def.resolve(res.length !== 0);
    });
    return def.promise;
  }

  appstate.register('enterprise', function (enterprise) {
    $scope.enterprise = enterprise;
    validate.process(dependencies)
    .then(startup);
  });

  $scope.delete = function (reference_group) {
    var result = confirm($translate.instant('REFERENCE_GROUP.CONFIRM'));
    if (result) {
      connect.delete('reference_group', ['id'], [reference_group.id])
      .then(function () {
        $scope.reference_groups.remove(reference_group.id);
        messenger.info($translate.instant('REFERENCE_GROUP.DELETE_SUCCESS'));
      });
    }
  };

  $scope.edit = function (reference_group) {
    session.action = 'edit';
    session.edit = angular.copy(reference_group);
  };

  $scope.new = function () {
    session.action = 'new';
    session.new = {};
  };

  $scope.save = {};

  $scope.save.edit = function () {
    var record = connect.clean(session.edit);
    delete record.reference;
    delete record.section_bilan_txt;

    checkingReferenceGroupUpdate(record.id,record.position,record.section_bilan_id)
    .then(function (is_exist) {
      if (!is_exist) {
        connect.put('reference_group', [record], ['id'])
        .then(function () {
          messenger.success($translate.instant('REFERENCE_GROUP.UPDATE_SUCCES'));
          $scope.reference_groups.put(record);
          session.action = '';
          session.edit = {};
        });
      } else {
        messenger.danger($translate.instant('REFERENCE_GROUP.ALERT_2'));
      }
    });
  };

  $scope.save.new = function () {
    var record = connect.clean(session.new);
    checkingReferenceGroup(record.position,record.section_bilan_id)
    .then(function (is_exist) {
      if (!is_exist) {
        connect.post('reference_group', [record])
        .then(function () {
          messenger.success($translate.instant('REFERENCE_GROUP.SAVE_SUCCES'));
          $scope.reference_groups.post(record);
          session.action = '';
          session.new = {};
        });
      } else {
        messenger.danger($translate.instant('REFERENCE_GROUP.ALERT_2'));
      }
    });
  };

}
