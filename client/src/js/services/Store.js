angular.module('bhima.services')
  .service('Store', StoreService);

/**
 * @class Store
 *
 * @description
 * This class implements an object data store, similar to Dojo's Memory Store.
 * It has been migrated to use the Map API.  New code should likely just use
 * a new Map() instead of using the store service.
 */
function StoreService() {

  // deprecated
  function Store(options = {}) {
    // default data
    this.data = new Map();
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
    this.data.clear();
    data.forEach((item) => {
      this.post(item);
    });
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
    return this.data.get(id);
  };

  // return the latest copy of each data element
  Store.prototype.getAll = function getAll() {
    return Array.from(this.data.values());
  };

  /**
   * @method post
   *
   * @description
   * This method inserts an object into the store.  If the object is missing
   * the store identifier property, an error is thrown.
   *
   * @param {Object} object - an object to be inserted into the store.
   */
  Store.prototype.post = function post(object) {
    const id = object[this.identifier];

    if (angular.isUndefined(id)) {
      throw new Error(
        `Trying to insert an object without the identity property "${this.identifier}".\n`
        + `Failing object: ${JSON.stringify(object)}`,
      );
    }

    this.data.set(id, object);
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
    this.data.delete(id);
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
    return this.data.has(id);
  };

  /**
   * @method clear
   *
   * @description
   * Clears all data from the store.
   */
  Store.prototype.clear = function clear() {
    this.data.clear();
  };

  return Store;
}
