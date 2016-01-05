angular.module('bhima.directives')
.directive('reportGroup', ['$compile', function($compile) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var groupModel = attrs.groupModel;
      var template = [
        '<tr data-ng-repeat-start="group in ' + groupModel + '">',
        '<td style="text-align: right">{{group.detail.account_number}}</td>',
        '<td ng-class="{\'reportTitle\': group.detail.account_type_id==3}" ng-style="{\'padding-left\': group.detail.depth * 30 + \'px\'}">{{group.detail.account_txt}}</td>',
        '<td ng-repeat="column in tableDefinition.columns"><span ng-hide="group.detail.account_type_id==3">{{(group.detail[column.key] || 0) | currency}}</span></td>',
        '</tr>',
        '<tr ng-if="group.accounts" data-report-group data-group-model="group.accounts"></tr>',
        '<tr ng-if="group.detail.account_type_id == 3" data-ng-repeat-end><td></td><td ng-style="{\'padding-left\': group.detail.depth * 30 + \'px\'}"><em>Total {{group.detail.account_txt}}</em></td><td ng-repeat="column in tableDefinition.columns"><b>{{group.detail.total[column.key] | currency}}</b></td></tr>'
      ];

      if(attrs.groupModel){
        element.replaceWith($compile(template.join(''))(scope));
      }
    }
  };
}]);
