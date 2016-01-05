angular.module('bhima.controllers')
.controller('InventoryRegisterController', InventoryRegisterController);

InventoryRegisterController.$inject = [
  '$scope', '$translate', 'appstate', 'connect', '$modal',
  'messenger', 'validate', 'uuid'
];

function InventoryRegisterController($scope, $translate, appstate, connect, $modal, messenger, validate, uuid) {
  var dependencies = {};

  dependencies.account = {
    required : true,
    query : {
      tables: {
        'account' : {
          columns: ['enterprise_id', 'id', 'account_number', 'locked', 'account_txt', 'account_type_id']
        }
      },
    }
  };

  dependencies.inventory_unit = {
    required : true,
    query : {
      tables : {
        'inventory_unit': {
          columns: ['id', 'text']
        }
      }
    }
  };

  dependencies.inventory_group = {
    // required: true,
    query : {
      identifier : 'uuid',
      tables: {
        'inventory_group': {
          columns: ['uuid', 'name', 'code', 'sales_account', 'cogs_account', 'stock_account', 'donation_account']
        }
      }
    }
  };

  dependencies.inventory = {
    query : {
      identifier : 'uuid',
      tables: {
        'inventory': {
          columns: ['enterprise_id', 'uuid', 'code', 'text', 'price', 'group_uuid', 'unit_id', 'unit_weight', 'unit_volume', 'stock', 'stock_max', 'stock_min', 'consumable']
        }
      },
    }
  };

  dependencies.inventory_type = {
    required : true,
    query : {
      tables: {
        'inventory_type': {
          columns: ['id', 'text']
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

  appstate.register('enterprise', function (enterprise) {
    $scope.enterprise = enterprise;
    dependencies.inventory.query.where =
      ['inventory.enterprise_id=' + enterprise.id];
    dependencies.account.query.where =
      ['account.enterprise_id=' + enterprise.id];
    validate.process(dependencies).then(buildStores, handleErrors);
  });

  function handleErrors(err) {
    messenger.danger('An error occurred:' + err);
  }

  function buildStores(stores) {
    angular.extend($scope, stores);

    $scope.item = {};
    $scope.item.unit_weight = 0;
    $scope.item.unit_volume = 0;
  }

  $scope.reset = function reset () {
    $scope.item =  {};
    $scope.item.unit_weight = 0;
    $scope.item.unit_volume = 0;
  };

  $scope.submit = function () {
    var inventory_type_data = $scope.inventory_type.data;

    $scope.item.consumable = 0;
    inventory_type_data.forEach(function (inventoryType) {
      if (parseInt($scope.item.type_id) === parseInt(inventoryType.id)) {
        if (inventoryType.text === 'Article') {
          $scope.item.consumable = 1;
        }
      }
    });

    var packaged = connect.clean($scope.item);
    packaged.uuid = uuid();

    packaged.enterprise_id = $scope.enterprise.id;
    connect.post('inventory', [packaged])
    .then(function () {
      // $scope.item.uuid = packated.uuid;
      // $scope.inventory.post($scope.item);
      messenger.success($translate.instant('ALLTRANSACTIONS.POSTED_ITEM'));
    })
    .catch(function (err) {
      messenger.danger('An error occured' + err);
    });
    $scope.reset();
  };

  // New Type Instance Modal/Controller
  $scope.newUnitType = function () {
    var instance = $modal.open({
      templateUrl: 'unitmodal.html',
      controller: 'inventoryUnit',
      resolve: {
        unitStore: function() {
          return $scope.inventory_unit;
        }
      }
    });

    instance.result.then(function (unit) {
      $scope.inventory_unit.post(unit);
    });
  };

  // FIXME : Refactor
  $scope.isSubmitable = function () {
    if (!$scope.item) { return false; }
    if (!$scope.item.type_id) { return false; }
    if (!$scope.item.code) { return false; }
    if (!$scope.item.text) { return false; }
    if (!$scope.item.group_uuid) { return false; }
    if (!$scope.item.unit_id) { return false; }
    if (!$scope.item.purchase_price) { return false; }
    if (!$scope.item.price) { return false; }
    return true;
  };

  $scope.newInventoryGroup = function () {
    var instance = $modal.open({
      templateUrl: 'inventorygroupmodal.html',
      controller: 'inventoryGroup',
      resolve: {
        groupStore: function () {
          return $scope.inventory_group;
        },
        accountModel: function () {
          return $scope.account.data;
        }
      }
    });

    instance.result.then(function (model) {
      model.uuid = uuid();
      $scope.inventory_group.post(model);
        messenger.success($translate.instant('INVENTORY.REGISTER.SUBMIT_SUCCESS'));
    }, function () {
    });
  };
}
