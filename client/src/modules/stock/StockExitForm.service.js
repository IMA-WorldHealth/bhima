angular.module('bhima.services')
  .service('StockExitFormService', StockExitFormService);

StockExitFormService.$inject = [
  'Store', 'AppCache', 'SessionService', '$timeout',
  'bhConstants', 'moment', 'DepotService', '$q', 'Pool', 'LotService',
];

/**
 * @class StockExitFormService
 *
 * @description
 * This form powers the stock exit form in BHIMA.
 */
function StockExitFormService(Store, AppCache, Session, $timeout, bhConstants, moment, Depots, $q, Pool, Lot) {
  /**
   * @constructor
   */
  function StockExitForm(cacheKey) {
    if (!cacheKey) {
      throw new Error('StockExitForm expected a cacheKey, but it was not provided.');
    }

    this.cache = AppCache(cacheKey);
    this.details = {};
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

  StockExitForm.prototype.fetchQuantityInStock = function fetchQuantityInStock(depotUuid, date) {
    if (!depotUuid || !date) { return {}; }

    const parameters = { consumable : 1, inStock : true, date };

    this._queriesInProgress++;

    // get the quantity in stock for this depot
    return Depots.getStockQuantityForDate(depotUuid, parameters)
      .then(stock => {

        const available = stock.map(item => new Lot(item));
        this._pool.initialize('lot_uuid', available);

        this._queriesInProgress--;
      });
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

  /**
   * @method setPatientDistribution
   *
   * @description
   * Sets the form up for a patient distribution.
   */
  StockExitForm.prototype.setPatientDistribution = function setPatientDistribution(patient) {
    this.entity_uuid = patient.uuid;
    console.log('patient:', patient);
    console.log('invoice:', patient.invoice);
  };

  /**
   * @method setServiceDistribution
   *
   * @description
   * Sets the form up for a service distribution.
   */
  StockExitForm.prototype.setServiceDistribution = function setServiceDistribution(service) {
    this.entity_uuid = service.uuid;
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
      elt.id = this.store.data.length;
      this.store.post(elt);
    }

    this.validate();

    return elt;
  };

  /**
   * @method removeItem
   *
   * @description
   * This method removes an item from the ui-grid by its index.
   */
  StockExitForm.prototype.removeItem = function removeItem(index) {
    const item = this.store.remove(index);
    this.validate();
    return item;
  };

  /**
   * @method clear
   *
   * @description
   * This method clears the entire grid, removing all items from the grid.
   */
  StockExitForm.prototype.clear = function clear() {
    this.store.clear();

    $timeout(() => {
      this.setup();

      // validate() is only set up to test on submission as it checks the validity
      // of individual items which will not have been configured, manually
      // reset error state
      delete this._error;
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
   * @method hasDuplicatedLots
   *
   * @description
   * This method catch duplicated row and emit notification on the row
   */
  StockExitForm.prototype.hasDuplicatedLots = function hasDuplicatedLots() {
    let doublonDetectedLine;

    if (findDuplicatedLots(this.store)) {
      // notify on the concerned row
      errorLineHighlight(doublonDetectedLine, this.store);
      return true;
    }

    // update the list of selected lots
    function refreshSelectedLotsList(store) {
      return store.data
        .filter(item => item.lot && item.lot.uuid)
        .map(item => item.lot.uuid);
    }

    // detect the presence of duplicated lots
    function findDuplicatedLots(store) {
      let doubleIndex;
      const selectedLots = refreshSelectedLotsList(store);

      const doublonDetected = selectedLots.some((lot, idx) => {
        const hasDoubles = selectedLots.lastIndexOf(lot) !== idx;
        if (hasDoubles) { doubleIndex = idx; }
        return hasDoubles;
      });

      doublonDetectedLine = doubleIndex;
      return doublonDetected;
    }

    return false;
  };

  /**
   * @method validate
   *
   * @description
   * Check if the form is valid or contains errors.  This is done by:
   *
   * 1. TODO(@jniles) - checking if all data is finished loading
   * 2. Running the validate function on each stock item.
   * 3. Checking if globally required items (date, etc) are set.
   *
   * @returns boolean
   */
  StockExitForm.prototype.validate = function validate() {

    // run the checks on the lot contents
    const hasValidLots = this.store.data.every(item => item.validate())
      && this.store.data.length > 0;

    // checks the form details
    const hasRequiredDetails = this.details.depot_uuid
      && this.details.date
      && this.details.exit_type;

    // check specifically for expired lots
    const hasExpiredLots = this.store.data.every(item => item.isExpired(this.details.date));

    // stock losses do not need a destination
    if (this.details.exit_type !== 'loss') {

      if (hasExpiredLots) {
        // return Notify.danger('ERRORS.ER_EXPIRED_STOCK_LOTS');
      }

      if (!this.details.entity_uuid) {
      // return Notify.danger('ERRORS.ER_NO_STOCK_DESTINATION');

      }

    }

    // check for unique lots

    // NOTE(@jniles) - expired lots are only relevant if

    return hasValidLots && hasRequiredDetails;
  };

  /**
   * @method hasValidLots
   *
   * @description
   * Check if lots are defined and valid
   */
  StockExitForm.prototype.hasValidLots = function hasValidLots() {
    return this.store.data.every((item) => {
      return item.quantity >= 0 && item.lot && item.lot.uuid;
    });
  };

  /**
   * @function formatRowsForExport
   *
   * @description this function will be apply to grid columns as filter for getting new columns
   *
   * @param {array} rows - refer to the grid data array
   * @return {array} - return an array of array with value as an object in this format : { value : ... }
   */
  StockExitForm.prototype.formatRowsForExport = function formatRowsForExport(rows = []) {
    return rows.map(row => {
      const code = row.inventory?.code;
      const description = row.inventory?.text;
      const lot = row.lot?.label;
      const price = row.inventory?.unit_cost;
      const quantity = row.quantity?.quantity;
      const type = row.quantity?.unit_type;
      const available = row.inventory?.quantity;
      const amount = (price && quantity) ? price * quantity : 0;
      const expiration = (row.lot && row.lot.expiration_date)
        ? moment(row.lot.expiration_date).format(bhConstants.dates.formatDB) : null;

      return [code, description, lot, price, quantity, type, available, amount, expiration].map(value => ({ value }));
    });
  };

  return StockExitForm;
}
