angular.module('bhima.directives')
.directive('header', ['appstate', '$timeout', function (appstate, $timeout) {
  return {
    restrict: 'A',
    replace : true,
    transclude : true,
    template : '<header ng-cloak><span ng-transclude></span><span class="pull-right" style="font-size: .45em;"><div><strong>{{ "UTIL.PROJECT" | translate }}</strong></div><div>{{ project.abbr.toUpperCase() }} {{ project.name }}</div></span></header>',
    link : function (scope) {
      appstate.register('project', function (project) {
        $timeout(function () { scope.project = project; });
      });
    }
  };
}]);
