angular.module('bhima.services')
  .service('SearchFilterService', SearchFilterService);

SearchFilterService.$inject = [
  'FilterService', 'appcache',
];

function SearchFilterService(Filters, AppCache) {
  function SearchFilter(cacheKey) {
    this._filters = new Filters();
    this._cache = new AppCache(cacheKey);

    // available filters
    this._availableFilters = [
      { key : 'period', label : 'TABLE.COLUMNS.PERIOD', valueFilter : 'translate' },
      { key : 'custom_period_start', label : 'PERIODS.START', valueFilter : 'date', comparitor : '>' },
      { key : 'custom_period_end', label : 'PERIODS.END', valueFilter : 'date', comparitor : '<' },
      { key : 'limit', label : 'FORM.LABELS.LIMIT' },
      { key : 'is_caution', label : 'FORM.LABELS.CAUTION' },
      { key : 'cashbox_id', label : 'FORM.LABELS.CASHBOX' },
      { key : 'debtor_uuid', label : 'FORM.LABELS.CLIENT' },
      { key : 'user_id', label : 'FORM.LABELS.USER' },
      { key : 'reference', label : 'FORM.LABELS.REFERENCE' },
      { key : 'dateFrom', label : 'FORM.LABELS.DATE_FROM', comparitor : '>', valueFilter : 'date' },
      { key : 'dateTo', label : 'FORM.LABELS.DATE_TO', comparitor : '<', valueFilter : 'date' },
      { key : 'currency_id', label : 'FORM.LABELS.CURRENCY' },
      { key : 'reversed', label : 'CASH.REGISTRY.REVERSED_RECORDS' },
      { key : 'patientReference', label : 'FORM.LABELS.REFERENCE_PATIENT' },
      { key : 'defaultPeriod', label : 'TABLE.COLUMNS.PERIOD', valueFilter : 'translate' },
      { key : 'invoiceReference', label : 'FORM.LABELS.INVOICE' },
      { key : 'patientReference', label : 'FORM.LABELS.REFERENCE_PATIENT' },
      { key : 'debtor_group_uuid', label : 'FORM.LABELS.DEBTOR_GROUP' },
      { key : 'invoice_uuid', label : 'FORM.LABELS.INVOICE' },
      { key : 'group_uuid', label : 'FORM.LABELS.GROUP' },
      { key : 'text', label : 'FORM.LABELS.LABEL' },
    ];

    this._filters.registerCustomFilters(this._availableFilters);
    this._filters.registerDefaultFilters([]);
  }

  /**
   * @method formatParameters
   *
   * @description
   * format parameters given according the FilterService standard
   *
   * @param {object} parameters - { key: value }
   * @param {object} ctx - the context (this of object)
   * @returns {object}
   */
  function formatParameters(parameters, ctx) {
    var params = parameters || {};
    return ctx._filters._customFilters.filter(function (column) {
      var value = params[column._key];
      if (angular.isDefined(value)) {
        column._value = value;
        return true;
      }
      return false;
    });
  }

  SearchFilter.prototype.assignFilters = function assignFilters(parameters) {
    var filters = formatParameters(parameters, this);
    this._cache.parameters = parameters;
    this._cache.filters = filters;
  };

  SearchFilter.prototype.latestViewFilters = function latestViewFilters() {
    return {
      defaultFilters : [],
      customFilters : this._cache.filters || [],
    };
  };

  SearchFilter.prototype.hasCustomFilters = function hasCustomFilters() {
    if (!this._cache.filters) { return false; }
    return this._cache.filters.length;
  };

  SearchFilter.prototype.getParameters = function getParameters() {
    return this._cache.parameters;
  };

  SearchFilter.prototype.removeFilter = function removeFilter(key) {
    delete this._cache.parameters[key];
  };

  SearchFilter.prototype.clearFilters = function clearFilters() {
    delete this._cache.parameters;
    delete this._cache.filters;
  };

  return SearchFilter;
}
