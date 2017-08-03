angular.module('bhima.services')
  .service('FilterService', FilterService);

FilterService.$inject = ['Store'];

function FilterService(Store) {
  function FilterList() {
    // initialise internal state
    this._defaultFilters = [];
    this._customFilters = [];
    this._filterIndex = {};
  }

  FilterList.prototype.resetFilterState = function resetFilterState(key) {
    this._filterIndex[key].setValue(null, null);
  };

  FilterList.prototype._resetCustomFilters = function resetCustomFilters() {
    this._filterActiveFilters().forEach(function (filter) {
      // only by default remove custom values
      if (!filter._isDefault) {
        this.resetFilterState(filter._key);
      }
    }.bind(this));
  };

  // @TODO registerDefaultFilter and registerCustomFilter could use the same underlying function
  //       with a toggle between the array to populate and the default value
  FilterList.prototype.registerDefaultFilters = function registerDefaultFilters(filterDefinitions) {
    var formattedFilters = filterDefinitions.map(function (filterDefinition) {
      var filter = new Filter(filterDefinition.key, filterDefinition.label, filterDefinition.valueFilter, filterDefinition.comparitor);
      filter.setDefault(true);

      if (filterDefinition.defaultValue) {
        filter.setValue(filterDefinition.defaultValue);
      }
      return filter;
    });

    // udpate index
    this._indexList(this._filterIndex, formattedFilters);
    this._defaultFilters = this._defaultFilters.concat(formattedFilters);
  };

  FilterList.prototype.registerCustomFilters = function registerCustomFilters(filterDefinitions) {
    var formattedFilters = filterDefinitions.map(function (filterDefinition) {
      var filter = new Filter(filterDefinition.key, filterDefinition.label, filterDefinition.valueFilter, filterDefinition.comparitor);
      filter.setDefault(false);
      return filter;
    });

    // udpate index
    this._indexList(this._filterIndex, formattedFilters);
    this._customFilters = this._customFilters.concat(formattedFilters);
  };


  // assigns the value of a filter, a filter with a value will be actively used
  // during the HTTP/ UI export process
  FilterList.prototype.assignFilter = function assignFilter(key, value, displayValue) {
    this._filterIndex[key].setValue(value, displayValue);
  };

  // accepts an array of key : filterValue objects that are assigned
  // [
  // { key : value },
  // { key : value }
  // ]
  FilterList.prototype.assignFilters = function assignFilters(valueList) {
    valueList.forEach(function (valueMap) {
      this.assignFilter(valueMap.key, valueMap.value, valueMap.displayValue, valueMap.comparitor);
    }.bind(this));
  };

  // alias for `assignFilters`, clears the currently active filters before
  // calling the referenced method
  FilterList.prototype.replaceFilters = function replaceFilters(valueList) {
    this._resetCustomFilters();
    this.assignFilters(valueList);
  };

  // uses angular.copy() to break references to old values
  FilterList.prototype.replaceFiltersFromState = function replaceFiltersFromState(stateFilterList) {
    var changes = angular.copy(stateFilterList);
    this.replaceFilters(changes);
  };

  // return filters for the view - this method will always be compatible with the bhFilter component
  FilterList.prototype.formatView = function formatView() {
    var activeFilters = this._filterActiveFilters();
    var activeKeys = activeFilters.map(function (filter) { return filter._key; });

    function keysInActive(filter) { return activeKeys.indexOf(filter._key) !== -1; }

    // parse into two lists
    return {
      defaultFilters : this._defaultFilters.filter(keysInActive),
      customFilters : this._customFilters.filter(keysInActive)
    };
  };

  // format filters for the server
  // sendClientTimestamp - this will send an attribute hidden to the user
  // returns a JSON object with active filters
  FilterList.prototype.formatHTTP = function formatHTTP(hasClientTimestamp) {
    var clientTimestamp = angular.isDefined(hasClientTimestamp) ? hasClientTimestamp : false;
    var activeFilters = this._filterActiveFilters();

    // format current filters correctly
    var httpFilters = activeFilters.reduce(function (aggregate, filter) {
      aggregate[filter._key] = filter._value;
      return aggregate;
    }, {});

    // add client timestamp if requested
    if (clientTimestamp) {
      httpFilters.client_timestamp = (new Date()).toJSON();
    }
    return httpFilters;
  };

  // returns an array of labels and overriden labels that is built for the FilterParser API
  FilterList.prototype.formatHTTPLabels = function formatHTTPLabels() {
    var activeFilters = this._filterActiveFilters();

    return activeFilters.map(function (filter) {
      return filter._key.concat(':', filter._label);
    });
  };

  FilterList.prototype.formatCache = function formatCache() {
    return angular.copy(this._filterIndex);
  };

  // replaces current filters with filters from cache
  FilterList.prototype.loadCache = function loadCache(storedCache) {
    Object.keys(storedCache).forEach(function (key) {
      var cached = storedCache[key];
      var currentFilter = this._filterIndex[key];
      if (currentFilter) {
        currentFilter.setValue(cached._value, cached._displayValue);
      }
    }.bind(this));
  };

  FilterList.prototype._indexList = function indexList(index, list) {
    index = list.reduce(function (aggregateIndex, filterDefinition) {
      aggregateIndex[filterDefinition._key] = filterDefinition;
      return aggregateIndex;
    }, index);
  };

  // returns a flat array of filters that have values (and should be applied)
  FilterList.prototype._filterActiveFilters = function filterActiveFilters() {
    var filtered = [];

    Object.keys(this._filterIndex).forEach(function (key) {
      var filter = this._filterIndex[key];
      
      if (filter._value !== null && filter._value !== undefined && filter._value.length !== '') {
        filtered.push(angular.copy(filter));
      }
    }.bind(this));
    return filtered;
  };

  // expose Filter data element
  FilterList.prototype.Filter = Filter;
  return FilterList;
}

// Filter class for storing filter information in a uniform way
// @TODO add debug asserts to ensure that key and value are specified when required
function Filter(key, label, valueFilter, comparitor) {
  // initialise internal state
  this._key = key;
  this._label = label;
  this._valueFilter = valueFilter;
  this._comparitor = comparitor;
  this._value = null;
  this._isDefault = null;
  this._displayValue = null;

  this.setDefault = function setDefault(value) {
    this._isDefault = value;
  };

  this.setValue = function setValue(value, displayValue) {
    this._value = value;
    this._displayValue = displayValue;
  };
}
