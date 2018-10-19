angular.module('bhima.controllers')
  .controller('RolesPermissionsController', RolesPermissionsController);

RolesPermissionsController.$inject = [
  'data', '$uibModalInstance', 'RolesService', 'NotifyService', 'Tree', '$q',
];

/**
 * @function RolesPermissionController
 *
 * @description
 * Powers the modal that assigns units to roles.
 */
function RolesPermissionsController(data, ModalInstance, Roles, Notify, Tree, $q) {
  const vm = this;

  vm.role = angular.copy(data);

  vm.close = ModalInstance.dismiss;
  vm.toggleNode = toggleNode;

  vm.submit = submit;

  const TreeNodes = new Map();
  const ROOT_NODE_ID = 0;

  function startup() {
    $q.all([Tree.all(), Roles.unit(vm.role.uuid)])
      .then(([tree, assignedUnits]) => {
        const root = tree.getRootNode();
        Tree.sortByTranslationKey(root.children);

        // set the virtual root node
        TreeNodes.set(root.id, root);

        // create a map of unit ids -> units
        createNodeMapRecursive(root.children, 1);

        // check each node that should be checked by default
        assignedUnits.forEach(unit => {
          const node = TreeNodes.get(unit.id);
          node.checked = true;
        });

        vm.tree = root.children;
      });
  }


  /**
   * @function createNodeMapRecursive
   *
   * @param {Array} units - the units sent back from the database, arranged in a
   *   tree  format.
   * @param {Number} depth - the depth of tree units
   *
   */
  function createNodeMapRecursive(units, depth) {
    if (!units || !units.length) { return; }

    units.forEach(unit => {
      // depth is computed to render nodes indented
      unit.depth = depth;

      // default all units for not checked
      unit.checked = false;

      TreeNodes.set(unit.id, unit);
      createNodeMapRecursive(unit.children, depth + 1);
    });
  }

  // helper function to figure out if a node has children
  function isParentNode(node) {
    return node.children && node.children.length > 0;
  }

  /**
   * @function toggleNode
   *
   * @description
   * Provides an external binding for the setNodeValue() function.
   */
  function toggleNode(id, isChecked) {
    setNodeValue(id, isChecked);
  }

  /**
   * @function setNodeValue
   *
   * @param {Number} id - the id of the node to set
   * @param {Boolean} isChecked - a boolean value to set the node to
   *
   * @description
   * This function sets a node's value to the isChecked parameter.  It also sets
   * any children to the same value if it is a parent node.  Finally, it will
   * check to make sure the parent is automatically checked if needed.
   */
  function setNodeValue(id, isChecked) {
    const node = TreeNodes.get(id);

    // set the value of the node to isChecked
    node.checked = isChecked;

    // recursively update all child nodes.
    if (isParentNode(node)) {
      node.children.forEach(child => setNodeValue(child.id, isChecked));
    }

    // make sure the parent is toggled if all children are toggled
    if (node.id !== ROOT_NODE_ID) {
      updateParentNodeCheckedState(node.parent);
    }
  }

  /**
   * @function updateParentNodeCheckedState
   *
   * @description
   * This function will check the parent node if some child is checked.
   * Otherwise, the parent will be unchecked.
   *
   * @param {Number} parentId - the id of a node in the tree
   */
  function updateParentNodeCheckedState(parentId) {
    const node = TreeNodes.get(parentId);

    // check if every child node is checked
    const isChecked = node.children.some(child => child.checked);
    node.checked = isChecked;
  }

  function submit() {
    // gather all ids
    const ids = Array.from(TreeNodes.values())
      .filter(node => node.checked)
      .map(node => node.id);

    const params = {
      role_uuid : vm.role.uuid,
      unit_ids : ids,
    };

    return Roles.affectPages(params)
      .then(() => {
        Notify.success('FORM.LABELS.PERMISSION_ASSIGNED_SUCCESS');

        // modal action was a success `close` will return correctly
        ModalInstance.close();
      })
      .catch(Notify.handleError);
  }

  startup();
}
