angular.module('bhima.controllers')
  .controller('JournalEditTransactionController', JournalEditTransactionController);

JournalEditTransactionController.$inject = [
  'JournalService', 'Store', 'TransactionService', 'TransactionTypeService', '$uibModalInstance',
  'transactionUuid', 'readOnly', 'uiGridConstants', 'uuid', 'util', 'moment',
  'ModalService', 'CurrencyService', 'ExchangeRateService', 'SessionService',
];

function JournalEditTransactionController(
  Journal, Store, TransactionService, TransactionType, Modal, transactionUuid, readOnly, uiGridConstants,
  uuid, util, moment, ModalService, CurrencyService, ExchangeRateService, SessionService
) {
  const vm = this;
  let gridApi = {};

  // Variables for tracking edits
  const removedRows = [];
  const addedRows = [];
  const changes = {};

  // must have transaction_type for certain cases
  const ERROR_MISSING_TRANSACTION_TYPE = 'TRANSACTIONS.MISSING_TRANSACTION_TYPE';
  const ERROR_IMBALANCED_TRANSACTION = 'TRANSACTIONS.IMBALANCED_TRANSACTION';
  const ERROR_SINGLE_ACCOUNT_TRANSACTION = 'TRANSACTIONS.SINGLE_ACCOUNT_TRANSACTION';
  const ERROR_SINGLE_ROW_TRANSACTION = 'TRANSACTIONS.SINGLE_ROW_TRANSACTION';
  const ERROR_INVALID_DEBITS_AND_CREDITS = 'VOUCHERS.COMPLEX.ERROR_AMOUNT';
  const ERROR_NEGATIVE_NUMBERS = 'VOUCHERS.COMPLEX.ERROR_NEGATIVE_NUMBERS';

  const footerTemplate = `
    <div class="ui-grid-cell-contents">
      <span translate>POSTING_JOURNAL.ROWS</span> <span>{{grid.rows.length}}</span> |
      <span translate>POSTING_JOURNAL.TRANSACTION_CURRENCY</span>
      <b>{{grid.appScope.transactionCurrencySymbol()}}</b> |
      <bh-exchange-rate></bh-exchange-rate>
    </div>`;

  // @FIXME(sfount) this is only exposed for the UI grid link component - this should be self contained in the future
  vm.loadingTransaction = false;
  vm.setupComplete = false;
  vm.shared = {};
  vm.enterprise = SessionService.enterprise;

  // @TODO(sfount) apply read only logic to save buttons and grid editing logic
  vm.readOnly = readOnly || false;

  vm.validation = {
    errored : false,
    blockedPostedTransactionEdit : false,
  };

  // @TODO(sfount) column definitions currently duplicated across journal and here
  const editColumns = [{
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
    field                : 'debit',
    displayName          : 'TABLE.COLUMNS.DEBIT',
    cellClass            : 'text-right',
    footerCellClass      : 'text-right',
    headerCellFilter     : 'translate',
    type : 'number',
    aggregationHideLabel : true,
    enableCellEdit : !vm.readOnly,
    allowCellFocus : !vm.readOnly,
    aggregationType : uiGridConstants.aggregationTypes.sum,
  }, {
    field            : 'credit',
    displayName      : 'TABLE.COLUMNS.CREDIT',
    cellClass        : 'text-right',
    footerCellClass  : 'text-right',
    headerCellFilter : 'translate',
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
    cellTemplate : `
      <div class="ui-grid-cell-contents">
        <bh-reference-link ng-if="row.entity.hrEntity" reference="row.entity.hrEntity" />
      </div>`,
    enableCellEdit : !vm.readOnly,
    allowCellFocus : !vm.readOnly,
    visible              : true,
  }, {
    field            : 'hrReference',
    displayName      : 'TABLE.COLUMNS.REFERENCE',
    cellTemplate : `
      <div class="ui-grid-cell-contents">
        <bh-reference-link ng-if="row.entity.hrReference" reference="row.entity.hrReference" />
      </div>`,
    headerCellFilter : 'translate',
    enableCellEdit : !vm.readOnly,
    allowCellFocus : !vm.readOnly,
    visible          : true,
  }];

  vm.gridOptions = {
    columnDefs : editColumns,
    enableColumnMenus : false,
    enableSorting : false,
    showColumnFooter : true,
    showGridFooter : true,
    appScopeProvider : vm,
    gridFooterTemplate : footerTemplate,
    onRegisterApi,
  };

  function onRegisterApi(api) {
    gridApi = api;
    gridApi.edit.on.afterCellEdit(null, handleCellEdit);
  }

  vm.transactionCurrencySymbol = () => {
    if (!vm.shared.currency_id) { return ''; }
    return CurrencyService.symbol(vm.shared.currency_id);
  };

  vm.currentExchangeRate = () => {
    if (!vm.enterprise.currency_id) { return ''; }
    return ExchangeRateService.getCurrentRate(vm.enterprise.currency_id);
  };

  vm.close = Modal.dismiss;

  // @TODO(sfount) move to component vm.dateEditorOpen = false;
  vm.openDateEditor = () => { vm.dateEditorOpen = !vm.dateEditorOpen; };

  // module dependencies
  TransactionType.read()
    .then((typeResults) => {
      vm.transactionTypes = new Store({ identifier : 'id' });
      vm.transactionTypes.setData(typeResults);
    });

  // this is completely optional - it is just for decoration and interest.
  Journal.getTransactionEditHistory(transactionUuid)
    .then((editHistory) => {
      const hasPreviousEdits = editHistory.length > 0;
      let mostRecentEdit;
      vm.hasPreviousEdits = hasPreviousEdits;

      if (hasPreviousEdits) {
        mostRecentEdit = editHistory.pop();

        vm.lastEditValues = {
          user : mostRecentEdit.display_name,
          date : moment(mostRecentEdit.timestamp).format('DD/MM/YYYY'),
        };
      }
    });


  vm.loadingTransaction = true;
  Journal.grid(transactionUuid)
    .then((transaction) => {
      vm.setupComplete = true;

      verifyEditableTransaction(transaction);

      vm.rows = new Store({ identifier : 'uuid' });
      vm.rows.setData(transaction);

      // @FIXME(sfount) date ng-model hack
      vm.rows.data.forEach((row) => { row.trans_date = new Date(row.trans_date); });
      vm.shared = sharedDetails(vm.rows.data[0]);
      vm.gridOptions.data = vm.rows.data;

      console.log('parsed shared details', vm.shared);
    })
    .catch(() => {
      vm.hasError = true;
    })
    .finally(() => {
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
    const hasSingleLine = rows.length < 2;
    if (hasSingleLine) {
      return ERROR_SINGLE_ROW_TRANSACTION;
    }

    let debits = 0;
    let credits = 0;

    let i = rows.length;
    let row;

    while (i--) {
      row = rows[i];

      const hasTransactionType = typeof row.transaction_type_id === 'number';
      if (!hasTransactionType) {
        return ERROR_MISSING_TRANSACTION_TYPE;
      }

      const hasNegativeNumbers = (row.debit < 0 || row.credit < 0);
      if (hasNegativeNumbers) {
        return ERROR_NEGATIVE_NUMBERS;
      }

      const hasSingleNumericValue = !util.xor(Boolean(row.debit), Boolean(row.credit));
      if (hasSingleNumericValue) {
        return ERROR_INVALID_DEBITS_AND_CREDITS;
      }

      credits += row.credit;
      debits += row.debit;
    }

    const uniqueAccountsArray = rows
      .map((_row) => {
        return _row.account_id;
      })
      .filter((accountId, index, array) => {
        return array.indexOf(accountId) === index;
      });

    const hasSingleAccount = uniqueAccountsArray.length === 1;
    if (hasSingleAccount) {
      return ERROR_SINGLE_ACCOUNT_TRANSACTION;
    }

    const hasImbalancedTransaction = Number(debits.toFixed('2')) !== Number(credits.toFixed('2'));
    if (hasImbalancedTransaction) {
      return ERROR_IMBALANCED_TRANSACTION;
    }

    return false;
  }


  function verifyEditableTransaction(transaction) {
    const { posted } = transaction[0];

    if (posted) {
      vm.validation.blockedPostedTransactionEdit = true;
      vm.readOnly = true;

      // notify the grid of options change - the grid should no longer be editable
      vm.gridOptions.columnDefs.forEach((column) => {
        column.allowCellFocus = !vm.readOnly;
        column.enableCellEdit = !vm.readOnly;
      });
      gridApi.core.notifyDataChange(uiGridConstants.dataChange.ALL);
    }
  }

  // Editing global transaction attributes
  vm.handleTransactionTypeChange = function handleTransactionTypeChange(currentValue) {
    applyAttributeToRows('transaction_type_id', currentValue);
  };

  vm.handleTransactionDateChange = function handleTransactionDateChange(currentValue) {
    applyAttributeToRows('trans_date', currentValue);
  };

  // Edit rows functions
  vm.addRow = function addRow() {
    const row = { uuid : uuid(), debit : 0, credit : 0 };
    angular.extend(row, angular.copy(vm.shared));

    addedRows.push(row.uuid);
    vm.rows.post(row);
  };

  // helper function to pull out the uuid property on an array of objects
  function mapRowUuids(uid) {
    return { uuid : uid };
  }

  // this function removes the human readable references if they have changed.
  // it instead substitutes with NULL-ing the underlying columns
  function pruneHumanReadableReferences(row) {
    if (row.hrEntity === '') {
      row.entity_uuid = null;
      delete row.hrEntity;
    }

    if (row.hrReference === '') {
      row.reference_uuid = null;
      delete row.hrReference;
    }
  }

  vm.saveTransaction = () => {
    const noChanges = addedRows.length === 0 && removedRows.length === 0 && Object.keys(changes).length === 0;

    if (noChanges) {
      Modal.close({});
      return;
    }

    // run local validation before submission
    const offlineErrors = offlineTransactionValidation(vm.rows.data);
    if (offlineErrors) {
      vm.validation.errored = true;
      vm.validation.message = offlineErrors;
      return;
    }


    // building object to conform to legacy API
    // @FIXME(sfount) update journal service API for human readable interface
    const transactionRequest = {
      uuid : vm.shared.record_uuid,
      newRows : { data : filterRowsByUuid(vm.rows.data, addedRows) },
      removedRows : removedRows.map(mapRowUuids),
    };

    // reset error validation
    vm.validation.errored = false;
    vm.validation.message = null;
    vm.saving = true;

    const safeChanges = angular.copy(changes);

    // prune off the human readable references, submitting only raw data to the
    // server
    angular.forEach(safeChanges, pruneHumanReadableReferences);

    Journal.saveChanges(transactionRequest, safeChanges)
      .then((resultUpdatedTransaction) => {
        const transaction = new Store({ identifier : 'uuid' });

        transaction.setData(resultUpdatedTransaction);

        // collapse information for the module that might expect to apply optimistic updates
        const editSessionResult = {
          edited : Object.keys(changes),
          added : addedRows,
          removed : removedRows,
          updatedTransaction : transaction,
        };

        Modal.close(editSessionResult);
      })
      .catch((error) => {
        vm.validation.errored = true;
        vm.validation.message = error.data.code;
      })
      .finally(() => {
        vm.saving = false;
      });
  };

  vm.deleteTransaction = () => {
    ModalService.confirm()
      .then(ans => {
        if (!ans) { return; }

        TransactionService.remove(vm.shared.record_uuid)
          .then(() => {
            const deleteTransactionResult = {
              deleted : true,
              removed : getGridRowsUuid(),
            };

            Modal.close(deleteTransactionResult);
          });
      })
      .catch(angular.noop);
  };

  function getGridRowsUuid() {
    return vm.rows.data.map((row) => {
      return row.uuid;
    });
  }

  // rows - array of rows
  // uuids - array of uuids
  function filterRowsByUuid(rows, uuids) {
    return rows.filter(row => uuids.includes(row.uuid));
  }

  vm.removeRows = () => {
    const selectedRows = gridApi.selection.getSelectedRows();

    selectedRows.forEach((row) => {
      const isOriginalRow = !addedRows.includes(row.uuid);

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
    if (oldValue !== newValue) {
      const isOriginalRow = !addedRows.includes(rowEntity.uuid);

      if (isOriginalRow) {
        changes[rowEntity.uuid] = changes[rowEntity.uuid] || {};
        changes[rowEntity.uuid][colDef.field] = newValue;
      }
    }
  }

  // Edit utilities
  function applyAttributeToRows(key, value) {
    vm.rows.data.forEach((row) => {
      handleCellEdit({ uuid : row.uuid }, { field : key }, value, row[key]);
      row[key] = value;
    });
  }

  // takes a transaction row and returns all parameters that are shared among the transaction
  // @TODO(sfount) rewrite method given current transaction service code
  function sharedDetails(row) {
    const columns = [
      'hrRecord', 'record_uuid', 'project_name', 'trans_id', 'transaction_type_id', 'display_name', 'trans_date',
      'project_id', 'fiscal_year_id', 'currency_id', 'user_id', 'posted', 'period_id', 'description',
    ];

    const shared = {};

    columns.forEach((column) => {
      shared[column] = row[column];
    });

    return shared;
  }
}
