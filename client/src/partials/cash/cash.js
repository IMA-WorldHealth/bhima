angular.module('bhima.controllers')
.controller('CashController', CashController);

CashController.$inject = [
  'CashService', 'CashboxService', 'AppCache', 'CurrencyService', '$uibModal',
  '$routeParams', '$location', 'Patients', 'ExchangeRateService', 'SessionService'
];

/**
 * The Cash Payments Controller
 *
 * This controller is responsible for binding the cash payments controller to
 * its view.  Cash payments can be made against future invocies (cautions) or
 * against previous invoices (sales).  The cash payments module provides
 * functionality to pay both in multiple currencies.
 *
 * @todo documentation improvements
 * @todo should the $location routing and/or appcache be in a service?
 * @todo move invoices modal into a service
 * @todo move receipt modal into a service
 *
 * @module bhima/controllers/CashController
 */
function CashController(Cash, Cashboxes, AppCache, Currencies, Modal, $routeParams, $location, Patients, Exchange, Session) {

  /** @const controller view-model alias */
  var vm = this;

  /**
  * @const persistent cashbox store
  * This should be the same as in CashboxSelect Controller
  */
  var cache = AppCache('CashPayments');

  /** @const id of the currently select cashbox */
  var cashboxId = $routeParams.id;

  /** default to dots for currency symbol */
  vm.currencyLabel = '...';

  // bind methods
  vm.currencies = Currencies;
  vm.openInvoicesModal = openInvoicesModal;
  vm.changeCashbox = changeCashbox;
  vm.usePatient = usePatient;
  vm.hasFutureDate = hasFutureDate;
  vm.digestExchangeRate = digestExchangeRate;
  vm.toggleDateInput = toggleDateInput;
  vm.toggleVoucherType = toggleVoucherType;
  vm.submit = submit;

  // temporary error handler until an application-wide method is described
  function handler(error) {

    // if we have received 404 for while reading the cashbox, reroute
    // to the cashboxes page.
    if (error.status === 404) {
      $location.url('/cash');

    // for any error that has a translatable error code, bind to view
    } else if (error.data && error.data.code) {
      vm.HttpError = error.data.code;

    // unclear what action to take - throw the error.
    } else {
      throw error;
    }
  }

  /**
   * warns if the date is in the future
   * @todo - refactor into an angular.component.
   * @see Issue #58.
   */
  function hasFutureDate() {
    return (vm.payment.date > vm.timestamp);
  }

  /**
   * switches the date flag to allow users to edit the date.
   * @todo refactor into an angular.component
   * @see Issue #58.
   */
  function toggleDateInput() {
    vm.lockDateInput = !vm.lockDateInput;
  }

  // removes the cashbox from the local cache
  function changeCashbox() {
    delete cache.cashbox;
    $location.path('/cash');
  }

  /**
   * Fired on controller start or form refresh
   * @private
   */
  function startup() {

    /** This is the actual payment form */
    vm.payment = { date : new Date() };

    // by default, do not let users edit the date until asked for
    vm.lockDateInput = true;
    vm.loadingState = false;

    // timestamp to compare date values
    vm.timestamp = new Date();
    vm.enterprise = Session.enterprise;

    // load the cashbox on startup
    Cashboxes.read(cashboxId)
    .then(function (cashbox) {
      vm.cashbox = cashbox;
      cache.cashbox = cashbox;
    }).catch(handler);

    // load currencies for later templating
    Currencies.read();

    // make sure we have exchange
    Exchange.read();
  }

  // submits the form to the server
  function submit(invalid) {

    // remove any dangling HTTP errors from the view
    vm.HttpError = null;

    // if the form is invalid, reject it without any further processing.
    if (invalid) { return; }

    // make sure the form cannot be clicked more than once via disabling.
    toggleLoadingState();

    // add in the cashbox id
    vm.payment.cashbox_id = cashboxId;

    // submit the cash payment
    Cash.create(vm.payment)
    .then(function (response) {

      // display the receipt in a modal
      openReceiptModal(response.uuid);
    })
    .catch(handler)
    .finally(toggleLoadingState);
  }

  /**
  * clears the invoices field whenever the voucher type changes for a better UX
  */
  function toggleVoucherType() {
    delete vm.payment.invoices;
  }

  // toggle loading state on off
  function toggleLoadingState() {
    vm.loadingState = !vm.loadingState;
  }

  // fired after a patient is found via the find-patient directive
  function usePatient(patient) {
    vm.payment.debtor_uuid = patient.debitor_uuid;
    vm.patient = patient;
  }

  /**
   * Cash Receipt Modal
   */
  function openReceiptModal(uuid) {

    var instance = Modal.open({
      templateUrl: 'partials/cash/modals/receipt.modal.html',
      controller:  'CashReceiptModalController as CashReceiptModalCtrl',
      size:        'md',
      backdrop:    'static',
      animation:   false,
      resolve : {
        uuid : function uuidProvider() { return uuid; },
        patientUuid : function patientUuidProvider() { return vm.patient.uuid; }
      }
    });
  }

  /**
   * receive open invoices from the invoice modal
   *
   * @todo refactor this into a separate invoices modal component, that can
   * be injected into any controller.
   */
  function openInvoicesModal() {

    var instance = Modal.open({
      templateUrl: 'partials/cash/modals/invoices.modal.html',
      controller:  'CashInvoiceModalController as CashInvoiceModalCtrl',
      size:        'md',
      backdrop:    'static',
      animation:   false,
      resolve:     {
        debtorId:  function debtorIdProvider() { return vm.payment.debtor_uuid; },
        invoiceIds : function invoiceIdsProvider() {

          // if no invoices have been initialized, pass in an empty array.
          if (!vm.payment.invoices) { return []; }

          return vm.payment.invoices.map(function (invoice) {
            return invoice.sale_uuid;
          });
        }
      }
    });

    // fired when the modal closes
    instance.result.then(function (result) {

      // clear HTTP errors if we are taking further action.
      vm.HttpError = null;

      // bind the selected invoices
      vm.payment.invoices = result.invoices;

      // the table of invoices shown to the client is namespaced by 'slip'
      vm.slip = {};
      vm.slip.rawTotal = result.total;
      digestExchangeRate();
    });
  }

  // exchanges the payment at the bottom of the previous invoice slip.
  function digestExchangeRate() {

    // this is purely for UI considerations.  We want to update the currency
    // input's symbol when the currency changes (prompting a
    // digestExchangeRate()) call.
    vm.currencyLabel = Currencies.symbol(vm.payment.currency_id);

    // make sure we have all the required data before attempting to exchange
    // any values
    if (!vm.slip || !vm.payment.currency_id) { return; }

    // bind the correct exchange rate
    vm.slip.rate = Exchange.getCurrentRate(vm.payment.currency_id);

    // bind the correct exchanged total
    vm.slip.total =
      Exchange.convertFromEnterpriseCurrency(vm.payment.currency_id, vm.payment.date, vm.slip.rawTotal);
  }

  // start up the module
  startup();
}
