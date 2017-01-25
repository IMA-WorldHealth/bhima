angular.module('bhima.services')
.service('SearchFilterFormatService', SearchFilterFormatService);

// dependencies injection 
SearchFilterFormatService.$inject = [];

/**
 * SearchFilterFormatService
 * @description This service help to format filters which are displayed for a search 
 */
function SearchFilterFormatService() {

    var service = this;

    // expose the service 
    service.formatFilter = formatFilter;
    service.formatDisplayNames = formatDisplayNames;
    service.onRemoveFilter = onRemoveFilter;
    service.clearFilters = clearFilters;

    /**
     * @function formatFilter
     * @description filter and format properties of an object for being processed by formatFilterValues
     * @param {object} element the object which contains all filters and their values. Ex. { reference: 'TPA1', is_cancelled: 1 }
     * @param {boolean} WITH_NULL_VALUES a boolean flag for returning also properties which have null values 
     * @return {object} {identifiers: ..., display: ...} returns identifiers for search query and display: values to display in filter 
     */
    function formatFilter(element, WITH_NULL_VALUES) {
      var queryParam = formatFilterParameters(element, true);
      var params = formatFilterValues(queryParam);
      return params;
    }

    /**
     * @function formatFilterParameters
     * @description filter and format properties of an object for being processed by formatFilterValues
     * @param {object} element the object which contains all filters and their values. Ex. { reference: 'TPA1', is_cancelled: 1 }
     * @param {boolean} WITH_NULL_VALUES a boolean flag for returning also properties which have null values 
     */
    function formatFilterParameters(element, WITH_NULL_VALUES) {
        var out = {};
        for (var i in element) {
            if (WITH_NULL_VALUES) {
            out[i] = element[i];
            } else if (element[i]) {
            out[i] = element[i];
            }
        }
        return out;
    }

  /**
   * @function formatFilterValues
   * @description identifier and display value
   * @param {object} formatedFilters a returned value of formatFilterParameters
   * @return {object} fomatedValues { identifiers: {}, display: {} }
   */
  function formatFilterValues(formatedFilters) {
    var out = { identifiers: {}, display: {} };
    for (var key in formatedFilters) {

      if (!formatedFilters.hasOwnProperty(key)) { continue; }

      // get identifiers
      out.identifiers[key] = typeof(formatedFilters[key]) === 'object' ?
        formatedFilters[key].uuid || formatedFilters[key].id || formatedFilters[key] : formatedFilters[key];

      // get value to display
      out.display[key] = typeof(formatedFilters[key]) === 'object' ?
        formatedFilters[key].text || formatedFilters[key].label || formatedFilters[key].display_name || formatedFilters[key] : formatedFilters[key];
    }
    return out;
  }

  /**
   * @method formatDisplayNames
   * @description returns human name for filters
   * @param {object} params A filter.dispay object returned in formatFilterValues
   */
  function formatDisplayNames(params) {
    var columns = [
      { field: 'is_confirmed', displayName: 'PURCHASES.STATUS.CONFIRMED' },
      { field: 'is_received', displayName: 'PURCHASES.STATUS.RECEIVED' },
      { field: 'is_cancelled', displayName: 'PURCHASES.STATUS.CANCELLED' },
      { field: 'supplier_uuid', displayName: 'FORM.LABELS.SUPPLIER' },
      { field: 'user_id', displayName: 'FORM.LABELS.USER' },
      { field: 'reference', displayName: 'FORM.LABELS.REFERENCE' },
      { field: 'dateFrom', displayName: 'FORM.LABELS.DATE_FROM', comparitor: '>', ngFilter:'date' },
      { field: 'dateTo', displayName: 'FORM.LABELS.DATE_TO', comparitor: '<', ngFilter:'date' },
    ];

    // returns columns from filters
    return columns.filter(function (column) {
      var value = params[column.field];

      if (angular.isDefined(value)) {
        column.value = value;
        return true;
      } else {
        return false;
      }
    });
  }

  /**
   * @function onRemoveFilter
   * @description when remove a filter reload data
   * @param {object} filters {identifiers: ..., display: ...}
   * @param {function} reload A reload function 
   */
  function onRemoveFilter(key, filters, reload) {
    if ((filters && !filters.display && !filters.identifiers) || (!filters) || !reload) { return; }
    
    if (key === 'dateFrom' ||  key === 'dateTo') {
      // remove all dates filters if one selected
      delete filters.identifiers.dateFrom;
      delete filters.identifiers.dateTo;
      delete filters.display.dateFrom;
      delete filters.display.dateTo;
    } else {
      // remove the key
      delete filters.identifiers[key];
      delete filters.display[key];
    }
    reload(filters);
  }

  /**
   * @function clearFilters
   * @description remove all filters
   * @param {function} reload A reload function
   */
  function clearFilters(reload) {
    if (!reload) { return; }
    
    reload({ identifiers: {}, display: {} });
  }

  return service;

}