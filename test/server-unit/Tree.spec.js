const Tree = require('../../server/lib/Tree');
const { expect } = require('chai');

function TreeUnitTests() {
  /*
   *  This tree looks like this:
   *            ROOT
   *         /    |    \
   *       id:1  id:4  id:6
   *       /             \
   *    id:2            id:3
   *     /
   *   id:5
   */
  const nodes = [{
    id : 1,
    parent : 0,
  }, {
    id : 2,
    parent : 1,
  }, {
    id : 3,
    parent : 6,
  }, {
    id : 4,
    parent : 0,
  }, {
    id : 5,
    parent : 2,
  }, {
    id : 6,
    parent : 0,
  }];

  it('#constructor() should populate private variables', () => {
    const tree = new Tree(nodes);
    expect(tree._data).to.deep.equal(nodes);
    expect(tree._tree).to.not.be.undefined;
  });

  it('#constructor() should not have side-effects', () => {
    const cloned = JSON.parse(JSON.stringify(nodes));
    const tree = new Tree(nodes);
    expect(tree._data).to.deep.equal(cloned);
  });

  it('#constructor() node id:0 should have three childen', () => {
    const tree = new Tree(nodes)._tree;
    expect(tree).to.have.length(3);
  });

  it('#constructor() nodes should all have "children" arrays', () => {
    const tree = new Tree(nodes)._tree;
    tree.forEach(node => {
      expect(node).to.have.property('children');
      expect(node.children).to.be.an('array');
    });
  });

  it('#constructor() node id:4 should not have any children', () => {
    const tree = new Tree(nodes)._tree;
    const node4 = tree[1];
    expect(node4.id).to.equal(4);
    expect(node4.children).to.have.length(0);
  });

  it('#constructor() node id:6 should have one child', () => {
    const tree = new Tree(nodes)._tree;
    const node6 = tree[2];
    expect(node6.id).to.equal(6);
    expect(node6.children).to.have.length(1);
  });

  it('#toArray() should return an array', () => {
    const array = new Tree(nodes).toArray();
    expect(array).to.be.an('array');
  });

  it('#toArray() should populate the "depth" key on all nodes', () => {
    const array = new Tree(nodes).toArray();
    array.forEach(node => {
      expect(node).to.have.property('depth');
    });
  });
}

describe('Tree.js', TreeUnitTests);
