/* jshint expr: true */
/* global inject, expect */
describe.skip('PoolStore', function () {
  'use strict';

  let PS;
  const data = [{
    id: 1,
    name: 'Bob'
  }, {
    id: 2,
    name: 'Sarah'
  }];

  beforeEach(() => {
    module('bhima.services');
  });

  beforeEach(inject((_PoolStore_) => {
    let PoolStore = _PoolStore_;
    PS = new PoolStore('id', data);
  }));

  it('retrieve items stored in it', () => {

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

  it('returns free items to the pool', () => {
    let bob = PS.use(1);
    expect(bob.id).to.equal(1);

    let dup = PS.use(1);
    expect(dup).to.be.undefined;

    // return bob to the pool
    PS.free(1);

    let bobAgain = PS.use(1);
    expect(bobAgain.id).to.equal(1);
  });
});

