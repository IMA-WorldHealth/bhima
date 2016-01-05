angular.module('bhima.controllers')
.controller('inventory.manifest', [
  '$scope',
  'validate',
  'appstate',
  function ($scope, validate, appstate) {
    var dependencies = {};

    $scope.timestamp = new Date();

    dependencies.inventory = {
      query : {
        identifier : 'uuid',
        tables : {
          'inventory' : {
            columns: ['uuid', 'code', 'text', 'price', 'unit_id', 'unit_weight', 'unit_volume', 'type_id', 'consumable']
          },
          'inventory_group' : {
            columns : ['name']
          }
        },
        join: ['inventory.group_uuid=inventory_group.uuid'],
      }
    };

    dependencies.units = {
      query : {
        tables : {
          'inventory_unit': {
            columns : ['id', 'text' ]
          }
        }
      }
    };

    dependencies.types = {
      query : {
        tables : {
          'inventory_type' : {
            columns : ['id', 'text' ]
          }
        }
      }
    };

    dependencies.currencies = {
      query : {
        tables : {
          'currency' : {
            columns : ['id', 'symbol']
          }
        }
      }
    };

    function startup(models) {
      angular.extend($scope, models);
    }

    appstate.register('project', function (project) {
      $scope.project = project;
      validate.process(dependencies)
      .then(startup);
    });

    $scope.print = function printer() {
      window.print();
    };
  }
]);
