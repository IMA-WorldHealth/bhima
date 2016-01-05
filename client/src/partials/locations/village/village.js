angular.module('bhima.controllers')
.controller('village', [
  '$scope',
  'connect',
  'validate',
  'uuid',
  'messenger',
  function ($scope, connect, validate, uuid, messenger) {
    var dependencies = {};

    dependencies.sectors = {
      query :  {
        identifier : 'uuid',
        tables: {
          'sector' : {
            columns : ['uuid', 'name', 'province_uuid']
          }
        }
      }
    };

    dependencies.villages = {
      identifier:'uuid',
      query : '/location/villages'
    };

    function manageVillage (model) {
      angular.extend($scope, model);
    }

    function setOp(action, village){
      $scope.village = angular.copy(village) || {};
      $scope.op = action;
    }

    function addVillage(obj){

      var v = {
        uuid : uuid(),
        name : obj.name,
        sector_uuid : obj.sector_uuid,
      };

      connect.post('village', [v])
      .then(function (suc) {
        v.sector_name = $scope.sectors.get(v.sector_uuid).name;
        $scope.villages.post(v);
        $scope.op='';
      })
      .catch(function (err) {
        messenger.danger('error during deleting', err);
      });
    }

    function editVillage(obj){
      var village = {
        uuid : obj.uuid,
        name : obj.name,
        sector_uuid : obj.sector_uuid
      };

      connect.put('village', [village], ['uuid'])
      .then(function () {
        village.sector_name = $scope.sectors.get(village.sector_uuid).name;
        $scope.villages.put(village);
        $scope.op='';
      })
      .catch(function (err) {
        messenger.danger('error during updating', err);
      });
    }

    function removeVillage(uuid){
      connect.delete('village', 'uuid', [uuid])
      .then(function (suc){
        $scope.villages.remove(uuid);
      })
      .catch(function (err) {
        messenger.danger('error during deleting', err);
      });
    }

    validate.process(dependencies)
    .then(manageVillage);

    $scope.setOp = setOp;
    $scope.addVillage = addVillage;
    $scope.editVillage = editVillage;
    $scope.removeVillage = removeVillage;
  }
]);
