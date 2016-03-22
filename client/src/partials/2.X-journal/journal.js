angular.module('bhima.controllers')
.controller('JournalController', JournalController);

JournalController.$inject = ['TransactionService'];

/**
 * Posting Journal Controller 
 * 
 * This controller is responsible for initialising the core client side posting 
 * journal, binding the UI Grid component with services that facilitate all 
 * operations required by an accounted. 
 * - Displaying transactions in an easy to find and review format 
 *   - Search for transactions
 *   - Filter transactions
 *   - Group by transactions to show aggregates 
 *   - Sort transactions 
 *
 * - (Super user) Edit and update transactions
 * - Post one or more transactions to the general ledger to confirm they are complete
 *   - Tun trial balance validation on transactions 
 *
 * @todo Propose design for services plugging in and configuring aspects of the grid
 * @todo Develop a mock transaction service to provide example data to test with 
 * @todo Popoulate models/test/data.sql with test transactions data
 * @todo Propose utility bar view design 
 *
 * @module bhima/controllers/JournalController
 */
function JournalController(Transactions) { 
  var vm = this;
 
  // gridOptions is bound to the UI Grid and used to configure many of the
  // options, it is also used by the grid to expose the API
  vm.gridOptions = {};
  
  // bind the transactions service to populate the grid component
  vm.gridOptions.data = Transactions.list.data;
  
  vm.gridOptions.columnDefs = [
    { field : 'trans_date', displayName : 'Date' },
    { field : 'description', displayName : 'Description' },
    { field : 'account_number', displayName : 'Account' },
    { field : 'debit_equiv', displayName : 'Debit' },
    { field : 'credit_equiv', displayName : 'Credit' },
    { field : 'trans_id', displayName : 'Transaction' },

    // @todo this should be formatted as a currency icon vs. an ID
    { field : 'currency_id', displayName : 'Currency' },
    
    // @todo this should be formatted showing the debitor/credior
    { field : 'deb_cred_uuid', displayName : 'Recipient' }, 

    // @fixme inv_po_id -> reference
    { field : 'inv_po_id', displayName : 'Reference Document' },
    { field : 'user', displayName : 'Responsible' },
    { field : 'period_summary', displayName : 'Period' },
    // @fixme this field should not come from the database as 'cc'
    { field : 'cc', displayName : 'Cost Center' }
  ];
}
