angular.module('bhima.services')
  .service('DebtorService', DebtorService);

DebtorService.$inject = ['$q', '$http', 'util', 'Store'];

/**
 * Debtor Service
 *
 * This service is responsible for providing an interface between angular
 * module controllers and the server /debtors API endpoint. It also provides
 * a number of utility methods for correctly packaging requests.
 *
 * @example
 * Controller.$inject = ['DebtorService'];
 *
 * const Debtors = DebtorService;
 *
 * // Returns all debtor groups
 * Debtors.groups()
 *
 * @todo  A pattern of overriding a method has been used in various other services
 *        * groups() - returns all debtor groups
 *        * groups(uuid) - returns details for a specific group
 *        This would replace the groupDetail method
 *
 * @module services/DebtorService
 */
function DebtorService($q, $http, util, Store) {
  const service = this;

  /** returns a list of debtors */
  service.read = read;

  /** update the details of a debtor */
  service.update = update;

  /** returns a list of debtor groups */
  service.groups = groups;

  /** returns the details of a debtor group */
  service.groupDetail = groupDetail;

  /** returns a list of invoices owed to a given debtor */
  service.invoices = invoices;

  // load debtors
  service.store = store;

  function read(uuid) {
    const path = `/debtors/${uuid || ''}`;
    return $http.get(path)
      .then(util.unwrapHttpResponse);
  }

  function groupDetail(uuid) {
    const path = `/debtors/groups/${uuid}`;
    return $http.get(path)
      .then(util.unwrapHttpResponse);
  }

  function groups() {
    const path = '/debtors/groups';
    return $http.get(path)
      .then(util.unwrapHttpResponse);
  }

  function update(uuid, params) {
    const path = `/debtors/${uuid}`;
    return $http.put(path, params)
      .then(util.unwrapHttpResponse);
  }

  function invoices(uuid, params) {
    const path = `/debtors/${uuid}/invoices`;
    return $http.get(path, { params })
      .then(util.unwrapHttpResponse);
  }

  function store() {
    return read()
      .then(data => new Store({ identifier : 'uuid', data }));
  }
}
