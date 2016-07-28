angular.module('bhima.services')
  .service('TransactionService', TransactionService);

TransactionService.$inject = ['util', 'uiGridConstants'];

/**
 * Transactions Service
 *
 * This service is responsible for fetching transactions from a datasource
 * and providing a number of utility methods for manipulating and framing this
 * information.
 *
 * NOTE: this requires that both cellNav and edit features are enabled on the
 * ui-grid.
 *
 * @requires util
 * @requires uiGridConstants
 */
function TransactionService(util, uiGridConstants) {

  // convert arguments to an array
  function toArray(args) {
    return Array.prototype.slice.call(args);
  }

  /**
   * @function indexBy
   *
   * @description
   * Maps an array of objects to an object keyed by the particular property
   * provided, mapping to indices in the array.  It's somewhat tied to ui-grid's
   * implementation of rows entities.
   *
   * @param {Array} array - the array to index
   * @param {String} property - the key to index the array's contents by.
   * @returns {Object} - an object of value -> array indices
   *
   * @private
   */
  function indexBy(array, property) {
    return array.reduce(function (aggregate, row, index) {
      var key = row.entity[property];

      // header rows do not have keys
      if (!key) { return aggregate; }

      aggregate[key] = aggregate[key] || [];
      aggregate[key].push(index);

      return aggregate;
    }, {});
  }

  /**
   * @function cellEditableCondition
   *
   * @description
   * Only allows rows to be edited if they have been marked by the _editing flag.
   * This should be bound to the cellEditableCondition of gridOptions.
   *
   * @private
   */
  function cellEditableCondition($scope) {
    return $scope.row._editing;
  }

  /**
   * @constructor
   */
  function Transactions(gridOptions) {
    this.gridOptions = gridOptions;

    // a mapping of record_uuid -> array indices in the rendered row set
    this.transactionIndices = {};

    // these arrays store the transactions ids currently being highlighted or
    // edited.
    this._highlights = [];
    this._edits = [];

    gridOptions.cellEditableCondition = cellEditableCondition;
    gridOptions.enableCellEditOnFocus = true;

    util.after(gridOptions, 'onRegisterApi', function onRegisterApi(api) {
      this.gridApi = api;

      // on each row rendering, recompute the transaction row indexes
      api.core.on.rowsRendered(null, createTransactionIndexMap.bind(this));
    }.bind(this));
  }

  /**
   * @function createTransactionIndexMap
   *
   * @description
   * Creates the transaction index mapping for easy lookup of transactions.
   * This is an internal method that is called on every rowRendered() call.
   *
   * @private
   */
  function createTransactionIndexMap() {
    var rows = this.gridApi.grid.rows;
    this.transactionIndices = indexBy(rows, 'record_uuid');
  }

  /**
   * @function getTransactionRows
   *
   * @description
   * Efficiently return transaction rows (but not header rows) in a transaction
   * given the record_uuid using the transaction index mapping.
   *
   * @param {String} uuid - the record_uuid of the transaction
   * @return {Array} rows - the rows in the grid used to render that transaction.
   */
  Transactions.prototype.getTransactionRows = function getTransactionRows(uuid) {
    var array = this.gridApi.grid.rows;
    var indices = this.transactionIndices[uuid];

    // return an array of transaction rows.  These are bound to the grid, despite
    // being a new array.
    return indices.map(function (index) {
      return array[index];
    });
  };


  /**
   * @method validate
   *
   * @description
   * A method to validate individual transactions by their record uuid.  If no records
   * uuids are passed in, it will validate all transactions in the grid.
   */
  Transactions.prototype.validate = function validate(uuid) {

    // if no uuid is passed in, call with all uuids indexed
    if (!uuid) {
      this.validate.apply(this, Object.keys(this.indexBy));
    }

    var rows = this.getTransactionRows(uuid);

    // @TODO - custom logic to validate that debits/credits balance, etc
    return true;
  };

  // helper functions to get parent row (group header) from a child row
  function getParentNode(row) {
    return row.treeNode.parentRow;
  }

  // helper functions to get child row record_uuid from the first child row.
  // Note: if we want to support multiple groups, this should take the last
  // child to avoid getting another group header.
  function getChildRecordUuid(row) {
    var child = row.treeNode.children[0].row;
    return child.entity.record_uuid;
  }

  /**
   * @function setPropertyOnTransaction
   *
   * @description
   * This function toggles a single property on the transaction rows.  It must
   * be called with `.call()` or `.bind()` to properly set the `this` variable.
   *
   * @param {String} uuid - the transaction's record_uuid
   * @param {String} property - the property to set on each transaction row
   * @param {Any} value - any value to set on the transaction
   *
   * @private
   */
  function setPropertyOnTransaction(uuid, property, value) {

    var rows = this.getTransactionRows(uuid);

    // loop through all rows to set the transactions
    rows.forEach(function (row) {
      if (row.entity.record_uuid === uuid) {
        row[property] = value;

        // set the transaction property with the same record
        var parent = getParentNode(row);
        parent[property] = value;
      }
    });

    // make sure the grid updates with the changes
    this.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  }

  /**
   * @method highlight
   *
   * @description
   * This function sets the _hasHighlight property on all transactions matching
   * the provided uuid.  This is useful for scrolling transactions into view.
   *
   * @param {String} uuid - the record_uuid of the transaction to highlight.
   * @param {Boolean} unsetPreviousHighlight - boolean to determine whether
   *   previous highlights should persist.
   */
  Transactions.prototype.highlight = function highlight(uuid, unsetPreviousHighlight) {

    // remove the _editing property on all transactions
    if (unsetPreviousHighlight) {
      this._highlights.forEach(function (uuid) {
        setPropertyOnTransaction.call(this, uuid, '_hasHighlight', false);
      }.bind(this));
    }

    // set highlight on the provided transaction
    setPropertyOnTransaction.call(this, uuid, '_hasHighlight', true);
    this._highlights.push(uuid);
  };

  /**
   * @method scrollIntoView
   *
   * @description
   * Scrolls a transaction group into view by ensuring the last row is visible.
   */
  Transactions.prototype.scrollIntoView = function scrollIntoView(uuid) {
    var rows = this.getTransactionRows(uuid);
    var lastRowInView = rows[rows.length - 1];
    this.gridApi.core.scrollTo(lastRowInView.entity);
  };

  /**
   * @method invalidate
   *
   * @param {String} uuid - the record_uuid of the transaction to invalidate.
   */
  Transactions.prototype.invalidate = function invalidate(uuid) {
    setPropertyOnTransaction.call(this, uuid, '_invalid', true);
  };

  /**
   * @method edit
   *
   * @description
   * This function sets the _editing property on all transactions matching the
   * provided uuid.  It also scrolls the transaction into view if necessary.
   *
   * @param {String|Object} uuid - either a row or a record_uuid of the
   *   transaction to be edited.  If a row is passed in, the record_uuid is
   *   inferred from the child rows.
   */
  Transactions.prototype.edit = function edit(uuid) {

    var api = this.gridApi;

    // if a row is passed in, resolve the row to the child record_uuid
    if (angular.isObject(uuid)) {
      uuid = getChildRecordUuid(uuid);
    }

    setPropertyOnTransaction.call(this, uuid, '_editing', true);
    this.scrollIntoView(uuid);
    this._edits.push(uuid);
  };

  /**
   * @method save
   *
   * @description
   * This function saves all transactions by
   */
  Transactions.prototype.save = function save() {
    // @TODO validate()

    // remove the _editing property on all transactions
    this._edits.forEach(function (uuid) {
      setPropertyOnTransaction.call(this, uuid, '_editing', false);
    }.bind(this));

    // set the edits length to 0
    this._edits.length = 0;
  };

  /**
   * @method isEditing
   *
   * @description
   * Returns a boolean indicating if a transaction is being edited or not.
   *
   * @returns {Boolean} - True if there is a transaction being edited, false
   *   otherwise.
   */
  Transactions.prototype.isEditing = function isEditing() {
    return this._edits.length > 0;
  };

  /**
   * @method print
   *
   * @description
   * This function allows the controller to print the selected uuid.
   */
  Transactions.prototype.print = function print(uuid) {
    // noop()
  };

  return Transactions;
}
