/* global inject, expect */
describe('Store', function () {
  'use strict';

  let Store;
  let data;

  beforeEach(module('bhima.services'));

  beforeEach(inject(_Store_ => {
    Store = _Store_;
    data = [
      { id: 1, name: 'Bob' },
      { id: 2, name: 'Sarah' }
    ];
  }));

  it('constructs a store', () => {
    let defaultStore = new Store();
    let customStore = new Store({ identifier : 'x' });
    let dataStore = new Store({ data : [{ id : 1 }] });

    expect(defaultStore.identifier).to.equal('id');
    expect(defaultStore.data).to.be.empty;

    expect(customStore.identifier).to.equal('x');
    expect(customStore.data).to.be.empty;

    expect(dataStore.data).to.have.length(1);
  });

  it('#setData() sets data in a store', () => {
    let emptyStore = new Store();

    emptyStore.setData(data);
    expect(emptyStore.data).to.have.length(2);

    emptyStore.setData([]);
    expect(emptyStore.data).to.have.length(0);
  });


  it('#get() retrieves items stored in it', () => {
    let store = new Store({ data : data });

    let bob = store.get(1);
    expect(bob.id).to.equal(1);
    expect(bob.name).to.equal('Bob');

    let sarah = store.get(2);
    expect(sarah.id).to.equal(2);
    expect(sarah.name).to.equal('Sarah');

    // set new data
    store.setData([{ id : 1, name : 'Marshall' }]);

    let marshall = store.get(1);
    expect(marshall.name).to.equal('Marshall');

    // store should give undefined if the id does not exist
    let nonexistant = store.get(2);
    expect(nonexistant).to.be.undefined;
  });

  it('#remove() removes items stored in it', () => {
    let store = new Store({ data : data });
    expect(store.data).to.have.length(2);

    let sarah = store.get(2);
    expect(sarah.id).to.equal(2);
    expect(sarah.name).to.equal('Sarah');

    // remove Sarah
    store.remove(2);
    expect(store.data).to.have.length(1);
    let nonexistant = store.get(2);
    expect(nonexistant).to.be.undefined;

    // should be able to remove all data
    store.remove(1);
    expect(store.data).to.have.length(0);

    // if an undefined id is attempted to be remove, fail silently
    store.remove(undefined);
    expect(store.data).to.have.length(0);
  });

  it('#post() adds items to the store', () => {
    let store = new Store({ data : data });
    expect(store.data).to.have.length(2);

    // add another item
    let benjamin = { id : 3, name : 'Benjamin' };
    store.post(benjamin);
    expect(store.data).to.have.length(3);
    expect(store.get(3)).to.eql(benjamin);

    // add an item without an id should throw an error
    try {
      store.post({ name : 'Error' });
    } catch (error) {
      expect(error).to.be.defined;
    }
  });

  it('#contains() reflects stores contents', () => {
    let store = new Store({ data : data });
    expect(store.data).to.have.length(2);

    // check the validity of the items
    expect(store.contains(1)).to.be.true;
    expect(store.contains(3)).to.be.false;

    // flip the boolean results from above
    store.remove(1);
    store.post({ id : 3, name : 'Bill' });

    // assert that they flipped
    expect(store.contains(1)).to.be.false;
    expect(store.contains(3)).to.be.true;

    // make sure setData also clears the store
    store.setData([]);
    expect(store.contains(1)).to.be.false;
    expect(store.contains(3)).to.be.false;
  });

  it('#clear() removes all data from the store', () => {
    let store = new Store({ data : data });
    expect(store.data).to.have.length(2);

    store.clear();
    expect(store.data).to.have.length(0);
    expect(store.contains(1)).to.be.false;
    expect(store.contains(2)).to.be.false;
    expect(store.contains(3)).to.be.false;

    store.post({ id : 1 });
    expect(store.data).to.have.length(1);
    expect(store.contains(1)).to.be.true;
  });
});
