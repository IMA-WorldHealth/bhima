angular.module('bhima.controllers')
  .controller('ClosingFiscalYearModalController', ClosingFiscalYearModalController);

// dependencies injection
ClosingFiscalYearModalController.$inject = [
  'AccountService', 'NotifyService', 'FiscalService', 'ModalService', '$uibModalInstance', 'data'
];

// The closing fiscal year controller
function ClosingFiscalYearModalController(Accounts, Notify, Fiscal, Modal, Instance, Data) {
  var vm = this;

  // global variables
  vm.steps  = 'default';

  // expose to the view
  vm.cancel = Instance.close;
  vm.stepForward = stepForward;

  // load the list of accounts
  Accounts.read()
  .then(function (accounts) {
    vm.accounts = accounts;
  })
  .catch(Notify.handleError);

  Fiscal.read(Data.id)
  .then(function (fiscal) {
    vm.fiscal = fiscal;

    // get balance of period N of the year to close
    return Fiscal.periodicBalance({
      id: vm.fiscal.id,
      period_number: vm.fiscal.number_of_months // last month
    });
  })
  .then(function (balance) {

    vm.exploitation = { profit: [], charge: [] };

    balance.forEach(function (item) {

      if (item.type === 'income') {
        vm.exploitation.profit.push(item);
      }

      if (item.type === 'expense') {
        vm.exploitation.charge.push(item);
      }

    });

    return vm.exploitation;

  })
  .then(exploitationStatus)
  .catch(Notify.handleError);

  // process sold of balance
  function exploitationStatus(data) {
    vm.profit = creditorSold(data.profit);
    vm.charge = debitorSold(data.charge);
    vm.globalResult = vm.profit - vm.charge;
  }

  // step handler
  function stepForward(form) {

    if (form.$invalid) { return; }

    if (vm.steps === 'default') {
      vm.steps = 'summary';
    } else if (vm.steps === 'summary') {
      confirmClosing();
    }

  }

  // confirm closing
  function confirmClosing() {
    var request = {
      pattern: vm.fiscal.label,
      patternName: 'FORM.PATTERNS.FISCAL_YEAR_NAME'
    };
    return Modal.openConfirmDialog(request)
    .then(function (ans) {
      if (!ans) { return; }

      return Fiscal.closing({
        id: vm.fiscal.id,
        account_id: vm.resultAccount.id
      });
    })
    .then(function (res) {
      if (!res) { return; }

      Instance.close(true);
      Notify.success('FISCAL.CLOSING_SUCCESS');
    })
    .catch(Notify.handleError);

  }

  // utilities
  function debitorSold(array) {
    return array.reduce(function (a, b) {
      return a + b.debit - b.credit;
    }, 0);
  }

  function creditorSold(array) {
    return array.reduce(function (a, b) {
      return a + b.credit - b.debit;
    }, 0);
  }

}
