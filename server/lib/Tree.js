/**
 * @class Tree
 *
 * @description
 * This file contains the generic class definition of a tree. A tree is defined
 * as an array of JSON objects having a parent key referring to another member
 * of the array.  The only exception is the root node, which does not need to be
 * in the tree.
 */
const _ = require('lodash');
const debug = require('debug')('TreeBuilder');


class Tree {
  constructor(data = [], options = {
    parentKey : 'parent',
    rootId : 0,
  }) {
    this._parentKey = options.parentKey;
    this._rootNode = {
      id : options.rootId,
    };

    // build the tree with the provided root id and parentKey
    this._rootNode.children = this.buildTreeFromArray(_.cloneDeep(data));
    this.buildNodeIndex();

    // build a node index

    debug(`#constructor() built tree with ${data.length} nodes.`);
  }

  buildTreeFromArray(nodes, parentId = this._rootNode.id) {
    debug(`#builtTreeFromArray() called with (Array(${nodes.length}), ${parentId}).`);

    // recursion base-case:  return nothing if empty array
    if (nodes.length === 0) { return null; }

    // find nodes which are the children of parentId
    const children = nodes.filter(node => node[this._parentKey] === parentId);

    // recurse - for each child node, compute their child-trees using the same
    // buildTreeFromArray() command
    children.forEach(node => {
      node.children = this.buildTreeFromArray(nodes, node.id);
    });

    // return the list of children
    return children;
  }

  buildNodeIndex() {
    this._nodeIndex = {};
    this.walk(node => {
      this._nodeIndex[node.id] = node;
    });
  }

  prune(fn) {
    debug('#prune() called on tree structure.');

    const markNodeToPruneFn = (node) => {
      node._toPrune = fn(node);
    };

    this.walk(childNode => markNodeToPruneFn(childNode));

    const prev = this.toArray();
    const pruned = prev.filter(node => !node._toPrune);

    debug(`#prune() removed ${prev.length - pruned.length} nodes from the tree`);

    // return an array missing the pruned values
    return pruned;
  }

  toArray() {
    const array = [];
    this.walk((node) => array.push(node));
    return array;
  }

  /**
   * @method isRootNode
   *
   * @description
   * Returns true if the node is the root node.
   *
   * @param node {Object} - a tree node to compare.
   */
  isRootNode(node) {
    return node.id === this._rootNode.id;
  }

  /**
   * @method find
   *
   * @description
   * Gets a node by its id.
   */
  find(id) {
    return this._nodeIndex[id];
  }

  /**
   * @method walk
   *
   * @description
   * Internal method to be used to walk through children, calling a function on
   * each child.  The caller can walk around the tree, calling a passed function
   * on either the ascending or the descending step.
   *
   * @param fn {Function} - the function to call for each node in the tree
   * @param callFnBeforeRecurse {Boolean} - specify whether to call the function
   * on the descending or ascending direction of the recursion.  The descending
   * direction is before recursing through the children.  The ascending direction
   * is after all children have been looped through.
   * @param currentNode {Object} - the current node in the walk.
   * @param parentNode {Object} - the parent of the current node in the walk.
   */
  walk(fn, callFnBeforeRecurse = true, currentNode = this._rootNode, parentNode = null) {
    debug('#walk() called on tree structure.');
    const callFnAfterRecurse = !callFnBeforeRecurse;

    const recurse = () =>
      currentNode.children.forEach(childNode =>
        this.walk(fn, callFnBeforeRecurse, childNode, currentNode));

    // if we start as the root node, then descend immediately.
    if (this.isRootNode(currentNode)) {
      recurse();
      return;
    }

    // if we are supposed to call the function before recursion, we do that now
    if (callFnBeforeRecurse) {
      fn(currentNode, parentNode);
    }

    // recursive step: walk through children
    recurse();

    // if we are supposed to call the function after recursion, now is the time
    if (callFnAfterRecurse) {
      fn(currentNode, parentNode);
    }
  }

  filterByLeaf(prop, value) {
    // set the property of the child to the parent up to the top
    this.rootNode.children.forEach(node => {
      this.interate(node, prop, value, this._rootNode);
    });

    // let filter tree now
    const data = this.toArray().filter(row => row[prop] === value);

    this.rootNode.children = this.buildTreeFromArray(data);
    this.buildNodeIndex();
  }

  // set the child's property to parent recursively up to the top
  setPropertyToParent(node, prop, value) {
    node[prop] = value;
    if (node.parentNode) {
      this.setPropertyToParent(node.parentNode, prop, value);
    }
  }

  // walk around the tree
  // search the node by property's value
  interate(node, prop, value, parent) {
    node.parentNode = parent;

    if (node[prop] === value && !parent[prop]) {
      this.setPropertyToParent(parent, prop, value);
    }

    if (node.children) {
      node.children.forEach(child => {
        this.interate(child, prop, value, node);
      });
    }

    delete node.parentNode;
  }
}

// common functions used throughout the application.
Tree.common = {
  computeNodeDepth : (currentNode, parentNode) => {
    currentNode.depth = (parentNode.depth || 0) + 1;
  },

  sumOnProperty : (property, defaultValue = 0) =>
    (currentNode, parentNode) => {
      parentNode[property] =
        (parentNode[property] || defaultValue) + currentNode[property];
    },
};

module.exports = Tree;
