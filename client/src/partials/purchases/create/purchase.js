angular.module('bhima.controllers')
.controller('CreatePurchaseOrderController', CreatePurchaseOrderController);

CreatePurchaseOrderController.$inject = [
  '$scope', '$q', '$translate', '$location', 'validate', 'connect', 'appstate',
  'messenger', 'uuid', 'util', 'SessionService'
];

function CreatePurchaseOrderController($scope, $q, $translate, $location, validate, connect, appstate, messenger, uuid, util, Session) {
  // TODO Module should only continue with selection of both employee and
  // supplier, currently just hides everything to look like this
  // TODO Currently downloads every location - should only download the
  // selected creditors location
  // FIXME Everything currently waits on validate to process (download) models
  // begin settup etc. before that
  var dependencies = {};
  var session = $scope.session = { is_direct : false, label_purchase_type : 'indirect' },
      warnings = $scope.warnings = {};

  session.today = new Date();

  dependencies.inventory = {
    query : {
      identifier : 'uuid',
      tables : {
        inventory : { columns : ['uuid', 'code', 'text', 'purchase_price', 'type_id', 'group_uuid'] },
        inventory_group : { columns : ['sales_account', 'stock_account', 'donation_account'] },
      },
      join : ['inventory_group.uuid=inventory.group_uuid'],
      where : ['inventory_group.stock_account<>null']
    }
  };

  dependencies.creditor = {
    query : {
      tables : {
        supplier : { columns : ['uuid', 'name', 'creditor_uuid'] },
      }
    }
  };

  dependencies.employee = {
    query : {
      tables : {
        employee : { columns : ['id', 'code', 'prenom', 'name', 'postnom', 'dob', 'creditor_uuid'] }
      },
      where : ['employee.locked<>1']
    }
  };

  dependencies.creditorLocation = {
    identifier : 'uuid',
    query : '/location/villages'
  };

  dependencies.enterprise = {
    query : {
      tables : {
        enterprise : { columns : ['currency_id']}
      }
    }
  };

  warnings.invalid_price = {
    condition : function (item) { return item.code ? (Number(item.purchase_price) === 0) : false ; },
    message : 'PURCHASE.INVALID_PRICE',
  };

  appstate.register('project', function (project) {
    $scope.project = project;
     validate.process(dependencies).then(initialise);
  });

  function initialise(model) {
    $scope.idUser = Session.user.id;
    angular.extend($scope, model);
    $scope.user = Session.user;
    settupSession(session);
  }

  function settupSession(session) {
    session.selected = false;
    session.purchase = {
      uuid : uuid(),
      purchase_date : getDate(),
      note : formatPurchaseDescription()
    };
    session.hr_id = session.purchase.uuid.substr(0, 6);
    session.items = [];
  }

  function formatPurchaseDescription() {
    if (!session.creditor) { return '...'; }

    return [
      'PO',
      (session.label_purchase_type).toUpperCase(),
      session.hr_id,
      getDate(), //session.date,
      session.creditor.name
    ].join('/');
  }

  function selectCreditor(creditor) {
    session.location = $scope.creditorLocation.get(creditor.location_id);
    session.purchase.note = formatPurchaseDescription();
    if(session.is_direct) { initPanelSuccess(); }
    settupPurchase();
  }

  function settupPurchase() {
    session.items = [];
    addPurchaseItem();
    if(!session.is_direct && session.employee) { initPanelSuccess(); }
  }

  function addPurchaseItem() {
    var item = new PurchaseItem();
    session.items.push(item);
    return item;
  }

  function PurchaseItem() {
    var self = this;

    function set(inventoryReference) {
      self.quantity = self.quantity || 1;
      self.code = inventoryReference.code;
      self.text = inventoryReference.text;

      // FIXME naive rounding - ensure all entries/ exits to data are rounded to 4 DP
      self.purchase_price = Number(inventoryReference.purchase_price.toFixed(4));
      self.inventoryId = inventoryReference.uuid;
      self.note = '';
      self.isSet = true;
    }

    this.quantity = 0;
    this.code = null;
    this.inventoryId = null;
    this.purchase_price = null;
    this.text = null;
    this.note = null;
    this.set = set;

    return this;
  }

  function updatePurchaseItem(purchaseItem, inventoryReference) {
    if (purchaseItem.inventoryReference) {
      $scope.inventory.post(purchaseItem.inventoryReference);
      $scope.inventory.recalculateIndex();
    }
    purchaseItem.set(inventoryReference);
    purchaseItem.inventoryReference = inventoryReference;

    // Remove option to select duplicates
    $scope.inventory.remove(inventoryReference.uuid);
    $scope.inventory.recalculateIndex();
  }

  function removePurchaseItem(index) {
    var currentItem = session.items[index];

    if (currentItem.inventoryReference) {
      $scope.inventory.post(currentItem.inventoryReference);
      $scope.inventory.recalculateIndex();
    }
    session.items.splice(index, 1);
  }

  function purchaseTotal() {
    return session.items.reduce(priceMultiplyQuantity, 0);
  }

  function priceMultiplyQuantity(a, b) {
    a = (a.quantity * a.purchase_price) || a;
    return (b.code) ? a + (b.quantity * b.purchase_price) : a;
  }


  function verifyPurchase(items) {
    var invalid = false;
    var invalidKeys = [];

    if (!items || !items.length) { return true; }

    invalid = items.some(function (purchaseItem) {

      Object.keys(warnings).forEach(function (key) {
        if (warnings[key].condition(purchaseItem)) {
          invalidKeys.push(key);
        }
      });

      if (!purchaseItem.code || !purchaseItem.purchase_price) {
        return true;
      }
      return false;
    });
    // FIXME
    Object.keys(warnings).forEach(function(key) {
      warnings[key].result = false;
      if (invalidKeys.indexOf(key) >= 0) {
        warnings[key].result = true;
      }
    });

    return invalid;
  }

  function submitPurchase() {
    var purchase = connect.clean(session.purchase);
    purchase.cost = purchaseTotal();
    purchase.purchase_date = util.sqlDate(purchase.purchase_date);
    purchase.currency_id = $scope.enterprise.data[0].currency_id;
    purchase.creditor_uuid = session.creditor.creditor_uuid;
    purchase.receiver_id = session.receiver.id; //the receiver
    purchase.project_id = $scope.project.id;
    purchase.emitter_id = $scope.idUser; // the user who built the purchase
    purchase.purchaser_id = session.is_direct === true ? null : session.employee.id; // the employee who will go to make purchase
    purchase.is_direct = session.is_direct === true ? 1 : 0;

    writePurchaseLine(purchase)
    .then(writePurchaseItems(purchase.uuid))
    .then(writeSuccess)
    .catch(handleError);
  }

  function writePurchaseLine(purchase) {
    return connect.post('purchase', [purchase], ['uuid']);
  }

  function writePurchaseItems(purchase_uuid) {
    var deferred = $q.defer();
    var writeRequest = [];

    writeRequest = session.items.map(function (item) {
      var writeItem = {
        uuid           : uuid(),
        purchase_uuid  : purchase_uuid,
        inventory_uuid : item.inventoryId,
        quantity       : item.quantity,
        unit_price     : item.purchase_price,
        total          : item.quantity * item.purchase_price
      };
      return connect.post('purchase_item', [writeItem], ['uuid']);
    });

    $q.all(writeRequest)
    .then(function (result) {
      deferred.resolve(result);
    })
    .catch(function (error) {
      deferred.reject(error);
    });
    return deferred.promise;
  }

  function writeSuccess() {
     $location.path('/invoice/purchase/' + session.purchase.uuid);
  }

  function handleError(error) {
    $translate('PURCHASE.WRITE_FAILED')
    .then(function (value) {
       messenger.danger(value);
    });
  }

  function getDate() {
    var now = new Date();
    return now; //now.getFullYear() + '-' + ('0' + (now.getMonth() + 1)).slice(-2) + '-' + ('0' + now.getDate()).slice(-2);
  }

  function initPanelSuccess() {
    session.panel_success = {
      direct   : Boolean(session.creditor),
      indirect : Boolean(session.creditor && session.employee)
    };
    session.panel_success.direct_and_indirect = session.panel_success.direct && session.panel_success.indirect;
    session.panel_success.direct_or_indirect = session.panel_success.direct || session.panel_success.indirect;
  }

  function getPurchaseType() {
    session.label_purchase_type = session.is_direct === true ? $translate.instant('PURCHASE.DIRECT') : $translate.instant('PURCHASE.INDIRECT');
    session.purchase.note = formatPurchaseDescription();
    session.creditor = null;
    session.employee = null;
    session.panel_success = null;
  }

  $scope.selectCreditor = selectCreditor;
  $scope.addPurchaseItem = addPurchaseItem;
  $scope.removePurchaseItem = removePurchaseItem;
  $scope.updatePurchaseItem = updatePurchaseItem;
  $scope.purchaseTotal = purchaseTotal;
  $scope.verifyPurchase = verifyPurchase;
  $scope.submitPurchase = submitPurchase;
  $scope.initPanelSuccess = initPanelSuccess;
  $scope.getPurchaseType = getPurchaseType;
}
