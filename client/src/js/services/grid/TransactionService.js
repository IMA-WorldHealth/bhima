angular.module('bhima.services')
  .service('TransactionService', TransactionService);

TransactionService.$inject = ['$timeout', 'util', 'uiGridConstants', 'bhConstants', 'NotifyService', 'uuid', 'JournalService', 'Store'];

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
function TransactionService($timeout, util, uiGridConstants, bhConstants, Notify, uuid, Journal, Store) {

  var ROW_EDIT_FLAG = bhConstants.transactions.ROW_EDIT_FLAG;
  var ROW_HIGHLIGHT_FLAG = bhConstants.transactions.ROW_HIGHLIGHT_FLAG;
  var ROW_INVALID_FLAG = bhConstants.transactions.ROW_INVALID_FLAG;

  // allow or block editing multiple transactions simultaneously
  var MULTIPLE_EDITS = false;

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
    column.allowCellFocus = this._cellNavEnabled;
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
    this.gridOptions = gridOptions;

    // a mapping of record_uuid -> array indices in the rendered row set
    this.transactionIndices = {};

    // this array stores the transactions ids currently being edited.
    this._entity = null;
    this._changes = {};
    // this._edits = [];

    gridOptions.cellEditableCondition = cellEditableCondition;
    gridOptions.enableCellEditOnFocus = true;

    util.after(gridOptions, 'onRegisterApi', function onRegisterApi(api) {
      this.gridApi = api;

      window.myapi = api;
      this.gridApi.edit.on.afterCellEdit(null, editCell.bind(this));

      var scope = this;

			api.grid.registerRowsProcessor(function (rows) {

        if (this._entity) {


          console.log('_entity registered, editing in progress');
          setPropertyOnTransaction.call(this, this._entity.uuid, ROW_EDIT_FLAG, true);
        }
        return rows;
      }.bind(this), 410);

      // cellNav is not enabled by default
      // this.disableCellNavigation();

      // on each row rendering, recompute the transaction row indexes
      // api.core.on.rowsRendered(null, createTransactionIndexMap.bind(this));
      // api.core.on.rowsRendered(null, function (rows) { console.log('rows rendered'); });

      api.grid.registerDataChangeCallback(function (rows) {
        createTransactionIndexMap.bind(scope)();

        // console.log('creating new index', rows);
      }, [uiGridConstants.dataChange.ROW]);

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
          // removeFromNonIndexedArray(this._entity.rows, 'uuid', row.uuid, 'entity');

          console.log('rmmmmmmmmmmmmmmmmmmm');
          console.log(this._entity);
          console.log('removeRowIfExists', row);
        } else {
          // directly delete from rows that have been added
          this._entity.newRows.remove(row.uuid);
        }
        this.removeRowIfExists(row);
      }
    }.bind(this));

    this.digestAggregates();
  }

  Transactions.prototype.addRow = function addRow() {

    var transactionRow = {};

    // @todo use transaction row template instead of inidividual assignments
    console.log(this._entity);
    transactionRow.uuid = uuid();
    transactionRow.transaction = this._entity.transaction;
    transactionRow.trans_id = this._entity.trans_id;
    transactionRow.trans_date = this._entity.date;
    transactionRow.record_uuid = this._entity.record_uuid;
    transactionRow.project_id = this._entity.project_id;
    transactionRow.period_id = this._entity.period_id;
    transactionRow.fiscal_year_id = this._entity.fiscal_year_id;
    transactionRow.currency_id = this._entity.currency_id;
    transactionRow.user_id = this._entity.user_id;
    transactionRow.project_name = this._entity.project_name;

    transactionRow.hrRecord = this._entity.hrRecord;
    transactionRow.currencyName = this._entity.currencyName;

    console.log(transactionRow, this._entity);

    this._entity.newRows.post(transactionRow);

    this.gridApi.grid.options.data.push(transactionRow);
    setPropertyOnTransaction.call(this, transactionRow.uuid, ROW_EDIT_FLAG, true);
    this.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
    console.log(uiGridConstants.dataChange);

    this.digestAggregates();
  }

  // tied to afterCellEdit event
  function editCell(rowEntity, colDef, newValue, oldValue) {
    if (oldValue !== newValue) {
      var originalRecord = this._entity.data.get(rowEntity.uuid);

      // @fixme
      // keep data up to date with changes
      if (originalRecord) {
        // only keep track of changes if this is a new row
        this._changes[rowEntity.uuid] = this._changes[rowEntity.uuid] || {};
        this._changes[rowEntity.uuid][colDef.field] = newValue;

        // if this doesn't exist - this could be a new row
        this._entity.data.get(rowEntity.uuid)[colDef.field] = newValue;
      }
    }
    // this._changes[rowEntity.uuid][colDef] = newValue;

    // console.log('Updated', colDef.name, 'from', oldValue, 'to', newValue);
    console.log('_changes', this._changes);
    console.log('_entity', this._entity);

    console.log('calling digest');
    this.digestAggregates();
  }

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
   *
   */
  Transactions.prototype.disableCellNavigation = function disableCellNavigation() {

    // clear the focused element for a better UX
    this.gridApi.grid.cellNav.clearFocus();

    this._cellNavEnabled = false;
    registerCellNavChange.call(this)

    // $timeout(function () {
    //   console.log('clearing cellnav enabled');
    //   this.gridApi.grid.cellNav.clearFocus();
    //   setPropertyOnTransaction.call(this, this._entity.uuid, ROW_EDIT_FLAG, false);
    //   this._entity = null;
    // }.bind(this), 2000);

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
  Transactions.prototype.edit = function edit(uuid) {
    var api = this.gridApi;
    var RETURN_DATA_ENTITY = true;

    if (this.isEditing() && !MULTIPLE_EDITS) {
      Notify.warn('JOURNAL.SINGLE_EDIT_ONLY');
      return;
    }

    // if a row is passed in, resolve the row to the child record_uuid
    if (angular.isObject(uuid)) {
      uuid = getChildRecordUuid(uuid);
    }

    // fetch the transaction from the server
    Journal.grid(uuid)
      .then(function (result) {
        var rows = this.preprocessJournalData(result);
        var transactionData = new Store({identifier : 'uuid'});
        transactionData.setData(rows);

        console.log('journal has fetched', result);

        if (!this._cellNavEnabled) {
          this.enableCellNavigation();
        }

        // @todo create template row for addRow to use
        setPropertyOnTransaction.call(this, uuid, ROW_EDIT_FLAG, true);
        this.scrollIntoView(uuid);
        this._entity = {
          uuid : uuid,
          data : transactionData,
          // rows : this.getTransactionRows(uuid, RETURN_DATA_ENTITY),
          aggregates : {},
          newRows : new Store({ identifier : 'uuid' }),
          removedRows : []
        };

        console.log('ROWS FOR EDIT');
        console.log(rows);

        // shared data needed for all rows
        this._entity.trans_id = rows[0].trans_id;
        this._entity.transaction = rows[0].transaction;
        this._entity.date = rows[0].trans_date;
        this._entity.record_uuid = rows[0].record_uuid;
        this._entity.period_id = rows[0].period_id;
        this._entity.project_id = rows[0].project_id;
        this._entity.fiscal_year_id = rows[0].fiscal_year_id;
        this._entity.currency_id = rows[0].currency_id;
        this._entity.user_id = rows[0].user_id;
        this._entity.project_name = rows[0].project_name;

        this._entity.hrRecord = rows[0].hrRecord;
        this._entity.currencyName = rows[0].currencyName;

        this.applyEdits();
        this.digestAggregates();

        // @sfount proposal
        // 1. Download transaction information seperate from current view
        // 2. Show entity information in edit bar
        // 3. Ensure whenever filters or searches are applied that styles and edit classes are updated

        // console.log('editing with', this._entity);

      }.bind(this));



  };

  Transactions.prototype.digestAggregates = function digestAggregates () {
    this._entity.aggregates.totalRows =
      this._entity.data.data.length +
      this._entity.newRows.data.length;
      // this._entity.removedRows.length;

    this._entity.aggregates.credit =
      this._entity.data.data.reduce(function (a, b) { return a + Number(b.credit_equiv); }, 0) +
      this._entity.newRows.data.reduce(function (a, b) { return a + Number(b.credit_equiv) || 0; }, 0);

    this._entity.aggregates.debit =
      this._entity.data.data.reduce(function (a, b) { return a + Number(b.debit_equiv); }, 0) +
      this._entity.newRows.data.reduce(function (a, b) { return a + Number(b.debit_equiv) || 0; }, 0);

    console.log('DIGEST', this._entity);
  };


  // This function should be called whenever the underlying model changes
  // (i.e a new search) to ensure that the latest transactions changes are applied
  //
  // - currently this ensures the current transaction being edited is shown in
  // ALL searches. The server does not know about new or edited rows and cannot
  // search based on this new information. This should also provide a more
  // uniform user experience.
  // - local filters will still be applied to new and updated rows.
  Transactions.prototype.applyEdits = function applyEdits () {
    var gridData = this.gridApi.grid.options.data;
    this.transactionIndices = {};

    console.log('applyEdits');
    if (this._entity) {
      // apply edits - ensure current rows are shown

      console.log('editing exists');


      //@fixme
      this._entity.data.data.map(this.removeRowIfExists.bind(this));

      // this._entity.rows.forEach(function (row) {
        // data items are kept up to date with the latest changes, these
        // replace the latest server rows
        // this.removeRowIfExists(row);
      // });


      // introduce theory data
      this._entity.data.data.forEach(function (row) {
        gridData.push(row);
      }.bind(this));

      // include new rows
      this._entity.newRows.data.forEach(function (row) {
        gridData.push(row);
        // this.gridApi.grid.options.data.push(row);
      }.bind(this));

      // ensure removal of old rows
      this._entity.removedRows.map(this.removeRowIfExists.bind(this));
    }
  }

  Transactions.prototype.removeRowIfExists = function removeRowIfExists(row) {
    var uuid = row.uuid;

    var removed = removeFromNonIndexedArray(this.gridApi.grid.options.data, 'uuid', uuid);
    if (removed) {
      createTransactionIndexMap.bind(this)();
    }

    // var dataIndex;
    // var index = this.gridApi.grid.options.data.some(function (journalRow, index) {
      // console.log('comparing', journalRow.uuid, uuid);
      // if (journalRow.uuid === uuid) {

        // console.log('FOUND ROW TO REMOVE', row);
        // dataIndex = index;
        // return true;
      // }
      // return false;
    // });

    // if (angular.isDefined(dataIndex)) {

      // console.log('attempting to remove data item');
      // this.gridApi.grid.options.data.splice(dataIndex, 1);
      // createTransactionIndexMap.bind(this)();
    // }
  };

  function removeFromNonIndexedArray(array, id, value, objectAlias) {
    var dataIndex;
    var removed;
    var index = array.some(function (item, index) {
      var entity = objectAlias ? item[objectAlias] : item;

      // console.log('comparing', journalRow.uuid, uuid);
      if (entity[id] === value) {

        console.log('FOUND ROW TO REMOVE', item);
        dataIndex = index;
        return true;
      }
      return false;
    });

    removed = angular.isDefined(dataIndex);

    if (removed) {
      array.splice(dataIndex, 1);
    }

    return removed;
  }



  /**
   * @method save
   *
   * @description
   * This function saves all transactions by
   */
  Transactions.prototype.save = function save() {

    // @TODO validate()


    console.log('making a submission for', this._entity);
    console.log('making a submission for', this._changes);


    Journal.saveChanges(this._entity, this._changes)
      .then(function () {
        // successful save - exit edit mode

        this.disableCellNavigation();
        setPropertyOnTransaction.call(this, this._entity.uuid, ROW_EDIT_FLAG, false);
        // set the edits length to 0
        // this._edits.length = 0;
        this._entity = null;
        this._changes = {};
        // disable cell navigation
      }.bind(this))
      .catch(function (error) {
        Notify.handleError(error);

      });
    // remove the ROW_EDIT_FLAG property on all transactions
    // this._edits.forEach(function (uuid) {
    // }.bind(this));


    // setPropertyOnTransaction.call(this, this._entity.uuid, ROW_EDIT_FLAG, false);

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

  /**
   * @method print
   *
   * @description
   * This function allows the controller to print the selected uuid.
   */
  Transactions.prototype.print = function print(uuid) {
    // noop()
  };

  Transactions.prototype.preprocessJournalData = function preprocessJournalData(data) {
    var aggregateStore = new Store({ identifier : 'record_uuid' });
    aggregateStore.setData(data.aggregate);

    data.journal.forEach(function (row) {

      // give each row a reference to its transaction aggregate data
      row.transaction = aggregateStore.get(row.record_uuid);
    });

    return data.journal;
  };

  return Transactions;
}
