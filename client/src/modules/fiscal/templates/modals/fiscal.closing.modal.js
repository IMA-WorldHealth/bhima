angular.module('bhima.controllers')
  .controller('ClosingFiscalYearModalController', ClosingFiscalYearModalController);

// dependencies injection
ClosingFiscalYearModalController.$inject = [
  'AccountService', 'NotifyService', 'FiscalService', 'ModalService',
  'SessionService', '$uibModalInstance', 'data'
];

// The closing fiscal year controller
function ClosingFiscalYearModalController(Accounts, Notify, Fiscal, Modal, Session, Instance, Data) {
  var vm = this;

  // global variables
  vm.currency_id = Session.enterprise.currency_id;

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

    var map = { income: 'profit', expense: 'charge' };

    vm.exploitation = balance.reduce(function (previous, current) {
      var key = map[current.type];

      if (key) {
        previous[key].push(current);
      }

      return previous;
    }, { profit: [], charge: [] });

    vm.profit = creditorSold(vm.exploitation.profit);
    vm.charge = debitorSold(vm.exploitation.charge);
    vm.globalResult = vm.profit - vm.charge;
  })
  .catch(Notify.handleError);

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
    .catch(function (err) {
      Instance.close(false);
      Notify.handleError(err);
    });

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
