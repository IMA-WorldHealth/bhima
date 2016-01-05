angular.module('bhima.controllers')
.controller('receipt.movement', [
  '$scope',
  '$routeParams',
  'validate',
  function ($scope, $routeParams, validate) {
    var dependencies = {}, model = $scope.model = {common : {}},
      invoiceId    = $scope.invoiceId = $routeParams.invoiceId;

    dependencies.movement = {
      query : {
        tables : {
          depot : {
            columns : ['reference']
          },
          movement : {
            columns : ['uuid', 'depot_entry', 'depot_exit', 'tracking_number', 'quantity', 'date']
          },
          stock : {
            columns : ['inventory_uuid', 'tracking_number', 'expiration_date', 'entry_date', 'lot_number']
          },
          inventory : {
            columns : ['code', 'text']
          }
        },
        where : ['movement.document_id='+invoiceId],
        join : [
          'depot.uuid=movement.depot_exit',
          'movement.tracking_number=stock.tracking_number',
          'stock.inventory_uuid=inventory.uuid'
        ]
      }
    };
    validate.process(dependencies).then(fetchDepot);

    function fetchDepot(model) {
      var depot_entry = model.movement.data[0].depot_entry;
      var depot_exit = model.movement.data[0].depot_exit;

      dependencies.depots = {
        query : {
          identifier : 'uuid',
          tables : {
            depot : {
              columns : ['uuid','reference', 'text']
            }
          },
          where : ['depot.uuid=' + depot_exit, 'OR', 'depot.uuid=' + depot_entry]
        }
      };

      validate.process(dependencies)
      .then(function (depotModel) {
        angular.extend($scope, depotModel);
        $scope.depotEntry = depotModel.depots.get(depot_entry);
        $scope.depotExit = depotModel.depots.get(depot_exit);
      });
    }

  }
]);