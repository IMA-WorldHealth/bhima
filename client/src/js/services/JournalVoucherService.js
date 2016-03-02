angular.module('bhima.services')
  .service('JournalVoucherService', JournalVoucherService);

JournalVoucherService.$inject = [ '$http', 'util' ];

/**
 * Journal Voucher Service
 *
 * The service queries the journal vouchers backend tables to retrieve generic
 * vouchers.  Currently only supports the reference() method.
 *
 * @todo - implement full CRUD in this service.
 */
function JournalVoucherService($http, util) {
  var service = this;
  var baseUrl = '/vouchers/';

  /** @method read */
  service.read = read;

  /** @method reference */
  service.reference = reference;

  /**
   * Retrieves a particular journal voucher by UUID or lists all vouchers if
   * no UUID is specified.
   *
   * @param {string} uuid (optional) - the uuid of the journal voucher to look
   * up in the database.
   * @param {object} options (optional) - options to be passed as query string
   * parameters to the HTTP request
   * @returns {promise} promise - the result of the HTTP request
   */
  function read(uuid, options) {
    var target = baseUrl.concat(uuid || '');
    return $http.get(target)
      .then(util.unwrapHttpResponse);
  }

  /**
   * Searches for a particular journal voucher by its human readable reference
   *
   * @param {string} ref - the reference to search for
   * @returns {promise} promise - a resolved or rejected result from the server
   */
  function reference(ref) {
    var target = baseUrl + 'references/' + ref;
    return $http.get(target)
      .then(util.unwrapHttpResponse);
  }

  return service;
}
