angular.module('bhima.services')
  .service('ChoicesListManagementService', ChoicesListManagementService);

ChoicesListManagementService.$inject = ['PrototypeApiService'];

/**
 * @class ChoicesListManagementService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /choices_list_management/ URL.
 */
function ChoicesListManagementService(Api) {
  const service = new Api('/choices_list_management/');

  service.formatStore = formatStore;

  function formatStore(data) {
    const storeData = order(data);
    return storeData;
  }

  /**
   * @method order
   *
   * @description
   * Creates a proper choice list ordering by first creating an choice list tree and
   * then flattening in place.
   *
   * @param {Array} lists - a list of choices lists objects
   * @returns {Array} - the properly ordered list of choices lists objects
   */

  function order(data) {
    // NOTE: we assume the root node is 0
    const ROOT_NODE = 0;

    // build the choices list tree
    const tree = getChildren(data, ROOT_NODE);

    // return a flattened tree (in order)
    return flatten(tree);
  }

  /**
   * @method getChildren
   *
   * @description
   * This method builds a tree data structure of Choices lists and children of a
   * specified parentId.
   *
   * @returns {Array} - an array of children
   */
  function getChildren(data, parentId) {
    // base case: There are no child Choices list
    if (data.length === 0) { return null; }

    // returns all List where the parent is the
    // parentId
    const children = data.filter(handleParent);

    // recursively call getChildren on all child accounts
    // and attach them as childen of their parent account
    children.forEach(handleChildren);

    function handleParent(choiceList) {
      return choiceList.parent === parentId;
    }

    function handleChildren(choiceList) {
      choiceList.children = getChildren(data, choiceList.id);
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
