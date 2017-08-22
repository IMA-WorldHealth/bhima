angular.module('bhima.controllers')
  .controller('JournalEditTransactionController', JournalEditTransactionController);

JournalEditTransactionController.$inject = ['JournalService', 'LanguageService', 'Store', 'TransactionTypeService', '$uibModalInstance', 'transactionUuid', 'readOnly', 'uiGridConstants', 'uuid'];

function JournalEditTransactionController(Journal, Languages, Store, TransactionType, Modal, transactionUuid, readOnly, uiGridConstants, uuid) {
  var gridApi = {};
  var vm = this;

  // @FIXME(sfount) this is only exposed for the UI grid link component - this should be self contained in the future
  vm.languages = Languages;
  vm.loadingTransaction = false;
  vm.settupComplete = false;

  // @TODO(sfount) apply read only logic to save buttons and grid editing logic
  vm.readOnly = readOnly || false;

  vm.validation = {
    errored : false,
    blockedPostedTransactionEdit : false
  };

  // @TODO(sfount) column definitions currently duplicated across journal and here
  var editColumns = [
    { field              : 'description',
      displayName        : 'TABLE.COLUMNS.DESCRIPTION',
      headerCellFilter   : 'translate',
      allowCellFocus : !vm.readOnly,
      enableCellEdit : !vm.readOnly
    },

    { field                : 'account_number',
      displayName          : 'TABLE.COLUMNS.ACCOUNT',
      editableCellTemplate : '<div><div ui-grid-edit-account></div></div>',
      cellTemplate         : '/modules/journal/templates/account.cell.html',
      enableCellEdit : !vm.readOnly,
      allowCellFocus : !vm.readOnly,
      headerCellFilter     : 'translate' },

    { field                            : 'debit_equiv',
      displayName                      : 'TABLE.COLUMNS.DEBIT',
      cellClass                        : 'text-right',
      headerCellFilter                 : 'translate',
      aggregationHideLabel : true,
      enableCellEdit : !vm.readOnly,
      allowCellFocus : !vm.readOnly,
      aggregationType : uiGridConstants.aggregationTypes.sum },

    { field                            : 'credit_equiv',
      displayName                      : 'TABLE.COLUMNS.CREDIT',
      cellClass                        : 'text-right',
      headerCellFilter                 : 'translate',
      enableFiltering : true,
      aggregationHideLabel : true,
      enableCellEdit : !vm.readOnly,
      allowCellFocus : !vm.readOnly,
      aggregationType : uiGridConstants.aggregationTypes.sum
    },
    { field                : 'hrEntity',
      displayName          : 'TABLE.COLUMNS.RECIPIENT',
      headerCellFilter     : 'translate',
      enableCellEdit : !vm.readOnly,
      allowCellFocus : !vm.readOnly,
      visible              : true },

    { field            : 'hrReference',
      displayName      : 'TABLE.COLUMNS.REFERENCE',
      cellTemplate     : '<div class="ui-grid-cell-contents"><bh-reference-link ng-if="row.entity.hrReference" reference="row.entity.hrReference" /></div>',
      headerCellFilter : 'translate',
      enableCellEdit : !vm.readOnly,
      allowCellFocus : !vm.readOnly,
      visible          : true }
  ];

  vm.gridOptions = {
    columnDefs : editColumns,
    showColumnFooter : true,
    showGridFooter : true,
    appScopeProvider : vm,
    gridFooterTemplate : '<div class="ui-grid-cell-contents"><span translate>POSTING_JOURNAL.ROWS</span> <span>{{grid.rows.length}}</span></div>',
    onRegisterApi : function (api) {
      gridApi = api;
      gridApi.edit.on.afterCellEdit(null, handleCellEdit);
    }
  };

  vm.close = Modal.dismiss;

  // @TODO(sfount) move to component vm.dateEditorOpen = false;
  vm.openDateEditor = function () { vm.dateEditorOpen = !vm.dateEditorOpen; }

  // module dependencies
  TransactionType.read()
    .then(function (typeResults) {
      vm.transactionTypes = new Store({ identifier : 'id' });
      vm.transactionTypes.setData(typeResults);
    });

  vm.loadingTransaction = true;
  Journal.grid(transactionUuid)
    .then(function (transaction) {
      vm.settupComplete = true;

      verifyEditableTransaction(transaction);

      vm.rows = new Store({ identifier : 'uuid' });
      vm.rows.setData(transaction);

      // @FIXME(sfount) date ng-model hack
      vm.rows.data.forEach(function (row) { row.trans_date = new Date(row.trans_date); });
      vm.shared = sharedDetails(vm.rows.data[0]);
      vm.gridOptions.data = vm.rows.data;
    })
    .catch(function (error) {
      console.error(error);
      vm.hasError = true;
    })
    .finally(function () {
      vm.loadingTransaction = false;
    });

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

  // Variables for tracking edits
  var removedRows = [];
  var addedRows = [];
  var changes = {};

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

  vm.saveTransaction = function saveTransaction() {
    var noChanges = addedRows.length === 0 && removedRows.length === 0 && Object.keys(changes).length === 0;

    if (noChanges) {
      Modal.close({});
      return;
    }

    // reset error validation
    vm.validation.errored = false;
    vm.validation.message = null;
    vm.saving = true;

    // building object to conform to legacy API
    // @FIXME(sfount) update journal service API for human readable interface
    var transactionRequest = {
      uuid : vm.shared.record_uuid,
      newRows : { data : filterRowsByUuid(vm.rows.data, addedRows) },
      removedRows : removedRows.map(function (uuid) { return { uuid : uuid }; })
    };

    Journal.saveChanges(transactionRequest, changes)
      .then(function (resultUpdatedTransaction) {
        var transaction = new Store({ identifier : 'uuid' });
        transaction.setData(resultUpdatedTransaction);

        // collapse information for the module that might expect to apply optimistic updates
        var editSessionResult = {
          edited : Object.keys(changes),
          added : addedRows,
          removed : removedRows,
          updatedTransaction : transaction
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

      vm.rows.remove(row.uuid)
    });
  }

  function handleCellEdit(rowEntity, colDef, newValue, oldValue) {
    if (oldValue !== newValue) {
      var isOriginalRow = !contains(addedRows, rowEntity.uuid);

      if (isOriginalRow) {
        changes[rowEntity.uuid] = changes[rowEntity.uuid] || {};
        changes[rowEntity.uuid][colDef.field] = newValue;
      }
    }
  }

  // Edit utilities
  function applyAttributeToRows(key, value) {
    vm.rows.data.forEach(function (row) {
      handleCellEdit({ uuid : row.uuid }, { field : key}, value, row[key]);
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
    var columns = ['hrRecord', 'record_uuid', 'project_name', 'trans_id', 'origin_id', 'display_name', 'trans_date', 'project_id', 'fiscal_year_id', 'currency_id', 'user_id', 'posted', 'period_id'];
    var shared = {};

    columns.forEach(function (column) {
      shared[column] = row[column];
    });
    return shared;
  }
}
