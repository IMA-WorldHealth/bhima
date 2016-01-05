angular.module('bhima.controllers')
.controller('enterprise', [
  '$scope',
  '$window',
  'connect',
  'validate',
  'appstate',
  function ($scope, $window, connect, validate, appstate) {
    var dependencies = {};

    dependencies.enterprise = {
      required : true,
      query : {
        tables : {
          'enterprise' : {
            columns : ['id', 'name', 'abbr', 'email', 'po_box', 'phone', 'location_id', 'logo', 'currency_id']
          }
        }
      }
    };

    dependencies.currency = {
      required : true,
      query : {
        tables : {
          'currency' : {
            columns : ['id', 'symbol', 'name']
          }
        }
      }
    };

    dependencies.location = {
      query : '/location/villages'
    };

    appstate.register('enterprise', function (enterprise) {
      $scope.globalEnterprise = enterprise;
      validate.process(dependencies)
      .then(initialize);
    });

    function initialize (models) {
      angular.extend($scope, models);
      $scope.newAccount = {};
    }

    $scope.formatLocation = function formatLocation (l) {
      return [l.name, l.sector_name, l.province_name, l.country_name].join(' -- ');
    };

    $scope.newEnterprise = function () {
      $scope.add = {};
      $scope.action = 'new';
    };

    $scope.editEnterprise = function (enterprise) {
      $scope.edit = angular.copy(enterprise);
      $scope.editingEnterprise = enterprise;
      $scope.action = 'edit';
    };

    $scope.saveEdit = function () {
      var data = connect.clean($scope.edit);

      connect.put('enterprise', [data], ['id'])
      .then(function () {
        $scope.enterprise.put(data);
        $scope.action = '';

        // we should reset the global enterprise variable
        // if we have updated the global enterprise data
        if (data.id === $scope.globalEnterprise.id) {
          appstate.set('enterprise', data);
        }

      });
    };

    $scope.resetEdit = function () {
      $scope.edit = angular.copy($scope.editingEnterprise);
    };

    $scope.saveNew = function () {
      var data = connect.clean($scope.add);

      connect.post('enterprise', [data])
      .then(function (res) {
        data.id = res.data.insertId;
        $scope.enterprise.post(data);
        $scope.action = '';
      });
    };

    $scope.resetNew = function () {
      $scope.add = {};
    };

    $scope.print = function () {
      $window.print();
    };

  }
]);
