angular.module('bhima.services')
  .service('EmployeeService', EmployeeService);

EmployeeService.$inject = ['FilterService', '$uibModal', 'PrototypeApiService', 'appcache'];

/**
 * @class EmployeeService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /employees/ URL.
 */
function EmployeeService(Filters, $uibModal, Api, AppCache) {
  var service = new Api('/employees/');
  var employeeFilters = new Filters();
  var filterCache = new AppCache('employee-filters');

  service.openSearchModal = openSearchModal;
  service.filters = employeeFilters;
  service.removeFilter = removeFilter;
  service.employeeFilters = employeeFilters;
  service.loadCachedFilters = loadCachedFilters;
  service.cacheFilters = cacheFilters;

  employeeFilters.registerDefaultFilters([{ key : 'limit', label : 'FORM.LABELS.LIMIT' }]);

  employeeFilters.registerCustomFilters([
      { key : 'display_name', label : 'FORM.LABELS.NAME' },
      { key : 'sex', label : 'FORM.LABELS.GENDER' },
      { key : 'code', label : 'FORM.LABELS.CODE' },
      { key : 'dateBirthFrom', label : 'FORM.LABELS.DOB', comparitor: '>', valueFilter:'date' },
      { key : 'dateBirthTo', label : 'FORM.LABELS.DOB', comparitor: '<', valueFilter:'date' },
      { key : 'dateEmbaucheFrom', label : 'FORM.LABELS.DATE_EMBAUCHE', comparitor: '>', valueFilter:'date' },
      { key : 'dateEmbaucheTo', label : 'FORM.LABELS.DATE_EMBAUCHE', comparitor: '<', valueFilter:'date' },
      { key : 'grade_id', label : 'FORM.LABELS.GRADE' },
      { key : 'fonction_id', label : 'FORM.LABELS.FUNCTION' },
      { key : 'service_id', label : 'FORM.LABELS.SERVICE' }
    ]); 
  
  if (filterCache.filters) {
    // load cached filter definition if it exists
    employeeFilters.loadCache(filterCache.filters);
  }

  // once the cache has been loaded - ensure that default filters are provided appropriate values
  assignDefaultFilters();

  function assignDefaultFilters() {
    // get the keys of filters already assigned - on initial load this will be empty
    var assignedKeys = Object.keys(employeeFilters.formatHTTP());

    // assign default limit filter
    if (assignedKeys.indexOf('limit') === -1) {
      employeeFilters.assignFilter('limit', 100);
    }
  }

  function removeFilter(key) {
    employeeFilters.resetFilterState(key);
  };

  // load filters from cache
  function cacheFilters() {
    filterCache.filters = employeeFilters.formatCache();
  };

  function loadCachedFilters() {
    employeeFilters.loadCache(filterCache.filters || {});
  };

  /**
   * @method openSearchModal
   *
   * @param {Object} params - an object of filter parameters to be passed to
   *   the modal.
   * @returns {Promise} modalInstance
   */
  function openSearchModal(params) {
    return $uibModal.open({
      templateUrl: 'modules/employees/registry/search.modal.html',
      size: 'md',
      keyboard: false,
      animation: false,
      backdrop: 'static',
      controller: 'EmployeeRegistryModalController as ModalCtrl',
      resolve : {
        filters : function paramsProvider() { return params; }
      }
    }).result;
  }

  return service;
}
