angular.module('bhima.services')
  .service('LotItemService', LotItemService);

LotItemService.$inject = ['uuid'];

/**
 * @class Lot
 */
function LotItemService(uuid) {

  /**
   * @constructor Lot
   */
  function Lot(options) {
    this.uuid = uuid();

    // inventory properties
    this.inventory_uuid = null;
    this.code = null;
    this.text = null;
    this.group_uuid = null;

    // lot properties
    this.lot_uuid = null;
    this.label = null;
    this.quantity = 0;
    this.unit_cost = 0;
    this.expiration_date = null;

    // validation properities
    this.__is_asset = false;
    this.__tracking_expiration = true;
    this.__tracking_consumption = true;

    this._initialised = true;

    // if options were passed in, use them to configure the
    //
    if (options) {
      this.configure(options);
    }
  }

  /**
   * @function validate
   *
   * @description
   * This function ensures that is lot is valid.  A valid lot is:
   *   - one that has a positive quantity in stock
   *   - one that is not expired
   *   - has all required information
   */
  Lot.prototype.validate = function validate(date) {
    return this.hasInventoryInformation()
      && this.hasLotInformation()
      && !this.isEmpty()
      && !this.isExpired(date);
  };

  // Lot.prototype.

  // checks if a value is a uuid
  function isUuid(uid) {
    return typeof uid === 'string' && uid.length === 32;
  }

  /**
   * @function hasInventoryInformation
   *
   * @description
   * Checks if the inventory information is available.
   */
  Lot.prototype.hasInventoryInformation = function hasInventoryInformation() {
    return isUuid(this.inventory_uuid)
      && typeof this.code === 'string'
      && typeof this.text === 'string';
  };

  /**
   * @function hasLotInformation
   *
   * @description
   * Checks if the lot information is availability.
   */
  Lot.prototype.hasLotInformation = function hasLotInformation() {
    return isUuid(this.lot_uuid)
      && typeof this.label === 'string'
      && typeof this.quantity === 'number';
  };

  // we need to differentiate between server-sent expiration date
  // and this calculated one.
  Lot.prototype.isExpired = function isExpired(date = new Date()) {

    // if we are not tracking expiration, always return false.
    if (this.__tracking_expiration === false) { return false; }

    // the `is_expired` flag is set on the server.  If this
    // flag is set, return the results of this flag.
    if (this.is_expired !== undefined) { return !!this.is_expired; }

    // if a date has been passed in, it will validate against that date
    // (for example, if this is a past date).  If not, it will validate
    // against the current date.
    return this.expiration_date < date;
  };

  /**
   * @function isEmpty
   *
   * @description
   * Returns true if the quantity is 0.
   */
  Lot.prototype.isEmpty = function isEmpty() {
    return this.quantity === 0;
  };

  /**
   * @function isConsumable
   *
   * @description
   * Returns true if the lot is consumable.
   */
  Lot.prototype.isConsumable = function isConsumable() {
    return this.consumable === 1;
  };

  /**
   * @function isAsset
   *
   * @description
   * Returns true if the lot is an asset.
   */
  Lot.prototype.isAsset = function isAsset() {
    return this.__is_asset === true;
  };

  /**
   * @function configure
   *
   * @description
   * This configures the lot.
   */
  Lot.prototype.configure = function configure(item) {
    this._initialised = true;

    const clone = { ...item };

    if (clone.tracking_consumption !== undefined) {
      this.setTrackingConsumption(clone.tracking_consumption);
      delete clone.tracking_consumption;
    }

    if (clone.tracking_expiration !== undefined) {
      this.setTrackingExpiration(clone.tracking_expiration);
      delete clone.tracking_expiration;
    }

    if (clone.is_asset !== undefined) {
      this.setAsset(clone.is_asset);
      delete clone.is_asset;
    }

    // assign properties to current lot
    Object.assign(this, clone);

    // parse the date if it is not already a date
    if (!(this.expiration_date instanceof Date) && this.expiration_date !== undefined) {
      this.expiration_date = new Date(this.expiration_date);
    }

  };

  /**
   * @function setAsset
   *
   * @description
   * Sets a lot to be an asset.
   */
  Lot.prototype.setAsset = function setAsset(bool) {
    this.__is_asset = bool;
  };

  /**
   * @function setTrackingExpiration
   *
   * @description
   * Sets the tracking expiration condition
   */
  Lot.prototype.setTrackingExpiration = function setTrackingExpiration(bool) {
    this.__tracking_expiration = bool;
  };

  /**
   * @function setTrackingConsumption
   *
   * @description
   * Sets the tracking consumption condition
   */
  Lot.prototype.setTrackingConsumption = function setTrackingConsumption(bool) {
    this.__tracking_consumption = bool;
  };

  return Lot;
}
