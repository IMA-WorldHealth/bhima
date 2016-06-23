angular.module('bhima.services')
  .service('AccountGridService', AccountGridService);

AccountGridService.$inject = ['AccountStoreService', 'AccountService', 'Store'];

function AccountGridService(AccountStore, Accounts, Store, Notify) {
  /**
   * @constructor
   *
   * @description
   * @todo sets up the account grid
   */
  function AccountGrid() {
    // store that will be used to hold accounts
    this._cachedAccountList = null;

    // exposed variables and methods
    this._store = null;
    this.data = null;
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

        // order and expose data made available through the store
        // this.data = Accounts.order(this._store.data);
        this.formatStore();

        // update exposed store driven data
        this.data = angular.copy(this._store.data);
      }.bind(this));
  };

  AccountGrid.prototype.formatStore = function formatStore() {
    // sort underlying data to ensure it is ordered by number - this is how it
    // is sent from the server by default
    this._store.data.sort(orderByNumber);

    // ensure data respects groups
    this._store.data = Accounts.order(this._store.data);

    this._store.recalculateIndex();
  };

  function orderByNumber(a, b) {
    return a.number - b.number;
  }

  AccountGrid.prototype.insertDifference = function insertDifference(account, index) {
    this.data.splice(index, 0, account);
  }

  AccountGrid.prototype.updateViewInsert = function updateViewInsert(event, account) {
    var insertedIndex;

    account.number = Number(account.number);
    account.hrlabel = Accounts.label(account);

    this._store.post(account);

    this.formatStore();
    insertedIndex = this._store.index[account.id];
    this.insertDifference(account, insertedIndex);
  };

  AccountGrid.prototype.updateViewEdit = function updateViewEdit(event, account) {
    var storeRecord = this._store.get(account.id);
    var parentHasChanged = account.parent !== storeRecord.parent;

    account.hrlabel = Accounts.label(account);
    angular.extend(storeRecord, account);

    if (parentHasChanged) {
      this.formatStore();

      // this will invalidate the any references to the services data up to this point
      this.data = angular.copy(this._store.data);
      return true;
    }

    // only semantic information about the account has changed - override the current account
    this.data.splice(this._store.index[account.id], 1, storeRecord);
    return false;
  };

  return AccountGrid;
}
