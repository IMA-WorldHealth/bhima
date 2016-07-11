angular.module('bhima.services')
.service('JournalVoucherService', JournalVoucherService);

JournalVoucherService.$inject = [ '$http', 'util'];

/**
 * @module JournalVoucherService
 */

function JournalVoucherService($http, util) {
  var service = this;
  var baseUrl = '/journal/';

  service.reverse = reverse;

  /**
   * This method facilitate annulling a transaction, 
   * bhima should automatically be able to reverse 
   * any transaction in the posting_journal by creating a 
   * new transaction that is an exact duplicate of the original transaction with sign minous.
   */
  function reverse(uuid) {
    return $http.put(baseUrl.concat(uuid, '/reverse'))
      .then(util.unwrapHttpResponse);
  }

  return service;
}
