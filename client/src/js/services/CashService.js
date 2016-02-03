/**
 * CashService
 *
 * This service interacts with the server-side /cash API.
 *
 * @module services/CashService
 */

angular.module('bhima.services')
.service('CashService', CashService);

CashService.$inject = [ '$http', 'util', 'ExchangeRateService' ];

/**
 * A service to interact with the server-side /cash API.
 *
 * @constructor CashService
 */
function CashService($http, util, Exchange) {
  var service = this;
  var baseUrl = '/cash';

  service.read = read;
  service.create = create;
  service.update = update;
  service.delete = remove;

  /**
   * Fetchs cash payments from the server.  If an uuid is specified, will read a
   * single JSON out of the service, otherwise, fetches every cash payment in the
   * database.
   *
   * @method read
   * @param {string} uuid A cash payment UUID
   * @returns {object|array} payments One or more cash payments.
   */
  function read(uuid, options) {
    var target = (uuid) ?
      baseUrl + '/' + uuid :
      baseUrl;

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

    var items = data.invoices

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
    var target = baseUrl + '/' + uuid;
    return $http.put(target, data)
      .then(util.unwrapHttpResponse);
  }

  /**
   * Deletes cash payments from the database based on the id passed in.
   *
   * @method delete
   * @param {string} uuid A cash payment UUID
   * @returns Promise A resolved or rejected empty promise
   */
  function remove(uuid) {
    var target = baseUrl + '/' + uuid;

    // Technically, we are not returning any body, so unwrappHttpResponse does
    // not do anything.  However, to keep uniformity with the API, I've included
    // it.
    return $http.delete(target)
      .then(util.unwrapHttpResponse);
  }
}
