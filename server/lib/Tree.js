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

/**
 * @function buildTreeFromArray
 *
 * @description
 * This function makes a tree data structure from a properly formatted array.
 */
function buildTreeFromArray(nodes, parentId, parentKey) {
  debug(`#builtTreeFromArray() called with (Array(${nodes.length}), ${parentId}, ${parentKey}.`);

  // recursion base-case:  return nothing if empty array
  if (nodes.length === 0) { return null; }

  // find nodes which are the children of parentId
  const children = nodes.filter(node => node[parentKey] === parentId);

  // recurse - for each child node, compute their child-trees using the same
  // buildTreeFromArray() command
  children.forEach(node => {
    node.children = buildTreeFromArray(nodes, node.id, parentKey);
  });

  // return the list of children
  return children;
}

/**
 * @function flatten
 *
 * @description
 * Operates on constructed trees which have "children" attributes holding all
 * child nodes.  It computes the depth of the node and affixes it to the child
 * node.  This function is recursive.
 *
 * @param {Array} tree - tree structure created by the tree constructor
 * @param {Number} depth - depth attribute
 * @param {Boolen} pruneChildren - instructs the function to remove children
 */
function flatten(tree, depth, pruneChildren = true) {
  let currentDepth = (Number.isNaN(depth) || _.isUndefined(depth)) ? -1 : depth;
  currentDepth += 1;

  return tree.reduce((array, node) => {
    node.depth = currentDepth;
    const items = [node].concat(node.children ?
      flatten(node.children, currentDepth, pruneChildren) : []);

    if (pruneChildren) { delete node.children; }

    return array.concat(items);
  }, []);
}

/**
 * @function sumOnProperty
 *
 * @description
 * Computes the value of all parent nodes in the tree as the sum of the values
 * of their children for a given property.
 */
function sumOnProperty(node, prop) {
  if (hasChildren(node)) {
    // recursively compute the value of node[prop] by summing all child[prop]s
    node[prop] = node.children.reduce((value, child) =>
      value + sumOnProperty(child, prop), 0);
  }

  return node[prop];
}

function hasChildren(node) {
  return node.children.length > 0;
}

function markNodeToPrune(node, fn) {
  if (hasChildren(node)) {
    node.children.forEach(child => markNodeToPrune(child, fn));
  }

  if (fn(node)) {
    node._toPrune = true;
  }
}

class Tree {
  constructor(data = [], options = {
    parentKey : 'parent',
    rootId : 0,
  }) {
    this._data = data;

    this._parentKey = options.parentKey;
    this._rootId = options.rootId;


    // build the tree with the provided root id and parentKey
    this._tree = buildTreeFromArray(_.cloneDeep(data), this._rootId, this._parentKey);

    debug(`#constructor() built tree with ${this._data.length} nodes.`);
  }

  prune(fn) {
    debug('#prune() called on tree strucure.');
    // walk down the tree, marking nodes to be pruned.
    this._tree.forEach(node => markNodeToPrune(node, fn));

    const prev = this.toArray();
    const pruned = prev.filter(node => !node._toPrune);

    debug(`#prune() removed ${prev.length - pruned.length} nodes from the tree`);

    // return an array missing the pruned values
    return pruned;
  }

  toArray() {
    return flatten(this._tree);
  }

  sumOnProperty(prop) {
    this._tree.forEach(node => {
      sumOnProperty(node, prop);
    });
  }


  filterByLeaf(prop, value) {
    // set the property of the child to the parent up to the top
    this._tree.forEach(node => {
      this.interate(node, prop, value, this._tree);
    });
    // let filter tree now
    const data = this.toArray().filter(row => {
      return row[prop] === value;
    });
    this._data = data;
    this._tree = buildTreeFromArray(_.cloneDeep(data), this._rootId, this._parentKey);
  }

  // set the child's property to parent recursively up to the top
  setPropertyToParent(node, prop, value) {
    node[prop] = value;
    if (node.parentNode) {
      this.setPropertyToParent(node.parentNode, prop, value);
    }
  }

  // walk arround the tree
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

module.exports = Tree;
