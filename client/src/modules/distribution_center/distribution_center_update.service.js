angular.module('bhima.services')
  .service('DistributionCenterUpdateService', DistributionCenterUpdateService);

DistributionCenterUpdateService.$inject = ['PrototypeApiService', 'FilterService', 'appcache'];

/**
 * @class DistributionCenterUpdateService
 *
 * @description
 * Encapsulates common requests to the /distribution_fee_center/ URL.
 */
function DistributionCenterUpdateService(Api, Filters, AppCache) {
  const service = new Api('/distribution_fee_center/');
  const distributionFilters = new Filters();
  const filterCache = new AppCache('distribution-center-update-filters');

  service.filters = distributionFilters;
  service.cacheFilters = cacheFilters;
  service.removeFilter = removeFilter;

  distributionFilters.registerDefaultFilters([
    { key : 'fiscal', label : 'FORM.LABELS.FISCAL_YEAR' },
    { key : 'periodFrom', label : 'FORM.LABELS.PERIOD_FROM' },
    { key : 'periodTo', label : 'FORM.LABELS.PERIOD_TO' },
    { key : 'typeFeeCenter', label : 'FORM.LABELS.TYPE' },
  ]);

  distributionFilters.registerCustomFilters([
    { key : 'trans_id', label : 'FORM.LABELS.TRANSACTION' },
    { key : 'hrRecord', label : 'FORM.LABELS.RECORD' },
    { key : 'account_id', label : 'FORM.LABELS.ACCOUNT' },
    { key : 'fee_center_id', label : 'FORM.LABELS.FEE_CENTER' },
  ]);

  if (filterCache.filters) {
    distributionFilters.loadCache(filterCache.filters);
  }

  // load filters from cache
  function cacheFilters() {
    filterCache.filters = distributionFilters.formatCache();
  }

  function removeFilter(key) {
    distributionFilters.resetFilterState(key);
  }

  return service;
}
