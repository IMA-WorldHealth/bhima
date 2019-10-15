angular.module('bhima.services')
  .service('ChoisesListManagementService', ChoisesListManagementService);

ChoisesListManagementService.$inject = ['PrototypeApiService'];

/**
 * @class ChoisesListManagementService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /choises_list_management/ URL.
 */
function ChoisesListManagementService(Api) {
  const service = new Api('/choises_list_management/');

  service.formatStore = formatStore;

  function formatStore(data) {
    const storeData = order(data);
    return storeData;
  }

  /**
   * @method order
   *
   * @description
   * Creates a proper choise list ordering by first creating an choise list tree and
   * then flattening in place.
   *
   * @param {Array} lists - a list of choises lists objects
   * @returns {Array} - the properly ordered list of choises lists objects
   */

  function order(data) {
    // NOTE: we assume the root node is 0
    const ROOT_NODE = 0;

    // build the choises list tree
    const tree = getChildren(data, ROOT_NODE);

    // return a flattened tree (in order)
    return flatten(tree);
  }

  /**
   * @method getChildren
   *
   * @description
   * This method builds a tree data structure of Choises lists and children of a
   * specified parentId.
   *
   * @returns {Array} - an array of children
   */
  function getChildren(data, parentId) {
    // base case: There are no child Choises list
    if (data.length === 0) { return null; }

    // returns all List where the parent is the
    // parentId
    const children = data.filter(handleParent);

    // recursively call getChildren on all child accounts
    // and attach them as childen of their parent account
    children.forEach(handleChildren);

    function handleParent(choiseList) {
      return choiseList.parent === parentId;
    }

    function handleChildren(choiseList) {
      choiseList.children = getChildren(data, choiseList.id);
    }

    return children;
  }

  /**
   * @method flatten
   *
   * @description
   * Flattens a tree data structure (must have `children` property) in place.
   *
   * @returns {Array} - the flattened array
   */
  function flatten(_tree, _depth) {
    const tree = _tree || [];
    let depth = (!angular.isDefined(_depth) || Number.isNaN(_depth)) ? -1 : _depth;
    depth += 1;

    function handleTreeLevel(array, node) {
      const items = [node].concat(node.children ? flatten(node.children, depth) : []);
      node.$$treeLevel = depth;
      return array.concat(items);
    }

    return tree.reduce(handleTreeLevel, []);
  }

  return service;
}
