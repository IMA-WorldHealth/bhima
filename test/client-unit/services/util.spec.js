/* jshint expr: true */
/* global inject, expect */
describe('util', function () {
  'use strict';

  let util;

  beforeEach(module('angularMoment', 'bhima.services'));


  beforeEach(inject(_util_=> {
    util= _util_;
  }));

  it('#unwrapHttpResponse() returns only object data', () => {
    const data = { headers : [ 1, 2, 3], data : {o : 1}, other : y => y + 1 };

    const result = util.unwrapHttpResponse(data);
    expect(result).to.have.keys('o');
    expect(result.o).to.equal(1);
  });

  it('#once() should only call a function once', () => {
    let fn = util.once((x) => x + 1);

    // the result of the function shouldn't change
    expect(fn(1)).to.be.equal(2);
    expect(fn(10)).to.be.undefined;
    expect(fn('some string')).to.be.undefined;

    // you should be able to pass in a context to use as this
    const context = { y : 0 };
    fn = util.once(function () {
      this.y = this.y + 3;
    }, context);

    fn();
    expect(context).to.deep.equal({ y : 3 });

    // repeated calls do no affect the results
    fn();
    fn();
    fn();
    fn();
    fn();
    expect(context).to.deep.equal({ y : 3 });
  });

  it('#before() should call a function when a target method is called', () => {

    const api = {
      x : z => Math.pow(z, 2),
      y : z => z / 2
    };

    let input;
    util.before(api, 'x', function (args) {
      input = args;
    });

    api.x(2);
    expect(input).to.be.equal(2);
  });

  it('#after() should call a function when a target method is called', () => {

    const api = {
      x : z => Math.pow(z, 2),
      y : z => z / 2
    };

    let input;
    util.after(api, 'y', function (args) {
      input = args;
    });

    api.y(2);
    expect(input).to.be.equal(2);
  });
});
