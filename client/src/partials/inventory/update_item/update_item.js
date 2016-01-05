angular.module('bhima.controllers')
.controller('InventoryUpdateController', InventoryUpdateController);

InventoryUpdateController.$inject = [
  '$scope', '$translate', 'validate', 'connect', 'messenger',
  'liberror', 'uuid', 'util'
];

function InventoryUpdateController($scope, $translate, validate, connect, messenger, liberror, uuid, util) {
  // TODO
  //  (1) History is relatively uninformative.  It should record
  //    (a) User ID
  //    (b) Changes made
  //  Without these, there really isn't a point

  var dependencies = {}, selectedItem;
  var session = $scope.session = {
    search: true
  };

  var error = liberror.namespace('INVENTORY');

  dependencies.inventory = {
    query : {
      identifier : 'uuid',
      tables : {
        inventory : {
          columns : ['uuid', 'code', 'text', 'price', 'purchase_price', 'group_uuid', 'unit_id', 'unit_weight', 'unit_volume', 'stock_min', 'stock_max', 'consumable', 'type_id']
        }
      }
    }
  };

  dependencies.history = {
    query : {
      tables : {
        inventory_log : {
          columns : ['uuid', 'log_timestamp', 'price', 'code', 'text']
        }
      }
    }
  };

  dependencies.accounts = {
    query : {
      tables : {
        account : {
          columns : ['id', 'account_txt', 'account_number']
        }
      }
    }
  };

  dependencies.units = {
    query : {
      tables : {
        inventory_unit : {
          columns : ['id', 'text']
        }
      }
    }
  };

  dependencies.types = {
    query : {
      tables : {
        inventory_type : {
          columns : ['id', 'text']
        }
      }
    }
  };

  dependencies.groups = {
    query : {
      identifier : 'uuid',
      tables : {
        inventory_group : {
          columns : ['uuid', 'code', 'name']
        }
      }
    }
  };

  function init(models) {
    angular.extend($scope, models);
  }

  (function startup() {
    validate.process(dependencies, ['inventory', 'accounts', 'groups', 'types', 'units'])
    .then(init);
  })();

  function selectStock(uuid) {
    selectedItem = $scope.selectedItem = $scope.inventory.get(uuid);

    selectedItem.consumable = selectedItem.consumable !== 0;
    
    $scope.cachePrice = angular.copy(selectedItem.price);
    $scope.cachePurchasePrice = angular.copy(selectedItem.purchase_price);
  }

  function loadStock () {
    session.search = false;
    dependencies.history.query.where = ['inventory_log.inventory_uuid=' + selectedItem.uuid];
    validate.refresh(dependencies, ['history'])
    .then(function (models) {
      $scope.history = models.history;
    });
  }

  // function displayHistory(model) {}

  function refreshSession() {
    session.search = true;
    selectedItem = $scope.selectedItem = null;
    $scope.session.stockSearch = '';
  }

  function detectErrors(item) {
    var hasErrors;
    if (isNaN(Number(item.price))) {
      error.throw('ERR_INVALID_PRICE', item.price);
      hasErrors = true;
    }

    if (item.code === undefined || item.code === '') {
      error.throw('ERR_INVALID_CODE', item.code);
      hasErrors = true;
    }

    if (item.text === undefined || item.text === '') {
      error.throw('ERR_INVALID_LABEL', item.text);
      hasErrors = true;
    }

    return hasErrors;
  }

  function submitUpdate() {
    var updateLine, history;
    updateLine = connect.clean(selectedItem);

    var inventory_type_data = $scope.types.data;
    updateLine.consumable = 0;
    inventory_type_data.forEach(function (inventoryType) {
      if (parseInt(updateLine.type_id) === parseInt(inventoryType.id)) {
        if (inventoryType.text === 'Article') {
          updateLine.consumable = 1;  
        }
      } 
    });

    if (detectErrors(updateLine)) { return; }

    connect.put('inventory', [updateLine], ['uuid'])
    .then(function writeHistory() {
      // Write history

      history = {
        uuid : uuid(),
        inventory_uuid : updateLine.uuid,
        log_timestamp : util.sqlDate(new Date()),
        price : updateLine.price,
        code : updateLine.code,
        text : updateLine.text
      };

      return connect.post('inventory_log', [history]);
    })
    .then(function () {
      messenger.success({ namespace : 'INVENTORY', description : $translate.instant('INVENTORY.UPDATE_ITEM.UPDATE_SUCCESS') });
      $scope.cachePrice = angular.copy(selectedItem.price);
      $scope.cachePurchasePrice = angular.copy(selectedItem.purchase_price);
      // refresh history
      validate.refresh(dependencies, ['history'])
      .then(function (models) {
        $scope.history = models.history;
      });
    });
  }

  $scope.loadStock = loadStock;
  $scope.selectStock = selectStock;
  $scope.refreshSession = refreshSession;
  $scope.submitUpdate = submitUpdate;
}
