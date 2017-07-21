angular.module('bhima.controllers')
  .controller('ClosingFiscalYearModalController', ClosingFiscalYearModalController);

// dependencies injection
ClosingFiscalYearModalController.$inject = [
  'NotifyService', 'FiscalService', 'ModalService',
  'SessionService', '$uibModalInstance', 'data',
  'uiGridGroupingConstants',
];

// The closing fiscal year controller
function ClosingFiscalYearModalController(Notify, Fiscal, Modal,
  Session, Instance, Data, uiGridGroupingConstants) {
  var vm = this;
  var columns;

  // global variables
  vm.currency_id = Session.enterprise.currency_id;

  // expose to the view
  vm.cancel = Instance.close;
  vm.stepForward = stepForward;
  vm.onSelectAccount = onSelectAccount;

  // exploitation grid
  columns = [
    { field            : 'type',
      displayName      : '',
      cellTemplate     : 'modules/fiscal/templates/exploitation_type.tmpl.html',
      width            : 25,
    },
    { field            : 'number',
      displayName      : 'ACCOUNT.NUMBER',
      headerCellFilter : 'translate',
      treeAggregationType : uiGridGroupingConstants.aggregation.COUNT,
    },
    { field            : 'label',
      displayName      : 'TABLE.COLUMNS.ACCOUNT',
      headerCellFilter : 'translate',
    },
    { field            : 'debit',
      displayName      : 'TABLE.COLUMNS.DEBIT',
      headerCellFilter : 'translate',
      treeAggregationType : uiGridGroupingConstants.aggregation.SUM,
    },
    { field            : 'credit',
      displayName      : 'TABLE.COLUMNS.CREDIT',
      headerCellFilter : 'translate',
      treeAggregationType : uiGridGroupingConstants.aggregation.SUM,
    },
  ];
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
  .then(function (fiscal) {
    vm.fiscal = fiscal;

    // get balance until period N of the year to close
    return Fiscal.periodicBalance({
      id            : vm.fiscal.id,
      period_number : vm.fiscal.number_of_months, // last month
    });
  })
  .then(function (balance) {
    var profit = balance.filter(getProfitAccount);
    var charge = balance.filter(getExpenseAccount);

    vm.gridOptions.data = profit.concat(charge);
    vm.profit = creditorSold(profit);
    vm.charge = debitorSold(charge);
    vm.globalResult = vm.profit - vm.charge;
  })
  .catch(Notify.handleError);

  // get profit account
  function getProfitAccount(account) {
    var nullBalance = account.debit === account.credit && account.credit === 0;
    return account.type === 'revenue' && !nullBalance;
  }

  // get expense account
  function getExpenseAccount(account) {
    var nullBalance = account.debit === account.credit && account.credit === 0;
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
    var request = {
      pattern     : vm.fiscal.label,
      patternName : 'FORM.PATTERNS.FISCAL_YEAR_NAME',
    };

    return Modal.openConfirmDialog(request)
    .then(function (ans) {
      if (!ans) { return; }

      return Fiscal.closing({
        id         : vm.fiscal.id,
        account_id : vm.resultAccount.id,
      });
    })
    .then(function (res) {
      if (!res) { return; }

      Instance.close(true);
      Notify.success('FISCAL.CLOSING_SUCCESS');
    })
    .catch(function (err) {
      Instance.close(false);
      Notify.handleError(err);
    });
  }

  // utilities
  function debitorSold(array) {
    return array.reduce(function (a, b) {
      return (a + b.debit) - b.credit;
    }, 0);
  }

  function creditorSold(array) {
    return array.reduce(function (a, b) {
      return (a + b.credit) - b.debit;
    }, 0);
  }
}
