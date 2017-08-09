angular.module('bhima.controllers')
  .controller('JournalEditTransactionController', JournalEditTransactionController);

JournalEditTransactionController.$inject = ['JournalService', 'Store', 'TransactionTypeService', '$uibModalInstance', 'transactionUuid', 'uiGridConstants', 'uuid'];

function JournalEditTransactionController(Journal, Store, TransactionType, Modal, transactionUuid, uiGridConstants, uuid) { 
  // try { 
  var gridApi = {};
  var vm = this;
  console.log('got here'); 
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

  vm.close = Modal.close;
  
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
    var columns = ['hrRecord', 'project_name', 'trans_id', 'origin_id', 'display_name', 'trans_date'];
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

  vm.removeRows = function removeRows() { 
    var selectedRows = gridApi.selection.getSelectedRows();

    selectedRows.forEach(function (row) { 
      removedRows.push(row.uuid);
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
      row[key] = value;
    });
  }

  function contains(array, value) {
    return array.indexOf(value) !== -1;
  }

  // } catch(e) { 
    // console.error(e);
  // }

}
