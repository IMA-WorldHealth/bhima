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

/**
 * @function buildTreeFromArray
 *
 * @description
 * This function makes a tree data structure from a properly formatted array.
 */
function buildTreeFromArray(nodes, parentId, parentKey) {
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


class Tree {
  constructor(data = [], parentKey = 'parent', rootId = 0) {
    this._data = data;
    this._parentKey = parentKey;
    this._rootId = rootId;

    // build the tree with the provided root id and parentKey
    this._tree = buildTreeFromArray(_.cloneDeep(data), rootId, parentKey);
  }

  toArray() {
    return flatten(this._tree);
  }
}

module.exports = Tree;
