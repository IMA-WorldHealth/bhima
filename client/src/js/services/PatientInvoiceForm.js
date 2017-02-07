angular.module('bhima.services')
  .service('PatientInvoiceForm', PatientInvoiceFormService);

PatientInvoiceFormService.$inject = [
  'PatientService', 'PriceListService', 'InventoryService', 'AppCache', 'Store',
  'Pool', 'PatientInvoiceItemService', 'bhConstants'
];

/**
 * @class PatientInvoiceForm
 *
 * @description
 * The PatientInvoiceForm class manages the totalling, caching, and validation associated
 * with the Patient PatientInvoiceForm module.  You must specify a cacheKey to enable the
 * class to be instantiated correctly.
 *
 * @todo (required) only the maximum of the bill should be subsidised
 * @todo (required) billing services and subsidies should be ignored for
 *   specific debtors.
 */
function PatientInvoiceFormService(Patients, PriceLists, Inventory, AppCache, Store, Pool, PatientInvoiceItem, Constants) {

  var ROW_ERROR_FLAG = Constants.grid.ROW_ERROR_FLAG;

  // Reduce method - assigns the current billing services charge to the billing
  // service and adds to the running total
  function calculateBillingServices(billingServices, total) {
    return billingServices.reduce(function (current, billingService) {
      billingService.charge = (total / 100) * billingService.value;
      return current + billingService.charge;
    }, 0);
  }

  // This is a separate(very similar) method to calculating billing services
  // as subsidies will require additional logic to limit subsidising more then 100%
  function calculateSubsidies(subsidies, total) {

    // All values are percentages
    return subsidies.reduce(function (current, subsidy) {
      subsidy.charge = (total / 100) *  subsidy.value;
      return current + subsidy.charge;
    }, 0);
  }

  // this method calculates the base invoice cost by summing all the items in
  // the invoice.  To make sure that items are correctly counted, it validates
  // each row before processing it.
  function calculateBaseInvoiceCost(items) {
    return items.reduce(function (aggregate, row) {
      row.validate();

      // only sum valid rows
      if (row._valid) {
        row.credit = (row.quantity * row.transaction_price);
        return aggregate + row.credit;
      } else {
        return aggregate;
      }
    }, 0);
  }


  /**
   * @constructor
   *
   * @description
   * This function constructs a new instance of the PatientInvoiceForm class.
   *
   * @param {String} cacheKey - the AppCache key under which to store the
   *   invoice.
   */
  function PatientInvoiceForm(cacheKey) {

    if (!cacheKey) {
      throw new Error(
        'PatientInvoiceForm expected a cacheKey, but it was not provided.'
      );
    }

    // bind the cache key
    this.cache = AppCache(cacheKey);

    // set up the inventory
    // this will be referred to as PatientInvoiceForm.inventory.available.data
    this.inventory = new Pool({ identifier: 'uuid', data : [] });

    // set up the inventory
    Inventory.read(null, { detailed : 1 })
      .then(function (data) {

        // make sure both the label and code is searchable
        data.forEach(function (item) {
          item.hrlabel = item.code + ' ' + item.label;
        });

        this.inventory.initialize('uuid', data);
      }.bind(this));

    // setup the rows of the grid as a store
    // this will be referred to as PatientInvoiceForm.store.data
    this.store = new Store({ identifier : 'uuid', data: [] });

    this.setup();
  }

  // initial setup and clearing of the invoice
  PatientInvoiceForm.prototype.setup = function setup() {

    // the invoice details
    this.details = {
      date : new Date(),
      cost : 0,
      description : null
    };

    // tracks the price list of the inventory items
    this.prices = new Store({ identifier : 'inventory_uuid' });

    // the recipient is null
    this.recipient = null;

    // this object holds the abstract properties of the invoice
    this.billingServices = [];
    this.subsidies = [];

    // this object holds the totals for the invoice.
    this.totals = {
      billingServices : 0,
      subsidies : 0,
      rows : 0,
      grandTotal : 0
    };

    // remove all items from the store as needed
    this.clear();

    this._valid = false ;
    this._invalid = true;

    // trigger a totals digest
    this.digest();
  };

  /**
   * @method validate
   *
   * @description
   * This method digests the invoice, then returns all invalid items in the
   * invoice to be dealt with by the user.
   *
   * @param {Boolean} highlight - determines if the ROW_ERROR_FLAG should be set
   *   to highlight errors on the grid.
   */
  PatientInvoiceForm.prototype.validate = function validate(highlight) {
    this.digest();

    var globalConfigurationError = null;

    // filters out valid items
    var invalidItems = this.store.data.filter(function (row) {
      row[ROW_ERROR_FLAG] = highlight ? row._invalid : false;

      // this sets the global configuration error if there is no sales account
      // and the row has already been configured.
      if (row._initialised && !row._hasSalesAccount) {
        globalConfigurationError = row._message;
      }

      return row._invalid;
    });

    this._invalid = invalidItems.length > 0;
    this._valid = !this._invalid;
    this._error = globalConfigurationError;

    return invalidItems;
  };


  /**
   * @method setPatient
   *
   * @description
   * This method downloads the patient's billing services, price lists, and
   * subsidies to be applied to the bill.  It sets also sets the `recipient`
   * and `debtor_uuid` properties on the invoice.
   *
   * @param {Object} patient - a patient object as read out of the database.
   */
  PatientInvoiceForm.prototype.setPatient = function setPatient(patient) {
    var invoice = this;

    // load the billing services and bind to the invoice
    Patients.billingServices(patient.uuid)
    .then(function (billingServices) {
      invoice.billingServices = billingServices;
      invoice.digest();
    });

    // load the subsidies and bind to the invoice
    Patients.subsidies(patient.uuid)
    .then(function (subsidies) {
      invoice.subsidies = subsidies;
      invoice.digest();
    });

    // the patient's price list when complete
    if (patient.price_list_uuid) {
      PriceLists.read(patient.price_list_uuid)
      .then(function (priceList) {
        invoice.setPriceList(priceList);
        invoice.digest();
      });
    }

    invoice.recipient = patient;
    invoice.details.debtor_uuid = patient.debtor_uuid;

    // add a single item to the invoice to begin
    invoice.addItem();

    // run validation and calculation
    invoice.digest();
  };

  /**
   * @method setPriceList
   *
   * @description
   * This method sets the inventory price list for the patient.
   *
   * @param {Object} priceList - a list of prices loaded based on the patient's
   * group affiliations.
   */
  PatientInvoiceForm.prototype.setPriceList = function setPriceList(priceList) {
    this.prices.setData(priceList.items);
  };

  /**
   * @method setService
   *
   * @description
   * This method simply sets the `service_id` property of the invoice.
   *
   * @param {Object} service - a service object as read from the database
   */
  PatientInvoiceForm.prototype.setService = function setService(service) {
    this.service = service;
    this.details.service_id = service.id;
  };


  /**
   * @method digest
   *
   * @description
   * Calculates the totals for the invoice by:
   *  1) Summing all the values in the grid (invoice items)
   *  2) Calculating the additions due to billing services
   *  3) Calculating the reductions due to subsidies
   *  4) Reporting the "grand total" owed after all are applied
   *
   * This method should be called anytime the values of the grid change,
   * and on setPatient() completion.
   */
  PatientInvoiceForm.prototype.digest = function digest() {
    var invoice = this;
    var totals = this.totals;
    var grandTotal = 0;

    // PatientInvoiceForm cost as modelled in the database does not factor in billing services
    // or subsidies
    var baseCost = calculateBaseInvoiceCost(this.store.data);
    totals.rows = baseCost;
    invoice.details.cost = baseCost;
    grandTotal += baseCost;

    // calculate the billing services total and increase the bill by that much
    totals.billingServices = calculateBillingServices(invoice.billingServices, grandTotal);
    grandTotal += totals.billingServices;

    // calculate the subsidies total and decrease the bill by that much
    totals.subsidies = calculateSubsidies(invoice.subsidies, grandTotal);
    grandTotal -= totals.subsidies;

    // bind the grandTotal
    totals.grandTotal = grandTotal;
  };

  // clears the store of items
  PatientInvoiceForm.prototype.clear = function clear() {
    var invoice = this;

    // copy the data so that forEach() doesn't get confused.
    var cp = angular.copy(this.store.data);

    // remove each item from the store
    cp.forEach(function (item) {
      invoice.removeItem(item);
    });
  };

  /*
   * PatientInvoiceForm Item Methods
   */

  /**
   * @method addItem
   *
   * @description
   * Adds a new PatientPatientInvoiceFormItem to the store.  If the inventory is all used
   * up, return silently.  This is so that we do not add rows that cannot be
   * configured with inventory items.
   */
  PatientInvoiceForm.prototype.addItem = function addItem() {

    // we cannot insert more rows than our max inventory size
    var maxRows = this.inventory.size();
    if (this.store.data.length >= maxRows) {
      return;
    }

    // add the item to the store
    var item = new PatientInvoiceItem();
    this.store.post(item);

    // return a reference to the item
    return item;
  };

  /**
   * @method removeItem
   *
   * @description
   * Removes a specific item from the store. If the item has been configured,
   * also release the associated inventory item so that it may be used again.
   *
   * @param {Object} item - the item/row to be removed from the store
   */
  PatientInvoiceForm.prototype.removeItem = function removeItem(item) {
    this.store.remove(item.uuid);
    if (item.inventory_uuid) {
      this.inventory.release(item.inventory_uuid);
    }
    this.digest();
  };

  /**
   * @method configureItem
   *
   * @description
   * New items still need to be configured with references to the inventory item
   * that is being invoiced.  This method attaches the inventory_uuid to the
   * item, removes the referenced inventory item from the pool, and sets the
   * price of the item based on the patient's price list.
   *
   * @param {Object} item - the item/row to be configured
   */
  PatientInvoiceForm.prototype.configureItem = function configureItem(item) {

    // remove the item from the pool
    var inventoryItem = this.inventory.use(item.inventory_uuid);

    // configure the PatientPatientInvoiceFormItem with the inventory values
    item.configure(inventoryItem);

    // apply the price list, if it exists
    var price = this.prices.get(item.inventory_uuid);
    if (angular.isDefined(price)) {
      item.applyPriceList(price);
    }

    // make sure to validate and calculate new totals
    this.digest();

    // check for global configuration errors
    this.validate();
  };


  /**
   * @method readCache
   *
   * @description
   * This method reads the values out of the application cache and into the
   * patient invoice.  After reading the value, it re-digests the invoice to
   * perform validation and computer totals.
   */
  PatientInvoiceForm.prototype.readCache = function readCache() {

    // copy the cache temporarily
    var cp = angular.copy(this.cache);

    // set the details to the cached ones
    this.details = cp.details;
    this.details.date = new Date(this.details.date);

    // set the patient
    this.setPatient(cp.recipient);

    // setPatient() adds an item.  Remove it before configuring data
    this.clear();

    // loop through the cached items, configuring them
    cp.items.forEach(function (cacheItem) {
      var item = this.addItem();

      item.inventory_uuid = cacheItem.inventory_uuid;
      this.configureItem(item);

      item.quantity = cacheItem.quantity;
      item.transaction_price = cacheItem.transaction_price;
    }.bind(this));

    this.hasRecoveredCache = true;

    // digest validation and totals
    this.digest();
  };

  /**
   * @method writeCache
   *
   * @description
   * This method writes values from the invoice into the application cache for
   * later recovery.
   */
  PatientInvoiceForm.prototype.writeCache = function writeCache() {
    this.cache.details = this.details;
    this.cache.recipient = this.recipient;
    this.cache.items = angular.copy(this.store.data);
  };

  /**
   * @method clearCache
   *
   * @description
   * This method deletes the items from the application cache.
   */
  PatientInvoiceForm.prototype.clearCache = function clearCache() {
    delete this.cache.details;
    delete this.cache.recipient;
    delete this.cache.items;
  };

  /**
   * @method hasCacheAvailable
   *
   * @description
   * Checks to see if the invoice has cached items to recover.
   */
  PatientInvoiceForm.prototype.hasCacheAvailable =  function hasCacheAvailable() {
    return Object.keys(this.cache).length > 0;
  };

  return PatientInvoiceForm;
}
