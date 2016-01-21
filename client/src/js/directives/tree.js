angular.module('bhima.directives')
.directive('treeModel', ['$compile', 'appcache', function($compile, Appcache) {
  var MODULE_NAMESPACE = 'tree';
  var cache = new Appcache(MODULE_NAMESPACE);

  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var treeId = attrs.treeId;
      var treeModel = attrs.treeModel;
      var nodeId = attrs.nodeId || 'id';
      var nodeLabel = attrs.nodeLabel || 'name';
      var nodeChildren = attrs.nodeChildren || 'children';


      var template =
        // '<ul>' +
          // '<li data-ng-repeat=\'node in ' + treeModel + '\'>' +
            // '<i name=\'{{node.' + nodeLabel + '}}\' ng-class="{\'glyphicon-folder-close collapsed\': node.' + nodeChildren + '.length && node.collapsed, \'glyphicon-folder-open expanded\': node.' + nodeChildren + '.length && !node.collapsed }" class=\'glyphicon\' data-ng-click=\'' + treeId + '.selectNodeHead(node)\'></i> ' +
            // '<i class=\'normal glyphicon glyphicon-file\' data-ng-hide=\'node.' + nodeChildren + '.length\' data-ng-click=\'' + treeId + '.selectNodeHead(node)\'></i> ' +
            // '<span name=\'{{node.'  + nodeLabel + '}}\' data-ng-class=\'node.selected\' data-ng-click=\'' + treeId + '.selectNodeLabel(node)\'>{{node.' + nodeLabel + ' | translate }}</span>' +
            // '<div data-ng-hide=\'node.collapsed\' data-tree-id=\'' + treeId + '\' data-tree-model=\'node.' + nodeChildren + '\' data-node-id=' + nodeId + ' data-node-label=' + nodeLabel + ' data-node-children=' + nodeChildren + '></div>' +
          // '</li>' +
        '</ul>';

      // Collapse by default
      if (scope.node) {
        scope.node.collapsed = true;
      }

      // Assign select/ collapse methods - should only occur once
      if (treeId && treeModel) {
        if (attrs.angularTreeview) {
          scope[treeId] = scope[treeId] || {};
          scope[treeId].selectNodeHead = scope[treeId].selectNodeHead || function (selectedNode) {
            var hasChildren = selectedNode.children && selectedNode.children.length > 0;

            // Select nodes without children
            if (!hasChildren) {
              return scope[treeId].selectNodeLabel(selectedNode);
            }

            selectedNode.collapsed = !selectedNode.collapsed;

            // Update cache
            cache.put(selectedNode.id, {collapsed: selectedNode.collapsed});
          };
          scope[treeId].selectNodeLabel = scope[treeId].selectNodeLabel || function (selectedNode) {
            var hasChildren = selectedNode.children && selectedNode.children.length > 0;
            // Open nodes with children
            if (hasChildren) {
              return scope[treeId].selectNodeHead(selectedNode);
            }

            // Close previous node
            if (scope[treeId].currentNode && scope[treeId].currentNode.selected) {
              scope[treeId].currentNode.selected = undefined;
            }

            // Select current (non-parent) node
            selectedNode.selected = 'selected';
            scope[treeId].currentNode = selectedNode;
          };
        }
        element.html('').append($compile(template)(scope));
      }
    }
  };
}]);
