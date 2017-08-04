angular.module('bhima.controllers')
  .controller('JournalEditTransactionController', JournalEditTransactionController);

JournalEditTransactionController.$inject = ['JournalService', '$uibModalInstance', 'transactionUuid'];

function JournalEditTransactionController(Journal, Modal, transactionUuid) { 
  try { 
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
      footerCellFilter : 'currency:grid.appScope.enterprise.currency_id'
    },
    { field                            : 'credit_equiv',
      displayName                      : 'TABLE.COLUMNS.CREDIT',
      headerCellFilter                 : 'translate',
      enableFiltering : true,
      footerCellFilter : 'currency:grid.appScope.enterprise.currency_id'
    },
    { field                : 'hrEntity',
      displayName          : 'TABLE.COLUMNS.RECIPIENT',
      headerCellFilter     : 'translate',
      editableCellTemplate : '/modules/journal/templates/entity.edit.html',
      visible              : true },
    { field            : 'hrReference',
      displayName      : 'TABLE.COLUMNS.REFERENCE',
      cellTemplate     : '/modules/journal/templates/references.link.html',
      headerCellFilter : 'translate',
      visible          : true
    }
  ];

  vm.gridOptions = { 
    columnDefs : editColumns
  };

  vm.close = Modal.close;
  
  // @TODO(sfount) move to component
  vm.dateEditorOpen = false;
  vm.openDateEditor = function () { vm.dateEditorOpen = !vm.dateEditorOpen; }

  Journal.grid(transactionUuid)
    .then(function (transaction) { 
      vm.transactionDetails = transaction.aggregate[0];
      vm.rows = transaction.journal;

      // @FIXME(sfount) date ng-model hack 
      vm.rows.forEach(function (row) { row.trans_date = new Date(row.trans_date); });

      vm.shared = sharedDetails(vm.rows[0]);

      vm.gridOptions.data = vm.rows;
      console.log('got info on transaction', transaction);
    });
  
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
  
  } catch(e) { 
    console.error(e);
  }
}
