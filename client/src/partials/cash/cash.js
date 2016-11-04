angular.module('bhima.controllers')
  .controller('CashController', CashController);

CashController.$inject = [
  'CashService', 'CashboxService', 'AppCache', 'CurrencyService',
  'ExchangeRateService', 'SessionService', 'ModalService',
  'NotifyService', '$state', 'ReceiptModal', 'PatientService'
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
function CashController(Cash, Cashboxes, AppCache, Currencies, Exchange, Session, Modals, Notify, $state, Receipts, Patient) {
  var vm = this;

  // persist cash data across sessions
  var cache = AppCache('CashPayments');

  /* id of the currently select cashbox */
  var cashboxId = $state.params.id || (cache.cashbox && cache.cashbox.id) || null;

  // if no id, re-route to 'cash.select'
  if (!cashboxId) {
    $state.go('^.select', {}, { notify : false });

  // if there is no URL id but one in localstorage, update the state with the
  // localstorage params
  } else if (cashboxId && !$state.params.id) {
    $state.go('^.window', { id : cashboxId }, { location: 'replace'});
  }

  // bind methods
  vm.openInvoicesModal = openInvoicesModal;
  vm.usePatient = usePatient;
  vm.digestExchangeRate = digestExchangeRate;
  vm.togglePaymentType = togglePaymentType;
  vm.submit = submit;
  vm.onRegisterApiCallback = onRegisterApiCallback;

  // fired when the bhFindPatient API becomes available
  function onRegisterApiCallback(api) {
    vm.bhFindPatient = api;
  }

  // fired on controller start or form refresh
  function startup() {

    /* This is the actual payment form */
    vm.payment = { date : new Date() };

    // timestamp to compare date values
    vm.timestamp = new Date();
    vm.enterprise = Session.enterprise;
    vm.payment.currency_id = vm.enterprise.currency_id;

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

        Notify.handleError(error);

        // if we hit a 404 error, we don't have a valid cashbox.
        if (error.status === 404) {
          $state.go('^.select', {}, { notify: false});
        }
      });

    // make sure we have exchange rate (no need to do anything with it)
    Exchange.read()
      .catch(Notify.handleError);
  }

  // clears the invoices field whenever the voucher type changes for a better UX
  function togglePaymentType() {
    delete vm.payment.invoices;
  }

  // fired after a patient is found via the find-patient directive
  function usePatient(patient) {
    vm.payment.debtor_uuid = patient.debtor_uuid;
    vm.patient = patient;

    Patient.balance(vm.patient.debtor_uuid)
    .then(function (balance) {
      vm.patientBalance = balance;
    });
  }

  // caches the cashbox
  function setCashboxSelection(cashbox) {
    vm.cashbox = cashbox;
    cache.cashbox = cashbox;
    vm.disabledCurrencyIds = Cash.calculateDisabledIds(vm.cashbox, vm.currencies);
  }

  /* Debtor Invoices Modal */
  function openInvoicesModal() {
    Modals.openDebtorInvoices({ debtorUuid: vm.payment.debtor_uuid, invoices: vm.payment.invoices })
      .then(function (result) {

        // bind the selected invoices
        vm.payment.invoices = result.invoices;

        // the table of invoices shown to the client is name-spaced by 'slip'
        vm.slip = {};
        vm.slip.rawTotal = result.total;
        digestExchangeRate(vm.payment.currency_id);
      });
  }

  // exchanges the payment at the bottom of the previous invoice slip.
  function digestExchangeRate(currencyId) {

    // make sure we have all the required data before attempting to exchange
    // any values
    if (!(vm.slip && currencyId)) { return; }

    // bind the correct exchange rate
    vm.slip.rate = Exchange.getCurrentRate(currencyId);

    // bind the correct exchanged total
    vm.slip.total =
      Exchange.convertFromEnterpriseCurrency(currencyId, vm.payment.date, vm.slip.rawTotal);
  }

  // submits the form to the server
  function submit(form) {
    if (form.$invalid) { return; }

    // add in the cashbox id
    vm.payment.cashbox_id = vm.cashbox.id;

    // patient invoices are covered by caution
    var hascaution = (vm.slip && vm.patientBalance < 0) ? true : false;

    // submit the cash payment
    if (hascaution) {
      return Modals.confirm('CASH.CONFIRM_PAYMENT_WHEN_CAUTION')
        .then(function (ans) {
          if (!ans) { return; }
          return submitPayment(form);
        })
        .catch(Notify.handleError);

    } else {
      return submitPayment(form);
    }

  }

  // submit payment
  function submitPayment(form) {
    return Cash.create(vm.payment)
      .then(function (response) {
        return Receipts.cash(response.uuid, true);
      })
      .then(function () {

        // reset the data
        vm.payment = { date : new Date() };

        // reset the bhFindPatient component
        vm.bhFindPatient.reset();

        // make sure the form is pristine
        form.$setPristine();

        delete vm.slip;
      })
      .catch(Notify.handleError);
  }

  // start up the module
  startup();
}
