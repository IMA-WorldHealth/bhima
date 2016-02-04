'use strict';

angular.module('bhima.services')
  .service('InventoryItems', InventoryItems);

InventoryItems.$inject = ['InventoryService', 'uuid', 'store'];

function InventoryItems(InventoryService, Uuid, Store) { 
  
  /** [rename] Available inventory items. */
  //this.availableInventory = availableInventory

  var service = this;
  var items = new Store({identifier : 'uuid'});

  // FIXME
  var used = new Store({identifier : 'uuid'});
  used.setData([]);
  
  // Expose store
  this.current = [];
  
      

  // Expose blueprint 
  this.available = function () { 
    console.log('this shit called');
    return items.data;  
  };

  this.currentItems = function () { 
    return current;
  }

  this.addItem = function () { 
    this.current.push(new Item());
  }

  this.confirmItem = function (item) { 
    var inventoryItem = items.get(item.inventoryUuid);
    item.confirmed = true;
    item.quantity = 1;
    item.unit_price = inventoryItem.price;
    item.amount = 0;
    item.code = inventoryItem.code;
    item.description = inventoryItem.label;
  
    used.post(item);
    items.remove(item.inventoryUuid);
  }

  InventoryService.getInventoryItems()
    .then(function (result) { 

      // items = items.concat(result);
      items.setData(result);
    });

  function Item() { 
    return { 
      confirmed : false,
      uuid : Uuid()
    }
  }

  // TODO Move this code - initial inventory item 
  this.addItem();

  return service;
}
