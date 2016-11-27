angular.module('bhima.services')
.service('CashService', CashService);

CashService.$inject = [
  '$uibModal' ,'PrototypeApiService', 'ExchangeRateService', 'SessionService', 'moment', '$http', 'util'
];

/**
 * @class CashService
 * @extends PrototypeApiService
 *
 * @description
 * A service to interact with the server-side /cash API.
 */
function CashService(Modal, Api, Exchange, Session, moment, $http, util) {
  var service     = new Api('/cash/');
  var baseUrl     = '/cash/';
  var urlCheckin  = '/cash/checkin/';


  // templates for descriptions
  var TRANSFER_DESCRIPTION = 'Transfer Voucher / :date / :user';
  var PAYMENT_DESCRIPTION = 'Cash Payment/ :date / :user';
  var CAUTION_DESCRIPTION = 'Caution Payment / :date / :user';

  // custom methods
  service.create = create;
  service.getTransferRecord = getTransferRecord;
  service.calculateDisabledIds = calculateDisabledIds;
  service.formatFilterParameters = formatFilterParameters;
  service.openCancelCashModal = openCancelCashModal;
  service.checkCashPayment = checkCashPayment;  

  /**
   * Cash Payments can be made to multiple invoices.  This function loops
   * though the invoices in selected order, allocating the global amount to each
   * invoice until it is decimated.
   */
  function allocatePaymentAmounts(data) {

    // the global amount paid
    var totalAmount = data.amount;

    // default to an empty array if necessary -- the server will throw an error
    var items = (data.invoices || [])

    // loop through the invoices, allocating a sum to the invoice until there
    // is no more left to allocate.
      .map(function (invoice) {
        return { invoice_uuid : invoice.uuid };
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

    data.description = formatCashDescription(payment.date, payment.is_caution);

    // remove data.invoices property before submission to the server
    delete data.invoices;

    // call the prototype create method with the formatted data
    return Api.create.call(service, { payment : data });
  }

  /*
   * Nicely format the cash payment description
   */
  function formatCashDescription(date, isCaution) {
    var tmpl = isCaution ? CAUTION_DESCRIPTION : PAYMENT_DESCRIPTION;

    return tmpl
      .replace(':date', moment(date).format('YYYY-MM-DD'))
      .replace(':user', Session.user.display_name);
  }

  /**
   * This method is responsible to create a voucher object and it back
   */
  function getTransferRecord(cashAccountCurrency, amount, currencyId) {
    var voucher = {
      project_id: Session.project.id,
      currency_id: currencyId,
      amount: amount,
      description: generateTransferDescription(),
      user_id: Session.user.id,

      // two lines (debit and credit) to be recorded in the database
      items: [{
        account_id : cashAccountCurrency.account_id,
        debit : 0,
        credit : amount,
      }, {
        account_id : cashAccountCurrency.transfer_account_id,
        debit : amount,
        credit : 0,
      }]
    };

    return voucher;
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
   * This method is responsible to generate a description for the transfer operation.
   * @private
   */
  function generateTransferDescription() {
    return TRANSFER_DESCRIPTION
      .replace(':date', moment().format('YYYY-MM-DD'))
      .replace(':user', Session.user.display_name);
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
      { field: 'dateFrom', displayName: 'FORM.LABELS.DATE_FROM', comparitor: '>', ngFilter:'date' },
      { field: 'dateTo', displayName: 'FORM.LABELS.DATE_TO', comparitor: '<', ngFilter:'date' },
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

  //open a dialog box to Cancel Cash Paiement
  function openCancelCashModal(invoice) {
    return Modal.open({
      templateUrl : 'partials/cash/modals/modalCancelCash.html',
      resolve : { data : { invoice : invoice } },
      size : 'md',
      animation : true,
      keyboard  : false,
      backdrop : 'static',
      controller : 'ModalCancelCashController as ModalCtrl',
    }).result;
  }

  /**
   * @desc It checkCashPayment the invoice from the database
   * @param {String} invoiceUuid, is the uuid of invoice
   * @example
   * service.checkCashPayment(invoiceUuid)
   * .then(function (res){
   *   your code here
   *  });
   */
  function checkCashPayment (invoiceUuid){
    var url = urlCheckin + invoiceUuid;
    return $http.get(url)
      .then(util.unwrapHttpResponse);
  }

  return service;
}
