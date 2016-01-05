angular.module('bhima.controllers')
.controller('sector', [
  '$scope',
  'connect',
  'validate',
  'uuid',
  'messenger',
  function ($scope, connect, validate, uuid, messenger) {
    var dependencies = {};

    dependencies.provinces = {
      query :  {
        identifier : 'uuid',
        tables: {
          'province' : {
            columns : ['uuid', 'name', 'country_uuid']
          }
        }
      }
    };

    dependencies.sectors = {
      identifier : 'uuid',
      query : 'location/sectors/'
    };

    function manageSector(model) {
      angular.extend($scope, model);
    }

    function setOp(action, sector){
      $scope.sector = angular.copy(sector) || {};
      $scope.op = action;
    }

    function addSector(obj){
      var newObject = {};
      newObject.uuid = uuid();
      newObject.name = obj.name;
      newObject.province_uuid = obj.province_uuid;
      connect.post('sector', [connect.clean(newObject)])
      .then(function (suc) {
        newObject.province_name = $scope.provinces.get(obj.province_uuid).name;
        $scope.sectors.post(newObject);
        $scope.op = '';
      })
      .catch(function (err) {
        messenger.danger('error during deleting', err);
      });
    }

    function editSector(obj){
      var sector = {
        uuid : obj.uuid,
        name : obj.name,
        province_uuid :obj.province_uuid
      };

      connect.put('sector', [connect.clean(sector)], ['uuid'])
      .then(function (suc) {
        sector.province_name = $scope.provinces.get(sector.province_uuid).name;
        $scope.sectors.put(sector);
        $scope.op = '';
      })
      .catch(function (err) {
        messenger.danger('error during editing', err);
      });
    }

    function removeSector(uuid){
      connect.delete('sector', 'uuid', uuid)
      .then(function (suc){
        $scope.sectors.remove(uuid);
      })
      .catch(function (err) {
        messenger.danger('error during deleting', err);
      });
    }

    validate.process(dependencies)
    .then(manageSector);

    $scope.setOp = setOp;
    $scope.addSector = addSector;
    $scope.editSector = editSector;
    $scope.removeSector = removeSector;
  }
]);
