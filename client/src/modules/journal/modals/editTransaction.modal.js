angular.module('bhima.controllers')
  .controller('JournalEditTransactionController', JournalEditTransactionController);

JournalEditTransactionController.$inject = ['JournalService', 'Store', 'TransactionTypeService', '$uibModalInstance', 'transactionUuid', 'readOnly', 'uiGridConstants', 'uuid'];

function JournalEditTransactionController(Journal, Store, TransactionType, Modal, transactionUuid, readOnly, uiGridConstants, uuid) { 
  var gridApi = {};
  var vm = this;
  
  // @TODO(sfount) column definitions currently duplicated across journal and here
  var editColumns = [ 
    { field              : 'description',
      displayName        : 'TABLE.COLUMNS.DESCRIPTION',
      headerCellFilter   : 'translate',
      footerCellTemplate : '<i></i>' },

    { field                : 'account_number',
      displayName          : 'TABLE.COLUMNS.ACCOUNT',
      editableCellTemplate : '<div><form name="inputForm"><div ui-grid-edit-account></div></form></div>',
      enableCellEdit       : true,
      cellTemplate         : '/modules/journal/templates/account.cell.html',
      headerCellFilter     : 'translate',
    }, {
      field                            : 'debit_equiv',
      displayName                      : 'TABLE.COLUMNS.DEBIT',
      headerCellFilter                 : 'translate',
      enableFiltering : true,
      aggregationHideLabel : true,
      aggregationType : uiGridConstants.aggregationTypes.sum
    },
    { field                            : 'credit_equiv',
      displayName                      : 'TABLE.COLUMNS.CREDIT',
      headerCellFilter                 : 'translate',
      enableFiltering : true,
      aggregationHideLabel : true,
      aggregationType : uiGridConstants.aggregationTypes.sum
    },
    { field                : 'hrEntity',
      displayName          : 'TABLE.COLUMNS.RECIPIENT',
      headerCellFilter     : 'translate',
      // editableCellTemplate : '/modules/journal/templates/entity.edit.html',
      visible              : true },
    { field            : 'hrReference',
      displayName      : 'TABLE.COLUMNS.REFERENCE',
      cellTemplate     : '/modules/journal/templates/references.link.html',
      headerCellFilter : 'translate',
      visible          : true
    }
  ];

  vm.gridOptions = { 
    columnDefs : editColumns, 
    showColumnFooter : true,
    // enableCellEditOnFocus : true
    showGridFooter : true,
    gridFooterTemplate : '<div class="ui-grid-cell-contents"><span translate>POSTING_JOURNAL.ROWS</span> <span>{{grid.rows.length}}</span></div>', 
    onRegisterApi : function (api) { 
      gridApi = api; 
      gridApi.edit.on.afterCellEdit(null, handleCellEdit);
    }
  };

  vm.validation = { 
    errored : false
  };

  vm.close = Modal.close;

  // @TODO(sfount) apply read only logic to save buttons and grid editing logic
  vm.readOnly = readOnly || false;
  
  // @TODO(sfount) move to component
  vm.dateEditorOpen = false;
  vm.openDateEditor = function () { vm.dateEditorOpen = !vm.dateEditorOpen; }
 
  console.log('here too');
  // module dependencies 
  TransactionType.read()
    .then(function (typeResults) { 
      vm.transactionTypes = typeResults;
    });

  TransactionType.read
  Journal.grid(transactionUuid)
    .then(function (transaction) { 
      vm.transactionDetails = transaction.aggregate[0];
      
      vm.rows = new Store({ identifier : 'uuid' });
      vm.rows.setData(transaction.journal);

      // @FIXME(sfount) date ng-model hack 
      vm.rows.data.forEach(function (row) { row.trans_date = new Date(row.trans_date); });

      vm.shared = sharedDetails(vm.rows.data[0]);

      vm.gridOptions.data = vm.rows.data;
      console.log('got info on transaction', transaction);
    })
    .catch(console.error);
  
  // takes a transaction row and returns all parameters that are shared among the transaction
  // @TODO(sfount) rewrite method given current transaction service code
  function sharedDetails(row) { 
    var columns = ['hrRecord', 'record_uuid', 'project_name', 'trans_id', 'origin_id', 'display_name', 'trans_date', 'project_id', 'fiscal_year_id', 'currency_id', 'user_id', 'period_id'];
    var shared = {};
  
    columns.forEach(function (column) { 
      shared[column] = row[column];
    });
    return shared;
  }
  
  
  // Variables for tracking edits
  var removedRows = [];
  var addedRows = [];
  var changes = {};

  // at submission time, added rows are seperated and sent on their own
  // removed rows are sent from those that haven't been added 
  // edits are submitted with removed rows removed

  // Editing global transaction attributes 
  vm.handleTransactionTypeChange = function handleTransactionTypeChange(currentValue) { 
    applyAttributeToRows('origin_id', currentValue);
    
    console.log(vm.rows.data);
  };

  vm.handleTransactionDateChange = function handleTransactionDateChange(currentValue) { 
    applyAttributeToRows('trans_date', currentValue);

    console.log(vm.rows.data);
  };

  // Edit rows functions
  vm.addRow = function addRow() { 
    var row = { uuid : uuid(), debit_equiv : 0, credit_equiv : 0 };
    angular.extend(row, angular.copy(vm.shared));

    addedRows.push(row.uuid);
    vm.rows.post(row);
  };

  vm.saveTransaction = function saveTransaction() { 
    console.log('saving');
    console.log('shared info', vm.shared);
    console.log('added', addedRows);
    console.log('removed', removedRows);
    console.log('edits', changes);

    var noChanges = addedRows.length === 0 && removedRows.length === 0 && Object.keys(changes).length === 0;

    if (noChanges) { 
      Modal.close();
      return;
    }

    // reset error validation 
    vm.validation.errored = false;
    vm.validation.message = null;
    vm.saving = true;
  
    // building object to conform to legacy API 
    // @TODO(sfount) update journal service API for human readable interface
    var transactionRequest = { 
      uuid : vm.shared.record_uuid, 
      newRows : { data : filterRowsByUuid(vm.rows.data, addedRows) },
      removedRows : removedRows.map(function (uuid) { return { uuid : uuid }; })
    };

    Journal.saveChanges(transactionRequest, changes)
      .then(function (saveResult) { 
        console.log('got save result', saveResult);

        Modal.close();
      })
      .catch(function (error) { 
        // initial errors are handled internally by the modal
        console.log('server error', error);

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
    console.log('filter rows result', result);
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
        console.log(changes);
        console.log(colDef);
        changes[rowEntity.uuid][colDef.field] = newValue;
      }
    }

    console.log(addedRows);
    console.log(removedRows);
    console.log(changes);
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
}
