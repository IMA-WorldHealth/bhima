angular.module('bhima.controllers')
.controller('DonorManagementController', DonorManagementController);

DonorManagementController.$inject = [
  '$scope', '$translate', '$http', 'validate', 'messenger', 'connect', 'appstate'
];

function DonorManagementController($scope, $translate, $http, validate, messenger, connect, appstate) {
  var dependencies = {},
      session = $scope.session = {};

  dependencies.donors = {
    query : {
      identifier : 'id',
      tables : {
        'donor' : {
          columns : ['id', 'name']
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

  $scope.delete = function (donor) {
    var result = confirm($translate.instant('DONOR_MANAGEMENT.CONFIRM'));
    if (result) {  
      connect.delete('donor', 'id', donor.id)
      .then(function () {
        $scope.donors.remove(donor.id);
        messenger.info($translate.instant('DONOR_MANAGEMENT.DELETE_SUCCESS'));
      });
    }
  };

  $scope.edit = function (donor) {
    session.action = 'edit';
    session.edit = angular.copy(donor);
  };

  $scope.new = function () {
    session.action = 'new';
    session.new = {};
  };

  $scope.save = {};

  $scope.save.edit = function () {
    var record = connect.clean(session.edit);
    delete record.reference;
    connect.put('donor', [record], ['id'])
    .then(function () {
      messenger.success($translate.instant('DONOR_MANAGEMENT.UPDATE_SUCCES')); 
      $scope.donors.put(record);
      session.action = '';
      session.edit = {};
    });
  };

  $scope.save.new = function () {
    var record = connect.clean(session.new);
    connect.post('donor', [record])
    .then(function () {
      messenger.success($translate.instant('DONOR_MANAGEMENT.SAVE_SUCCES'));        
      record.reference = generateReference(); 
      $scope.donors.post(record);
      session.action = '';
      session.new = {};
    });
  };

  function generateReference () {
    window.data = $scope.donors.data;
    var max = Math.max.apply(Math.max, $scope.donors.data.map(function (o) { return o.reference; }));
    return Number.isNaN(max) ? 1 : max + 1;
  }
}  
