angular.module('bhima.services')
  .service('AccountGridService', AccountGridService);

AccountGridService.$inject = ['AccountStoreService', 'AccountService', 'Store'];

/**
 * @class AccountGridService
 *
 * @description
 * This service is responsible for collecting data required to populate the
 * Account Management module, it also provides helper methods for dynamically
 * adding and removing data.
 */
function AccountGridService(AccountStore, Accounts, Store, Notify) {

  /**
   * @constructor
   *
   * @description
   * Initialises a new Account Grid object, setting default values
   */
  function AccountGrid() {
    this._store = null;

    // exposed variables
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
    return AccountStore.accounts()
      .then(function (result) {
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

  AccountGrid.prototype.updateViewInsert = function updateViewInsert(event, account) {
    var insertedIndex;

    account.number = Number(account.number);
    account.type_id = Number(account.type_id);
    account.hrlabel = Accounts.label(account);

    // update local store
    this._store.post(account);
    this.formatStore();
    insertedIndex = this._store.index[account.id];

    // live update the grid data - this does not require the grid to redraw and
    // maintains the expand/ collapse states
    this.insertDifference(account, insertedIndex);
  };


  AccountGrid.prototype.updateViewDelete = function updateViewDelete(event, account) {
    // findAndRemove(this._store.data, 'id', account.id);

    // Update the store for other modules accessing it
    var removeIndex = this._store.index[account.id];
    this._store.remove(account.id);
    this.formatStore();

    // Update this grid
    this.data.splice(removeIndex, 1);
  };


  /**
   * @method updateViewEdit
   *
   * @description
   * This method updates an account in the current store based on edits passed
   * in from the account update state. If the parent has changed it will request
   * that the grid updates the store with new data, otherwise an in-line change
   * can be made.
   *
   * @param {Event}   event   Angular $broadcast event
   * @param {Object}  account The udpated account object
   * @return {Boolean} This value reflects if the Grid must be refreshed or not
   */
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

  AccountGrid.prototype.insertDifference = function insertDifference(account, index) {
    this.data.splice(index, 0, account);
  };

  return AccountGrid;
}
