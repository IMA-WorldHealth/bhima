angular.module('bhima.controllers')
  .controller('AdvancesLoansInstallmentsKitController', AdvancesLoansInstallmentsKitController);

AdvancesLoansInstallmentsKitController.$inject = [
  '$uibModalInstance', 'NotifyService', 'SessionService', 'bhConstants', '$translate',
  'VoucherToolkitService', 'EmployeeService', 'uiGridConstants', 'VoucherForm',
];

// Import transaction rows for Advances Loans Installments of Employees
function AdvancesLoansInstallmentsKitController(
  Instance, Notify, Session, bhConstants, $translate, ToolKits,
  Employees, uiGridConstants, VoucherForm,
) {
  const vm = this;

  vm.enterprise = Session.enterprise;
  vm.onSelectCashbox = onSelectCashbox;
  vm.onSelectAccountCallback = onSelectAccountCallback;

  vm.close = Instance.close;
  vm.import = submit;

  vm.Voucher = new VoucherForm('AdvancesLoansInstallments');

  // fired on changes
  vm.onChanges = function onChanges() {
    vm.Voucher.onChanges();
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.EDIT);
  };

  vm.onCurrencyChange = function onCurrencyChange(currency) {
    vm.Voucher.handleCurrencyChange(currency.id, true);
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.EDIT);
  };

  // custom filter cashbox_id - assign the value to the searchQueries object
  function onSelectCashbox(cashbox) {
    vm.currencyId = cashbox.currency_id;
    vm.account_id = cashbox.account_id;
    reloadGrid();
  }

  function onSelectAccountCallback(account) {
    vm.paiementAccountId = account.id;
    vm.accountLabel = account.label;
    reloadGrid();
  }

  function reloadGrid() {
    if (vm.currencyId && vm.account_id && vm.paiementAccountId) {
      vm.gridDisplay = true;

      Employees.read()
        .then((employees) => {
          employees.forEach((employee) => {
            employee.currency_id = vm.currencyId;
            employee.value = 0;
          });
          // put data in the grid
          vm.gridOptions.data = employees || [];
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
    const { payments } = result;
    const supportRow = ToolKits.getBlankVoucherRow();

    rows.typeId = bhConstants.transactionType.SALARY_PAYMENT;

    // first, generate a support row
    supportRow.account_id = supportAccountId;
    supportRow.debit = 0;
    supportRow.credit = result.totalPaiement;

    rows.push(supportRow);
    // then loop through each selected item and credit it with the Supported account
    payments.forEach((payment) => {
      const row = ToolKits.getBlankVoucherRow();
      row.account_id = payment.account_id;
      row.document_uuid = payment.payment_uuid;
      row.debit = payment.value;

      // this is needed for a nice display in the grid
      row.entity = { label : payment.display_name, type : 'C', uuid : payment.creditor_uuid };

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
    showColumnFooter : true,
    onRegisterApi,
  };

  function muteDisabledCells(grid, row) {
    return (row.entity.locked) ? `text-muted strike` : '';
  }

  vm.gridOptions.columnDefs = [{
    field : 'display_name',
    width : 300,
    displayName : 'FORM.LABELS.EMPLOYEE_NAME',
    headerCellFilter : 'translate',
    cellClass : muteDisabledCells,
  }, {
    field : 'value',
    displayName : 'FORM.LABELS.AMOUNT',
    headerCellFilter : 'translate',
    cellFilter : 'currency: row.entity.currency_id',
    cellTemplate : 'modules/vouchers/templates/amount_paiment.grid.tmpl.html',
    aggregationType : uiGridConstants.aggregationTypes.sum,
    footerCellFilter     : 'currency:grid.appScope.Voucher.details.currency_id',
  }];

  function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
  }

  /* ================ End Paiement grid parameters ===================== */

  // submission
  function submit(form) {
    if (form.$invalid) { return; }

    const dataPaiements = [];
    let totalPaiement = 0;

    vm.gridApi.grid.rows.forEach(item => {
      if (item.entity.value > 0) {
        totalPaiement += item.entity.value;
        item.entity.account_id = vm.paiementAccountId;
        dataPaiements.push(item.entity);
      }
    });

    const bundle = generateTransactionRows({
      account_id : vm.account_id,
      totalPaiement,
      payments   : dataPaiements,
    });

    Instance.close({
      rows    : bundle,
      currency_id : vm.currencyId,
    });
  }
}
