angular.module('bhima.services')
  .service('VoucherForm', VoucherFormService);

VoucherFormService.$inject = [
  'VoucherService', 'bhConstants', 'SessionService', 'VoucherItemService',
  'CashboxService', 'AppCache', 'Store', 'AccountService', '$timeout', '$translate'
];

/**
 * @class VoucherFormService
 *
 * @description
 * This wraps the journal voucher form and provides additional validators
 * customized for the rules of double entry accounting.  It also provides
 * functionality for efficiently calculating totals.
 *
 * @todo - finish the caching implementation
 */
function VoucherFormService(Vouchers, Constants, Session, VoucherItem, Cashboxes, AppCache, Store, Accounts, $timeout, $translate) {

  var ROW_ERROR_FLAG = Constants.grid.ROW_ERROR_FLAG;

  // Error Flags
  var ERROR_MISSING_TRANSACTION_TYPE = 'TRANSACTIONS.MISSING_TRANSACTION_TYPE'; // must have transaction_type for certain cases
  var ERROR_IMBALANCED_TRANSACTION = 'TRANSACTIONS.IMBALANCED_TRANSACTION'; // must have sum(debits) === sum(credits)
  var ERROR_SINGLE_ACCOUNT_TRANSACTION = 'TRANSACTIONS.SINGLE_ACCOUNT_TRANSACTION'; // must have > 1 unique accounts
  var ERROR_SINGLE_ROW_TRANSACTION = 'TRANSACTIONS.SINGLE_ROW_TRANSACTION'; // must have > 1 rows

  // applied to the reduce
  function sumDebitsAndCredits(aggregates, row) {
    aggregates.debit += row.debit || 0;
    aggregates.credit += row.credit || 0;
    return aggregates;
  }

  /**
   * @function calculateItemTotals
   * @param {Array} items - the array of voucher items
   * @returns {Object} - totals object with aggregate debit and credit
   *
   * @description
   * This function loops through the items and aggregates the debits and credits
   * into an aggregate object.
   */
  function calculateItemTotals(items) {
    return items.reduce(sumDebitsAndCredits, { debit : 0, credit : 0 });
  }

  /** @constructor */
  function VoucherForm(cacheKey) {

    if (!cacheKey) {
      throw new Error(
        'VoucherForm expected a cacheKey, but it was not provided.'
      );
    }

    // bind the cache key
    this.cache = AppCache(cacheKey);

    // this is the overarching details of the voucher to be filled in
    this.details = {};

    // cash accounts require a certain voucher type
    this.cashAccounts = [];
    var self = this;

    // load cashboxes for their accounts.
    Cashboxes.read(null, { detailed: 1 })
      .then(function (cashboxes) {

        self.cashAccounts = cashboxes

          // collect a lost of all cashbox acounts
          .reduce(function (accounts, cashbox) {
            return accounts.concat([ cashbox.account_id, cashbox.transfer_account_id ]);
          }, [])

          // make sure the list is unique
          .filter(function (account, index, accounts) {
            return accounts.indexOf(account) === index;
          });

        // self.cashAccounts is now a proper list of unique cash account ids
        // that can be used to determine if a voucher type is required.
      });

    Accounts.read()
      .then(function (accounts) {
        self.accounts = Accounts.order(accounts);
      });

    // this will contain the grid rows
    this.store = new Store({ identifier: 'uuid', data : [] });

    // run the setup function
    this.setup();
  }

  /**
   * @function validate
   *
   * @description
   * This function is called on the journal voucher items to run validation
   * checks against each item, returning the global validation state.  If there
   * is an error in any single line item, that error is set on the form.
   *
   * It also performs validation to check if a type_id is required for the
   * voucher.  Voucher types are required if any of the concerned accounts are
   * cashbox accounts.
   */
  VoucherForm.prototype.validate = function validate() {
    var items = this.store.data;

    // calculate the totals for the data
    this.totals = calculateItemTotals(items);

    var err;

    // this array will store unique accounts
    var uniqueAccountsArray = [];

    // this will store the validity condition.  We could use array.every() but it
    // seems like Chrome greedily exits if a false condition is it.
    var valid = true;


    // do validation checks to see if we have a transaction type for a cashbox
    // account
    var cashAccounts = this.cashAccounts;

    var hasCashboxAccount = false;

    // loop through each row, checking the amounts and accounts of each item.
    items.forEach(function (item, index) {
      valid = valid && item.validate();

      // if the row has an error, save it as the form error
      if (item._error) {
        err = item._error;
      }

      // only test for unique accounts if there are valid accounts selected
      if (item.account_id) {
        // if there unique accounts array does not have this account, add it.
        if (uniqueAccountsArray.indexOf(item.account_id) === -1) {
          uniqueAccountsArray.push(item.account_id);
        }
      }

      if (cashAccounts.indexOf(item.account_id) !== -1) {
        hasCashboxAccount = true;
      }
    });

    // if there is a cashbox account used, the voucher type_id is required
    this.hasCashboxAccount = hasCashboxAccount;

    // validate that the cashbox accounts and type_id are set
    var hasTypeId = angular.isDefined(this.details.type_id);
    if (!hasTypeId && this.hasCashboxAccount) {
      err = ERROR_MISSING_TRANSACTION_TYPE;
    }

    // validate that this uses multiple accounts in the transaction
    
    // To prevent calling the validation function when selecting the transaction type before selecting accounts
    var hasNullAccounts = (uniqueAccountsArray.length === 0);

    if(!hasNullAccounts) {
      var hasUniqueAccounts = (uniqueAccountsArray.length > 1);
      if (!hasUniqueAccounts) {
        err = ERROR_SINGLE_ACCOUNT_TRANSACTION;
      }

      // validate that the number of rows in the grid is > 1
      var hasEnoughRows = (items.length > 1);
      if (!hasEnoughRows) {
        err = ERROR_SINGLE_ROW_TRANSACTION;
      }

      var hasBalancedDebitsAndCredits = (this.totals.debit === this.totals.credit);
      if (!hasBalancedDebitsAndCredits) {
        err = ERROR_IMBALANCED_TRANSACTION;
      }

      // attach error to the form
      this._error = err;

      // return the boolean condition to the caller
      return (valid && hasUniqueAccounts && hasEnoughRows && hasBalancedDebitsAndCredits);
    }  
  };

  /**
   * @method setup
   *
   * @description
   * This function initializes the journal voucher form with data.  By default,
   * two lines are always present in the form.
   */
  VoucherForm.prototype.setup = function setup() {
    this.details = {};

    this.details.date = new Date();
    this.details.project_id = Session.project.id;
    this.details.currency_id = Session.enterprise.currency_id;
    this.details.user_id = Session.user.id;

    this.addItems(2);
  };

  // this is called whenever a change is made to the grid
  VoucherForm.prototype.onChanges = function onChanges() {
    this.validate();
  };

  VoucherForm.prototype.configureRow = function configureRow(row) {
    row.configure(row);
    this.validate();
  };

  VoucherForm.prototype.description = function description(key, options) {
    this.details.description = $translate.instant(key, options);
  };

  /**
   * @method addItems
   *
   * @description
   * Adds an item to the voucher grid.  This function is called when from the
   * view to add an uninitialized item into the voucher ui-grid.
   *
   * @param {Number} n - the number of items to add to the grid
   */
  VoucherForm.prototype.addItems = function addItems(n) {
    while (n--) {
      this.store.post(new VoucherItem());
    }
  };

  /**
   * @method removeItem
   *
   * @description
   * This method removes an item from the ui-grid by its index.
   */
  VoucherForm.prototype.removeItem = function removeItem(uuid) {
    return this.store.remove(uuid);
  };

  /**
   * @method clear
   *
   * @description
   * This method clears the entire grid, removing all items from the grid.
   */
  VoucherForm.prototype.clear = function clear() {

    this.store.clear();

    // directly running setup after clear adds the voucher items that have been
    // removed from the store, wrapping these methods in a timeout ensures they
    // are no longer in use by the ui-grid data object
    $timeout(function () {
      this.setup();

      // validate() is only set up to test on submission as it checks the validity
      // of individual items which will not have been configured, manually
      // reset error state
      delete this._error;
      this.hasCashboxAccount = false;
    }.bind(this));
  };

  /**
   * @method writeCache
   *
   * @description
   * This method writes values from the voucher into the application cache for
   * later recovery.
   */
  VoucherForm.prototype.writeCache = function writeCache() {
    this.cache.details = this.details;
    this.cache.items = angular.copy(this.store.data);
  };

  /**
   * @method clearCache
   *
   * @description
   * This method deletes the items from the application cache.
   */
  VoucherForm.prototype.clearCache = function clearCache() {
    delete this.cache.details;
    delete this.cache.items;
  };

  /**
   * @method hasCacheAvailable
   *
   * @description
   * Checks to see if the invoice has cached items to recover.
   */
  VoucherForm.prototype.hasCacheAvailable =  function hasCacheAvailable() {
    return Object.keys(this.cache).length > 0;
  };

  return VoucherForm;
}
