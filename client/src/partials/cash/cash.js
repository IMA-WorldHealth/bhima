angular.module('bhima.controllers')
.controller('CashController', CashController);

CashController.$inject = [
  'CashService', 'CashboxService', 'AppCache', 'CurrencyService',
  'ExchangeRateService', 'SessionService', 'ModalService',
  'NotifyService', '$state'
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
function CashController(Cash, Cashboxes, AppCache, Currencies, Exchange, Session, Modals, Notify, $state) {
  var vm = this;

  // persist cash data across sessions
  var cache = AppCache('CashPayments');

  /* id of the currently select cashbox */
  var cashboxId = $state.params.id || (cache.cashbox && cache.cashbox.id) || null;

  // if no id, re-route to 'cash.select'
  if (!cashboxId) {
    $state.go('^.select', {}, { notify : false });

    // if there is no URL id but one in localstorage, the state with the
    // localstorage params
  } else if (cashboxId && !$state.params.id) {
    $state.go('^.window', { id : cashboxId }, { location: 'replace'});
  }

  // bind methods
  vm.openInvoicesModal = openInvoicesModal;
  vm.openTransferModal = openTransferModal;
  vm.usePatient = usePatient;
  vm.digestExchangeRate = digestExchangeRate;
  vm.togglePaymentType = togglePaymentType;
  vm.submit = submit;

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

  function calculateDisabledIds() {

    // collect cashbox ids in an array
    var cashboxCurrencyIds = vm.cashbox.currencies.reduce(function (array, currency) {
      return array.concat(currency.currency_id);
    }, []);

    // find all ids that are not cashbox ids, to disable them
    vm.disabledCurrencyIds = vm.currencies.reduce(function (array, currency) {
      var bool = (cashboxCurrencyIds.indexOf(currency.id) === -1);
      return array.concat(bool ? currency.id : []);
    }, []);
  }

  // clears the invoices field whenever the voucher type changes for a better UX
  function togglePaymentType() {
    delete vm.payment.invoices;
  }

  // fired after a patient is found via the find-patient directive
  function usePatient(patient) {
    vm.payment.debtor_uuid = patient.debtor_uuid;
    vm.patient = patient;
  }

  /** Transfer Modal */
  function openTransferModal() {
    Modals.openTransfer({ cashbox: vm.cashbox });
  }

  // caches the cashbox
  function setCashboxSelection(cashbox) {
    vm.cashbox = cashbox;
    cache.cashbox = cashbox;
    calculateDisabledIds();
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
      digestExchangeRate();
    });
  }

  // exchanges the payment at the bottom of the previous invoice slip.
  function digestExchangeRate() {

    // make sure we have all the required data before attempting to exchange
    // any values
    if (!vm.slip || !vm.payment.currency_id) { return; }

    // bind the correct exchange rate
    vm.slip.rate = Exchange.getCurrentRate(vm.payment.currency_id);

    // bind the correct exchanged total
    vm.slip.total =
      Exchange.convertFromEnterpriseCurrency(vm.payment.currency_id, vm.payment.date, vm.slip.rawTotal);
  }

  // submits the form to the server
  function submit(form) {
    if (form.$invalid) { return; }

    // add in the cashbox id
    vm.payment.cashbox_id = vm.cashbox.id;

    // submit the cash payment
    return Cash.create(vm.payment)
      .then(function (response) {

        // open cash receipt
        Modals.openPatientReceipt({
          uuid: response.uuid,
          patientUuid: vm.patient.uuid
        });
      })
      .catch(Notify.handleError);
  }

  // start up the module
  startup();
}
