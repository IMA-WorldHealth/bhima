angular.module('bhima.controllers')
  .controller('SupportPatientKitController', SupportPatientKitController);

SupportPatientKitController.$inject = [
  '$uibModalInstance', 'NotifyService', 'SessionService', 'bhConstants', 'DebtorService', '$translate',
  'VoucherToolkitService',
];

// Import transaction rows for a Support Patient
function SupportPatientKitController(Instance, Notify, Session, bhConstants, Debtors, $translate, ToolKits) {
  var vm = this;

  var MAX_DECIMAL_PRECISION = bhConstants.precision.MAX_DECIMAL_PRECISION;

  vm.enterprise = Session.enterprise;

  vm.close = Instance.close;
  vm.import = submit;
  vm.loadInvoice = loadInvoice;
  vm.onSelectAccount = onSelectAccount;

  // helper aggregation function
  function aggregate(sum, row) {
    return sum + row.balance;
  }

  // get debtor group invoices
  function selectPatientInvoices(debtorUuid) {
    // load patient invoices
    vm.debtorUuid = debtorUuid;

    Debtors.invoices(debtorUuid, { balanced : 0 })
      .then(function (invoices) {
        // total amount
        var totals = invoices.reduce(aggregate, 0);

        vm.gridOptions.data = invoices || [];

        // make sure we are always within precision
        vm.totalInvoices = Number.parseFloat(totals.toFixed(MAX_DECIMAL_PRECISION));
      })
      .catch(Notify.handleError);
  }

  function loadInvoice(patient) {
    vm.patient = patient;
    selectPatientInvoices(patient.debtor_uuid);
  }

  function onSelectAccount(account) {
    vm.account_id = account.id;
  }

  // generate transaction rows
  function generateTransactionRows(result) {
    var rows = [];
    var supportAccountId = result.account_id;
    var supportedAccountId = result.patient.account_id;
    var invoices = result.invoices;
    var supportRow = ToolKits.getBlankVoucherRow();

    rows.typeId = bhConstants.transactionType.SUPPORT_INCOME;

    // first, generate a support row
    supportRow.account_id = supportAccountId;
    supportRow.debit = vm.totalSelected;
    supportRow.credit = 0;
    rows.push(supportRow);

    // then loop through each selected item and credit it with the Supported account
    invoices.forEach(function (invoice) {
      var row = ToolKits.getBlankVoucherRow();

      row.account_id = supportedAccountId;
      row.reference_uuid = invoice.uuid;
      row.entity_uuid = invoice.entity_uuid;
      row.credit = invoice.balance;

      // this is needed for a nice display in the grid
      row.entity = { label : result.patient.text, type: 'D', uuid : result.patient.debtor_uuid };

      // @FIXME(sfount) this was included in legacy format invoice code - it should either be derived from
      // the database or omitted
      invoice.document_type = 'VOUCHERS.COMPLEX.PATIENT_INVOICE';
      row.document = invoice;

      // add the row in to the
      rows.push(row);
    });

    return rows;
  }

  /* ================ Invoice grid parameters ===================== */

  vm.gridOptions = {
    appScopeProvider : vm,
    enableFiltering : true,
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
    cellFilter : 'date',
    displayName : 'TABLE.COLUMNS.BILLING_DATE',
    headerCellFilter : 'translate',
    enableFiltering : false,
  }, {
    field : 'balance',
    type : 'number',
    displayName : 'TABLE.COLUMNS.BALANCE',
    headerCellFilter : 'translate',
    enableFiltering : true,
    cellFilter : 'currency:'.concat(Session.enterprise.currency_id),
    cellClass : 'text-right',
  }];

  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
    vm.gridApi.selection.on.rowSelectionChanged(null, rowSelectionCallback);
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
    if (form.$invalid) { return; }

    var selected = vm.gridApi.selection.getSelectedRows();

    var bundle = generateTransactionRows({
      account_id : vm.account_id,
      patient    : vm.patient,
      invoices   : selected,
    });

    var invoiceRefs = selected.map(function (i) { return i.reference; }).join(', ');

    var msg = $translate.instant('VOUCHERS.GLOBAL.SUPPORT_PAYMENT_DESCRIPTION', {
      patientName : vm.patient.display_name,
      patientReference : vm.patient.reference,
      invoiceReferences : invoiceRefs,
    });

    Instance.close({
      rows    : bundle,
      patient : vm.patient,
      description : msg,
      type_id : bhConstants.transactionType.SUPPORT_INCOME,
    });
  }
}
