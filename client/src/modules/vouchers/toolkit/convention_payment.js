angular.module('bhima.controllers')
.controller('ConventionPaymentKitController', ConventionPaymentKitController);

// DI definition
ConventionPaymentKitController.$inject = [
  '$uibModalInstance', 'DebtorGroupService', 'NotifyService',
  'CashboxService', 'SessionService', 'data', 'bhConstants',
  'AccountStoreService', 'DebtorService', 'PatientInvoiceService'
];

// Import transaction rows for a convention payment
function ConventionPaymentKitController(Instance, DebtorGroup, Notify, Cashbox, Session, Data, bhConstants, AccountStore, Debtors, Invoices) {
  var vm = this;

  // global variables
  vm.enterprise = Session.enterprise;
  vm.gridOptions = {};
  vm.tool = Data;

  var MAX_DECIMAL_PRECISION = bhConstants = bhConstants.precision.MAX_DECIMAL_PRECISION;

  // expose to the view
  vm.selectGroupInvoices = selectGroupInvoices;
  vm.close = Instance.close;
  vm.import = submit;

  // accounts from store
  AccountStore.accounts()
    .then(function (data) {
      vm.accounts = data;
    })
    .catch(Notify.handleError);

  // debtors from store
  Debtors.store()
    .then(function (data) {
      vm.debtors = data;
    })
    .catch(Notify.handleError);

  //  optimization with `Store` will be well
  Invoices.read()
  .then(function (data) {
    vm.invoices = data;
  })
  .catch(Notify.handleError);

  // load debtors
  Debtors.read()
    .then(function (list) {
      vm.debtorList = list;
    })
    .catch(Notify.handleError);

  // load conventions
  DebtorGroup.read()
    .then(function (list) {
      vm.conventionGroupList = list;
    })
    .catch(Notify.handleError);

  // load cashboxes
  Cashbox.read(null, { detailed: 1 })
    .then(function (cashboxes) {
      vm.cashboxList = cashboxes;
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

        // make sure we are always within precision
        vm.totalInvoices = Number.parseFloat(vm.totalInvoices.toFixed(MAX_DECIMAL_PRECISION));
      })
      .catch(Notify.handleError);
  }

  // generate transaction rows
  function generateTransactionRows(result) {
    var rows = [];

    var cashboxAccountId = result.cashbox.account_id;
    var conventionAccountId = result.convention.account_id;
    var invoices = result.invoices;

    // first, generate a cashbox row
    var cashboxRow = generateRow();
    cashboxRow.account_id = cashboxAccountId;
    cashboxRow.debit = vm.totalSelected;
    cashboxRow.credit = 0;
    rows.push(cashboxRow);

    // then loop through each selected item and credit it with the convention account
    invoices.forEach(function (invoice) {
      var row = generateRow();

      row.account_id = conventionAccountId;
      row.reference_uuid = invoice.uuid;
      row.entity_uuid = invoice.entity_uuid;
      row.credit = invoice.balance;

      // this is needed for a nice display in the grid
      row.entity = formatEntity(invoice.entity_uuid);

      // this is need to display references in the grid nicely
      row.reference = getInvoiceReference(invoice.uuid);

      // add the row in to the
      rows.push(row);
    });

    return rows;
  }

  // format entity
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
    var invoice = vm.invoices.filter(function (item) {
      return item.uuid === uuid;
    })[0];

    if (invoice) {
      invoice.document_type = 'VOUCHERS.COMPLEX.PATIENT_INVOICE';
    }

    return invoice;
  }

  // generate row element
  function generateRow() {
    return {
      account_id    : undefined,
      debit         : 0,
      credit        : 0,
      reference_uuid : undefined,
      entity_uuid   : undefined
    };
  }

  /* ================ Invoice grid parameters ===================== */
  vm.gridOptions.appScopeProvider = vm;
  vm.gridOptions.enableFiltering  = true;
  vm.gridOptions.onRegisterApi    = onRegisterApi;
  vm.gridOptions.fastWatch = true;
  vm.gridOptions.flatEntityAccess = true;

  vm.gridOptions.columnDefs = [
    { field : 'reference', displayName : 'TABLE.COLUMNS.REFERENCE', headerCellFilter: 'translate' },
    { field : 'date', cellFilter:'date', displayName : 'TABLE.COLUMNS.BILLING_DATE', headerCellFilter : 'translate', enableFiltering: false },
    { field : 'balance', displayName : 'TABLE.COLUMNS.COST',
      headerCellFilter : 'translate', enableFiltering: false,
      cellTemplate: '/modules/templates/grid/balance.cell.html'
    }
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

    vm.totalSelected = Number.parseFloat(vm.totalSelected.toFixed(MAX_DECIMAL_PRECISION));
  }

  /* ================ End Invoice grid parameters ===================== */

  // submission
  function submit(form) {
    if (form.$invalid) { return; }

    var bundle = generateTransactionRows({
      cashbox: vm.cashbox,
      convention: vm.convention,
      invoices: vm.selectedRows
    });

    Instance.close({ rows: bundle, convention: vm.convention });
  }
}
