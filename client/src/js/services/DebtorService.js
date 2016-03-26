/**
 * @description The debtor service provides access to the debtor HTTP API
 *
 * @module services/DebtorService
 */

angular.module('bhima.services')
.service('DebtorService', DebtorService);

DebtorService.$inject = [ '$http', 'util' ];

function DebtorService($http, util) {
  var service = this;

  /** update the details of a debtor */
  service.update = update;

  /** returns a list of debtor groups */
  service.groups = groups;

  /** returns the details of a debtor group */
  service.groupDetail = groupDetail;

  /** returns a list of invoices owed to a given debtor */
  service.invoices = invoices;

  // function detail(uuid)
  // function list()

  function groupDetail(uuid) {
    var path = '/debtors/groups/';

    return $http.get(path.concat(uuid))
      .then(util.unwrapHttpResponse);
  }

  function groups() {
    var path = '/debtors/groups';

    return $http.get(path)
      .then(util.unwrapHttpResponse);
  }

  function update(uuid, params) {
    var path = '/debtors/';

    return $http.put(path.concat(uuid), params)
      .then(util.unwrapHttpResponse);
  }

  function invoices(uuid) {
    var path = '/debtors/:uuid/invoices';

    return $http.get(path.replace(':uuid', uuid))
      .then(util.unwrapHttpResponse);
  }

  return service;
}
