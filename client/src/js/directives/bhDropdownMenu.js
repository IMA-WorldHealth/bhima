angular.module('bhima.directives')
  .directive('bhDropdownMenu', () => {
    return {
      restrict : 'E',
      replace : true,
      transclude : true,
      template : `
      <div uib-dropdown dropdown-append-to-body data-action="open-tools">
        <a class="btn btn-default" uib-dropdown-toggle>
          <span class="fa fa-bars"></span>
          <span class="hidden-xs" translate>FORM.LABELS.MENU</span>
          <span class="caret"></span>
        </a>
        <ul uib-dropdown-menu role="menu" class="dropdown-menu-right" ng-transclude>
        </ul>
      </div>
      `,
    };
  });

angular.module('bhima.directives')
  .directive('bhDropdownMenuItem', () => {
    return {
      restrict : 'E',
      replace : true,
      transclude : true,
      template : '<li role="menuitem" ng-transclude></li>',
    };
  });
