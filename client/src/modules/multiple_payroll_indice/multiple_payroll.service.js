angular.module('bhima.services')
  .service('MultipleIndicesPayrollService', MultipleIndicesPayrollService);

MultipleIndicesPayrollService.$inject = [
  'PrototypeApiService', 'TransactionTypeStoreService', '$uibModal',
  'FilterService', 'PeriodService', 'LanguageService', '$httpParamSerializer',
  'appcache', 'TransactionService',
];

/**
 * @class MultipleIndicesPayrollService
 * @extends PrototypeApiService
 *
 * @description
 * This service manages posting data to the database via the /multiple_payroll/ URL.  It also
 * includes some utilities that are useful for Multiple Payroll pages.
 */
function MultipleIndicesPayrollService(
  Api, TransactionTypeStore, Modal, Filters, Periods, Languages,
  $httpParamSerializer, AppCache, Transactions
) {
  const service = new Api('/multiple_payroll_indice/');
  service.parameters = new Api('/multiple_payroll_indice/parameters/');

  const multiplePayrollFilters = new Filters();
  const filterCache = new AppCache('multiple-indices-payroll-filters');

  service.remove = Transactions.remove;
  service.openSearchModal = openSearchModal;
  service.staffingParametersModal = staffingParametersModal;

  service.filters = multiplePayrollFilters;
  service.cacheFilters = cacheFilters;
  service.removeFilter = removeFilter;
  service.loadCachedFilters = loadCachedFilters;
  service.download = download;
  service.getConfiguration = getConfiguration;
  service.setConfiguration = setConfiguration;
  service.paiementCommitment = paiementCommitment;
  service.configurations = configurations;

  // loads the Payroll Configuration
  function getConfiguration(id, params) {
    return service.$http.get(`/multiple_payroll/${id}/configuration`, { params })
      .then(service.util.unwrapHttpResponse);
  }

  // Set Multi Payroll Configuration using the public API
  function setConfiguration(id, data) {
    return service.$http.post(`/multiple_payroll/${id}/configuration`, { data })
      .then(service.util.unwrapHttpResponse);
  }

  // Set Employees Configured for Payroll
  function configurations(id, data) {
    return service.$http.post(`/multiple_payroll/${id}/multiConfiguration`, { data })
      .then(service.util.unwrapHttpResponse);
  }

  /**
   *Put Employees on the Payment Agreement List
   *Transfer of the entries in accountants for the commitment of payment
  */
  function paiementCommitment(id, data) {
    return service.$http.post(`/multiple_payroll/${id}/commitment`, { data })
      .then(service.util.unwrapHttpResponse);
  }

  multiplePayrollFilters.registerDefaultFilters([
    { key : 'payroll_configuration_id', label : 'FORM.LABELS.PERIOD_PAYMENT' },
    { key : 'currency_id', label : 'FORM.LABELS.CURRENCY' },
  ]);

  multiplePayrollFilters.registerCustomFilters([
    { key : 'display_name', label : 'FORM.LABELS.EMPLOYEE_NAME' },
    { key : 'code', label : 'FORM.LABELS.CODE' },
    { key : 'status_id', label : 'FORM.LABELS.STATUS' },
    { key : 'conversion_rate', label : 'FORM.LABELS.CONVERSION_RATE' },
  ]);


  if (filterCache.filters) {
    multiplePayrollFilters.loadCache(filterCache.filters);
  }

  function removeFilter(key) {
    multiplePayrollFilters.resetFilterState(key);
  }

  // load filters from cache
  function cacheFilters() {
    filterCache.filters = multiplePayrollFilters.formatCache();
  }

  function loadCachedFilters() {
    multiplePayrollFilters.loadCache(filterCache.filters || {});
  }

  // downloads a type of report based on the
  function download(type) {
    const filterOpts = multiplePayrollFilters.formatHTTP();
    const defaultOpts = { renderer : type, lang : Languages.key };

    // combine options
    const options = angular.merge(defaultOpts, filterOpts);
    // return  serialized options
    return $httpParamSerializer(options);
  }

  /**
   * @function openSearchModal
   * @description
   * This functions opens the search modal form for the voucher registry.
   */
  function openSearchModal(filters) {
    return Modal.open({
      templateUrl : 'modules/multiple_payroll_indice/modals/search.modal.html',
      size : 'md',
      animation : false,
      keyboard : false,
      backdrop : 'static',
      controller : 'MultiPayrollIndiceSearchModalController as $ctrl',
      resolve : {
        filters : function filtersProvider() { return filters; },
      },
    }).result;
  }

  function staffingParametersModal() {
    return Modal.open({
      templateUrl : 'modules/multiple_payroll_indice/modals/parameter.modal.html',
      size : 'md',
      animation : false,
      keyboard : false,
      backdrop : 'static',
      controller : 'MultiPayrollIndiceParamModalController as $ctrl',
    }).result;
  }
  return service;
}
