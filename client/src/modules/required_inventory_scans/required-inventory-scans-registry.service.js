angular.module('bhima.services')
  .service('RequiredInventoryScansRegistryService', RequiredInventoryScansRegistryService);

RequiredInventoryScansRegistryService.$inject = [
  'SessionService', 'FilterService', 'appcache', 'bhConstants',
];

/**
 * This service encapsulates some common methods of assets scans registry
 */
function RequiredInventoryScansRegistryService(Session, Filters, AppCache, bhConstants) {
  const service = this;

  /**
   * Define the grid columns
   */
  service.columnDefs = [
    {
      field : 'title',
      displayName : 'TABLE.COLUMNS.TITLE',
      headerTooltip : 'TABLE.COLUMNS.TITLE',
      headerCellFilter : 'translate',
    }, {
      field : 'description',
      displayName : 'TABLE.COLUMNS.DESCRIPTION',
      headerTooltip : 'TABLE.COLUMNS.DESCRIPTION',
      headerCellFilter : 'translate',
      visible : false,
    }, {
      field : 'due_date',
      type : 'date',
      displayName : 'ASSET.SCAN_DUE_DATE',
      headerTooltip : 'ASSET.SCAN_DUE_DATE',
      headerCellFilter : 'translate',
      cellFilter : 'date',
    }, {
      field : 'depot_name',
      displayName : 'STOCK.DEPOT',
      headerTooltip : 'STOCK.DEPOT',
      headerCellFilter : 'translate',
    }, {
      field : 'is_asset',
      displayName : 'FORM.LABELS.ASSETS_ONLY',
      headerTooltip : 'FORM.LABELS.ASSETS_ONLY',
      headerCellFilter : 'translate',
      cellTemplate : '/modules/inventory/list/templates/asset.cell.tmpl.html',
    }, {
      field : 'reference_number',
      displayName : 'FORM.LABELS.REFERENCE_NUMBER',
      headerTooltip : 'FORM.LABELS.REFERENCE_NUMBER',
      headerCellClass : 'wrappingColHeader',
      headerCellFilter : 'translate',
    }, {
      field : 'created_at',
      type : 'date',
      displayName : 'FORM.LABELS.SERVER_DATE',
      headerCellFilter : 'translate',
      headerCellClass : 'wrappingColHeader',
      cellTemplate : 'modules/journal/templates/created_at.cell.html',
      visible : false,
    }, {
      field : 'updated_at',
      displayName : 'ASSET.SCAN_DATE',
      headerTooltip : 'ASSET.SCAN_DATE',
      headerCellFilter : 'translate',
      headerCellClass : 'wrappingColHeader',
      cellFilter : 'date',
    }, {
      field : 'action',
      displayName : '',
      enableFiltering : false,
      enableSorting : false,
      cellTemplate : 'modules/required_inventory_scans/templates/action.cell.html',
    },
  ];

  /**
   * Set up Asset scans filters for the asset scans registry
   */
  const scansFilters = new Filters();
  const filterCache = new AppCache('required-inventory-scans-filters');

  service.filters = scansFilters;

  scansFilters.registerDefaultFilters(bhConstants.defaultFilters);

  scansFilters.registerCustomFilters([
    { key : 'uuid', label : 'FORM.LABELS.REFERENCE' },
    { key : 'depot_uuid', label : 'STOCK.DEPOT' },
  ]);

  if (filterCache.filters) {
    scansFilters.loadCache(filterCache.filters);
  }

  // once the cache has been loaded - ensure that default filters are provided appropriate values
  assignDefaultFilters();

  function assignDefaultFilters() {
    // get the keys of filters already assigned - on initial load this will be empty
    const assignedKeys = Object.keys(scansFilters.formatHTTP());

    // assign default limit filter
    if (assignedKeys.indexOf('limit') === -1) {
      scansFilters.assignFilter('limit', 100);
    }
  }

  // Remove a filter
  service.filters.removeFilter = function removeFilter(key) {
    scansFilters.resetFilterState(key);
  };

  // load filters from cache
  service.filters.cacheFilters = function cacheFilters() {
    filterCache.filters = scansFilters.formatCache();
  };
  service.filters.loadCachedFilters = function loadCachedFilters() {
    scansFilters.loadCache(filterCache.filters || {});
  };

}
