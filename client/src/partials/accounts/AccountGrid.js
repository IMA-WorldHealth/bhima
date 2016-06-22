angular.module('bhima.services')
  .service('AccountGridService', AccountGridService);

AccountGridService.$inject = ['AccountStoreService', 'AccountService', 'Store'];

function AccountGridService(AccountStore, Accounts, Store, Notify) { 
  /** @todo import from constants */
  var ROOT_ACCOUNT = 0;

  /**
   * @constructor
   * 
   * @description
   * @todo sets up the account grid
   */
  function AccountGrid() {
    // track service state - these variables can be exposed to drive the UI if required
    this._initialised = false;
    
    // store that will be used to hold accounts
    this._cachedAccountList = null;
    
    // exposed variables and methods 
    this._store = null;
    this.data = null; 
    
    console.log(this);
  }

  /**
   * @method settup 
   * 
   * @description 
   * Requests the latest account list from the AccountStore service and updates loading variables
   */
  AccountGrid.prototype.settup = function settup() {

    // Fetch initial set of accounts
    return AccountStore.store()
      .then(function (result) {
        this._cachedAccountList = angular.copy(result.data);
        this._store = result;
        this._initialised = true;

        // order and expose data made available through the store
        this.data = Accounts.order(this._store.data);
      }.bind(this));
  };

  /**
   * @method updateViewInsert 
   * 
   * @description
   * This method updates the models that drive a UI grid based on an account object passed in by the Account 
   * creation process.
   */
  AccountGrid.prototype.updateViewInsert = function updateViewInsert(event, account) {
    var insertAccount;
    
    // ensure received account is formatted as accounts recieved from the database 
    account.number = Number(account.number);
    account.hrlabel = Accounts.label(account);

    this._store.post(account);
    updateCachedAccountList(this._cachedAccountList, account);
    recalculateAccountChildren(this._store, account);
  
    // getting an account details relative to the latest ordering and inserting it allows us to respect the current 
    // expand/ collapse tree view (as apposed to simply setting new data)
    insertAccount = getNestedAccountDetails(this._cachedAccountList, account);
    this.data.splice(insertAccount.index, 0, insertAccount.details);
  };
  
  AccountGrid.prototype.updateViewEdit = function updateViewEdit(event, account) {
    
  };

  /**
   * @method updateCachedAccountList
   *  
   * @description 
   * Insert a provided account into the currently stored cached list of accounts 
   * 
   * @param list    {Array}
   * @param account {Object}
   */
  function updateCachedAccountList(list, account) {
    // naive brute force search - this should only be run once per major page update, if this results in performance 
    // issues either a faster search or a data structure more suited to inserts can be used
    var insertIndex = list.length;
    list.some(function (item, index) {
      if (Number(item.number) > account.number) { 
        insertIndex = index;
        return true;
      }
    });
    
    list.splice(insertIndex, 0, account);
  }

  /**
   * @method recalculateAccountChildren
   *
   * @param accounts  {Object}  Store object
   * @param account   {Object}  Account details
   */
  function recalculateAccountChildren(accounts, account) { 
    if (account.parent !== ROOT_ACCOUNT) { 
      var parent = accounts.get(account.parent);
      
      parent.children = parent.children || [];
      parent.children.push(account);
    }
  }
  
  /**
   * @method getNestedAccountDetails 
   * 
   * @param list {Array} Flat list of account as returned from the server
   * 
   * @returns {Object} Object with an index and account details
   */
  function getNestedAccountDetails(list, account) {
    var nestedAccount = {};
    var orderedList = Accounts.order(angular.copy(list));

    orderedList.some(function (item, index) {
      if (item.id === account.id) { 
        nestedAccount.index = index;
        nestedAccount.details = item;
        return true;
      }
    })
    return nestedAccount;
  }

  return AccountGrid;
}