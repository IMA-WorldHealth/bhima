angular.module('bhima.services')
  .service('InventoryService', InventoryService);

InventoryService.$inject = [
  'PrototypeApiService', 'InventoryGroupService', 'InventoryUnitService', 'InventoryTypeService', '$uibModal',
  'FilterService', 'appcache',
];

function InventoryService(Api, Groups, Units, Types, $uibModal, Filters, AppCache) {
  var service = new Api('/inventory/metadata/');

  var inventoryFilters = new Filters();
  var filterCache = new AppCache('inventory-filters');

  // expose inventory services through a nicer API
  service.Groups = Groups;
  service.Units = Units;
  service.Types = Types;
  service.openSearchModal = openSearchModal;
  service.filters = inventoryFilters;

  /**
   * @method openSearchModal
   *
   * @param {Object} filters - an object of filter parameters to be passed to
   *   the modal.
   * @returns {Promise} modalInstance
   */
  function openSearchModal(filters) {
    return $uibModal.open({
      templateUrl : 'modules/inventory/list/modals/search.modal.html',
      size : 'md',
      keyboard : false,
      animation : false,
      backdrop : 'static',
      controller : 'InventorySearchModalController as ModalCtrl',
      resolve : {
        filters : function filtersProvider() { return filters; },
      },
    }).result;
  }

  inventoryFilters.registerDefaultFilters([
    { key : 'limit', label : 'FORM.LABELS.LIMIT' },
  ]);

  inventoryFilters.registerCustomFilters([
    { key : 'group_uuid', label : 'FORM.LABELS.GROUP' },
    { key : 'code', label : 'FORM.LABELS.CODE' },
    { key : 'consumable', label : 'FORM.LABELS.CONSUMABLE' },
    { key : 'text', label : 'FORM.LABELS.LABEL' },
    { key : 'type_id', label : 'FORM.LABELS.TYPE' },
    { key : 'price', label : 'FORM.LABELS.PRICE' },
  ]);

  if (filterCache.filters) {
    // load cached filter definition if it exists
    inventoryFilters.loadCache(filterCache.filters);
  }

  assignDefaultFilters();

  function assignDefaultFilters() {
    // get the keys of filters already assigned - on initial load this will be empty
    var assignedKeys = Object.keys(inventoryFilters.formatHTTP());

    // assign default limit filter
    if (assignedKeys.indexOf('limit') === -1) {
      inventoryFilters.assignFilter('limit', 100);
    }
  }

  service.removeFilter = function removeFilter(key) {
    inventoryFilters.resetFilterState(key);
  };

  // load filters from cache
  service.cacheFilters = function cacheFilters() {
    filterCache.filters = inventoryFilters.formatCache();
  };

  service.loadCachedFilters = function loadCachedFilters() {
    inventoryFilters.loadCache(filterCache.filters || {});
  };

  return service;
}
