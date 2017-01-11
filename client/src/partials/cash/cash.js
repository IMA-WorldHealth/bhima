angular.module('bhima.controllers')
  .controller('CashController', CashController);

CashController.$inject = [
  'CashService', 'CashboxService', 'AppCache', 'CurrencyService',
  'SessionService', 'ModalService', 'NotifyService', '$state',
  'ReceiptModal', 'CashFormService', '$q'
];

/**
 * @class CashController
 *
 * @description
 * This controller is responsible for binding the cash payments controller to
 * its view.  Cash payments can be made against future invoices (cautions) or
 * against previous invoices.  The cash payments module provides
 * functionality to pay both in multiple currencies.
 */
function CashController(Cash, Cashboxes, AppCache, Currencies, Session, Modals, Notify, $state, Receipts, CashForm, $q) {
  var vm = this;

  var cacheKey = 'CashPayments';
  // persist cash data across sessions
  var cache = AppCache(cacheKey);

  /* id of the currently select cashbox */
  var cashboxId = $state.params.id || (cache.cashbox && cache.cashbox.id);

  // if no id, re-route to 'cash.select'
  if (!cashboxId) {
    $state.go('^.select', {}, { notify : false });

  // if there is no URL id but one in localstorage, update the state with the
  // localstorage params.  This doesn't actually reload anything .. it just changes
  // the URL.
  } else if (cashboxId && !$state.params.id) {
    $state.go('^.window', { id : cashboxId }, { location: 'replace'});
  }

  // this is the cache payment form
  vm.Payment = new CashForm(cacheKey);

  vm.timestamp = new Date();

  vm.enterprise = Session.enterprise;

  // bind methods
  vm.submit = submit;
  vm.clear = clear;
  vm.openInvoicesModal = openInvoicesModal;
  vm.onRegisterApiCallback = onRegisterApiCallback;

  // fired when the bhFindPatient API becomes available
  function onRegisterApiCallback(api) {
    vm.bhFindPatient = api;
  }

  // fired on controller start or form refresh
  function startup() {
    Currencies.read()
      .then(function (currencies) {
        vm.currencies = currencies;
        return Cashboxes.read(cashboxId);
      })
      .then(function (cashbox) {

        // set the cashbox selection in localstorage and recalculate disabled ids
        setCashboxSelection(cashbox);
      })
      .catch(function (error) {

        // if we hit a 404 error, we don't have a valid cashbox and do not show
        // the error.
        if (error.status === 404) {
          $state.go('^.select', {}, { notify: false});
          return;
        }

        Notify.handleError(error);
      });
  }

  // caches the cashbox
  function setCashboxSelection(cashbox) {
    vm.cashbox = cashbox;
    cache.cashbox = cashbox;
    vm.disabledCurrencyIds = Cash.calculateDisabledIds(vm.cashbox, vm.currencies);

    vm.Payment.setCashbox(cashbox);
  }

  /* Debtor Invoices Modal */
  function openInvoicesModal() {

    // only retrieve the invoice UUIDs
    var invoices = vm.Payment.details.invoices
      .map(function (invoice) {
        return invoice.uuid;
      });

    // open the invoices modal selection controller
    Modals.openDebtorInvoices({ debtorUuid: vm.Payment.details.debtor_uuid, invoices: invoices })
      .then(function (invoices) {
        vm.Payment.setInvoices(invoices);
      });
  }

  // submits the form to the server
  function submit(form) {
    if (form.$invalid) { return; }

    // be sure the cashbox is set
    vm.Payment.setCashbox(vm.cashbox);

    // patient invoices are covered by caution
    var hasCaution = vm.Payment.messages.hasPositiveAccountBalance;
    var isCaution = vm.Payment.isCaution();
    var hasInvoices = vm.Payment.details.invoices && vm.Payment.details.invoices.length > 0;

    // if the this is not a caution payment, but no invoices are selected,
    // raise an error.
    if (!isCaution && !hasInvoices) {
      return Notify.danger('CASH.VOUCHER.NO_INVOICES_ASSIGNED');
    }

    var promise = $q.resolve()
      .then(function () {
        return hasCaution ?
          Modals.confirm('CASH.CONFIRM_PAYMENT_WHEN_CAUTION') : true;
      })
      .then(function (allowPaymentWithCaution) {
        if (allowPaymentWithCaution) {
          return submitPayment(form);
        }
      });
  }

  // submit payment
  function submitPayment(form) {

    // make a copy of the data before submitting
    var copy = angular.copy(vm.Payment.details);

    // format the cash payment description
    var cachedPaymentDescription = copy.description;

    // TODO - find a much better way of doing this.  This seems quite ... hacky
    copy.description = Cash.formatCashDescription(vm.Payment.patient, copy)
      .concat(' -- ', cachedPaymentDescription);

    return Cash.create(copy)
      .then(function (response) {
        return Receipts.cash(response.uuid, true);
      })
      .then(function () {

        // clear and refresh the form
        clear(form);
      })
      .catch(Notify.handleError);
  }

  function clear(form) {

    vm.Payment.setup();

    // clear the patient selection
    vm.bhFindPatient.reset();

    // clear the form
    form.$setPristine();
  }

  // start up the module
  startup();
}
