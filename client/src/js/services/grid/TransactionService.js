angular.module('bhima.services')
  .service('TransactionService', TransactionService);

TransactionService.$inject = [
  '$timeout', 'util', 'uiGridConstants', 'bhConstants', 'NotifyService', 'uuid', 'JournalService', 'Store', '$q', 'DateService'
];

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
 *
 * @todo split into util and save logic
 *
 * @requires util
 * @requires uiGridConstants
 */
function TransactionService($timeout, util, uiGridConstants, bhConstants, Notify, uuid, Journal, Store, $q, Dates) {
  var ROW_EDIT_FLAG = bhConstants.transactions.ROW_EDIT_FLAG;
  var ROW_HIGHLIGHT_FLAG = bhConstants.transactions.ROW_HIGHLIGHT_FLAG;
  var ROW_INVALID_FLAG = bhConstants.transactions.ROW_INVALID_FLAG;

  // allow or block editing multiple transactions simultaneously
  var MULTIPLE_EDITS = false;

  // @const
  var TRANSACTION_SHARED_ATTRIBUTES = [
    'transaction', 'trans_id', 'trans_date', 'record_uuid', 'project_id',
    'period_id', 'fiscal_year_id', 'currency_id', 'user_id', 'project_name',
    'hrRecord', 'currencyName', 'description',
  ];

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
    // console.log('calculating indexes');
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
   * Only allows rows to be edited if they have been marked by the ROW_EDIT_FLAG.
   * This should be bound to the cellEditableCondition of gridOptions.
   *
   * @private
   */
  function cellEditableCondition($scope) {
    return $scope.row[ROW_EDIT_FLAG];
  }

  // sets the allowCellFocus parameter on grid's column definitions
  function setColumnCellNav(column) {
    column.allowCellFocus = !!this._cellNavEnabled;
  }

  // called after the cellNavigationEnabled trigger is fired
  function registerCellNavChange() {
    angular.forEach(this.gridOptions.columnDefs, setColumnCellNav.bind(this));
    this.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  }

  /**
   * @constructor
   */
  function Transactions(gridOptions) {
    // why is this number magic?
    var MAGIC_NUMBER = 410;

    // Silly columns that can be navigated to.
    var GRID_PLUGIN_COLUMNS = ['treeBaseRowHeaderCol', 'selectionRowHeaderCol'];

    this.gridOptions = gridOptions;

    // a mapping of record_uuid -> array indices in the rendered row set
    this.transactionIndices = {};

    // this array stores the transactions ids currently being edited.
    this._entity = null;
    this._changes = {};

    gridOptions.cellEditableCondition = cellEditableCondition;
    gridOptions.enableCellEditOnFocus = true;

    util.after(gridOptions, 'onRegisterApi', function onRegisterApi(api) {
      var scope = this;
      this.gridApi = api;

      this.gridApi.edit.on.afterCellEdit(null, editCell.bind(this));

      api.grid.registerRowsProcessor(function (rows) {
        if (this._entity) {
          setPropertyOnTransaction.call(this, this._entity.uuid, ROW_EDIT_FLAG, true);
        }

        return rows;
      }.bind(this), MAGIC_NUMBER);

      api.grid.registerDataChangeCallback(function (rows) {
        createTransactionIndexMap.bind(scope)();
      }, [uiGridConstants.dataChange.ROW]);

      // FIXME(@jniles)?
      // This $timeout hack is necessary to remove the cellNav
      $timeout(function () {

        GRID_PLUGIN_COLUMNS.forEach(function (name) {
          var column = api.grid.getColumn(name);
          column.colDef.allowCellFocus = false;
        });

        this.disableCellNavigation();

        api.grid.notifyDataChange(uiGridConstants.dataChange.COLUMN);
        api.grid.notifyDataChange(uiGridConstants.dataChange.OPTIONS);
      }.bind(this), MAGIC_NUMBER);
    }.bind(this));
  }

  Transactions.prototype.removeRows = function removeRows() {
    var selectedRows = this.gridApi.selection.getSelectedRows();

    selectedRows.forEach(function (row) {

      if (row.record_uuid === this._entity.record_uuid) {
        var originalRecord = this._entity.data.get(row.uuid);

        if (originalRecord) {
          // only remove rows that haven't been added in this session
          this._entity.removedRows.push(row);
          this._entity.data.remove(row.uuid);
        } else {
          // directly delete from rows that have been added
          this._entity.newRows.remove(row.uuid);
        }
        this.removeRowIfExists(row);
      }
    }.bind(this));

    this.digestAggregates();
  };

  Transactions.prototype.addRow = function addRow() {
    var transactionRow = cloneAttributes(this._entity, TRANSACTION_SHARED_ATTRIBUTES);
    transactionRow.uuid = uuid();

    // keep track of new rows in newRows array
    this._entity.newRows.post(transactionRow);

    // insert row into grid data (display row to user)
    this.gridApi.grid.options.data.push(transactionRow);
    this.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
    this.digestAggregates();
  };

  // returns a new object picking only the attributes passed
  // @TODO perf
  function cloneAttributes(originObject, attributes) {
    return attributes.reduce(function (aggregate, attribute) {
      aggregate[attribute] = angular.copy(originObject[attribute]);
      return aggregate;
    }, {});
  }

  // tied to afterCellEdit event
  function editCell(rowEntity, colDef, newValue, oldValue) {
    if (oldValue !== newValue) {
      var originalRecord = this._entity.data.get(rowEntity.uuid);

      // keep data up to date with changes
      if (originalRecord) {
        // only keep track of changes if this is a new row
        this._changes[rowEntity.uuid] = this._changes[rowEntity.uuid] || {};

        if (typeof (colDef) === 'object' && colDef.field) {
          this._changes[rowEntity.uuid][colDef.field] = newValue;
          this._entity.data.get(rowEntity.uuid)[colDef.field] = newValue;
        } else {
          this._changes[rowEntity.uuid][colDef] = newValue;
          this._entity.data.get(rowEntity.uuid)[colDef] = newValue;
        }
      }
    }
    this.digestAggregates();
  }

  /**
   * @function editCell
   *
   * @description
   * Edit the value of a cell for a custom template grid edit.
   *
   * @public
   *
   */
  Transactions.prototype.editCell = editCell;

  /**
   * @function enableCellNavigation
   *
   * @description
   * Enables cell navigation on the underlying grid.
   *
   * @public
   *
   */
  Transactions.prototype.enableCellNavigation = function enableCellNavigation() {
    this._cellNavEnabled = true;
    registerCellNavChange.call(this);
  };

  /**
   * @function disableCellNavigation
   *
   * @description
   * Disables and clears the focused cell navigation for a better UX while working
   * with complex grids.
   *
   * @public
   */
  Transactions.prototype.disableCellNavigation = function disableCellNavigation() {
    // clear the focused element for a better UX
    this.gridApi.grid.cellNav.clearFocus();

    this._cellNavEnabled = false;
    registerCellNavChange.call(this);
  };

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

    // console.log('createTransactionIndexMap');
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
    var indices = this.transactionIndices[uuid] || [];

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


  /**
   * @method transaction
   *
   * @description
   * This method is used to check if a transaction is balanced by their record
   */
  function validateTransaction(entity) {
    var transaction = [];

    // include transaction data
    entity.data.data.forEach(function (row) {
      transaction.push(row);
    });

    // include new rows
    entity.newRows.data.forEach(function (row) {
      transaction.push(row);
    });

    var numberOfLine = transaction.length;
    var error;

    var ERR_SINGLE_LINE_TRANSACTION = 'POSTING_JOURNAL.ERRORS.SINGLE_LINE_TRANSACTION',
      ERR_MISSING_ACCOUNTS = 'POSTING_JOURNAL.ERRORS.MISSING_ACCOUNTS',
      ERR_MISSING_DATES = 'POSTING_JOURNAL.ERRORS.MISSING_DATES',
      ERR_DATE_IN_WRONG_PERIOD = 'POSTING_JOURNAL.ERRORS.DATE_IN_WRONG_PERIOD',
      ERR_TRANSACTION_DIFF_DATES = 'POSTING_JOURNAL.ERRORS.TRANSACTION_DIFF_DATES',
      ERR_UNBALANCED_TRANSACTIONS = 'POSTING_JOURNAL.ERRORS.UNBALANCED_TRANSACTIONS',
      ERR_DEB_CRED_NOT_NULL = 'POSTING_JOURNAL.ERRORS.DEB_CRED_NOT_NULL',
      ERR_CREDITED_DEBITED = 'POSTING_JOURNAL.ERRORS.CREDITED_DEBITED';

    // If the transaction has 0 line
    if (numberOfLine === 0) {
      return;
    }

    // If the transaction are single line transaction
    if (numberOfLine === 1) {
      return ERR_SINGLE_LINE_TRANSACTION;
    }


    var debit = 0,
      credit = 0,
      initialDate,
      accountNull = false,
      dateNull =  false,
      dateDifferent = false,
      dateWrongPeriod = false,
      debitCreditNull = false,
      debitedCreditedNull = false;

    if (transaction[0].trans_date) {
      initialDate = transaction[0].trans_date;
    }


    transaction.forEach(function (row) {
      debit += Number(row.debit_equiv);
      credit += Number(row.credit_equiv);

      // Check if they are account number Null
      accountNull = !row.account_number;

      // Check if they are trans_date Null
      dateNull = !row.trans_date;

      // Check if they are different Date
      dateDifferent = Dates.util.str(row.trans_date) !== Dates.util.str(initialDate);

      // Check if debit and credit are Null
      debitCreditNull = (!Number(row.debit_equiv) && !Number(row.credit_equiv));

      // Check if they are value on debit and Credit
      debitedCreditedNull = (row.debit_equiv > 0 && row.credit_equiv > 0);

      // check if trans_date is in bed period
      if (new Date(row.trans_date) < new Date(row.period_start) || new Date(row.trans_date) > new Date(row.period_end)) {
        dateWrongPeriod = true;
      }
    });

    if (accountNull) {
      error = ERR_MISSING_ACCOUNTS;
    } else if (dateNull) {
      error = ERR_MISSING_DATES;
    } else if (dateWrongPeriod) {
      error = ERR_DATE_IN_WRONG_PERIOD;
    } else if (dateDifferent) {
      error = ERR_TRANSACTION_DIFF_DATES;
    } else if (debitCreditNull) {
      error = ERR_DEB_CRED_NOT_NULL;
    } else if (debitedCreditedNull) {
      error = ERR_CREDITED_DEBITED;
    } else {
      // later in validateTransaction()
      if (debit !== credit) {
        error = ERR_UNBALANCED_TRANSACTIONS;
      }
    }

    return error;
  }

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
    var visible = false;

    // ensure that only the visible rows parent UI is updated
    var visibleIndex = -1;

    // console.log('setting property');
    // loop through all rows to set the transactions
    rows.forEach(function (row, index) {

      // if row has been removed the index may not yet have completed and we
      // will try to set the property on an undefined object
      if (row) {
        // console.log('trying to update row', row);
        if (row.entity.record_uuid === uuid) {

          // console.log('setting child property');
          row[property] = value;


          // This will check to see if any of the rows in a transaction are visible
          if (row.visible) {
            visible = true;
            visibleIndex = index;
          }

          // set the transaction property with the same record
          // var parent = getParentNode(row);
          // parent[property] = value;
        }
      }
    });

    // ensure this flag is only set if the transaction row header exists
    // all rows are made 'children' of a row header - even if their transaction header does not exist
    if (visible) {
      // console.log('setting parent property');
      getParentNode(rows[visibleIndex])[property] = value;
    }
    // make sure the grid updates with the changes
    // this.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  }


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
   * This function sets the ROW_EDIT_FLAG property on all transactions matching the
   * provided uuid.  It also scrolls the transaction into view if necessary.
   *
   * @param {String|Object} uuid - either a row or a record_uuid of the
   *   transaction to be edited.  If a row is passed in, the record_uuid is
   *   inferred from the child rows.
   */
  Transactions.prototype.edit = function edit(gridRow) {

    if (this.isEditing() && !MULTIPLE_EDITS) {
      Notify.warn('POSTING_JOURNAL.SINGLE_EDIT_ONLY');
      return;
    }

    var uuid = getChildRecordUuid(gridRow);

    // fetch the transaction from the server
    Journal.grid(uuid)
      .then(function (result) {
        var rows = this.preprocessJournalData(result);

        // store for indexing transaction rows
        var transactionData = new Store({identifier : 'uuid'});
        transactionData.setData(rows);

        var newRows = new Store({identifier: 'uuid'});

        // use the first row in the transaction as a template for all new rows
        var transactionTemplate = cloneAttributes(rows[0], TRANSACTION_SHARED_ATTRIBUTES);

        // entity object will be used to track everything in the current edit session
        this._entity = {
          uuid        : uuid,
          data        : transactionData,
          newRows     : newRows,
          removedRows : [],
          aggregates  : {},
        };

        // assign shared values to entity session
        angular.merge(this._entity, transactionTemplate);

        //
        this.applyEdits();

        // ensure edit flag is set on all new rows from applyEdits
        setPropertyOnTransaction.call(this, uuid, ROW_EDIT_FLAG, true);
        if (!this._cellNavEnabled) { this.enableCellNavigation(); }
        // this.scrollIntoView(uuid);
        this.digestAggregates();
      }.bind(this))
      .catch(Notify.handleError);
  };

  Transactions.prototype.digestAggregates = function digestAggregates() {
    this._entity.aggregates.totalRows =
      this._entity.data.data.length +
      this._entity.newRows.data.length;

    this._entity.aggregates.credit =
      this._entity.data.data.reduce(sumCredit, 0) +
      this._entity.newRows.data.reduce(sumCredit, 0);

    this._entity.aggregates.debit =
      this._entity.data.data.reduce(sumDebit, 0) +
      this._entity.newRows.data.reduce(sumDebit, 0);
  };

  function sumCredit(a, b) { return a + (Number(b.credit_equiv) || 0); }
  function sumDebit(a, b) { return a + (Number(b.debit_equiv) || 0); }

  // This function should be called whenever the underlying model changes
  // (i.e a new search) to ensure that the latest transactions changes are applied
  //
  // - currently this ensures the current transaction being edited is shown in
  // ALL searches. The server does not know about new or edited rows and cannot
  // search based on this new information. This should also provide a more
  // uniform user experience.
  // - local filters will still be applied to new and updated rows.
  Transactions.prototype.applyEdits = function applyEdits() {
    var gridData = this.gridApi.grid.options.data;
    this.transactionIndices = {};

    // console.log('applyEdits');

    if (this._entity) {
      // apply edits - ensure current rows are shown

      //@fixme
      this._entity.data.data.map(this.removeRowIfExists.bind(this));

      // include transaction data
      this._entity.data.data.forEach(function (row) {
        gridData.push(row);
      }.bind(this));

      // include new rows
      this._entity.newRows.data.forEach(function (row) {
        gridData.push(row);
      }.bind(this));

      // ensure removal of old rows
      this._entity.removedRows.map(this.removeRowIfExists.bind(this));
    }
  };

  Transactions.prototype.removeRowIfExists = function removeRowIfExists(row) {
    var uid = row.uuid;

    var removed = removeFromNonIndexedArray(this.gridApi.grid.options.data, 'uuid', uid);
    if (removed) {
      createTransactionIndexMap.bind(this)();
    }
  };

  function removeFromNonIndexedArray(array, id, value, objectAlias) {
    var dataIndex;
    var index = array.some(function (item, index) {
      var entity = objectAlias ? item[objectAlias] : item;

      // console.log('comparing', journalRow.uuid, uuid);
      if (entity[id] === value) {
        dataIndex = index;
        return true;
      }
      return false;
    });

    if (angular.isDefined(dataIndex)) {
      array.splice(dataIndex, 1);
    }
    return angular.isDefined(dataIndex);
  }

  /**
   * @method save
   *
   * @description
   * This function saves all transactions by
   */
  Transactions.prototype.save = function save() {
    var clientErrors = validateTransaction(this._entity);

    if (clientErrors) {
      return $q.reject(clientErrors);
    }

    return Journal.saveChanges(this._entity, this._changes)
      .then(function (results) {
        this.disableCellNavigation();
        setPropertyOnTransaction.call(this, this._entity.uuid, ROW_EDIT_FLAG, false);

        this._entity = null;
        this._changes = {};
        return results;
      }.bind(this));
  };

  Transactions.prototype.cancel = function cancel() {
    this.disableCellNavigation();
    setPropertyOnTransaction.call(this, this._entity.uuid, ROW_EDIT_FLAG, false);
    this._entity = null;
    this._changes = {};
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
    return this._entity !== null;
    // return this._edits.length > 0;
  };

  Transactions.prototype.preprocessJournalData = function preprocessJournalData(data) {
    var aggregateStore = new Store({ identifier: 'record_uuid' });
    aggregateStore.setData(data.aggregate);

    data.journal.forEach(function (row) {

      // give each row a reference to its transaction aggregate data
      row.transaction = aggregateStore.get(row.record_uuid);
    });

    return data.journal;
  };

  return Transactions;
}
