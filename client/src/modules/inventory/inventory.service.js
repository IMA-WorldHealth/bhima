angular.module('bhima.services')
  .service('InventoryService', InventoryService);

InventoryService.$inject = [
  'PrototypeApiService', 'InventoryGroupService', 'InventoryUnitService', 'InventoryTypeService', '$uibModal',
  'FilterService', 'appcache', 'LanguageService', '$httpParamSerializer', 'HttpCacheService',
];

function InventoryService(
  Api, Groups, Units, Types, $uibModal, Filters,
  AppCache, Languages, $httpParamSerializer, HttpCache,
) {
  const service = new Api('/inventory/metadata/');

  service.read = read;

  // the import inventory api
  const INVENTORY_IMPORT_URL = '/inventory/import/';

  const inventoryFilters = new Filters();
  const filterCache = new AppCache('inventory-filters');

  const modalParameters = {
    size : 'md',
    keyboard : false,
    animation : false,
    backdrop : 'static',
  };

  // expose inventory services through a nicer API
  service.Groups = Groups;
  service.Units = Units;
  service.Types = Types;
  service.openSearchModal = openSearchModal;
  service.filters = inventoryFilters;
  service.remove = remove;
  service.openImportInventoriesModal = openImportInventoriesModal;
  service.downloadInventoriesTemplate = downloadInventoriesTemplate;

  service.inventoryLog = (uuid) => {
    return service.$http.get(`/inventory/log/${uuid}`)
      .then(service.util.unwrapHttpResponse);
  };

  function downloadInventoriesTemplate() {
    service.$http.get(INVENTORY_IMPORT_URL.concat('template_file'))
      .then(response => {
        return service.util.download(response, 'Template Inventory', 'csv');
      });
  }

  const callback = (uuid, options) => Api.read.call(service, uuid, options);
  const fetcher = HttpCache(callback, 2000);

  /**
   * The read() method loads data from the api endpoint. If a uuid is provided,
   * the $http promise is resolved with a single JSON object, otherwise an array
   * of objects should be expected.
   *
   * @param {String} uuid - the uuid of the account to fetch (optional).
   * @param {Object} options - options to be passed as query strings (optional).
   * @param {Boolean} cacheBust - ignore the cache and send the HTTP request directly
   *   to the server.
   * @return {Promise} promise - resolves to either a JSON (if uuid provided) or
   *   an array of JSONs.
   */
  function read(uuid, options, cacheBust = false) {
    return fetcher(uuid, options, cacheBust);
  }

  /**
   * @method openSearchModal
   *
   * @param {Object} filters - an object of filter parameters to be passed to
   *   the modal.
   * @returns {Promise} modalInstance
   */
  function openSearchModal(filters) {
    const params = angular.extend(modalParameters, {
      templateUrl  : 'modules/inventory/list/modals/search.modal.html',
      controller   : 'InventorySearchModalController as ModalCtrl',
      resolve : {
        filters : function filtersProvider() { return filters; },
      },
    });

    const instance = $uibModal.open(params);
    return instance.result;
  }

  /**
   * @method openImportInventoriesModal
   *
   * @returns {Promise} modalInstance
   */
  function openImportInventoriesModal(request) {
    const params = angular.extend(modalParameters, {
      templateUrl  : 'modules/inventory/list/modals/import.modal.html',
      controller   : 'ImportInventoriesModalController',
      controllerAs : '$ctrl',
      resolve : {
        data :  function dataProvider() { return request; },
      },
    });

    const instance = $uibModal.open(params);
    return instance.result;
  }

  inventoryFilters.registerDefaultFilters([{
    key : 'limit',
    label : 'FORM.LABELS.LIMIT',
  }]);

  inventoryFilters.registerCustomFilters([{
    key : 'group_uuid',
    label : 'FORM.LABELS.GROUP',
  },
  {
    key : 'code',
    label : 'FORM.LABELS.CODE',
  },
  {
    key : 'consumable',
    label : 'FORM.LABELS.CONSUMABLE',
  },
  {
    key : 'locked',
    label : 'FORM.LABELS.LOCKED',
  },
  {
    key : 'uuid',
    label : 'FORM.LABELS.LABEL',
  },
  {
    key : 'text',
    label : 'FORM.LABELS.LABEL',
  },
  {
    key : 'type_id',
    label : 'FORM.LABELS.TYPE',
  },
  {
    key : 'price',
    label : 'FORM.LABELS.PRICE',
  },
  {
    key : 'tags',
    label : 'TAG.TAGS',
  },
  ]);

  if (filterCache.filters) {
    // load cached filter definition if it exists
    inventoryFilters.loadCache(filterCache.filters);
  }

  assignDefaultFilters();

  function assignDefaultFilters() {
    // get the keys of filters already assigned - on initial load this will be empty
    const assignedKeys = Object.keys(inventoryFilters.formatHTTP());

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

  service.download = function download(type) {
    const filterOpts = inventoryFilters.formatHTTP();
    const defaultOpts = {
      renderer : type,
      lang : Languages.key,
    };

    // combine options
    const options = angular.merge(defaultOpts, filterOpts);

    // return  serialized options
    return $httpParamSerializer(options);
  };

  // delete an inventory
  function remove(uuid) {
    return service.$http.delete('/inventory/metadata/'.concat(uuid));
  }
  service.columnsMap = (key) => {
    const cols = {
      code : 'FORM.LABELS.CODE',
      consumable : 'FORM.LABELS.CONSUMABLE',
      default_quantity : 'FORM.LABELS.DEFAULT_QUANTITY',
      group_uuid : 'FORM.LABELS.GROUP',
      inventoryGroup : 'FORM.LABELS.GROUP',
      label : 'FORM.LABELS.LABEL',
      text : 'FORM.LABELS.LABEL',
      note : 'FORM.INFO.NOTE',
      price : 'FORM.LABELS.UNIT_PRICE',
      sellable : 'INVENTORY.SELLABLE',
      type_id : 'FORM.LABELS.TYPE',
      inventoryType : 'FORM.LABELS.TYPE',
      unit_id : 'FORM.LABELS.UNIT',
      inventoryUnit : 'FORM.LABELS.UNIT',
      unit_volume : 'FORM.LABELS.VOLUME',
      unit_weight : 'FORM.LABELS.WEIGHT',
    };

    return cols[key] || key;
  };

  return service;
}
