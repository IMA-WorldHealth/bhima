angular.module('bhima.services')
  .service('UserService', UserService);

UserService.$inject = ['PrototypeApiService', 'FilterService', 'bhConstants', 'AppCache', 'PeriodService'];

/**
 * User Service
 *
 * @description
 * This service implements CRUD on the /users endpoint on the client.
 */
function UserService(Api, Filters, bhConstants, AppCache, Periods) {
  const service = new Api('/users/');

  service.update = update;
  service.projects = projects;
  service.depots = depots;
  service.cashboxes = cashboxes;
  service.updatePassword = updatePassword;
  service.updatePermissions = updatePermissions;
  service.validatePassword = validatePassword;
  service.updateDepots = updateDepots;
  service.cashBoxManagement = cashBoxManagement;

  const filters = new Filters();
  const filterCache = new AppCache('users-filters');

  filters.registerDefaultFilters(bhConstants.defaultFilters);

  filters.registerCustomFilters([
    { key : 'uuid', label : 'FORM.LABELS.NAME' },
    { key : 'project_id', label : 'FORM.LABELS.PROJECT' },
    { key : 'role_uuid', label : 'FORM.LABELS.ROLES' },
    { key : 'cashbox_id', label : 'FORM.LABELS.CASHBOX' },
    { key : 'depot_uuid', label : 'FORM.LABELS.DEPOT' },
  ]);

  if (filterCache.filters) {
    // load cached filter definition if it exists
    filters.loadCache(filterCache.filters);
  }

  service.filters = filters;

  // once the cache has been loaded - ensure that default filters are provided appropriate values
  assignDefaultFilters();

  function assignDefaultFilters() {
    // get the keys of filters already assigned - on initial load this will be empty
    const assignedKeys = Object.keys(filters.formatHTTP());

    // assign default period filter
    const periodDefined = service.util.arrayIncludes(assignedKeys, [
      'period', 'custom_period_start', 'custom_period_end',
    ]);

    if (!periodDefined) {
      filters.assignFilters(Periods.defaultFilters());
    }

    // assign default limit filter
    if (assignedKeys.indexOf('limit') === -1) {
      filters.assignFilter('limit', 1000);
    }
  }

  service.removeFilter = function removeFilter(key) {
    filters.resetFilterState(key);
  };

  // load filters from cache
  service.cacheFilters = function cacheFilters() {
    filterCache.filters = filters.formatCache();
  };

  service.loadCachedFilters = function loadCachedFilters() {
    filters.loadCache(filterCache.filters || {});
  };

  /* ------------------------------------------------------------------------ */

  // updates a user with id
  function update(id, user) {

    // delete properties that should not be updated
    delete user.lastLogin;
    delete user.id;
    delete user.active;
    delete user.roles;
    delete user.cashboxes;
    delete user.depots;

    return service.$http.put(`/users/${id}`, user)
      .then(service.util.unwrapHttpResponse);
  }

  // loads the users's project permissions
  function projects(id) {
    return service.$http.get(`/users/${id}/projects`)
      .then(service.util.unwrapHttpResponse);
  }

  // loads the users's depot permissions
  function depots(id) {
    return service.$http.get(`/users/${id}/depots`)
      .then(service.util.unwrapHttpResponse);
  }

  // loads the users's cashbox permissions
  function cashboxes(id) {
    return service.$http.get(`/users/${id}/cashboxes`)
      .then(service.util.unwrapHttpResponse);
  }

  // sets a user's permissions using the public API
  function updatePermissions(id, data) {
    return service.$http.post(`/users/${id}/permissions`, { permissions : data })
      .then(service.util.unwrapHttpResponse);
  }

  // sets a user's Depot Management using the public API
  function updateDepots(id, data) {
    return service.$http.post(`/users/${id}/depots`, { depots : data })
      .then(service.util.unwrapHttpResponse);
  }

  // sets a user's Cashbox Management using the public API
  function cashBoxManagement(id, data) {
    return service.$http.post(`/users/${id}/cashboxes`, { cashboxes : data })
      .then(service.util.unwrapHttpResponse);
  }

  // sets a user's password using the public API
  function updatePassword(id, data) {
    return service.$http.put(`/users/${id}/password`, data)
      .then(service.util.unwrapHttpResponse);
  }

  /**
   * @function validatePassword
   *
   * @param {String} passwordA - a user password
   * @param {String} passwordB - a challenge password
   *
   * @description
   * This function exists to validate password inputs where two passwords are
   * required and must be equal.  This is involved in updating/creating a user
   * password to ensure that the password is correctly memorized by the user..
   */
  function validatePassword(passwordA, passwordB) {
    return passwordA && passwordA.length && passwordA === passwordB;
  }

  return service;
}
