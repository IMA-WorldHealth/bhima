angular.module('bhima.controllers')
.controller('DepotStockIntegrationController', DepotStockIntegrationController);

DepotStockIntegrationController.$inject = [
  '$scope', '$q', '$translate', '$location', '$routeParams', 'validate', 'connect',
  'appstate', 'messenger', 'uuid', 'util', 'appcache', '$http', 'SessionService'
];

function DepotStockIntegrationController($scope, $q, $translate, $location, $routeParams, validate, connect, appstate, messenger, uuid, util, Appcache, $http, Session) {
  var dependencies = {},
      session = $scope.session = {cfg : {}, totals : [], selectedAccount : {}, configured : true, integration : {} },
      warnings = $scope.warnings = {};

  var cache = new Appcache('integration');

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

  dependencies.inventory = {
    query : {
      identifier : 'uuid',
      tables : {
        inventory : { columns : ['uuid', 'code', 'text', 'purchase_price', 'type_id', 'group_uuid'] },
        inventory_group : { columns : ['sales_account', 'stock_account', 'donation_account'] },
      },
      join : ['inventory_group.uuid=inventory.group_uuid'],
      where : ['inventory_group.donation_account<>null','AND','inventory_group.stock_account<>null']
    }
  };

  dependencies.donor = {
    query : {
      tables : {
        donor : { columns : ['id', 'name']}
      }
    }
  };

  dependencies.employee = {
    query : {
      tables : {
        employee : { columns : ['id', 'code', 'prenom', 'name', 'postnom', 'dob', 'creditor_uuid']}
      }
    }
  };

  dependencies.donations = {
    query : {
      tables : {
        donations     : { columns : ['date']},
        donation_item : { columns : ['uuid']},
        inventory     : { columns : ['text']},
        stock         : { columns : ['tracking_number','lot_number','quantity']},
        donor         : { columns : ['name']}
      },
      join : [
        'donations.donor_id=donor.id',
        'donations.uuid=donation_item.donation_uuid',
        'inventory.uuid=stock.inventory_uuid',
        'stock.tracking_number=donation_item.tracking_number'
      ]
    }
  };

  dependencies.accounts = {
    required : true,
    query : 'getAccount7/'
  };

  appstate.register('project', function (project) {
    $scope.project = project;
    validate.process(dependencies)
    .then(startup)
    .catch(error);
  });

  function startup (models) {
    session.config = {};
    session.config.date = new Date();
    session.stocks = [];

    angular.extend($scope, models);
    session.depot = $scope.depots.get($routeParams.depotId);
    session.acceptIntegration = false;
    session.user = Session.user;
  }

  $scope.acceptIntegration = function () {
    session.integration.step = 'select_inventories';
    session.acceptIntegration = true;
    addStockItem();
  };

  function error (err) {
    messenger.danger(JSON.stringify(err));
  }

  function StockItem () {
    var self = this;

    this.inventory_uuid = null;
    this.text = null;
    this.date = new Date();
    this.lot_number = null;
    this.tracking_number = uuid();
    this.quantity = 0;
    this.purchase_price = 0;
    this.purchase_order_uuid = null;
    this.isValidStock = false;

    this.set = function (inventoryReference) {
      self.inventory_uuid = inventoryReference.uuid;
      self.code = inventoryReference.code;
      self.text = inventoryReference.text;
      self.expiration_date = new Date();
      self.date = new Date();
      self.lot_number = null;
      self.tracking_number = uuid();
      self.purchase_price = self.purchase_price || 0;
      self.purchase_order_uuid = null;
      self.isSet = true;
    };

    return this;
  }

  function addStockItem (drug) {
    var stock = new StockItem();

    // set up watchers for totalling and validation
    var listenCalculateTotals = $scope.$watch('session.stocks', calculateTotals, true);
    var listenValidateSession = $scope.$watch('session.stocks', validateSession, true);
    var listenValidateExpirationDate = $scope.$watch('session.stocks', validateExpirationDate, true);
    session.stocks.push(stock);
  }

  function removeStockItem (idx) {
    session.stocks.splice(idx, 1);
  }

  $scope.expand = function (drug) {
    drug.isCollapsed = !drug.isCollapsed;
  };

  $scope.updateStockItem = function (stockItem, inventoryReference) {
    stockItem.set(inventoryReference);
  };

  $scope.stockTotal = function () {
    return session.stocks.reduce(priceMultiplyQuantity, 0);
  };

  function priceMultiplyQuantity(a, b) {
    a = (a.quantity * a.purchase_price) || a;
    return (b.code) ? a + (b.quantity * b.purchase_price) : a;
  }

  function validateSession () {
    session.stockExist = session.stocks.length > 0;
    session.isValid = session.stocks[0] && session.stocks[0].code && session.stocks.every(function (stockItem) {
      stockItem.isValidStock = valid(stockItem);
      return stockItem.isValidStock;
    });
  }

  function validateExpirationDate () {
    session.isValidExpirationDate = session.stocks[0] && session.stocks[0].code && session.stocks.every(function (stockItem) {
      return validExpiration(stockItem);
    });
  }

  function validExpiration (stockItem) {
    var isDef = angular.isDefined;
    var minimumDate = new Date();
    return isDef(stockItem.code) && isDef(stockItem.expiration_date) && (stockItem.expiration_date > minimumDate) ? true : false;
  }

  function sum (a, b) {
    return a + Number(b.quantity);
  }

  function calculateTotals () {
    if (!session.stocks || session.stocks.length <= 0) { return; }

    var totals = session.totals;
    totals.quantity = 0;
    totals.price = 0;

    session.stocks.forEach(function (stockItem) {
      totals.quantity += Math.round(stockItem.quantity);
      totals.price += stockItem.purchase_price * stockItem.quantity;
    });
  }

  function valid (stockItem) {
    var isDef = angular.isDefined;
    var n = parseFloat(stockItem.quantity);
    return n > 0 && isDef(stockItem.lot_number) && isDef(stockItem.expiration_date) && !!stockItem.lot_number;
  }

  function preview () {
    session.integration.step = 'preview_inventories';
  }

  function cancel () {
    session.integration.step = 'select_inventories';
  }

  $scope.accept = function () {
    var document_id = uuid();
    var stocks = processStocks();
    var movement = processMovements(document_id);

    connect.post('stock',stocks)
      .then(function () {
        return connect.post('movement', movement);
      })
      .then(simulatePurchase)
      .then(function () {

        /*return $q.all(synthese.map(function (postingEntry) {
          // A FIXE   : L'affichage des transactions dans le journal n'est pas en ordre
          // A FIXE   : Ecrire chaque 'postingEntry' dans le journal de facon singuliere
          // OBJECTIF : Ecrire pour chaque inventory de la donation comme une transaction dans le journal
          return $http.post('posting_donation/', postingEntry);
        }));*/

      })
      .then(function () {
        $location.path('/stock/entry/report/' + document_id);
      })
      .then(function () {
         messenger.success($translate.instant('STOCK.ENTRY.WRITE_SUCCESS'), true);
      })
      .catch(function () {
        messenger.success($translate.instant('STOCK.ENTRY.WRITE_ERROR'), true);
      });

  };

  function processMovements (document_id) {
    var movements = [];
    session.stocks.forEach(function (stockItem) {
      movements.push({
        uuid            : uuid(),
        document_id     : document_id,
        tracking_number : stockItem.tracking_number,
        date            : util.sqlDate(new Date()),
        quantity        : stockItem.quantity,
        depot_entry     : session.cfg.depot.id
      });
    });

    return movements;
  }

  function processStocks () {
    // Lot a inserer dans la table `stock`
    var stocks = [];
    session.stocks.forEach(function (stockItem) {
      stocks.push({
        inventory_uuid      : stockItem.inventory_uuid,
        expiration_date     : util.sqlDate(stockItem.expiration_date),
        entry_date          : util.sqlDate(new Date()),
        lot_number          : stockItem.lot_number,
        tracking_number     : stockItem.tracking_number,
        quantity            : stockItem.quantity
      });
    });

    return stocks;
  }

  function formatAccount (acc) {
    return [acc.number, acc.label].join(' - ');
  }

  function setConfiguration (acc) {
    if (acc) {
      cache.put('selectedAccount', acc);
      session.configured = true;
      session.acc = acc;
    }
  }

  function reconfigure() {
    cache.remove('selectedAccount');
    session.acc = null;
    session.configured = false;
  }

  function simulatePurchase() {
    if (session.stocks.length > 0) {

      var purchase = {
        uuid          : uuid(),
        cost          : simulatePurchaseTotal(),
        purchase_date : util.sqlDate(session.config.date),
        currency_id   : Session.enterprise.currency_id,
        creditor_uuid : null,
        purchaser_id  : null,
        emitter_id    : Session.user.id,
        project_id    : $scope.project.id,
        receiver_id   : null,
        note          : 'INTEGRATION_STOCK /' + util.sqlDate(session.config.date),
        paid          : 0,
        confirmed     : 0,
        closed        : 0,
        is_integration: 1,
        is_direct     : 0
      };

      simulateWritePurchaseLine(purchase)
      .then(simulateWritePurchaseItems(purchase.uuid))
      .then(updateStockPurchaseOrder(purchase.uuid))
      .catch(handleError);
    }

  }

  function updateStockPurchaseOrder (purchase_uuid) {
    session.stocks.forEach(function (stockItem) {
      var stockEntry = {
        tracking_number     : stockItem.tracking_number,
        purchase_order_uuid : purchase_uuid
      };
      connect.put('stock', [stockEntry], ['tracking_number']);
    });
  }

  function simulatePurchaseTotal() {
    return session.stocks.reduce(priceMultiplyQuantity, 0);
  }


  function simulateWritePurchaseLine(purchase) {
    return connect.post('purchase', purchase);
  }

  function simulateWritePurchaseItems(purchase_uuid) {
    var requests = session.stocks.map(function (item) {
      var writeItem = {
        uuid           : uuid(),
        purchase_uuid  : purchase_uuid,
        inventory_uuid : item.inventory_uuid,
        quantity       : item.quantity,
        unit_price     : item.purchase_price,
        total          : item.quantity * item.purchase_price
      };
      return connect.post('purchase_item', writeItem);
    });

    return $q.all(requests);
  }

  function handleError(error) {
    messenger.danger($translate.instant('PURCHASE.WRITE_FAILED'));
  }

  $scope.formatAccount = formatAccount;
  $scope.setConfiguration = setConfiguration;
  $scope.addStockItem = addStockItem;
  $scope.reconfigure = reconfigure;
  $scope.addStockItem = addStockItem;
  $scope.removeStockItem = removeStockItem;
  $scope.validExpiration = validExpiration;
  $scope.valid = valid;
  $scope.preview = preview;
  $scope.cancel = cancel;
}
