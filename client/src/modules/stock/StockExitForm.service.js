angular.module('bhima.services')
  .service('StockExitFormService', StockExitFormService);

StockExitFormService.$inject = [
  'Store', 'AppCache', 'SessionService', '$timeout', 'bhConstants',
  'DepotService', 'Pool', 'LotItemService', 'StockExitFormHelperService', 'util',
];

/**
 * @class StockExitFormService
 *
 * @description
 * This form powers the stock exit form in BHIMA.
 */
function StockExitFormService(Store, AppCache, Session, $timeout, bhConstants, Depots, Pool, Lot, Helpers, util) {

  const {
    TO_PATIENT, TO_LOSS, TO_SERVICE, TO_OTHER_DEPOT,
  } = bhConstants.flux;

  /**
   * @constructor
   */
  function StockExitForm(cacheKey) {
    if (!cacheKey) {
      throw new Error('StockExitForm expected a cacheKey, but it was not provided.');
    }

    this.cache = AppCache(cacheKey);
    this.details = { is_exit : 1 };
    this.store = new Store({ identifier : 'uuid', data : [] });

    // this variable is private and will contain the stock for the current depot.
    this._pool = new Pool('lot_uuid', []);

    // this is used to power the loading indicator
    this._queriesInProgress = 0;
  }

  /**
   * @method setup
   *
   * @description
   * This function initializes the journal voucher form with data.  By default,
   * two lines are always present in the form.
   */
  StockExitForm.prototype.setup = function setup() {
    this.details = {
      date : new Date(),
      user_id : Session.user.id,
      is_exit : 1,
    };
  };

  /**
   * @function isLoading
   *
   * @description
   * Returns true if the form is waiting for data.
   */
  StockExitForm.prototype.isLoading = function isLoading() {
    return this._queriesInProgress !== 0;
  };

  /**
   * @function fetchQuantityInStock
   *
   *
   */
  StockExitForm.prototype.fetchQuantityInStock = function fetchQuantityInStock(depotUuid, date) {
    if (!depotUuid || !date) { return {}; }

    const parameters = { consumable : 1, inStock : true, date };

    this._queriesInProgress++;

    // get the quantity in stock for this depot
    return Depots.getStockQuantityForDate(depotUuid, parameters)
      .then(stock => {

        const available = stock
          .map(item => {
            const lot = new Lot(item);

            // set the default quantity when selected in the grid
            lot.quantity = lot.isAsset() ? 1 : 0;

            // FIXME(@jniles) - need to reset the _quantity_available
            // for some reason.   My logic must be broken somewhere.
            lot._quantity_available = item.quantity;

            return lot;
          });

        this._pool.initialize('lot_uuid', available);

        this._queriesInProgress--;
      });
  };

  /**
   * @function listLotsForInventory
   *
   * @description
   * This lists the lots for a given inventory by its uuid.
   *
   */
  StockExitForm.prototype.listLotsForInventory = function listLotsForInventory(inventoryUuid, lotUuid) {
    const available = this._pool.list()
      .filter(row => row.inventory_uuid === inventoryUuid);

    // console.log('#listLotsForInventory(): available:', available);

    if (lotUuid) {
      const lot = this._pool.unavailable.get(lotUuid);
      if (lot) {
        return [lot, ...available];
      }
    }

    return available;
  };

  StockExitForm.prototype.listAvailableInventory = function listAvailableInventory() {
    // console.log('#listAvailableInventory():', this._pool.list());
    return util.getUniqueBy(this._pool.list(), 'inventory_uuid');
  };

  /**
   * @method setDepot()
   *
   * @description
   * This sets the depot on the stock form and reloads the quantities in stock.
   *
   */
  StockExitForm.prototype.setDepot = function setDepot(depot) {
    this.details.depot_uuid = depot.uuid;
    this.depot = depot;
    return this.fetchQuantityInStock(this.details.depot_uuid, this.details.date);
  };

  /**
   * @method setDate()
   *
   * @description
   * Sets the date and reloads the quantites in stock.
   */
  StockExitForm.prototype.setDate = function setDate(date) {
    this.details.date = date;
    return this.fetchQuantityInStock(this.details.depot_uuid, this.details.date);
  };

  /**
   * @method setExitType
   *
   * @description
   * This sets the exit type.
   *
   * TODO(@jniles) - is there more logic for this?
   */
  StockExitForm.prototype.setExitType = function setExitType(type) {
    this.details.exit_type = type;
  };

  StockExitForm.prototype.setLotsFromInventoryList = function setLotsFromInventoryList(inventories, uuidKey = 'uuid') {
    // three lists
    // - one to contain the inventories that have stock available in the depot
    // - one to contain the inventories that do not have stock available in the depot
    // - one to contain inventories that have stock, but the quantity isn't sufficient
    const available = [];
    const unavailable = [];
    const insufficient = [];

    console.log('inventories:', inventories);

    inventories

    // filter out all unconsumable inventories
      .filter(inventory => inventory.consumable)

    // classify all inventory as available/unavailable
      .forEach(inventory => {
        const matches = this.listLotsForInventory(inventory[uuidKey]);
        if (matches.length > 0) {
          available.push(inventory);
        } else {
          unavailable.push(inventory);
        }
      });

    // if there are no consumable items in the invoice, this will exit early
    if (available.length === 0 && unavailable.length === 0) {
      console.log('No consumable items in inventory:', inventories);
      return;
    }

    // adds a lot to the grid.
    const addLotWithQuantity = (item, quantity) => {
      const lot = new Lot(item);
      lot.quantity = quantity;
      lot.validate();
      this.store.post(lot);
      this._pool.use(item.lot_uuid);
    };

    // loop through the loaded inventory and assign the quantity
    available.forEach(inventory => {
      const matches = this.listLotsForInventory(inventory[uuidKey]);

      let requestedQuantity = inventory.quantity;

      // loop through the matches, allocating quantities to the inventory items.
      matches.forEach(match => {

        // escape hatch - if we don't need anymore, just return.
        if (requestedQuantity === 0) { return; }

        // this is how much is available to us to use
        const availableQuantity = match.quantity;

        // if the available quantity is greater than or equal to the required
        // quantity, allocate the entire available quantity to this lot item
        // and reduce the requested quantity by that amount.
        if (availableQuantity >= requestedQuantity) {
          addLotWithQuantity(match, requestedQuantity);
          requestedQuantity = 0;

        // otherwise, we need to reduce by the quantity available in the lot,
        // and move to the next lot to start consuming it.
        } else {
          addLotWithQuantity(match, availableQuantity);
          requestedQuantity -= availableQuantity;
        }
      });

      // if there is still requested quantity left over, add this to the insufficient array.
      // TODO(@jniles) - should we tell the user the quantity that isn't available?
      if (requestedQuantity > 0) {
        insufficient.push(inventory);
      }
    });

    // finally, compute the error codes
    console.log('available:', available);
    console.log('unavailable:', unavailable);
    console.log('insufficient:', insufficient);

  };

  /**
   * @method setPatientDistribution
   *
   * @description
   * Sets the form up for a patient distribution.
   */
  StockExitForm.prototype.setPatientDistribution = function setPatientDistribution(patient) {
    this.details.entity_uuid = patient.uuid;
    this.details.invoice_uuid = patient.invoice.uuid;
    this.details.flux_id = TO_PATIENT;
    this.store.clear();

    // TODO(@jniles) - ensure that all the data is loaded by this point.

    // request the lots from a list of inventory items.
    this.setLotsFromInventoryList(patient.invoice.items, 'inventory_uuid');
  };

  /**
   * @method setServiceDistribution
   *
   * @description
   * Sets the form up for a service distribution.
   */
  StockExitForm.prototype.setServiceDistribution = function setServiceDistribution(service) {
    this.details.entity_uuid = service.uuid;
    this.details.flux_id = TO_SERVICE;
    console.log('service:', service);
    console.log('requisition:', service.requisition);
  };

  /**
   * @method setDepotDistribution
   *
   * @description
   * Sets the form up for a depot distribution.
   */
  StockExitForm.prototype.setDepotDistribution = function setDepotDistribution(depot) {
    this.details.entity_uuid = depot.uuid;
    this.details.flux_id = TO_OTHER_DEPOT;
    console.log('depot:', depot);
    console.log('requisition:', depot.requisition);
  };

  /**
   * @method setLossDistribution
   *
   * @description
   * Sets the form up for a depot distribution.
   */
  StockExitForm.prototype.setLossDistribution = function setLossDistribution(depot) {
    this.details.flux_id = TO_LOSS;
    console.log('depot:', depot);
  };

  /**
   * @method addItems
   *
   * @description
   * Adds an item to the grid.
   *
   * @param {Number} n - the number of items to add to the grid
   */
  StockExitForm.prototype.addItems = function addItems(n) {
    let elt;
    let i = n;

    // will repeat will n > 0
    while (i--) {
      elt = new Lot();
      this.store.post(elt);
    }

    this.validate();

    return elt;
  };

  /**
   * @method configureItem
   *
   * @description
   * A shorthand for configuring and item in the grid via the inventory dropdown.
   */
  StockExitForm.prototype.configureItem = function configureItem(row, item) {
    row.configure(item);

    row._quantity_available = item._quantity_available;

    // since we automatically select the first lot, we use set it as "used"
    this._pool.use(row.lot_uuid);

    this.validate();
  };

  /**
   * @method removeItem
   *
   * @description
   * This method removes an item from the ui-grid by its uuid.
   */
  StockExitForm.prototype.removeItem = function removeItem(uuid) {
    const lot = this.store.get(uuid);
    this.store.remove(uuid);

    // return the lot to the pool
    this._pool.release(lot.lot_uuid);

    this.validate();
  };

  /**
   * @method clear
   *
   * @description
   * This method clears the entire grid, removing all items from the grid.
   */
  StockExitForm.prototype.clear = function clear() {
    // cache the current depot
    const { depot } = this;

    this.store.clear();
    this._pool.available.clear();
    this._pool.unavailable.clear();
    this._queriesInProgress = 0;

    $timeout(() => {
      this.setup();

      // reset the depot and load stock
      this.setDepot(depot);

      // validate() is only set up to test on submission as it checks the validity
      // of individual items which will not have been configured, manually
      // reset error state
      delete this._errors;
    });
  };

  /**
   * @method writeCache
   *
   * @description
   * This method writes values from the movement into the application cache for
   * later recovery.
   */
  StockExitForm.prototype.writeCache = function writeCache() {
    this.cache.details = this.details;
    this.cache.items = angular.copy(this.store.data);
  };

  /**
   * @method clearCache
   *
   * @description
   * This method deletes the items from the application cache.
   */
  StockExitForm.prototype.clearCache = function clearCache() {
    delete this.cache.details;
    delete this.cache.items;
  };

  /**
   * @method hasCacheAvailable
   *
   * @description
   * Checks to see if the invoice has cached items to recover.
   */
  StockExitForm.prototype.hasCacheAvailable = function hasCacheAvailable() {
    return Object.keys(this.cache).length > 0;
  };

  /**
   * @function errorLineHighlight
   *
   * @description
   * Sets the grid's error flag on the row to render a red highlight
   * on the row.
   *
   */
  function errorLineHighlight(rowIdx, store) {
    const { ROW_ERROR_FLAG } = bhConstants.grid;
    // set and unset error flag for allowing to highlight again the row
    // when the user click again on the submit button
    const row = store.data[rowIdx];
    row[ROW_ERROR_FLAG] = true;
    $timeout(() => {
      row[ROW_ERROR_FLAG] = false;
    }, 1000);
  }

  /**
   * @method validate
   *
   * @description
   * Check if the form is valid or contains errors.  This is done by:
   *
   * 1. TODO(@jniles) - check if all data is finished loading
   * 2. Running the validate function on each stock item.
   * 3. Checking if globally required items (date, etc) are set.
   *
   * @returns boolean
   */
  StockExitForm.prototype.validate = function validate() {

    // checks the form details
    const hasRequiredDetails = this.details.depot_uuid
      && this.details.date
      && this.details.exit_type;

    // run the checks on the lot contents
    const hasValidLots = this.store.data.every(item => item.validate(this.details.date))
      && this.store.data.length > 0;

    // gather errors into a flat array
    this._errors = this.store.data
      .flatMap(row => {
        row.validate();
        return row.errors();
      })
      .filter(err => err);

    const hasDestination = !!this.details.entity_uuid;

    // stock losses do not need a destination
    if (this.details.exit_type !== 'loss') {

      // if (hasExpiredLots) {
      //   // return Notify.danger('ERRORS.ER_EXPIRED_STOCK_LOTS');
      // }

      if (!hasDestination) {
      // return Notify.danger('ERRORS.ER_NO_STOCK_DESTINATION');

      }

    }

    // NOTE(@jniles) - expired lots are only relevant if not in loss.
    return hasValidLots && hasRequiredDetails;
  };

  /**
   * @function getDataForSubmission
   *
   * @description
   * This method returns the "stock movement object" needed by the stock exit form to submit data.
   */
  StockExitForm.prototype.getDataForSubmission = function getDataForSubmission() {
    const data = { ...this.details };

    Helpers.getDescription(this.depot, data)
      .then(description => {
        Object.assign(data, { description });
      });

    // how do we

  };

  return StockExitForm;
}
