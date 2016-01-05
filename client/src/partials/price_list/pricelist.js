angular.module('bhima.controllers')
.controller('PriceListController', PriceListController);

PriceListController.$inject = [
  '$scope', '$q', '$translate', '$window', 'connect', 'messenger',
  'appstate', 'validate', 'uuid'
];

function PriceListController($scope, $q, $translate, $window, connect, messenger, appstate, validate, uuid) {
  var dependencies = {};
  var enterprise;

  $scope.session = {
    action : 'default',
    selected : null
  };

  dependencies.priceList = {
    query : {
      identifier : 'uuid',
      tables : {'price_list' : {columns:['uuid', 'title', 'description']}}
    }
  };

  dependencies.inventory = {
    query : {
      identifier : 'uuid',
      tables : {'inventory' : {columns:['uuid', 'code', 'text', 'type_id']}},
    }
  };


  function loadDependencies(enterpriseResult) {
    enterprise = $scope.enterprise = enterpriseResult;

    // Set condition
    dependencies.priceList.query.where  = ['price_list.enterprise_id='+enterprise.id];
    validate.process(dependencies).then(priceList);
  }

  appstate.register('enterprise', loadDependencies);


  function priceList(model) {
    $scope.model = model;
  }

  function editItems(list) {
    dependencies.priceListItems = {
      query : {
        identifier: 'uuid',
        tables : {'price_list_item' : {columns:['uuid', 'item_order', 'description', 'value', 'is_discount', 'is_global', 'price_list_uuid', 'inventory_uuid']}},
        where : ['price_list_item.price_list_uuid=' + list.uuid]
      }
    };
    validate.process(dependencies).then(processListItems);

    $scope.session.action = 'item';
    $scope.session.selected = list;
    $scope.session.deleteQueue = [];
  }

  function processListItems(model) {
    var defaultItem = {
      is_discount : '0',
      is_global : '0'
    };

    $scope.session.listItems = model.priceListItems.data;
    $scope.session.listCache = angular.copy($scope.session.listItems);

    $scope.session.listItems.sort(function (a, b) { return (a.item_order === b.item_order) ? 0 : (a.item_order > b.item_order ? 1 : -1); });
    if ($scope.session.listItems.length === 0) {
      $scope.session.listItems.push(defaultItem);
    }
  }

  function addItem() {
    var defaultItem = {
      is_discount : '0',
      is_global : '0'
    };

    $scope.session.listItems.push(defaultItem);
  }

  function shiftDown(item) {
    var list = $scope.session.listItems, index = list.indexOf(item);

    if (index < list.length - 1) {
      list.splice(index, 1);
      list.splice(index + 1, 0, item);
    }
  }

  function shiftUp(item) {
    var list = $scope.session.listItems, index = list.indexOf(item);

    if (index > 0) {
      list.splice(index, 1);
      list.splice(index - 1, 0, item);
    }
  }

  function deleteItem(item) {
    var list = $scope.session.listItems;
    if (list.length > 1) {
      list.splice(list.indexOf(item), 1);
      if (item.uuid) {
        $scope.session.deleteQueue.push(item.uuid);
      }
    } else {
      messenger.warn($translate.instant('PRICE_LIST.WARN'));
    }
  }

  function saveItems() {
    var priceList = $scope.session.selected,
        uploadPromise = [];

    // Verify items
    var invalidData = $scope.session.listItems.some(function (item, index) {
      if (!item.price_list_uuid) {
        item.price_list_uuid = priceList.uuid;
      }
      item.item_order = index;


      if (isNaN(Number(item.value))) {
        return true;
      }

      if (!item.description || item.description.length === 0) { return true; }
      if (Number(item.is_global) && !item.inventory_uuid) { return true; }

      return false;
    });

    if (invalidData) {
      return messenger.danger($translate.instant('PRICE_LIST.INVALID_ITEMS'));
    }

    // FIXME single request for all items
    $scope.session.listItems.forEach(function (item) {
      var request, uploadItem = connect.clean(item);
      if (item.uuid) {
        request = connect.put('price_list_item', [uploadItem], ['uuid']);
      } else {
        uploadItem.uuid = uuid();
        request = connect.post('price_list_item', [uploadItem]);
      }
      uploadPromise.push(request);
    });

    $scope.session.deleteQueue.forEach(function (itemId) {
      uploadPromise.push(connect.delete('price_list_item', 'uuid', itemId));
    });

    $q.all(uploadPromise)
    .then(function () {
      // FIXME Redownload to prove DB state - remove (horrible use of bandwidth)
      editItems(priceList);
      messenger.success($translate.instant('PRICE_LIST.LIST_SUCCESS'));
    })
    .catch(function () {
      messenger.danger($translate.instant('PRICE_LIST.LIST_FAILURE'));
    });
  }

  // Clear inventory uuid for non global items (on change)
  function clearInventory(item) {
    if (!Number(item.is_global)) { item.inventory_uuid = null; }
  }

  function editMeta (list) {
    $scope.edit = {};
    $scope.session.action = 'meta';
    $scope.session.selected = list;
    $scope.edit = angular.copy(list);
  }

  function saveMeta () {
    connect.put('price_list', [connect.clean($scope.edit)], ['uuid'])
    .then(function () {
      messenger.success($translate.instant('PRICE_LIST.EDITED_SUCCES'));
      $scope.model.priceList.put($scope.edit);

      $scope.session.selected = null;
      $scope.session.action = '';
    }, function (err) {
      messenger.danger('error:' + JSON.stringify(err));
    });
  }

  function resetMeta  () {
    $scope.edit = {};
  }

  function addList () {
    $scope.add = {};

    $scope.session.action = 'add';
    $scope.session.selected = null;
  }

  function saveAdd () {
    $scope.add.enterprise_id = $scope.enterprise.id;
    $scope.add.uuid = uuid();
    connect.post('price_list', [connect.clean($scope.add)])
    .then(function () {
      var finalList;

      finalList = connect.clean($scope.add);

      $scope.model.priceList.post(finalList);
      editItems(finalList);

      messenger.success($translate.instant('PRICE_LIST.POSTED'));
    }, function (err) {
      messenger.danger('Error:' + JSON.stringify(err));
    });
  }

  $scope.resetAdd = function () {
    $scope.add = {};
  };

  function removeList (list) {
    var confirmed = $window.confirm($translate.instant('PRICE_LIST.DELETE_CONFIRM'));
    if (!confirmed) { return; }

    connect.delete('price_list', 'uuid', list.uuid)
    .then(function(v) {
      if (v.status === 200) {
        $scope.model.priceList.remove(list.uuid);
        messenger.success($translate.instant('PRICE_LIST.REMOVE_SUCCESS'));
      }
    })
    .catch(function(error) {
      //FIXME Temporary
      if (error.status === 500) {
        messenger.danger($translate.instant('PRICE_LIST.UNABLE_TO_DELETE'), 4000);
      }
    });
  }

  $scope.editMeta = editMeta;
  $scope.saveMeta = saveMeta;
  $scope.resetMeta = resetMeta;

  $scope.editItems = editItems;
  $scope.addItem = addItem;
  $scope.saveItems = saveItems;
  $scope.shiftUp = shiftUp;
  $scope.shiftDown = shiftDown;
  $scope.deleteItem = deleteItem;
  $scope.clearInventory = clearInventory;

  $scope.addList = addList;
  $scope.saveAdd = saveAdd;
  $scope.removeList = removeList;
}
