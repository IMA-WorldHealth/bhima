angular.module('bhima.services')
  .service('InventoryStoreService', InventoryStoreService);

InventoryStoreService.$inject = [ 'InventoryService', 'Store' ];

function InventoryStoreService(Inventory, Store) {

  var IDENTIFIER = 'uuid';
  var service = this;
  var store = new Store({ identifier : IDENTIFIER, data : [] });

  // the
  service.load = load;
  service.update = update;
  service.create = create;

  // loads data into a store and returns
  function load() {
    return Inventory.read()
      .then(function (data) {
        store.setData(data);
        return store;
      });
  }

  // responds to an update event
  function update(data) {
    store.remove(data[IDENTIFIER]);
    store.post(data);
  }

  // responds to a create event
  function create(data) {
    store.post(data);
  }
}
