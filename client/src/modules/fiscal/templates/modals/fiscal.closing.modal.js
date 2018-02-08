angular.module('bhima.controllers')
  .controller('ClosingFiscalYearModalController', ClosingFiscalYearModalController);

// dependencies injection
ClosingFiscalYearModalController.$inject = [
  'NotifyService', 'FiscalService', 'ModalService',
  'SessionService', '$uibModalInstance', 'data',
  'uiGridGroupingConstants',
];

// The closing fiscal year controller
function ClosingFiscalYearModalController(Notify, Fiscal, Modal, Session, Instance, Data, uiGridGroupingConstants) {
  const vm = this;

  // global
  vm.currency_id = Session.enterprise.currency_id;

  // expose to the view
  vm.cancel = Instance.close;
  vm.stepForward = stepForward;
  vm.onSelectAccount = onSelectAccount;

  // exploitation grid
  const columns = [{
    field            : 'type',
    displayName      : '',
    cellTemplate     : 'modules/fiscal/templates/exploitation_type.tmpl.html',
    width            : 25,
  }, {
    field            : 'number',
    displayName      : 'ACCOUNT.NUMBER',
    headerCellFilter : 'translate',
  }, {
    field            : 'label',
    displayName      : 'TABLE.COLUMNS.ACCOUNT',
    headerCellFilter : 'translate',
  }, {
    field            : 'debit',
    displayName      : 'TABLE.COLUMNS.DEBIT',
    headerCellFilter : 'translate',
    treeAggregationType : uiGridGroupingConstants.aggregation.SUM,
    aggregationHideLabel : true,
  }, {
    field            : 'credit',
    displayName      : 'TABLE.COLUMNS.CREDIT',
    headerCellFilter : 'translate',
    treeAggregationType : uiGridGroupingConstants.aggregation.SUM,
    aggregationHideLabel : true,
  }];

  vm.gridOptions = {
    columnDefs        : columns,
    enableColumnMenus : false,
    showColumnFooter  : true,
    appScopeProvider  : vm,
    flatEntityAccess  : true,
    fastWatch         : true,
  };

  function onSelectAccount(account) {
    vm.resultAccount = account;
  }

  Fiscal.read(Data.id)
    .then(fiscal => {
      vm.fiscal = fiscal;

      // get balance until period N of the year to close
      return Fiscal.periodicBalance({
        id            : vm.fiscal.id,
        period_number : vm.fiscal.number_of_months, // last month
      });
    })
    .then(balance => {
      const profit = balance.filter(getProfitAccount);
      const charge = balance.filter(getExpenseAccount);

      vm.gridOptions.data = profit.concat(charge);
      vm.profit = creditorSold(profit);
      vm.charge = debitorSold(charge);
      vm.globalResult = vm.profit - vm.charge;
    })
    .catch(Notify.handleError);

  // get profit account
  function getProfitAccount(account) {
    const nullBalance = account.debit === account.credit && account.credit === 0;
    return account.type === 'revenue' && !nullBalance;
  }

  // get expense account
  function getExpenseAccount(account) {
    const nullBalance = account.debit === account.credit && account.credit === 0;
    return account.type === 'expense' && !nullBalance;
  }

  // step handler
  function stepForward(form) {
    if (form.$invalid) { return; }

    if (vm.steps !== 'summary') {
      vm.steps = 'summary';
    } else {
      confirmClosing();
    }
  }

  // confirm closing
  function confirmClosing() {
    const request = {
      pattern     : vm.fiscal.label,
      patternName : 'FORM.PATTERNS.FISCAL_YEAR_NAME',
    };

    return Modal.openConfirmDialog(request)
      .then(ans => {
        if (!ans) { return 0; }

        return Fiscal.closing({
          id         : vm.fiscal.id,
          account_id : vm.resultAccount.id,
        });
      })
      .then(res => {
        if (!res) { return; }

        Instance.close(true);
        Notify.success('FISCAL.CLOSING_SUCCESS');
      })
      .catch(err => {
        Instance.close(false);
        Notify.handleError(err);
      });
  }

  // utility fns
  function debitorSold(array) {
    return array.reduce((a, b) => (a + b.debit) - b.credit, 0);
  }

  function creditorSold(array) {
    return array.reduce((a, b) => (a + b.credit) - b.debit, 0);
  }
}
