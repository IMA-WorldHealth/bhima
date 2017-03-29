angular.module('bhima.components')
.component('bhFiltersApplied', {
  templateUrl : 'modules/templates/bhFiltersApplied.tmpl.html',
  controller  : bhFiltersAppliedController,
  bindings    : {
    filters        : '<',
    onRemoveFilter : '&',  // fires to remove the filter
  },
});

bhFiltersAppliedController.$inject = ['$filter'];

/**
 * @class bhFiltersApplied
 *
 * @description
 * The bhFiltersApplied directive watches the component boundary for changes in
 * the filters passed in. Filters appear as a list of JSON objects, with a
 * similar API to ui grid.  At minimum, they must contain:
 *  1. displayName (this will be passed through $translate as the column name)
 *  2. value
 * They can optionally contain:
 *  1. comparitor (usually ">", "<", etc)
 *  2. filter (an angular or custom filter to apply to the value)
 *
 * When the filters change, the values are re-digested.  Each filter also has an
 * "X" button, which simply calls `onRemoveFilter()`.  It is up to the parent
 * controller to determine what should happen in this case.
 *
 * @example
 * var filters = [
 *  { displayName : 'SOME.COLUMN', value: 5 },
 *  { displayName : 'SOME.DATE.COLUMN', value : '06/12/1993', filter: 'moment' }
 * ];
 *
 * // in the HTML, it will look something like:
 * // <bh-filters-applied
 * //  filters="SomeCtrl.filters"
 * //  on-remove-filter="SomeCtrl.removeFilter">
 * // </bh-filters-applied>
 */
function bhFiltersAppliedController($filter) {
  var $ctrl = this;

  // formats the $viewValue according to any filters passed in
  $ctrl.$onChanges = function onChanges(changes) {
    var filters;

    if (!changes.filters) { return; }

    filters = changes.filters.currentValue;

    filters.forEach(function (filter) {
      // @FIXME patch hack - this should be managed by the FilterService
      if (filter.field === 'defaultPeriod') {
        filter.isDefault = true;
      }

      if (filter.ngFilter) {
        filter.viewValue = $filter(filter.ngFilter)(filter.value);
      } else {
        filter.viewValue = filter.value;
      }
    });
  };
}
