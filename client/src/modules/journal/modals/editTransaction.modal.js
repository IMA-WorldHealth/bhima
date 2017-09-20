angular.module('bhima.controllers')
  .controller('JournalEditTransactionController', JournalEditTransactionController);

JournalEditTransactionController.$inject = [
  'JournalService', 'Store', 'TransactionTypeService', '$uibModalInstance',
  'transactionUuid', 'readOnly', 'uiGridConstants', 'uuid', 'util',
];

function JournalEditTransactionController(
  Journal, Store, TransactionType, Modal, transactionUuid, readOnly, uiGridConstants, uuid, util
) {
  var gridApi = {};
  var vm = this;
  var editColumns;

  // Variables for tracking edits
  var removedRows = [];
  var addedRows = [];
  var changes = {};

  // must have transaction_type for certain cases
  var ERROR_MISSING_TRANSACTION_TYPE = 'TRANSACTIONS.MISSING_TRANSACTION_TYPE';
  var ERROR_IMBALANCED_TRANSACTION = 'TRANSACTIONS.IMBALANCED_TRANSACTION';
  var ERROR_SINGLE_ACCOUNT_TRANSACTION = 'TRANSACTIONS.SINGLE_ACCOUNT_TRANSACTION';
  var ERROR_SINGLE_ROW_TRANSACTION = 'TRANSACTIONS.SINGLE_ROW_TRANSACTION';
  var ERROR_NEGATIVE_VALUES = 'VOUCHERS.COMPLEX.ERRORS_NEGATIVE_VALUES'
  var ERROR_INVALID_DEBITS_AND_CREDITS = 'VOUCHERS.COMPLEX.ERROR_AMOUNT';

  var footerTemplate =
    '<div class="ui-grid-cell-contents"><span translate>POSTING_JOURNAL.ROWS</span> <span>{{grid.rows.length}}</span></div>';

  // @FIXME(sfount) this is only exposed for the UI grid link component - this should be self contained in the future
  vm.loadingTransaction = false;
  vm.setupComplete = false;

  // @TODO(sfount) apply read only logic to save buttons and grid editing logic
  vm.readOnly = readOnly || false;

  vm.validation = {
    errored : false,
    blockedPostedTransactionEdit : false,
  };

  // @TODO(sfount) column definitions currently duplicated across journal and here
  editColumns = [{
    field              : 'description',
    displayName        : 'TABLE.COLUMNS.DESCRIPTION',
    headerCellFilter   : 'translate',
    allowCellFocus : !vm.readOnly,
    enableCellEdit : !vm.readOnly,
  }, {
    field                : 'account_number',
    displayName          : 'TABLE.COLUMNS.ACCOUNT',
    editableCellTemplate : '<div><div ui-grid-edit-account></div></div>',
    cellTemplate         : '/modules/journal/templates/account.cell.html',
    enableCellEdit : !vm.readOnly,
    allowCellFocus : !vm.readOnly,
    headerCellFilter     : 'translate',
  }, {
    field                            : 'debit_equiv',
    displayName                      : 'TABLE.COLUMNS.DEBIT',
    cellClass                        : 'text-right',
    footerCellClass                 : 'text-right',
    headerCellFilter                 : 'translate',
    type : 'number',
    aggregationHideLabel : true,
    enableCellEdit : !vm.readOnly,
    allowCellFocus : !vm.readOnly,
    aggregationType : uiGridConstants.aggregationTypes.sum,
  }, {
    field                            : 'credit_equiv',
    displayName                      : 'TABLE.COLUMNS.CREDIT',
    cellClass                        : 'text-right',
    footerCellClass                 : 'text-right',
    headerCellFilter                 : 'translate',
    enableFiltering : true,
    type : 'number',
    aggregationHideLabel : true,
    enableCellEdit : !vm.readOnly,
    allowCellFocus : !vm.readOnly,
    aggregationType : uiGridConstants.aggregationTypes.sum,
  }, {
    field                : 'hrEntity',
    displayName          : 'TABLE.COLUMNS.RECIPIENT',
    headerCellFilter     : 'translate',
    cellTemplate : '<div class="ui-grid-cell-contents"><bh-reference-link ng-if="row.entity.hrEntity" reference="row.entity.hrEntity" /></div>',
    enableCellEdit : !vm.readOnly,
    allowCellFocus : !vm.readOnly,
    visible              : true,
  }, {
    field            : 'hrReference',
    displayName      : 'TABLE.COLUMNS.REFERENCE',
    cellTemplate : '<div class="ui-grid-cell-contents"><bh-reference-link ng-if="row.entity.hrReference" reference="row.entity.hrReference" /></div>',
    headerCellFilter : 'translate',
    enableCellEdit : !vm.readOnly,
    allowCellFocus : !vm.readOnly,
    visible          : true,
  }];

  vm.gridOptions = {
    columnDefs : editColumns,
    showColumnFooter : true,
    showGridFooter : true,
    appScopeProvider : vm,
    gridFooterTemplate : footerTemplate,
    onRegisterApi : function (api) {
      gridApi = api;
      gridApi.edit.on.afterCellEdit(null, handleCellEdit);
    },
  };

  vm.close = Modal.dismiss;

  // @TODO(sfount) move to component vm.dateEditorOpen = false;
  vm.openDateEditor = function openDateEditor() { vm.dateEditorOpen = !vm.dateEditorOpen; };

  // module dependencies
  TransactionType.read()
    .then(function (typeResults) {
      vm.transactionTypes = new Store({ identifier : 'id' });
      vm.transactionTypes.setData(typeResults);
    });

  vm.loadingTransaction = true;
  Journal.grid(transactionUuid)
    .then(function (transaction) {
      vm.setupComplete = true;

      verifyEditableTransaction(transaction);

      vm.rows = new Store({ identifier : 'uuid' });
      vm.rows.setData(transaction);

      // @FIXME(sfount) date ng-model hack
      vm.rows.data.forEach(function (row) { row.trans_date = new Date(row.trans_date); });
      vm.shared = sharedDetails(vm.rows.data[0]);
      vm.gridOptions.data = vm.rows.data;
    })
    .catch(function () {
      vm.hasError = true;
    })
    .finally(function () {
      vm.loadingTransaction = false;
    });

  /**
   * @function offlineTransactionValidation
   *
   * @description
   * This function validates transactions without doing a round-trip to the server.  It implements some simple checks
   * such as:
   *  1. Making sure a transaction has multiple lines
   *  2. Make sure a transaction is balanced
   *  3. Making sure a transaction involves at least two accounts
   *  4. Making sure a transaction has a transaction_type associated with it.
   *  5. Make sure both the debits and credits are defined and not equal to each other.
   *
   * If any of these checks fail, the transaction submission is aborted until the user corrects those mistakes.
   */
  function offlineTransactionValidation(rows) {
    var hasSingleLine = rows.length < 2;
    if (hasSingleLine) {
      return ERROR_SINGLE_ROW_TRANSACTION;
    }

    var debits = 0;
    var credits = 0;

    var i = rows.length;
    var row;
    while (i--) {
      row = rows[i];

      var hasTransactionType = typeof row.origin_id === 'number';
      if (!hasTransactionType) {
        return ERROR_MISSING_TRANSACTION_TYPE;
      }

      var hasNegativeNumbers = (row.debit_equiv < 0 || row.credit_equiv < 0);
      if (hasNegativeNumbers) {
        return ERROR_NEGATIVE_NUMBERS;
      }

      window.util = util;

      var hasSingleNumericValue = !util.xor(Boolean(row.debit_equiv), Boolean(row.credit_equiv));
      if (hasSingleNumericValue) {
        return ERROR_INVALID_DEBITS_AND_CREDITS;
      }

      credits += row.credit_equiv;
      debits += row.debit_equiv;
    }

    var uniqueAccountsArray = rows
      .map(function (row) {
        return row.account_id;
      })
      .filter(function (accountId, index, array) {
        return array.indexOf(accountId) === index;
      });

    var hasSingleAccount = uniqueAccountsArray.length === 1;
    if (hasSingleAccount) {
      return ERROR_SINGLE_ACCOUNT_TRANSACTION;
    }

    var hasImbalancedTransaction = Number(debits.toFixed('2')) !== Number(credits.toFixed('2'));
    if (hasImbalancedTransaction) {
      return ERROR_IMBALANCED_TRANSACTION;
    }

    return false;
  }


  function verifyEditableTransaction(transaction) {
    var posted = transaction[0].posted;

    if (posted) {
      vm.validation.blockedPostedTransactionEdit = true;
      vm.readOnly = true;

      // notify the grid of options change - the grid should no longer be editable
      vm.gridOptions.columnDefs.forEach(function (column) {
        column.allowCellFocus = !vm.readOnly;
        column.enableCellEdit = !vm.readOnly;
      });
      gridApi.core.notifyDataChange(uiGridConstants.dataChange.ALL);
    }
  }

  // Editing global transaction attributes
  vm.handleTransactionTypeChange = function handleTransactionTypeChange(currentValue) {
    applyAttributeToRows('origin_id', currentValue);
  };

  vm.handleTransactionDateChange = function handleTransactionDateChange(currentValue) {
    applyAttributeToRows('trans_date', currentValue);
  };

  // Edit rows functions
  vm.addRow = function addRow() {
    var row = { uuid : uuid(), debit_equiv : 0, credit_equiv : 0 };
    angular.extend(row, angular.copy(vm.shared));

    addedRows.push(row.uuid);
    vm.rows.post(row);
  };

  // helper function to pull out the uuid property on an array of objects
  function mapRowUuids(uid) {
    return { uuid : uid };
  }

  vm.saveTransaction = function saveTransaction() {
    var noChanges = addedRows.length === 0 && removedRows.length === 0 && Object.keys(changes).length === 0;

    if (noChanges) {
      Modal.close({});
      return;
    }

    // run local validation before submission
    var offlineErrors = offlineTransactionValidation(vm.rows.data);
    if (offlineErrors) {
      vm.validation.errored = true;
      vm.validation.message = offlineErrors;
      return;
    }

    // building object to conform to legacy API
    // @FIXME(sfount) update journal service API for human readable interface
    var transactionRequest = {
      uuid : vm.shared.record_uuid,
      newRows : { data : filterRowsByUuid(vm.rows.data, addedRows) },
      removedRows : removedRows.map(mapRowUuids),
    };


    // reset error validation
    vm.validation.errored = false;
    vm.validation.message = null;
    vm.saving = true;


    Journal.saveChanges(transactionRequest, changes)
      .then(function (resultUpdatedTransaction) {
        var transaction = new Store({ identifier : 'uuid' });

        transaction.setData(resultUpdatedTransaction);

        // collapse information for the module that might expect to apply optimistic updates
        var editSessionResult = {
          edited : Object.keys(changes),
          added : addedRows,
          removed : removedRows,
          updatedTransaction : transaction,
        };

        Modal.close(editSessionResult);
      })
      .catch(function (error) {
        vm.validation.errored = true;
        vm.validation.message = error.data.code;
      })
      .finally(function () {
        vm.saving = false;
      });
  };

  // rows - array of rows
  // uuids - array of uuids
  function filterRowsByUuid(rows, uuids) {
    var result = rows.filter(function (row) {
      return contains(uuids, row.uuid);
    });
    return result;
  }

  vm.removeRows = function removeRows() {
    var selectedRows = gridApi.selection.getSelectedRows();

    selectedRows.forEach(function (row) {
      var isOriginalRow = !contains(addedRows, row.uuid);

      if (isOriginalRow) {
        // remove any changes tracked against this record
        delete changes[row.uuid];
        removedRows.push(row.uuid);
      } else {
        // remove new row request from list tracking additional rows
        addedRows.splice(addedRows.indexOf(row.uuid), 1);
      }

      vm.rows.remove(row.uuid);
    });
  };

  function handleCellEdit(rowEntity, colDef, newValue, oldValue) {
    var isOriginalRow;
    if (oldValue !== newValue) {
      isOriginalRow = !contains(addedRows, rowEntity.uuid);

      if (isOriginalRow) {
        changes[rowEntity.uuid] = changes[rowEntity.uuid] || {};
        changes[rowEntity.uuid][colDef.field] = newValue;
      }
    }
  }

  // Edit utilities
  function applyAttributeToRows(key, value) {
    vm.rows.data.forEach(function (row) {
      handleCellEdit({ uuid : row.uuid }, { field : key }, value, row[key]);
      row[key] = value;
    });
  }

  function contains(array, value) {
    return array.indexOf(value) !== -1;
  }

  // @TODO(sfount)
  function invalidate(message) {
    vm.validation.errored = true;
    vm.validation.message = message;
  }

  // takes a transaction row and returns all parameters that are shared among the transaction
  // @TODO(sfount) rewrite method given current transaction service code
  function sharedDetails(row) {
    var columns = [
      'hrRecord', 'record_uuid', 'project_name', 'trans_id', 'origin_id', 'display_name', 'trans_date',
      'project_id', 'fiscal_year_id', 'currency_id', 'user_id', 'posted', 'period_id', 'description',
    ];

    var shared = {};

    columns.forEach(function (column) {
      shared[column] = row[column];
    });

    return shared;
  }
}
