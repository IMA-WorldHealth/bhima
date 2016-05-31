/* jshint expr: true */
/* global inject, expect */
describe('PoolStore', function () {
  'use strict';

  const data = [{
    id: 1,
    name: 'Bob'
  }, {
    id: 2,
    name: 'Sarah'
  }];

  let PoolStore;

  beforeEach(() => {
    module('bhima.services');
  });

  beforeEach(inject((_PoolStore_) => {
    PoolStore = _PoolStore_;
  }));

  it('#constructor() runs with sane defaults', () => {
    let PS = new PoolStore();
    expect(PS).to.be.defined;
    expect(PS.available.identifier).to.equal('id');
    expect(PS.available.data).to.have.length(0);

    PS = new PoolStore('uuid');
    expect(PS.available.identifier).to.equal('uuid');
    expect(PS.available.data).to.have.length(0);
    expect(PS.unavailable.identifier).to.equal('uuid');

    PS = new PoolStore('id', data);
    expect(PS.available.identifier).to.equal('id');
    expect(PS.available.data).to.have.length(2);
    expect(PS.unavailable.data).to.have.length(0);
  });

  it('#use() retrieves items stored in it', () => {
    let PS = new PoolStore('id', data);

    let bob = PS.use(1);
    expect(bob.id).to.equal(1);
    expect(bob.name).to.equal('Bob');

    let sarah = PS.use(2);
    expect(sarah.id).to.equal(2);
    expect(sarah.name).to.equal('Sarah');

    // cannot retrieve the same item twice
    let bobDuplicate = PS.use(1);
    expect(bobDuplicate).to.be.undefined;
  });

  it('#free() returns items to the available pool', () => {
    let PS = new PoolStore('id', data);

    let bob = PS.use(1);
    expect(bob.id).to.equal(1);

    let duplicate = PS.use(1);
    expect(duplicate).to.be.undefined;

    // return bob to the pool
    PS.free(1);

    let bobAgain = PS.use(1);
    expect(bobAgain.id).to.equal(1);
  });

  it('#size() reports the proper size', () => {
    let PS = new PoolStore('id', []);
    expect(PS.size()).to.equal(0);

    PS = new PoolStore('id', data);
    expect(PS.size()).to.equal(2);
  });
});

