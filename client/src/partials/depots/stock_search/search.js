angular.module('bhima.controllers')
.controller('DepotStockSearchController', DepotStockSearchController);

DepotStockSearchController.$inject = [
  '$scope', 'connect', 'appstate', 'validate', 'store', 'messenger', 'InventoryService'
];

/**
* Depot Stock Search Controller
*
* Locates stock in depots around the enterprise.
*
* FIXME -- this is broken and needs to be repaired.
*/
function DepotStockSearchController($scope, connect, appstate, validate, Store, messenger, Inventory) {
  var vm = this;

  var dependencies = {};
  var session = $scope.session = { search: true, totals : {} };
  var selectedStock;


  dependencies.inventory = {
    query : {
      identifier : 'uuid',
      tables : {
        inventory : { columns : ['uuid', 'code', 'text', 'price', 'purchase_price', 'group_uuid', 'unit_id'] }
      }
    }
  };

  function startup (models) {
    angular.extend($scope, models);
  }

  function error (err) {
    messenger.danger(err);
  }

  appstate.register('project', function (project) {
    $scope.project = project;
    validate.process(dependencies, ['inventory'])
    .then(startup)
    .catch(error);
  });

  $scope.refreshSession = function refreshSession() {
    session.search = true;
    selectedStock = $scope.selectedStock = null;
    $scope.session.stockSearch = '';
  };

  $scope.loadStock = function loadStock (uuid) {
    selectedStock = $scope.selectedStock = $scope.inventory.get(uuid);
    session.search = false;
    connect.fetch('/stock_location/?id=' + uuid)
    .success(function (data) {
      var stock = new Store({ data : [], identifier : 'tracking_number' });


      data.forEach(function (row) {
        if (!stock.get(row.tracking_number)) {
          row.total = 0;
          stock.post(row);
        }
        stock.get(row.tracking_number).total += row.direction === 'Enter' ? row.quantity : -1 * row.quantity;
      });

      session.stock = stock;
    })
    .catch(error);
  };

  $scope.$watch('session.stock.data', function () {
    if (!session.stock || !session.stock.data) { return; }
    session.totals.quantity = 0;
    session.totals.quantity = session.stock.data.reduce(function (agg, row) {
      return agg + row.quantity;
    }, 0);
  });

}
