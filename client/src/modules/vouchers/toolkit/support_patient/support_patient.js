angular.module('bhima.controllers')
  .controller('SupportPatientKitController', SupportPatientKitController);

// DI definition
SupportPatientKitController.$inject = [
  '$uibModalInstance', 'NotifyService', 'SessionService', 'data', 'bhConstants',
  'DebtorService'
];

// Import transaction rows for a Support Patient
function SupportPatientKitController(Instance, Notify, Session, Data, bhConstants, Debtors) {
  var vm = this;

  var MAX_DECIMAL_PRECISION = bhConstants.precision.MAX_DECIMAL_PRECISION;

  // global variables
  vm.enterprise = Session.enterprise;
  vm.gridOptions = {};
  vm.tool = Data;
  vm.patientInvoice = false;

  // expose to the view
  vm.selectPatientInvoices = selectPatientInvoices;
  vm.close = Instance.close;
  vm.import = submit;
  vm.loadInvoice = loadInvoice;
  vm.onSelectAccount = onSelectAccount;
  
  // get debtor group invoices
  function selectPatientInvoices(debtorId) {
    // load patient invoices
    vm.debtorUuid = debtorId;

    Debtors.invoices(debtorId, { balanced: 0 })
      .then(function (invoices) {

        vm.gridOptions.data = invoices || [];

        // total amount
        vm.totalInvoices = vm.gridOptions.data.reduce(function (current, previous) {
          return current + previous.balance;
        }, 0);

        // make sure we are always within precision
        vm.totalInvoices = Number.parseFloat(vm.totalInvoices.toFixed(MAX_DECIMAL_PRECISION));
        
        vm.invoices = data;
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
    rows.typeId = bhConstants.transactionType.SUPPORT_INCOME;

    // first, generate a support row
    var supportRow = generateRow();
    supportRow.account_id = supportAccountId;
    supportRow.debit = vm.totalSelected;
    supportRow.credit = 0;
    rows.push(supportRow);

    // then loop through each selected item and credit it with the Supported account
    invoices.forEach(function (invoice) {
      var row = generateRow();

      row.account_id = supportedAccountId;
      row.reference_uuid = invoice.uuid;
      row.entity_uuid = invoice.entity_uuid;
      row.credit = invoice.balance;

      // this is needed for a nice display in the grid
      row.entity = formatEntity(result.patient);

      // @FIXME(sfount) this was included in legacy format invoice code - it should either be derived from 
      // the database or ommitted
      invoice.document_type = 'VOUCHERS.COMPLEX.PATIENT_INVOICE';
      row.document = invoice;

      // add the row in to the
      rows.push(row);
    });

    return rows;
  }

  // format entity
  function formatEntity(patient) {
    return {
      label : patient.text,
      type  : 'D',
      uuid  : patient.debtor_uuid,
    };
  }

  // generate row element
  function generateRow() {
    return {
      account_id     : undefined,
      debit          : 0,
      credit         : 0,
      reference_uuid : undefined,
      entity_uuid    : undefined,
    };
  }

  /* ================ Invoice grid parameters ===================== */
  vm.gridOptions.appScopeProvider = vm;
  vm.gridOptions.enableFiltering = true;
  vm.gridOptions.onRegisterApi = onRegisterApi;
  vm.gridOptions.fastWatch = true;
  vm.gridOptions.flatEntityAccess = true;

  vm.gridOptions.columnDefs = [
    { field: 'reference', displayName: 'TABLE.COLUMNS.REFERENCE', headerCellFilter: 'translate' },
    { field: 'date', cellFilter: 'date', displayName: 'TABLE.COLUMNS.BILLING_DATE', headerCellFilter: 'translate', enableFiltering: false },
    { field            : 'balance',
      displayName      : 'TABLE.COLUMNS.BALANCE',
      headerCellFilter : 'translate',
      cellClass : 'text-right',
      enableFiltering  : false,
      cellTemplate     : '/modules/templates/grid/balance.cell.html',
    },
  ];

  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
    vm.gridApi.selection.on.rowSelectionChanged(null, rowSelectionCallback);
    vm.gridApi.selection.on.rowSelectionChangedBatch(null, rowSelectionCallback);
  }

  function rowSelectionCallback() {
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
      account_id : vm.account_id,
      patient    : vm.patient,
      invoices   : vm.selectedRows,
    });

    Instance.close({
      rows    : bundle,
      patient : vm.patient,
      type_id : bhConstants.transactionType.SUPPORT_INCOME, // Patient Support ID
    });
  }
}
