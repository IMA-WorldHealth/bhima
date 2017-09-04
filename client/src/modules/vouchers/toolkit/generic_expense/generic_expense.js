angular.module('bhima.controllers')
  .controller('GenericExpenseKitController', GenericExpenseKitController);

GenericExpenseKitController.$inject = [
  '$uibModalInstance', 'NotifyService', 'CashboxService', 'bhConstants', 'VoucherToolkitService',
];

// Import transaction rows for a convention payment
function GenericExpenseKitController(Instance, Notify, Cashbox, bhConstants, ToolKits) {
  var vm = this;

  // expose to the view
  vm.close = Instance.close;
  vm.import = submit;

  vm.onSelectAccountCallback = onSelectAccountCallback;

  Cashbox.read(null, { detailed : 1 })
    .then(function (data) {
      vm.cashboxes = data;
    })
    .catch(Notify.handleError);

  // generate transaction rows
  function generateTransactionRows(params) {
    var rows = [];

    var debitRow = ToolKits.getBlankVoucherRow();
    var creditRow = ToolKits.getBlankVoucherRow();

    var cashboxAccountId = params.cashbox.account_id;
    var selectedAccountId = params.account.id;

    // debit the selected account
    debitRow.account_id = selectedAccountId;
    debitRow.debit = vm.amount;
    debitRow.credit = 0;
    rows.push(debitRow);

    // credit the cash box
    creditRow.account_id = cashboxAccountId;
    creditRow.debit = 0;
    creditRow.credit = vm.amount;
    rows.push(creditRow);

    return rows;
  }

  function onSelectAccountCallback(account) {
    vm.account = account;
  }

  // submission
  function submit(form) {
    if (form.$invalid) { return; }

    var bundle = generateTransactionRows({
      cashbox : vm.cashbox,
      account : vm.account,
    });

    Instance.close({
      rows        : bundle,
      description : vm.description,
      type_id     : bhConstants.transactionType.GENERIC_EXPENSE,
      currency_id : vm.cashbox.currency_id,
    });
  }
}
