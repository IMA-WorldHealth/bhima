angular.module('bhima.components')
.component('bhFiltersApplied', {
  templateUrl : 'partials/templates/bhFiltersApplied.tmpl.html',
  controller : bhFiltersAppliedController,
  bindings: {
    filters: '<',
    onRemoveFilter: '&'  // fires to remove the filter
  }
});

bhFiltersAppliedController.$inject = [ '$scope', '$filter' ];

function bhFiltersAppliedController($scope, $filter) {

  $scope.$watch('$ctrl.filters', formatViewValues);

  // formats the viewValue according to any filters passed in
  function formatViewValues(filters) {
    if (!filters) { return; }

    filters.forEach(function (filter) {
      if (filter.ngFilter) {
        filter.viewValue = $filter(filter.ngFilter)(filter.value);
      } else {
        filter.viewValue = filter.value;
      }
    });
  }
}
