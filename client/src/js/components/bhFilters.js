angular.module('bhima.components')
.component('bhFilters', {
  templateUrl : 'partials/templates/bhFilters.tmpl.html',
  controller  : bhFiltersController,
  bindings    : {
    filters        : '<',
    onRemoveFilter : '&',  // fires to remove the filter
  },
});

bhFiltersController.$inject = ['$filter'];
function bhFiltersController($filter) {
  var $ctrl = this;

  // formats the $viewValue according to any filters passed in
  $ctrl.$onChanges = function onChanges(changes) {
    if (!changes.filters) { return; }

    var filters = changes.filters.currentValue;

    filters.defaultFilters.forEach(mapDisplayValues);
    filters.customFilters.forEach(mapDisplayValues);
  };

  function mapDisplayValues(filter) {
    filter.displayValue = filter._displayValue || filter._value;

    if (filter._valueFilter) {
      filter.displayValue = $filter(filter._valueFilter)(filter.displayValue);
    }
    return filter;
  }
}


