angular.module('bhima.services')
  .service('PoolStore', PoolStoreService);

PoolStoreService.$inject = [ 'Store' ];

function PoolStoreService(Store) {

  function PoolStore(identifier, data) {
    this.initialize(identifier, data);
  }

  // initialize the stores with data
  PoolStore.prototype.initialize = function initialize(identifier, data) {

    // make sure the data array is defined
    data = data || [];

    // default to indexing on 'id'
    identifier = identifier || 'id';

    this.available = new Store({
      identifier : identifier,
      data : data
    });

    this.unavailable = new Store({
      identifier : identifier,
      data : []
    });

    this._size = data.length;
  };

  // remove the item from the pool
  PoolStore.prototype.use = function use(id) {
    var item = this.available.get(id);
    if (item) {
      this.available.remove(id);
      this.unavailable.post(item);
    }
    return item;
  };


  // return the unavailable item to the pool
  PoolStore.prototype.free = function free(id) {
    var item = this.unavailable.get(id);
    if (item) {
      this.unavailable.remove(id);
      this.available.post(item);
    }
    return item;
  };

  // the total number of items stored in the PoolStore
  PoolStore.prototype.size = function size() {
    return this._size;
  };

  return PoolStore;
}
