const template = `
<div data-bh-checkbox-tree>

  <div class="checkbox">
    <label>
      <input type="checkbox" ng-model="$ctrl.root._checked" ng-change="$ctrl.setNodeValue($ctrl.root.id, $ctrl.root._checked)" />
      <strong class="text-capitalize" data-root-node translate>FORM.LABELS.CHECK_ALL</strong>
    </label>
  </div>

  <div ng-repeat="node in $ctrl.root.children track by node.id">
    <div class="checkbox">
      <label>
        <input type="checkbox" ng-model="node._checked" ng-change="$ctrl.setNodeValue(node.id, node._checked)" />
        <span ng-class="{ 'text-bold' : node.children.length }" data-label="{{node._label}}" translate>{{node._label}}</span>
      </label>
    </div>

    <ul style="margin-left: calc({{node.depth}} * 15px)" class="list-unstyled">
      <li ng-repeat="child in node.children track by child.id">
        <div class="checkbox">
          <label>
            <input type="checkbox" ng-model="child._checked" ng-change="$ctrl.setNodeValue(child.id, child._checked)" />
            <span data-label="{{child._label}}" translate>{{child._label}}</span>
          </label>
        </div>
      </li>

      <ul style="margin-left: calc({{child.depth}} * 15px)" class="list-unstyled">
        <li ng-repeat="grandchild in child.children track by grandchild.id">
          <div class="checkbox">
            <label>
              <input type="checkbox" ng-model="grandchild._checked" ng-change="$ctrl.setNodeValue(grandchild.id, grandchild._checked)" />
              <span data-label="{{grandchild._label}}" translate>{{grandchild._label}}</span>
            </label>
          </div>
        </li>
      </ul>
    </ul>
  </div>
</div>`;

angular.module('bhima.components')
  .component('bhCheckboxTree', {
    template,
    controller  : bhCheckboxTreeController,
    bindings    : {
      data : '<',
      checkedIds : '<?',
      onChange : '&',
      idKey : '@?',
      labelKey : '@?',
      parentKey : '@?',
      isFlatTree : '@?',
    },
  });

bhCheckboxTreeController.$inject = ['TreeService'];

function bhCheckboxTreeController(Tree) {
  const $ctrl = this;

  const DEFAULT_ID_KEY = 'id';
  const DEFAULT_LABEL_KEY = 'label';
  const DEFAULT_PARENT_KEY = 'parent';

  $ctrl.$onInit = () => {
    $ctrl.idKey = $ctrl.idKey || DEFAULT_ID_KEY;
    $ctrl.labelKey = $ctrl.labelKey || DEFAULT_LABEL_KEY;
    $ctrl.parentKey = $ctrl.parentKey || DEFAULT_PARENT_KEY;

    if ($ctrl.data) {
      buildTree($ctrl.data);
    }
  };

  $ctrl.$onChanges = (changes) => {
    if (changes.data && changes.data.currentValue) {
      buildTree(changes.data.currentValue);
    }
  };

  function buildTree(array = []) {
    const data = [...array];

    // make easier template labels and default values to checked is false
    data.forEach(node => {
      node._label = node[$ctrl.labelKey];
      node._checked = false;

      // work on flat arrays by faking a tree
      if ($ctrl.isFlatTree) { node[$ctrl.parentKey] = 0; }
    });

    // create the tree
    $ctrl.tree = new Tree(data, { parentKey : $ctrl.parentKey, rootId : 0 });
    $ctrl.root = $ctrl.tree.getRootNode();

    // compute node depths
    $ctrl.tree.walk(Tree.common.computeNodeDepth);

    // ensure that checked ids are an array
    if (!Array.isArray($ctrl.checkedIds)) {
      return;
    }

    // ensure that the mask is a cloned array
    const mask = [...$ctrl.checkedIds];

    // initially, we won't use setNodeValue since we just want to make those as checked
    // that the mask sets as checked, not parent/child nodes.
    mask
      .filter(id => id !== $ctrl.root.id)
      .forEach(id => {
        const node = $ctrl.tree.find(id);
        node._checked = true;
      });
  }

  /**
   * @function getCheckedNodes
   *
   * @description
   * Called on every toggle to recompile the list of checked nodes.  It calls
   * the callback with the list of checked nodes.
   *
   */
  function getCheckedNodes() {
    const checked = [];
    $ctrl.tree.walk(node => { if (node._checked) { checked.push(node.id); } });

    // toggle the root node if all child nodes are checked
    $ctrl.root._checked = checked.length === $ctrl.data.length;

    // fire the callback.
    $ctrl.onChange({ data : checked });
  }

  // helper function to figure out if a node has children
  function isParentNode(node) {
    return node.children && node.children.length > 0;
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
  $ctrl.setNodeValue = setNodeValue;
  function setNodeValue(id, isChecked) {
    const node = $ctrl.tree.find(id);

    // set the value of the node to isChecked
    node._checked = isChecked;

    // recursively update all child nodes.
    if (isParentNode(node)) {
      node.children.forEach(child => setNodeValue(child.id, isChecked));
    }

    // make sure the parent is toggled if all children are toggled
    if (!$ctrl.tree.isRootNode(node)) {
      updateParentNodeCheckedState(node.parent);
    }

    getCheckedNodes();
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
    const node = $ctrl.tree.find(parentId);

    // the state root node cannot be set by this function since it is
    // only set if _all_ underlying nodes are true.  That check is performed
    // in the getCheckedNodes() function.
    if ($ctrl.tree.isRootNode(node)) { return; }

    // check if every child node is checked
    const isChecked = node.children.some(child => child._checked);
    node._checked = isChecked;
  }

}
