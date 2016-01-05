angular.module('bhima.controllers')
.controller('province', [
  '$scope',
  'connect',
  'messenger',
  'validate',
  'uuid',
  function ($scope, connect, messenger, validate, uuid) {
    var dependencies = {};

    dependencies.countries = {
      query : {
        identifier: 'uuid',
        tables: {
          'country' : {
            columns : ['uuid', 'country_en', 'country_fr']
          }
        }
      }
    };

    dependencies.provinces = {
      identifier : 'uuid',
      query : 'location/provinces/'
    };


    function manageProvince (model) {
      angular.extend($scope, model);
    }

    $scope.setOp = function setOp(action, province){
      $scope.province = angular.copy(province) || {};
      $scope.op = action;
    };

    function addProvince (obj) {

      var prov = {
        name         : obj.name,
        country_uuid : obj.country_uuid,
        uuid         : uuid()
      };

      connect.post('province', [prov])
      .then(function () {
        var clientSideProv = {};
        clientSideProv.uuid = prov.uuid;
        clientSideProv.name = prov.name;
        clientSideProv.country_name = $scope.countries.get(prov.country_uuid).country_en;
        $scope.provinces.post(clientSideProv);
        $scope.op = '';
      })
      .catch(function (err) {
        messenger.danger('error during adding', err);
      });
    }

    function editProvince (obj) {
      var province  = {
        uuid         : obj.uuid,
        name         : obj.name,
        country_uuid : obj.country_uuid
      };

      connect.put('province', [province], ['uuid'])
      .then(function (suc) {
        province.country_name = $scope.countries.get(province.country_uuid).country_en;
        $scope.provinces.put(province);
        $scope.op = '';
      })
      .catch(function (err) {
        messenger.danger('error during editing', err);
      });
    }

    function removeProvince(uuid){
      connect.delete('province', 'uuid', [uuid])
      .then(function (suc){
        $scope.provinces.remove(uuid);
      })
      .catch(function (err) {
        messenger.danger('error during removing', err);
      });
    }

    validate.process(dependencies)
    .then(manageProvince);

    $scope.addProvince = addProvince;
    $scope.editProvince = editProvince;
    $scope.removeProvince = removeProvince;
  }
]);
