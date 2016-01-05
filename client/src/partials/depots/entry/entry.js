angular.module('bhima.controllers')
.controller('DepotEntryController', DepotEntryController);

DepotEntryController.$inject = [
  '$scope', '$translate', '$q', '$location', '$routeParams', 'validate',
  'connect', 'messenger', 'appstate', 'precision', 'store', 'uuid', 'util'
];

/**
* Stock Entry Controller
*
* This controller is responsible for setting up stock entry.
*
* TODO
*  1. Use Depot, Stock, and Inventory services to reduce the code in this
*  controller.
*/
function DepotEntryController($scope, $translate, $q, $location, $routeParams, validate, connect, messenger, appstate, precision, Store, uuid, util) {
  var dependencies = {},
      session = $scope.session = { cfg : {}, totals : [] },
      find = $scope.find = { active : true, fn : {} };

  // TODO -- translate this
  if (!angular.isDefined($routeParams.depotId)) {
    messenger.error('NO_DEPOT_ID');
  }

  session.cfg.depot = { id : $routeParams.depotId };

  dependencies.depots = {
    query : {
      identifier : 'uuid',
      tables : {
        'depot' : {
          columns : ['uuid', 'reference', 'text']
        }
      }
    }
  };

  dependencies.projects = {
    query : {
      tables : {
        'project' : {
          columns : ['id', 'abbr']
        }
      }
    }
  };

  dependencies.names = { query : 'reports/purchase_order/'};

  dependencies.employees = {
    query : {
      tables : {
        'employee' : {
          columns : ['id', 'prenom', 'name']
        }
      }
    }
  };

  dependencies.orders = {
    query : {
      identifier : 'code',
      tables : {
        'purchase' : {
          columns : ['project_id', 'reference', 'cost', 'currency_id', 'creditor_uuid', 'purchaser_id', 'purchaser_id', 'timestamp', 'purchase_date', 'is_direct']
        },
        'purchase_item' : {
          columns : ['uuid', 'inventory_uuid', 'quantity', 'unit_price', 'total']
        },
        'project' : {
          columns : ['abbr']
        },
        'inventory' : {
          columns : ['code', 'text']
        },
        'inventory_group' : { // FIXME : add alaising the connect.req();
          columns : ['name']
        }
      },
      join : [
        'purchase.uuid=purchase_item.purchase_uuid',
        'purchase.project_id=project.id',
        'purchase_item.inventory_uuid=inventory.uuid',
        'inventory.group_uuid=inventory_group.uuid'
      ],
    }
  };

  find.fn.commit = function commit (order) {
    // order.label is a text identifier such as
    // PAX2 or HBB1235
    if (!order || !order.label || order.label.length < 1) { return messenger.danger($translate('STOCK.ENTRY.ERR_EMPTY_PARAMTER')); }

    session.selected = order;
    session.cfg.purchase_uuid = order.uuid;
    session.cfg.label = order.label;

    var project = order.label.substr(0,3).toUpperCase();
    var reference = Number(order.label.substr(3));

    dependencies.orders.query.where = [
      'project.abbr=' + project,
      'AND',
      'purchase.reference=' + reference
    ];

    validate.refresh(dependencies, ['orders'])
    .then(setSessionProperties)
    .then(calculateTotals)
    .catch(function (err) {
      find.valid = false;
      error(err);
    });

  };

  find.fn.activate = function activate () {
    find.active = true;
  };

  find.fn.reset = function reset () {
    find.active = true;
    find.valid = false;
  };

  function startup (models) {
    angular.extend($scope, models);

    session.depot = $scope.depots.get($routeParams.depotId);

    $scope.names.data.forEach(function (order) {
      order.label = $scope.projects.get(order.project_id).abbr + order.reference;
    });
  }

  function error (err) {
    messenger.danger(JSON.stringify(err));
  }

  appstate.register('project', function (project) {
    $scope.project = project;
    dependencies.depots.query.where =
      ['depot.enterprise_id=' + project.enterprise_id];
    dependencies.projects.query.where =
      ['project.enterprise_id=' + project.enterprise_id];
    validate.process(dependencies, ['names', 'depots', 'projects', 'employees'])
    .then(startup)
    .catch(error);
  });

  function validateSession () {
    session.valid = session.order.data.every(function (drug) {
      return drug.validLots;
    });
  }

  function setSessionProperties (models) {
    if (models.orders.data.length < 1) {
      return $q.reject('ERROR.EMPTY_DATA');
    }

    // deactivate find
    find.valid = true;
    find.active = false;

    // set up watchers for totalling and validation
    $scope.$watch('session.order.data', calculateTotals, true);
    $scope.$watch('session.order.data', validateSession, true);

    session.order = models.orders;

    // set up session properties
    session.cfg.is_direct = models.orders.data[0].is_direct;
    session.cfg.order_date = new Date(models.orders.data[0].purchase_date);

    if(!session.cfg.is_direct){
      session.cfg.employee_id = models.orders.data[0].purchaser_id;
      session.cfg.employee_name = ($scope.employees.get(session.cfg.employee_id).prenom || '') + ' ' + ($scope.employees.get(session.cfg.employee_id).name || '');
    }

    // modify paramters
    session.order.data.forEach(function (drug) {
      drug.lots = new Store({ identifier : 'tracking_number', data : [] });
      angular.extend(drug, { isCollapsed : false });
      //drug.isCollapsed = false;
      //drug.edittable = true;
      $scope.addLot(drug);
    });
  }

  function sum (a, b) {
    return a + Number(b.quantity);
  }

  function calculateTotals () {
    if (!session.order || !session.order.data) { return; }

    // total and calculate metadata
    var totals = session.totals;

    totals.quantity = 0;
    totals.price = 0;
    totals.purchase_price = 0;
    totals.items = session.order.data.length;
    session.order.data.forEach(function (drug) {
      totals.quantity += precision.round(drug.quantity);
      totals.price += precision.round(drug.unit_price * drug.quantity);
      drug.totalQuantity = drug.lots.data.reduce(sum, 0);
      drug.validLots = valid(drug.lots) && drug.totalQuantity === drug.quantity;
    });
  }

  function valid (lots) {
    var isDef = angular.isDefined;
    return lots.data.every(function (row) {
      var newDate = new Date().getTime(),
        expirate = new Date(row.expiration_date).getTime(),
        diffDays = (parseInt((expirate-newDate)/(24*3600*1000)));

      var n = parseFloat(row.quantity);
      return n > 0 && (diffDays > 0) && isDef(row.lot_number) &&
        isDef(row.expiration_date) &&
        !!row.lot_number;
    });
  }

  $scope.cancel = function cancel () {
    session = $scope.session = { cfg : {}, totals : [] };
    find.fn.reset();
  };

  $scope.expand = function expand (drug) {
    drug.isCollapsed = !drug.isCollapsed;
  };

  function Lot () {
    this.inventory_uuid = null;
    this.purchase_order_uuid = null;
    this.expiration_date = new Date();
    this.date = new Date();
    this.lot_number = null;
    this.tracking_number = uuid();
    this.quantity = 0;
  }

  $scope.addLot = function addLot (drug) {
    var lot = new Lot();
    lot.code = drug.code;
    lot.inventory_uuid = drug.inventory_uuid;
    drug.lots.post(lot);
  };

  $scope.removeLot = function removeLot (drug, idx) {
    drug.lots.data.splice(idx, 1);
  };

  $scope.review = function review () {
    // prepare object for cloning
    session.review = true;
    var lots = [];
    session.order.data.forEach(function (o) {
      lots = lots.concat(o.lots.data);
    });
    session.lots = lots;
  };

  function processStock () {
    var stocks = [];
    session.lots.forEach(function (stock) {
      stocks.push({
        inventory_uuid      : stock.inventory_uuid,
        expiration_date     : util.sqlDate(stock.expiration_date),
        entry_date          : util.sqlDate(new Date()),
        lot_number          : stock.lot_number,
        purchase_order_uuid : session.cfg.purchase_uuid,
        tracking_number     : stock.tracking_number,
        quantity            : stock.quantity
      });
    });

    return stocks;
  }

  function processMovements (document_id) {
    var movements = [];
    session.lots.forEach(function (stock) {
      movements.push({
        uuid : uuid(),
        document_id     : document_id,
        tracking_number : stock.tracking_number,
        date            : util.sqlDate(new Date()),
        quantity        : stock.quantity,
        depot_entry     : session.cfg.depot.id,
      });
    });

    return movements;
  }

  function setPurchasePrice () {
    session.order.data.forEach(function (item) {
      var obj = {
        uuid           : item.inventory_uuid,
        purchase_price : item.unit_price
      };
      connect.put('inventory', [obj], ['uuid']);
    });
  }

  $scope.accept = function () {
    var document_id = uuid();
    var stock = processStock();
    var movements = processMovements(document_id);
    connect.post('stock', stock)
    .then(function () {
      return connect.post('movement', movements);
    })
    .then(function () {
      return connect.put('purchase', [{ uuid : session.cfg.purchase_uuid, closed : 1 }], ['uuid']);
    })
    .then(setPurchasePrice)
    .then(function () {
      messenger.success($translate.instant('STOCK.ENTRY.WRITE_SUCCESS'));
      $location.path('/stock/entry/report/' + document_id);
    })
    .catch(function () {
      messenger.error($translate.instant('STOCK.ENTRY.WRITE_ERROR'));
    });
  };
}
