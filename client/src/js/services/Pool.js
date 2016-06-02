angular.module('bhima.services')
  .service('Pool', PoolService);

PoolService.$inject = [ 'Store' ];

function PoolService(Store) {

  function Pool(identifier, data) {
    this.initialize(identifier, data);
  }

  // initialize the stores with data
  Pool.prototype.initialize = function initialize(identifier, data) {

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
  Pool.prototype.use = function use(id) {
    var item = this.available.get(id);
    if (item) {
      this.available.remove(id);
      this.unavailable.post(item);
    }

    return item;
  };


  // return the unavailable item to the pool
  Pool.prototype.release = function release(id) {
    var item = this.unavailable.get(id);
    if (item) {
      this.unavailable.remove(id);
      this.available.post(item);
    }

    return item;
  };

  // the total number of items stored in the Pool
  Pool.prototype.size = function size() {
    return this._size;
  };

  return Pool;
}
