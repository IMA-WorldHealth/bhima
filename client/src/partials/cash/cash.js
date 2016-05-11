angular.module('bhima.controllers')
.controller('CashController', CashController);

CashController.$inject = [
  'CashService', 'CashboxService', 'AppCache', 'CurrencyService',
  '$stateParams', '$location', 'PatientService', 'ExchangeRateService', 'SessionService',
  'ModalService'
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
function CashController(Cash, Cashboxes, AppCache, Currencies, $stateParams, $location, Patients, Exchange, Session, ModalService) {

  /** @const controller view-model alias */
  var vm = this;

  /**
  * @const persistent cashbox store
  * This should be the same as in CashboxSelect Controller
  */
  var cache = AppCache('CashPayments');

  /** @const id of the currently select cashbox */
  var cashboxId = $stateParams.id;

  /** default to dots for currency symbol */
  vm.currencyLabel = '...';

  // bind methods
  vm.currencies = Currencies;
  vm.openInvoicesModal = openInvoicesModal;
  vm.openTransferModal = openTransferModal;
  vm.openSelectCashboxModal = openSelectCashboxModal;
  vm.changeCashbox = changeCashbox;
  vm.usePatient = usePatient;
  vm.hasFutureDate = hasFutureDate;
  vm.digestExchangeRate = digestExchangeRate;
  vm.toggleVoucherType = toggleVoucherType;
  vm.submit = submit;

  // temporary error handler until an application-wide method is described
  function handler(error) {

    // if we have received 404 for while reading the cashbox, reroute
    // to the cashboxes page.
    if (error.status === 404) {
      $location.url('/cash');
      openSelectCashboxModal();

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

    if ((!cache.cashbox || (cache.cashbox && !cache.cashbox.id)) && !cashboxId) {

      /**
       * first case :
       * No data in the cache && No data in stateParams
       */
      openSelectCashboxModal();

    } else if (cache.cashbox && cache.cashbox.id && !cashboxId) {

      /**
       * second case :
       * Data in the cache && No data in stateParams
       * Be sure data in cache has correct authorization according project
       */
      Cashboxes.read(cache.cashbox.id)
      .then(function (cashbox) {
        cashbox = handleAuth(cashbox);
        if (cashbox.id) {
          vm.cashbox = cashbox;
          cache.cashbox = cashbox;
        } else {
          openSelectCashboxModal();
        }
      }).catch(handler);

    } else if (cashboxId) {

      /**
       * third case :
       * Data in stateParams
       * Be sure data in cache has correct authorization according project
       */
       Cashboxes.read(cashboxId)
       .then(function (cashbox) {
         cashbox = handleAuth(cashbox);
         if (cashbox.id) {
           vm.cashbox = cashbox;
           cache.cashbox = cashbox;
         } else {
           openSelectCashboxModal();
         }
       }).catch(handler);

    }

    /** This is the actual payment form */
    vm.payment = { date : new Date() };

    // timestamp to compare date values
    vm.timestamp = new Date();
    vm.enterprise = Session.enterprise;

    // load currencies for later templating
    Currencies.read();

    // make sure we have exchange
    Exchange.read();
  }

  function handleAuth(cashbox) {
    return (cashbox.project_id === Session.project.id && cashbox.is_auxiliary === 1) ? cashbox : {};
  }

  /**
  * clears the invoices field whenever the voucher type changes for a better UX
  */
  function toggleVoucherType() {
    delete vm.payment.invoices;
  }

  // fired after a patient is found via the find-patient directive
  function usePatient(patient) {
    vm.payment.debtor_uuid = patient.debtor_uuid;
    vm.patient = patient;
  }

  /** Receipt Modal */
  function openReceiptModal(uuid) {
    ModalService.openPatientReceipt({ uuid: uuid, patientUuid: vm.patient.uuid });
  }

  /** Transfer Modal */
  function openTransferModal() {
    ModalService.openTransfer({ cashbox: vm.cashbox });
  }

  /** Select Cashbox Modal */
  function openSelectCashboxModal() {
    ModalService.openSelectCashbox({ cashbox: cache.cashbox, cashboxId: cashboxId })
    .then(function (result) {
      vm.cashbox = result;
      $location.url('/cash/' + vm.cashbox.id);
    });
  }

  /** Debtor Invoices Modal */
  function openInvoicesModal() {
    ModalService.openDebtorInvoices({ debtorUuid: vm.payment.debtor_uuid, invoices: vm.payment.invoices })
    .then(function (result) {
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

  // submits the form to the server
  function submit() {

    var cashbox_id = (cashboxId) ? cashboxId :
      (cache.cashbox && cache.cashbox.id) ? cache.cashbox.id : null;

    if (!cashbox_id) { return ; }

    // add in the cashbox id
    vm.payment.cashbox_id = cashbox_id;

    // submit the cash payment
    return Cash.create(vm.payment)
    .then(function (response) {

      // display the receipt in a modal
      openReceiptModal(response.uuid);
    })
    .catch(function (error) {
      vm.HttpError = error;
    });
  }

  // start up the module
  startup();
}
