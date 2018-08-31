angular.module('bhima.components')
  .component('bhFilters', {
    templateUrl : 'modules/templates/bhFilters.tmpl.html',
    controller  : bhFiltersController,
    bindings    : {
      filters        : '<',
      onRemoveFilter : '&',
    },
  });

bhFiltersController.$inject = ['$filter'];
function bhFiltersController($filter) {
  const $ctrl = this;

  // formats the $viewValue according to any filters passed in
  $ctrl.$onChanges = function onChanges(changes) {
    if (!changes.filters) { return; }

    const filters = changes.filters.currentValue;

    if (!filters) { return; }

    filters.defaultFilters.forEach(mapDisplayValues);
    filters.customFilters.forEach(mapDisplayValues);
  };

  function mapDisplayValues(filter) {
    filter.displayValue = filter._displayValue || filter._value;

    if (filter._valueFilter) {
      filter.displayValue = $filter(filter._valueFilter)(filter.displayValue);
    }
  }
}
