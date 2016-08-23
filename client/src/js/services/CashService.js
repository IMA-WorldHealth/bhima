angular.module('bhima.services')
.service('CashService', CashService);

CashService.$inject = [
  'PrototypeApiService', 'ExchangeRateService', 'SessionService', 'moment'
];

/**
 * @class CashService
 * @extends PrototypeApiService
 *
 * @description
 * A service to interact with the server-side /cash API.
 */
function CashService(Api, Exchange, Session, moment) {
  var service = new Api('/cash/');

  // custom methods
  service.create = create;
  service.getTransferRecord = getTransferRecord;
  service.calculateDisabledIds = calculateDisabledIds;

  /**
   * Cash Payments can be made to multiple invoices.  This function loops
   * though the invoices in selected order, allocating the global amount to each
   * invoice until it is decimated.
   */
  function allocatePaymentAmounts(data) {

    // the global amount paid
    var totalAmount = data.amount;

    // default to an empty array if necessary -- the server will throw an error
    /** @todo -- review this decision */
    var items = (data.invoices || [])

    // loop through the invoices, allocating a sum to the invoice until there
    // is no more left to allocate.
      .map(function (invoice) {

        // the allocated amount depends on the amount remaining.
        var allocatedAmount = (totalAmount > invoice.amount) ?
            invoice.amount :
            totalAmount;

        // decrease the total amount by the allocated amount.
        totalAmount -= allocatedAmount;

        // return a slice of the data
        return { invoice_uuid : invoice.invoice_uuid, amount : allocatedAmount };
      })

    // filter out invoices that do not have amounts allocated to them
      .filter(function (invoice) {
        return invoice.amount > 0;
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

    // a payment can be made in any currency.  Exchange the currency into the
    // enterprise currency before any more calculations take place.
    data.amount = Exchange.convertToEnterpriseCurrency(data.currency_id, data.date, data.amount);

    // ensure that the caution flag is a Number
    data.is_caution = Number(data.is_caution);

    // process the invoice item, allocating costs to each of them
    if (data.is_caution === 0) {
      data.items = allocatePaymentAmounts(data);
    }

    // remove data.invoices property before submission to the server
    delete data.invoices;

    // call the prototype create method with the formatted data
    return Api.create.call(service, { payment : data });
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
  function generateTransferDescription (){
    return 'Transfer Voucher/'.concat(moment().format('YYYY-MM-DD'), '/', Session.user.id);
  }

  return service;
}
