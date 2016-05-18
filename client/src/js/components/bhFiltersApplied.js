angular.module('bhima.components')
.component('bhFiltersApplied', {
  controller: FiltersAppliedController,
  templateUrl : 'partials/templates/bhFiltersApplied.tmpl.html',
  bindings: {
    filters: '='
  }
});

FiltersAppliedController.$inject =  ['$scope'];

function FiltersAppliedController($scope) {
  var vm = this;
}  
