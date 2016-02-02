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
 * @todo - should the $location routing and/or appcache be in a service?
 *
 * @module bhima/controllers/CashController
 */
angular.module('bhima.controllers')
.controller('CashController', CashController);

CashController.$inject = [
  'CashService', 'CashboxService', 'appcache', 'CurrencyService', '$uibModal',
  '$routeParams', '$location', 'Patients', 'ExchangeRateService', 'SessionService'
];

function CashController(Cash, Cashboxes, AppCache, Currencies, Modal, $routeParams, $location, Patients, Exchange, Session) {

  // bind controller alias
  var vm = this;
  var cache = new AppCache('CashPayments');
  var cashboxId = $routeParams.id;

  // bind methods
  vm.formatCurrency = formatCurrency;
  vm.Currencies = Currencies;
  vm.toggleDateInput = toggleDateInput;
  vm.openInvoicesModal = openInvoicesModal;
  vm.changeCashbox = changeCashbox;
  vm.usePatient = usePatient;
  vm.hasFutureDate = hasFutureDate;
  vm.digestExchangeRate = digestExchangeRate;
  vm.submit = submit;

  // bind data
  vm.payment = { date : new Date() };

  // by default, do not let users edit the date until asked for
  vm.lockDateInput = true;
  vm.loadingState = false;

  // timestamp to compare date values
  vm.timestamp = new Date();
  vm.enterprise = Session.enterprise;

  // temporary error handler until an application-wide method is described
  function handler(error) {
    throw error;
  }

  // TODO - advanced warning if the date is in the future
  function hasFutureDate() {
    return (vm.payment.date > vm.timestamp);
  }

  // removes the cachebox from the local cache
  function changeCashbox() {
    cache.put('cashbox', undefined)
    .then(function () {
      $location.path('/cash');
    })
    .catch(handler);
  }

  // fired on controller start
  function startup() {

    // load the cashbox on startup
    Cashboxes.read(cashboxId)
    .then(function (cashbox) {
      vm.cashbox = cashbox;
      cache.put('cashbox', cashbox);
    }).catch(handler);

    // load currencies for later templating
    Currencies.read();

    Exchange.read();
  }

  // formats currencies for client display
  function formatCurrency(id) {
    return Currencies.name(id) + ' (' + Currencies.symbol(id) + ')';
  }

  // submits the form to the server
  function submit(invalid) {

    // if the form is invalid, reject it without any further processing.
    if (invalid) { return; }

    // make sure the form cannot be clicked more than once via disabling.
    toggleLoadingState();

    // add in the cashbox id
    vm.payment.cashbox_id = cashboxId;

    console.log('Sending the following data to the server:', { payment : vm.payment });

    Cash.create({ payment : vm.payment })
    .then(function (response) {
      console.log('Got the following response:', response);
      console.log('Redirecting to another page!');
    })
    .catch(handler)
    .finally(toggleLoadingState);
  }

  // switches the date flag to allow users to edit the date.
  function toggleDateInput() {
    vm.lockDateInput = !vm.lockDateInput;
  }

  // toggle loading state on off
  function toggleLoadingState() {
    vm.loadingState = !vm.loadingState;
  }

  // fired after a patient is found via the find-patient directive
  function usePatient(patient) {
    vm.payment.debtor_uuid = patient.debitor_uuid;
  }

  /**
   * receive open invoices from the invoice modal
  * @TODO - pass in a list of invoices that are selected.
  * */
  function openInvoicesModal() {
    var instance = Modal.open({
      templateUrl : 'partials/cash/modals/invoices.modal.html',
      controller : 'CashInvoiceModalController as CashInvoiceModalCtrl',
      size : 'md',
      backdrop : 'static',
      animation: false,
      resolve : {
        debtorId : function () { return vm.payment.debtor_uuid; }
      }
    });

    // fired when the modal clsoes
    instance.result
    .then(function (result) {

      // bind the selected invoices
      vm.payment.invoices = result.invoices;

      // the table of invoices shown to the client is namespaced by 'slip'
      vm.slip = {};
      vm.slip.rawTotal = result.total;
      digestExchangeRate();
    });
  }
  
  window.Exchange = Exchange;

  // exchanges the payment at the bottom of the previous invoice slip.
  function digestExchangeRate() {

    // make sure we have all the required data
    if (!vm.slip || !vm.payment.currency_id) { return; }

    console.log(vm.slip, vm.payment.currency_id);

    // bind the correct exchange rate
    vm.slip.rate = Exchange.getCurrentRate(vm.payment.currency_id);

    // bind the correct exchanged total
    vm.slip.total =
      Exchange.convertFromEnterpriseCurrency(vm.payment.currency_id, vm.payment.date, vm.slip.rawTotal);
  }

  // start up the module
  startup();
}
