angular.module('bhima.services')
  .service('DepricatedFilterService', DepricatedFilterService);

DepricatedFilterService.$inject = ['Store'];

function DepricatedFilterService(Store) {
  // @FIXME this should be defined as a constant accross the server and the client
  /* @const */
  var PERIODS = new Store({ identifier: 'key' });
  PERIODS.setData([
    {
      key   : 'today',
      label : 'FORM.LABELS.TODAY',
    },{
      key   : 'week',
      label : 'FORM.LABELS.THIS_WEEK',
    },{
      key   : 'month',
      label : 'FORM.LABELS.THIS_MONTH',
    },
  ]);
  var DEFAULT_PERIOD = 'today';

  function Filter() {
    this.defaultPeriod = PERIODS.get(DEFAULT_PERIOD);
  }

  Filter.prototype.applyDefaults = function applyDefaults(filters) {
    if (!filters) { return filters; }

    var emptyFilters = Object.keys(filters).length === 0;

    if (emptyFilters) {
      filters.defaultPeriod = this.defaultPeriod.key;
    }
    return filters;
  }

  // @FIXME patch hack - this logic should not be required
  Filter.prototype.customFiltersApplied = function (filters) {
    var filterKeys = Object.keys(filters);
    if (filterKeys.length > 1) { return true; }

    // the filter length at this point can only be 1 or less - check to see if it's default
    if (filterKeys.indexOf('defaultPeriod') > -1) { return false; }
    return true;
  }

  Filter.prototype.lookupPeriod = function lookupPeriod(key) {
    return PERIODS.get(key);
  }
  return Filter;
}
