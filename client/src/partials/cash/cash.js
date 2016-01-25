/**
 * The Cash Payments Controller
 *
 * This controller is responsible for binding the cash payments controller to
 * its view.  Cash payments can be made against future invocies (cautions) or
 * against previous invoices (sales).  The cash payments module provides
 * functionality to pay both in multiple currencies.
 *
 * @todo documentation improvements
 *
 * @module controllers/CashController
 */

angular.module('bhima.controllers')
.controller('CashController', CashController);

CashController.$inject = [
  'CashService', 'CashboxService', 'appcache', 'CurrencyService', '$uibModal', 'SessionService'
];

function CashController(Cash, Cashboxes, AppCache, Currencies, $uibModal, Session) {

  // bind controller alias
  var vm = this;
  var cache = new AppCache('Cash Payments');

  // bind methods
  vm.selectCashbox = selectCashbox;
  vm.changeCashbox = changeCashbox;
  vm.formatCurrency = formatCurrency;
  vm.Currencies = Currencies;
  vm.enableDateInput = enableDateInput;
  vm.openInvoicesModal = openInvoicesModal;
  
  // bind data
  vm.payment = { date : new Date() };

  // by default, do not let users edit the date until asked for
  vm.dateEditable = false;
  vm.enterprise = Session.enterprise;

  // temporary error handler until an application-wide method is described
  function handler(error) {
    throw error;
  }

  // fired on controller start
  function startup() {

    // load cashboxes on startup
    Cashboxes.read().then(function (cashboxes) {
      vm.cashboxes = cashboxes;
      console.log('cashboxes:', cashboxes);
    }).catch(handler);

    // look up stored cashbox, if it exists
    cache.fetch('cashbox', function (cashbox) {
      if (cashbox) { vm.cashbox = cashbox; }
    });

    // load currencies for later templating
    Currencies.read();
  }

  //  load a particular cashbox on select
  function selectCashbox(id) {
    console.log('Clicked selectCashbox(%d)', id);

    Cashboxes.read(id).then(function (cashbox) {
      vm.cashbox = cashbox;

      // cache for page refreshes
      cache.put('cashbox', cashbox);
      console.log('cashbox', cashbox);
    });
  }

  // simply deletes the cashbox, triggering a view update
  function changeCashbox() {
    vm.cashbox = null;
  }

  // formats currencies for client display
  function formatCurrency(id) {
    return Currencies.name(id) + ' (' + Currencies.symbol(id) + ')';
  }

  // submits the form to the server
  function submit(invalid) {

    // if the form is invalid, reject it without any further processing.
    if (invalid) { return; }

    Cash.create({ payment : vm.payment })
    .then(function () {
      console.log('Redirecting to another page!'); 
    })
    .catch(handler);
  }

  // switches the date flag to allow users to edit the date.
  function enableDateInput() {
    vm.dateEditable = true;
  }

  function openInvoicesModal() {
    var instance = $uibModal.open({
      templateUrl : 'partials/cash/modal.html',
      controller : 'CashModalController as ModalCtrl',
      size : 'md',
      backdrop : 'static',
      animation: false,
      resolve : {
        patient : function () {
          return vm.patient;
        }
      }
    });

    instance.result
    .then(function (invoices) {
      vm.payment.invoices = invoices;
    });
  }

  // start up the module
  startup();
}
