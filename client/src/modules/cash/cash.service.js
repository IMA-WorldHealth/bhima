angular.module('bhima.services')
.service('CashService', CashService);

CashService.$inject = [
  '$uibModal', 'PrototypeApiService', 'ExchangeRateService', 'SessionService', 'moment', '$translate',
];

/**
 * @class CashService
 * @extends PrototypeApiService
 *
 * @description
 * A service to interact with the server-side /cash API.
 */
function CashService(Modal, Api, Exchange, Session, moment, $translate) {
  var service = new Api('/cash/');
  var urlCheckin = '/cash/checkin/';

  // custom methods
  service.create = create;
  service.calculateDisabledIds = calculateDisabledIds;
  service.formatCashDescription = formatCashDescription;
  service.formatFilterParameters = formatFilterParameters;
  service.openCancelCashModal = openCancelCashModal;
  service.checkCashPayment = checkCashPayment;

  /**
   * Cash Payments can be made to multiple invoices.  This function loops
   * though the invoices in selected order, allocating the global amount to each
   * invoice until it is decimated.
   */
  function allocatePaymentAmounts(data) {
    // default to an empty array if necessary -- the server will throw an error
    var items = (data.invoices || [])

    // loop through the invoices, allocating a sum to the invoice until there
    // is no more left to allocate.
      .map(function (invoice) {
        return { invoice_uuid: invoice.uuid };
      });

    return items;
  }

  /**
   * @method create
   *
   * @description
   * Creates a cash payment from a JSON passed from a form.
   *
   * @param {object} data A JSON object containing the cash payment record defn
   * @returns {object} payment A promise resolved with the database uuid.
   */
  function create(payment) {

    // create a temporary copy to send to the server
    var data = angular.copy(payment);

    // ensure that the caution flag is a Number
    data.is_caution = Number(data.is_caution);

    // process the invoice item, allocating costs to each of them
    if (data.is_caution === 0) {
      data.items = allocatePaymentAmounts(data);
    }

    // remove data.invoices property before submission to the server
    delete data.invoices;

    // call the prototype create method with the formatted data
    return Api.create.call(service, { payment: data });
  }

  /*
   * Nicely format the cash payment description
   */
  function formatCashDescription(patient, payment) {
    var isCaution = payment.is_caution;
    var date = payment.date;

    // invoice references
    var invoicesReferences = payment.invoices.map(function (invoice) {
      return invoice.reference;
    });

    // this must be semicolons, otherwise the CSV file breaks.
    var referencesString = invoicesReferences.join('; ');

    var tmpl = isCaution ? 'CASH.PREPAYMENT_DESCRIPTION' : 'CASH.PAYMENT_DESCRIPTION';

    return $translate.instant(tmpl, {
      patientName       : patient.display_name,
      invoiceReferences : referencesString,
      patientReference  : patient.reference,
      amount            : payment.amount,
    });
  }

  /**
   * @method calculateDisabledIds
   *
   * @description
   * For a given cashbox, determine which currencies should be unsupported and
   * therefore disabled from selection.
   *
   * @param {Object} cashbox - the cashbox to read from.
   * @param {Array} currencies - a list of application currencies
   * @returns {Array} - the array of currency ids to disable
   */
  function calculateDisabledIds(cashbox, currencies) {

    // collect cashbox ids in an array
    var cashboxCurrencyIds = cashbox.currencies.reduce(function (array, currency) {
      return array.concat(currency.currency_id);
    }, []);

    // find all ids that are not cashbox ids, to disable them
    var disabledCurrencyIds = currencies.reduce(function (array, currency) {
      var bool = (cashboxCurrencyIds.indexOf(currency.id) === -1);
      return array.concat(bool ? currency.id : []);
    }, []);

    return disabledCurrencyIds;
  }

  /**
   * @method formatFilterParameters
   * @description format filters parameters
   */
  function formatFilterParameters(params) {
    var columns = [
      { field: 'is_caution', displayName: 'FORM.LABELS.CAUTION' },
      { field: 'cashbox_id', displayName: 'FORM.LABELS.CASHBOX' },
      { field: 'debtor_uuid', displayName: 'FORM.LABELS.CLIENT' },
      { field: 'user_id', displayName: 'FORM.LABELS.USER' },
      { field: 'reference', displayName: 'FORM.LABELS.REFERENCE' },
      { field: 'dateFrom', displayName: 'FORM.LABELS.DATE_FROM', comparitor: '>', ngFilter: 'date' },
      { field: 'dateTo', displayName: 'FORM.LABELS.DATE_TO', comparitor: '<', ngFilter: 'date' },
      { field: 'currency_id', displayName: 'FORM.LABELS.CURRENCY' },
      { field: 'reversed', displayName: 'CASH.REGISTRY.REVERSED_RECORDS' },
      { field : 'patientReference', displayName: 'FORM.LABELS.REFERENCE_PATIENT' },
      { field : 'defaultPeriod', displayName : 'TABLE.COLUMNS.PERIOD', ngFilter : 'translate' },
    ];

    // returns columns from filters
    return columns.filter(function (column) {
      var value = params[column.field];

      if (angular.isDefined(value)) {
        column.value = value;
        return true;
      } else {
        return false;
      }
    });
  }

  //open a dialog box to Cancel Cash Payment
  function openCancelCashModal(invoice) {
    return Modal.open({
      templateUrl : 'modules/cash/modals/modalCancelCash.html',
      resolve     : { data: { invoice: invoice } },
      size        : 'md',
      animation   : false,
      keyboard    : false,
      backdrop    : 'static',
      controller  : 'ModalCancelCashController as ModalCtrl',
    }).result;
  }

  /**
   * @desc checkCashPayment the invoice from the database
   * @param {String} invoiceUuid, is the uuid of invoice
   * @example
   * service.checkCashPayment(invoiceUuid)
   * .then(function (res){
   *   your code here
   *  });
   */
  function checkCashPayment(invoiceUuid) {
    var url = urlCheckin + invoiceUuid;
    return service.$http.get(url)
      .then(service.util.unwrapHttpResponse);
  }

  return service;
}
