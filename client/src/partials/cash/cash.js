angular.module('bhima.controllers')
.controller('CashController', CashController);

CashController.$inject = [
  'CashService', 'CashboxService', 'AppCache', 'CurrencyService',
  '$stateParams', '$location', 'ExchangeRateService', 'SessionService',
  'ModalService', 'NotifyService', '$q'
];

/**
 * @class CashController
 *
 * @description
 * This controller is responsible for binding the cash payments controller to
 * its view.  Cash payments can be made against future invocies (cautions) or
 * against previous invoices (sales).  The cash payments module provides
 * functionality to pay both in multiple currencies.
 *
 * @todo - documentation improvements
 * @todo - deep link cashbox module from various states
 * @todo - move away from $location routing to $state routing.
 */
function CashController(Cash, Cashboxes, AppCache, Currencies, $stateParams, $location, Exchange, Session, Modals, Notify, $q) {

  /* controller view-model alias */
  var vm = this;

  /*
   * persistent cashbox store. This should be the same as in CashboxSelect Controller
   */
  var cache = AppCache('CashPayments');

  /* id of the currently select cashbox */
  var cashboxId = $stateParams.id;

  // bind methods
  vm.openInvoicesModal = openInvoicesModal;
  vm.openTransferModal = openTransferModal;
  vm.openSelectCashboxModal = openSelectCashboxModal;
  vm.usePatient = usePatient;
  vm.digestExchangeRate = digestExchangeRate;
  vm.toggleVoucherType = toggleVoucherType;
  vm.submit = submit;

  // fired on controller start or form refresh
  function startup() {

    /* This is the actual payment form */
    vm.payment = { date : new Date() };

    // timestamp to compare date values
    vm.timestamp = new Date();
    vm.enterprise = Session.enterprise;
    vm.payment.currency_id = vm.enterprise.currency_id;

    // check if there is a cached cashbox, either in $localStorage or $stateParams
    var noCachedCashbox = !cashboxId && (!cache.cashbox || !cache.cashbox.id);

    // if there is no data in the cache or $stateParams, open the cashbox selection modal
    if (noCachedCashbox) {
      return openSelectCashboxModal();
    }

    // if we got here, a cashbox id exists in either $stateParams or the
    // appcache.  We will bias towards $stateParams to allow linking from
    // elsewhere.

    // get the cashbox id
    var id = cashboxId || cache.cashbox.id;

    Currencies.read()
    .then(function (currencies) {
      vm.currencies = currencies;
      return Cashboxes.read(id);
    })
    .then(function (cashbox) {

      // make sure the cashbox we got was valid.  If not, open the cashbox
      // selection modal.  If so, allow through
      if (!validCashbox(cashbox)) {
        return openSelectCashboxModal();
      }

      // set the cashbox selection in localstorage and in URL
      setCashboxSelection(cashbox);
    })
    .catch(function (error) {

      // if we hit a 404 error, we don't have a valid cashbox.
      if (error.status === 404) {
        Notify.danger('VOUCHER.CASHBOXES.NO_CASHBOX_SELECTED');
        openSelectCashboxModal();

      // otherwise, display a system error
      } else {
        return $q.reject(error);
      }
    })
    .catch(Notify.handleError);

    // make sure we have exchange
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

  // returns true if the cashbox belongs to the project and is valid
  function validCashbox(cashbox) {
    return (
      cashbox.project_id === Session.project.id &&
      cashbox.is_auxiliary === 1
    );
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

  /** Transfer Modal */
  function openTransferModal() {
    Modals.openTransfer({ cashbox: vm.cashbox });
  }

  /** Select Cashbox Modal */
  function openSelectCashboxModal() {
    var cashboxId = vm.cashbox && vm.cashbox.id;
    Modals.openSelectCashbox({ cashboxId : cashboxId })
    .then(setCashboxSelection);
  }

  // caches the cashbox
  function setCashboxSelection(cashbox) {
    vm.cashbox = cashbox;
    cache.cashbox = cashbox;
    $location.url('cash/' + vm.cashbox.id);
    calculateDisabledIds();
  }

  /* Debtor Invoices Modal */
  function openInvoicesModal() {
    Modals.openDebtorInvoices({ debtorUuid: vm.payment.debtor_uuid, invoices: vm.payment.invoices })
    .then(function (result) {
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
