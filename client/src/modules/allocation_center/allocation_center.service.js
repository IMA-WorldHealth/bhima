angular.module('bhima.services')
  .service('DistributionCenterService', DistributionCenterService);

DistributionCenterService.$inject = ['PrototypeApiService', 'FilterService', 'appcache', '$uibModal'];

/**
 * @class DistributionCenterService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /allocation_cost_center/ URL.
 */
function DistributionCenterService(Api, Filters, AppCache, Modal) {
  const service = new Api('/allocation_cost_center/');
  const distributionFilters = new Filters();
  const filterCache = new AppCache('distribution-center-filters');

  service.filters = distributionFilters;
  service.openSettingModal = openSettingModal;
  service.openDistributionModal = openDistributionModal;
  service.cacheFilters = cacheFilters;
  service.proceedDistribution = proceedDistribution;
  service.proceedBreakDownPercent = proceedBreakDownPercent;
  service.getDistributed = getDistributed;
  service.removeFilter = removeFilter;
  service.breakDownPercentagesModal = breakDownPercentagesModal;
  service.automaticBreakdown = automaticBreakdown;
  service.getDistributionKey = getDistributionKey;
  service.openDistributionKeyModal = openDistributionKeyModal;
  service.proceedDistributionKey = proceedDistributionKey;
  service.resetDistributionKey = resetDistributionKey;

  // get the auxiliary centers already distributed
  function getDistributed(params) {
    return service.$http.get(`/allocation_cost_center/getDistributed`, { params })
      .then(service.util.unwrapHttpResponse);
  }

  function getDistributionKey() {
    return service.$http.get(`/allocation_cost_center/getDistributionKey`)
      .then(service.util.unwrapHttpResponse);
  }

  distributionFilters.registerDefaultFilters([
    { key : 'fiscal', label : 'FORM.LABELS.FISCAL_YEAR' },
    { key : 'periodFrom', label : 'FORM.LABELS.PERIOD_FROM' },
    { key : 'periodTo', label : 'FORM.LABELS.PERIOD_TO' },
    { key : 'typeCostCenter', label : 'FORM.LABELS.TYPE' },
  ]);

  distributionFilters.registerCustomFilters([
    { key : 'trans_id', label : 'FORM.LABELS.TRANSACTION' },
    { key : 'hrRecord', label : 'FORM.LABELS.RECORD' },
    { key : 'account_id', label : 'FORM.LABELS.ACCOUNT' },
    { key : 'cost_center_id', label : 'FORM.LABELS.COST_CENTER' },
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

  /**
   * @function openSettingModal
   * @description
   * This functions opens the setting modal form for Setting of distribution.
   */
  function openSettingModal(filters) {
    return Modal.open({
      templateUrl : 'modules/allocation_center/modals/setting_allocation.modal.html',
      size : 'md',
      animation : false,
      keyboard : false,
      backdrop : 'static',
      controller : 'SettingDistributionModalController as ModalCtrl',
      resolve : {
        filters : () => filters,
      },
    }).result;
  }

  /**
   * @function openDistributionModal
   * @description
   * This functions opens the distribution Modal form.
   */
  function openDistributionModal(data) {
    return Modal.open({
      templateUrl : 'modules/allocation_center/modals/allocation.modal.html',
      size : 'md',
      animation : false,
      keyboard : false,
      backdrop : 'static',
      controller : 'DistributionModalController as DistributionModalCtrl',
      resolve : {
        transaction : () => data,
      },
    }).result;
  }

  /**
   * @function breakDownPercentagesModal
   * @description
   * This functions opens the breakDown Percentages Modal form.
   */
  function breakDownPercentagesModal(data) {
    return Modal.open({
      templateUrl : 'modules/allocation_center/modals/breakDown.modal.html',
      size : 'md',
      animation : false,
      keyboard : false,
      backdrop : 'static',
      controller : 'BreakDownModalController as BreakDownModalCtrl',
      resolve : {
        data : () => data,
      },
    }).result;
  }

  /**
   * @function automatic Breakdown for Invoices
   * @description
   * This functions opens the distribution Modal form.
   */
  function automaticBreakdown(data) {
    return service.$http.post(`/allocation_cost_center/automatic`, { data })
      .then(service.util.unwrapHttpResponse);
  }

  // Proceed Distribution Cost Center
  function proceedDistribution(data) {
    return service.$http.post(`/allocation_cost_center/proceed`, { data })
      .then(service.util.unwrapHttpResponse);
  }

  // Proceed Break Down Cost Center in Percentage
  function proceedBreakDownPercent(data) {
    return service.$http.post(`/allocation_cost_center/breakDown`, { data })
      .then(service.util.unwrapHttpResponse);
  }

  /**
   * @function openDistributionKeyModal
   * @description
   * This functions opens the distribution key Modal form.
   */
  function openDistributionKeyModal(data) {
    return Modal.open({
      templateUrl : 'modules/allocation_center/modals/allocation_key.modal.html',
      size : 'md',
      animation : false,
      keyboard : false,
      backdrop : 'static',
      controller : 'DistributionKeyModalController as DistributionKeyModalCtrl',
      resolve : {
        settings : () => data,
      },
    }).result;
  }

  // initialization of the distribution keys of the auxiliary centers towards the main center
  function proceedDistributionKey(data) {
    return service.$http.post(`/allocation_cost_center/allocationKey`, { data })
      .then(service.util.unwrapHttpResponse);
  }

  // reset of the distribution keys of the auxiliary centers towards the main center
  function resetDistributionKey(data) {
    return service.$http.post(`/allocation_cost_center/resetKey`, { data })
      .then(service.util.unwrapHttpResponse);
  }

  return service;
}
