angular.module('bhima.controllers')
.controller('ConventionPaymentKitController', ConventionPaymentKitController);

// DI definition
ConventionPaymentKitController.$inject = [
  '$uibModalInstance', 'DebtorGroupService', 'NotifyService',
  'CashboxService', 'SessionService', 'data',
  'AccountStoreService', 'DebtorService', 'PatientInvoiceService'
];

// Import transaction rows for a convention payment
function ConventionPaymentKitController(Instance, DebtorGroup, Notify, Cashbox, Session, Data, AccountStore, Debtors, Invoices) {
  var vm = this;

  // global variables
  vm.enterprise = Session.enterprise;
  vm.gridOptions = {};
  vm.tool = Data;

  // expose to the view
  vm.selectGroupInvoices = selectGroupInvoices;
  vm.close = Instance.close;
  vm.import = submit;

  // accounts from store
  AccountStore.accounts().then(function (data) {
    vm.accounts = data;
  });

  // debtors from store
  // FIXME: need auto refresh
   Debtors.store.then(function (data) {
     vm.debtors = data;
   });

  //  optimization with `Store` will be well
   Invoices.read()
   .then(function (data) {
     vm.invoices = data;
   });

  // load debtors
  Debtors.read()
  .then(function (list) {
    vm.debtorList = list;
  })
  .catch(Notify.handleError);

  // load conventions
  DebtorGroup.read(null, { is_convention: 1})
  .then(function (list) {
    vm.conventionGroupList = list;
  })
  .catch(Notify.handleError);

  // load cashboxes
  Cashbox.read(null, { detailed: 1, is_auxiliary: 0})
  .then(function (list) {
    vm.cashboxList = list;
  })
  .catch(Notify.handleError);

  // get debtor group invoices
  function selectGroupInvoices(convention) {
    DebtorGroup.invoices(convention.uuid, { is_convention: 1})
    .then(function (list) {
      // invoices
      vm.gridOptions.data = list || [];

      // total amount
      vm.totalInvoices = vm.gridOptions.data.reduce(function (current, previous) {
        return current + previous.balance;
      }, 0);
    })
    .catch(Notify.handleError);
  }

  // generate transaction rows
  function generateTransactionRows(result) {
    vm.rows = [];

    var cashboxAccount = vm.accounts.get(result.cashbox.account_id);
    var conventionAccount = vm.accounts.get(result.convention.account_id);
    var entityAccount;
    var invoiceReference;
    var index;

    // cashbox row
    vm.rows.push(generateRow());
    vm.rows[0].account = cashboxAccount;
    vm.rows[0].debit = vm.totalSelected;
    vm.rows[0].credit = 0;

    // cashbox and invoices rows
    for (var i = 0; i < result.invoices.length; i++) {
      entityAccount = formatEntity(result.invoices[i].entity_uuid);
      invoiceReference = getInvoiceReference(result.invoices[i].uuid);

      index = i + 1;
      vm.rows.push(generateRow());
      vm.rows[index].account = conventionAccount;
      vm.rows[index].debit = 0;
      vm.rows[index].credit = result.invoices[i].balance;
      vm.rows[index].entity = entityAccount;
      vm.rows[index].reference = invoiceReference;
    }

    return vm.rows;
  }

  // foramt entity
  function formatEntity(uuid) {
    var entity = vm.debtors.get(uuid);
    return {
      label: entity.text,
      type: 'D',
      uuid: entity.uuid
    };
  }

  // get invoice reference
  function getInvoiceReference(uuid) {
    return vm.invoices.filter(function (item) {
      item.document_type = 'VOUCHERS.COMPLEX.PATIENT_INVOICE';
      return item.uuid === uuid;
    })[0];
  }

  // FIXME: duplicated function
  // generate row element
  function generateRow() {
    var index = vm.rows.length || 0;
    return {
      index         : index,
      account_id    : undefined,
      debit         : 0,
      credit        : 0,
      document_uuid : undefined,
      entity_uuid   : undefined
    };
  }

  /* ================ Invoice grid parameters ===================== */
  vm.gridOptions.enableFiltering = true;
  vm.gridOptions.onRegisterApi   = onRegisterApi;

  vm.gridOptions.columnDefs = [
    { field : 'reference', displayName : 'TABLE.COLUMNS.REFERENCE', headerCellFilter: 'translate' },
    { field : 'date', cellFilter:'date', displayName : 'TABLE.COLUMNS.BILLING_DATE', headerCellFilter : 'translate', enableFiltering: false },
    { field : 'balance', displayName : 'TABLE.COLUMNS.COST', headerCellFilter : 'translate', enableFiltering: false }
  ];

  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
    vm.gridApi.selection.on.rowSelectionChanged(null, rowSelectionCallback);
    vm.gridApi.selection.on.rowSelectionChangedBatch(null, rowSelectionCallback);
  }

  function rowSelectionCallback(row) {
    vm.selectedRows = vm.gridApi.selection.getSelectedRows();
    vm.totalSelected = vm.selectedRows.reduce(function (current, previous) {
      return current + previous.balance;
    }, 0);
  }
  /* ================ End Invoice grid parameters ===================== */

  // submission
  function submit() {
    var bundle = generateTransactionRows({
      cashbox: vm.cashbox,
      convention: vm.convention,
      invoices: vm.selectedRows
    });
    Instance.close({ rows: bundle, convention: vm.convention });
  }
}
