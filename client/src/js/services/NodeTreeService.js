angular.module('bhima.services')
.service('NodeTreeService', NodeTreeService);

/**
* Node Tree Service
*
* Constructs and destructs trees out of arrays of objects.
*/
function NodeTreeService() {
  var service = this;
  var PARENT_KEY = 'parent';
  var DEFAULT_ROOT = 0;
  var DEFAULT_DEPTH = 0;

  // expose service methods
  service.buildNodeTree = buildNodeTree;
  service.flattenInPlace = flattenInPlace;

  // This method builds a tree data structure from an array of nodes
  // having the property PARENT_KEY.  Returns an array of nested objects.
  function buildNodeTree(nodes, parentId, depth) {
    var children;

    // use the defaults if not provided
    parentId = parentId || DEFAULT_ROOT;
    depth = depth || DEFAULT_DEPTH;

    // Base case: There are no child accounts
    // Return an empty array
    if (nodes.length === 0) { return []; }

    // Returns all accounts where the parent is the
    // parentId
    children = nodes.filter(function (node) {
      return node[PARENT_KEY]=== parentId;
    });

    // Recursively call get children on all child accounts
    // and attach them as childen of their parent account
    children.forEach(function (node) {
      node.depth = depth;
      node.children = buildNodeTree(nodes, node.id, depth + 1);
    });

    return children;
  }

  // compares the name property on whatever objects are passed in.
  function defaultComparisonFn(nodeA, nodeB) {
    return (nodeA.name < nodeB.name) ?
      1 : (nodeA.name === nodeB.name) ?
      0 : -1;
  }

  // This method flattens a tree data structure "in place", so that the nodes
  // are ordered by first their tree heirarchy, then by an optional comparison
  // function.  If the comparison function does not exist, we default to comparing
  // object name properties.
  //
  // NOTE: This function preserves both the depth property and the children property
  // on the tree.
  function flattenInPlace(tree, cmp) {

    // base case for recursion.  Immediately return an empty array.
    if (tree.length === 0) {
      return [];
    }

    // default to defaultComparisonFn, if the user didn't pass one in.  Ideally,
    // the developer might want to use a function that calls $translate.instant()
    // to ensure that keys are sorted in appropriate order.
    cmp = cmp || defaultComparisonFn;

    // sort the keys before attempting to flatten tree
    tree.sort(cmp);

    // flatten the tree into a single array
    return tree.reduce(function (list, node) {
      var flattened;

      if (node.children) {
        flattened = flattenInPlace(node.children, cmp);
      }

      return list.concat(node, flattened);
    }, []);
  }

  return service;
}
