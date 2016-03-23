/**
 * CashService
 *
 * This service interacts with the server-side /cash API.
 *
 * @module services/CashService
 */

angular.module('bhima.services')
.service('CashService', CashService);

CashService.$inject = [ '$http', 'util', 'ExchangeRateService', 'uuid', 'SessionService' ];

/**
 * A service to interact with the server-side /cash API.
 *
 * @constructor CashService
 */
function CashService($http, util, Exchange, uuid, sessionService ) {
  var service = this;
  var baseUrl = '/cash/';

  service.read = read;
  service.create = create;
  service.update = update;
  service.delete = remove;
  service.reference = reference;
  service.getTransferRecord = getTransferRecord;
  service.getUnsupportedCurrencyIds = getUnsupportedCurrencyIds; 

  /**
   * Fetchs cash payments from the server.  If an uuid is specified, will read a
   * single JSON out of the service, otherwise, fetches every cash payment in the
   * database.
   *
   * @method read
   * @param {string} uuid (optional) - a cash payment UUID
   * @param {object} options - parameters to be passed as HTTP query strings
   * @returns {object|array} payments One or more cash payments.
   */
  function read(uuid, options) {
    var target = baseUrl.concat(uuid || '');

    return $http.get(target, options)
      .then(util.unwrapHttpResponse);
  }

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
        return { sale_uuid : invoice.sale_uuid, amount : allocatedAmount };
      })

    // filter out invoices that do not have amounts allocated to them
      .filter(function (invoice) {
        return invoice.amount > 0;
      });

    return items;
  }

  /**
   * Creates a cash payment from a JSON passed from a form.
   *
   * @method create
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

    // process the sale items, allocating costs to each of them
    if (data.is_caution === 0) {
      data.items = allocatePaymentAmounts(data);
    }

    // remove data.invoices property before submission to the server
    delete data.invoices;

    return $http.post(baseUrl, { payment : data })
      .then(util.unwrapHttpResponse);
  }

  /**
   * Fetchs cash payments from the server.  If an id is specified, will read a single
   * JSON out of the service, otherwise, fetches every cash payment in the database.
   *
   * @method update
   * @param {string} uuid A cash payment UUID
   * @returns {object} payments A promise containing the entire cash payment record
   */
  function update(uuid, data) {
    var target = baseUrl.concat(uuid);
    return $http.put(target, data)
      .then(util.unwrapHttpResponse);
  }

  /**
   * Deletes cash payments from the database based on the id passed in.
   *
   * @method delete
   * @param {string} uuid A cash payment UUID
   * @returns {promise} promise - a resolved or rejected empty promise
   */
  function remove(uuid) {
    var target = baseUrl.concat(uuid);

    // Technically, we are not returning any body, so unwrappHttpResponse does
    // not do anything.  However, to keep uniformity with the API, I've included
    // it.
    return $http.delete(target)
      .then(util.unwrapHttpResponse);
  }

  /**
   * Searches for a cash payment by its reference.
   *
   * @method reference
   * @param {string} reference
   * @returns {promise} promise - a resolved or rejected promise with the
   * result sent from the server.
   */
  function reference(ref) {
    var target = baseUrl + 'references/' + ref;

    return $http.get(target)
      .then(util.unwrapHttpResponse);
  }

  /**
  * This methode is responsible to create a voucher object and send it back
  **/
  function getTransferRecord (cashAccountCurrency, amount, currency_id){

    var voucher = {
      uuid : uuid(),
      project_id : sessionService.project.id,
      currency_id : currency_id,
      amount : amount,
      description : generateTransferDescription(),
      user_id : sessionService.user.id
    };   

    var cashVoucherLine = [
      uuid (),
      cashAccountCurrency.account_id,
      0,
      amount,
      voucher.uuid
    ];

    var transferVoucherLine = [
      uuid (),
      cashAccountCurrency.virement_account_id,
      amount,
      0,
      voucher.uuid
    ];

    return {voucher : voucher, voucher_item : [cashVoucherLine, transferVoucherLine]};
  }

  /**
  * This methode is responsible to generate a description for the transfer operation
  * @private
  **/
  function generateTransferDescription (){
    return ['Transfer voucher', new Date().toISOString().slice(0, 10), sessionService.user.id].join('/');
  }

  /**
  *This method take a cashbox and a liste of available currency in the system
  *and send back a list of currency not supported by the provided cashbox
  **/
  function getUnsupportedCurrencyIds (cashBox, currencies){
    var cashboxCurrencyIds = cashBox.currencies.reduce(function (array, currency) {
         return array.concat(currency.currency_id);
    }, []);
 
    // find all ids that are not cashbox ids, to disable them
    var ids = currencies.reduce(function (array, currency) {
      var bool = (cashboxCurrencyIds.indexOf(currency.id) === -1);
      return array.concat(bool ? currency.id : []);
    }, []);

    return ids;
  }
}
