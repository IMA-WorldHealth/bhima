/* jshint forin:false */
angular.module('bhima.services')
.service('Store', StoreService);

/**
 * @class Store
 *
 * @description
 * This class implements an object data store, similar to Dojo's Memory Store.  It could
 * forseeably be replaced by a WeakMap() in the future.
 */
function StoreService() {

  /** @constructor */
  function Store(options) {

    // default to empty options
    options = options || {};

    // default index and data
    this.index = {};
    this.data = [];

    // default the identifier to 'id'
    this.identifier = options.identifier || 'id';

    if (options.data) { this.setData(options.data); }
  }

  /**
   * @method setData
   *
   * @description
   * This method reinitializes the store with new data, freeing the old to be
   * garbage collected.
   *
   * @param {Array} data - an array of objects that will be stored in the instance.
   */
  Store.prototype.setData = function setData(data) {
    this.data = data;
    this.recalculateIndex();
  };

  /**
   * @method get
   *
   * @description
   * This method retrieves an item from the store by its identifier.  If the id
   * is not found, it returns undefined.
   *
   * @param {Number|String} id - the identifier of the object in the store.
   *
   * @return {Object|Undefined} the retrieved object from the store if an id
   * matches.  Otherwise, it returns undefined.
   */
  Store.prototype.get = function get(id) {
    var key = this.index[id];
    if (angular.isUndefined(key)) { return; }
    return this.data[key];
  };

  /**
   * @method post
   *
   * @description
   * This method inserts and object into the store.  If the object is missing
   * the store identifier property, an error is thrown.
   *
   * @param {Object} object - an object to be inserted into the store.
   */
  Store.prototype.post = function post(object) {
    var data = this.data;
    var index = this.index;
    var identifier = this.identifier;

    // default to an empty array if data not provided
    if (!data) { this.data = []; }

    var id = object[identifier];

    if (angular.isUndefined(id)) {
      throw new Error(
        'Trying to insert an object without the identity property "' + identifier + '".\n' +
        'Failing object: ' + JSON.stringify(object)
      );
    }

    index[id] = data.push(object) - 1;
  };

  /**
   * @method remove
   *
   * @description
   * This method removes an object from the store by its identifier.
   *
   * @param {Object} object - an object to be inserted into the store
   */
   Store.prototype.remove = function remove(id) {
    var data = this.data;
    var index = this.index;

    if (id in index) {
      data.splice(index[id], 1);
      this.setData(data);
    }
  };

  /**
   * @method contains
   *
   * @description
   * This method returns true if an object matching the provided id exists in
   * the store.
   *
   * @param {Number|String} id - the identifier of the object in the store.
   *
   * @return {Boolean} - true if the value exists in the store.
   */
  Store.prototype.contains = function contains(id) {
    return !!this.get(id);
  };

  /**
   * @method clear
   *
   * @description
   * Clears all data from the store and recalculates the index.
   */
  Store.prototype.clear = function clear() {
    this.data.length = 0;
    this.recalculateIndex();
  };

  /**
   * @method recalculateIndex
   *
   * @description
   * Recalculates the stores index when data is added/removed via other methods.
   */
  Store.prototype.recalculateIndex = function recalculateIndex() {
    var data = this.data;
    var index = this.index = {};
    var identifier = this.identifier;

    for (var i = 0, l = data.length; i < l; i += 1) {
      index[data[i][identifier]] = i;
    }
  };

  return Store;
}
