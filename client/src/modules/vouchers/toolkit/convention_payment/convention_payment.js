angular.module('bhima.controllers')
  .controller('ConventionPaymentKitController', ConventionPaymentKitController);

ConventionPaymentKitController.$inject = [
  '$uibModalInstance', 'DebtorGroupService', 'NotifyService', 'CashboxService',
  'SessionService', 'bhConstants', '$translate', 'VoucherToolkitService',
];

// Import transaction rows for a convention payment
function ConventionPaymentKitController(
  Instance, DebtorGroup, Notify, Cashboxes,
  Session, bhConstants, $translate, ToolKits) {
  var vm = this;

  var MAX_DECIMAL_PRECISION = bhConstants.precision.MAX_DECIMAL_PRECISION;

  // global variables
  vm.debtorGroupFilter = { is_convention : 1 };
  vm.gridOptions = {};
  vm.enterprise = Session.enterprise;

  // expose to the view
  vm.selectGroupInvoices = selectGroupInvoices;
  vm.close = Instance.close;
  vm.import = submit;

  // Set up page elements data (debtor select data)
  vm.onSelectDebtor = onSelectDebtor;

  function onSelectDebtor(debtorGroup) {
    vm.convention = debtorGroup;
    selectGroupInvoices(vm.convention);
  }

  // load cashboxes
  Cashboxes.read(null, { detailed : 1 })
    .then(function (cashboxes) {
      vm.cashboxList = cashboxes;
    })
    .catch(Notify.handleError);

  // get debtor group invoices
  function selectGroupInvoices(convention) {
    vm.loading = true;
    DebtorGroup.invoices(convention.uuid, { is_convention : 1 })
      .then(function (invoices) {
        // total amount
        var total = invoices.reduce(aggregate, 0);

        // invoices
        vm.gridOptions.data = invoices || [];

        // make sure we are always within precision
        vm.totalInvoices = Number.parseFloat(total.toFixed(MAX_DECIMAL_PRECISION));
      })
      .catch(function (err) {
        vm.hasError = true;
        Notify.handleError(err);
      })
      .finally(function () {
        vm.loading = false;
      });
  }

  // generate transaction rows
  function generateTransactionRows(result) {
    var rows = [];

    var cashboxAccountId = result.cashbox.account_id;
    var conventionAccountId = result.convention.account_id;
    var invoices = result.invoices;

    // first, generate a cashbox row
    var cashboxRow = ToolKits.getBlankVoucherRow();
    cashboxRow.account_id = cashboxAccountId;
    cashboxRow.debit = vm.totalSelected;
    cashboxRow.credit = 0;
    rows.push(cashboxRow);


    // then loop through each selected item and credit it with the convention account
    invoices.forEach(function (invoice) {
      var row = ToolKits.getBlankVoucherRow();

      row.account_id = conventionAccountId;
      row.reference_uuid = invoice.uuid;
      row.entity_uuid = invoice.entity_uuid;
      row.credit = invoice.balance;

      // this is needed for a nice display in the grid
      row.entity = {
        label : invoice.entityReference,
        type : 'D',
        uuid : invoice.entity_uuid,
      };

      // this is need to display references in the grid nicely
      row.document = {
        uuid : invoice.uuid,
        reference : invoice.reference,
        document_type : 'VOUCHERS.COMPLEX.PATIENT_INVOICE',
      };

      // add the row in to the
      rows.push(row);
    });

    return rows;
  }

  /* ================ Invoice grid parameters ===================== */
  vm.gridOptions = {
    enableFiltering : true,
    enableColumnMenus : false,
    fastWatch : true,
    flatEntityAccess : true,
    enableSelectionBatchEvent : false,
    onRegisterApi : onRegisterApi,
  };

  vm.gridOptions.columnDefs = [{
    field : 'reference',
    displayName : 'TABLE.COLUMNS.REFERENCE',
    headerCellFilter : 'translate',
  }, {
    field : 'date',
    type : 'date',
    cellFilter : 'date',
    displayName : 'TABLE.COLUMNS.BILLING_DATE',
    headerCellFilter : 'translate',
    enableFiltering : false,
  }, {
    field : 'balance',
    type : 'number',
    displayName : 'TABLE.COLUMNS.COST',
    headerCellFilter : 'translate',
    enableFiltering : true,
    cellFilter : 'currency:'.concat(Session.enterprise.currency_id),
    cellClass : 'text-right',
  }];

  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
    vm.gridApi.selection.on.rowSelectionChanged(null, rowSelectionCallback);
  }

  // helper function for the rowSelectionCallback()
  function aggregate(sum, row) {
    return sum + row.balance;
  }

  // called whenever the selection changes in the ui-grid
  function rowSelectionCallback() {
    var selected = vm.gridApi.selection.getSelectedRows();
    var aggregation = selected.reduce(aggregate, 0);

    vm.hasSelectedRows = selected.length > 0;
    vm.totalSelected = Number.parseFloat(aggregation.toFixed(MAX_DECIMAL_PRECISION));
  }

  /* ================ End Invoice grid parameters ===================== */

  // submission
  function submit(form) {
    var selected;
    var bundle;

    if (form.$invalid) { return; }

    selected = vm.gridApi.selection.getSelectedRows();

    bundle = generateTransactionRows({
      cashbox    : vm.cashbox,
      convention : vm.convention,
      invoices   : selected,
    });

    Instance.close({
      rows       : bundle,
      convention : vm.convention,
      type_id    : bhConstants.transactionType.CONVENTION_PAYMENT,
      description : $translate.instant('VOUCHERS.GLOBAL.CONVENTION_PAYMENT_DESCRIPTION', {
        numInvoices : selected.length,
        debtorGroupName : vm.convention.name,
      }),
    });
  }
}
