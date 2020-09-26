angular.module('bhima.controllers')
  .controller('PaymentEmployeeKitController', PaymentEmployeeKitController);

PaymentEmployeeKitController.$inject = [
  '$uibModalInstance', 'NotifyService', 'SessionService', 'bhConstants', '$translate',
  'VoucherToolkitService', 'MultiplePayrollService', 'moment',
];

// Import transaction rows for a Payment Employee
function PaymentEmployeeKitController(
  Instance, Notify, Session, bhConstants, $translate, ToolKits,
  MultiplePayroll, moment,
) {
  const vm = this;

  const { MAX_DECIMAL_PRECISION } = bhConstants.precision;
  vm.enterprise = Session.enterprise;
  vm.onSelectPayrollPeriod = onSelectPayrollPeriod;
  vm.onSelectCashbox = onSelectCashbox;

  vm.close = Instance.close;
  vm.import = submit;

  // custom filter cashbox_id - assign the value to the searchQueries object
  function onSelectCashbox(cashbox) {
    vm.currencyId = cashbox.currency_id;
    vm.account_id = cashbox.account_id;
    reloadGrid();
  }

  // helper aggregation function
  function aggregate(sum, row) {
    return sum + row.balance;
  }

  function onSelectPayrollPeriod(period) {
    vm.periodId = period.id;
    vm.dateFrom = moment(period.dateFrom).format('MM - YYYY');

    reloadGrid();
  }

  function reloadGrid() {
    if (vm.currencyId && vm.periodId) {
      vm.gridDisplay = true;

      const params = {
        payroll_configuration_id : vm.periodId,
        currency_id : vm.currencyId,
        status_id : [3, 4],
        filterCurrency : true,
      };

      MultiplePayroll.read(null, params)
        .then((paiements) => {

          // total amount
          const totals = paiements.reduce(aggregate, 0);

          vm.gridOptions.data = paiements || [];

          // make sure we are always within precision
          vm.totalNetSalary = Number.parseFloat(totals.toFixed(MAX_DECIMAL_PRECISION));
        })
        .catch(Notify.handleError);
    } else {
      vm.gridDisplay = false;
    }

  }

  // generate transaction rows
  function generateTransactionRows(result) {
    const rows = [];

    const supportAccountId = result.account_id;
    const { paiements } = result;
    const supportRow = ToolKits.getBlankVoucherRow();

    rows.typeId = bhConstants.transactionType.SALARY_PAYMENT;

    // first, generate a support row
    supportRow.account_id = supportAccountId;
    supportRow.debit = 0;
    supportRow.credit = vm.totalSelected;
    rows.push(supportRow);

    // then loop through each selected item and credit it with the Supported account
    paiements.forEach((paiement) => {
      const row = ToolKits.getBlankVoucherRow();

      row.account_id = paiement.account_id;
      row.document_uuid = paiement.paiement_uuid;
      row.debit = paiement.balance;

      // this is needed for a nice display in the grid
      row.entity = { label : paiement.display_name, type : 'C', uuid : paiement.creditor_uuid };

      // add the row in to the
      rows.push(row);
    });

    return rows;
  }

  /* ================ Paiement grid parameters ===================== */

  vm.gridOptions = {
    appScopeProvider : vm,
    enableFiltering : true,
    fastWatch : true,
    flatEntityAccess : true,
    enableSelectionBatchEvent : false,
    onRegisterApi,
  };

  vm.gridOptions.columnDefs = [{
    field : 'display_name',
    displayName : 'FORM.LABELS.EMPLOYEE_NAME',
    headerCellFilter : 'translate',
  }, {
    field : 'net_salary',
    displayName : 'FORM.LABELS.NET_SALARY',
    headerCellFilter : 'translate',
    cellFilter : 'currency:row.entity.currency_id',
  }, {
    field : 'balance',
    displayName : 'FORM.LABELS.BALANCE',
    headerCellFilter : 'translate',
    cellFilter : 'currency:row.entity.currency_id',
  }, {
    field : 'status_id',
    displayName : 'FORM.LABELS.STATUS',
    headerCellFilter : 'translate',
    cellTemplate : '/modules/multiple_payroll/templates/cellStatus.tmpl.html',
  }];

  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
    vm.gridApi.selection.on.rowSelectionChanged(null, rowSelectionCallback);
  }

  // called whenever the selection changes in the ui-grid
  function rowSelectionCallback() {
    const selected = vm.gridApi.selection.getSelectedRows();
    const aggregation = selected.reduce(aggregate, 0);

    vm.hasSelectedRows = selected.length > 0;
    vm.totalSelected = Number.parseFloat(aggregation.toFixed(MAX_DECIMAL_PRECISION));
  }

  /* ================ End Paiement grid parameters ===================== */

  // submission
  function submit(form) {
    if (form.$invalid) { return; }

    const selected = vm.gridApi.selection.getSelectedRows();
    const bundle = generateTransactionRows({
      account_id : vm.account_id,
      paiements  : selected,
    });

    const msg = $translate.instant('VOUCHERS.GLOBAL.PAYMENT_EMPLOYEES', {
      date : `[ ${vm.dateFrom} ]`,
    });

    Instance.close({
      rows    : bundle,
      description : msg,
      type_id : bhConstants.transactionType.SALARY_PAYMENT,
      currency_id : vm.currencyId,
    });
  }
}
