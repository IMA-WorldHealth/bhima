angular.module('bhima.services')
.service('precision', function () {
  var dflt_precision = 4,
      dflt_scalar = 1000,
      self = this;

  this.add = function add(n, m) {
    return self.round(n + m);
  };

  this.round = function round(n, p) {
    // round [fn]
    //
    // round takes in a number, n, and a precision, p,
    // returning the same number as a float to the
    // decimal percision p.
    if (!p) { p = dflt_precision; }
    return parseFloat(n.toFixed(p));

  };

  this.scale = function scale(n, s) {
    // scale [fn]
    //
    // scale scales a number by a default scalar
    // to avoid javascript rounding errors
    return n * (s || dflt_scalar);
  };

  this.unscale = function unscale(n, s) {
    // unscale [fn]
    //
    // unscale reduces a number by a default scalar
    // to revert scaled values to the origin metric
    return n / (s || dflt_scalar);
  };

  this.compare = function compare(n, m) {
    // compare [fn]
    //
    // compare is an extremely precise way to compare
    // the discrepancy between two numbers.  Returns a
    // float of the difference between the two numbers
    var _n = self.scale(n, 100000);
    var _m = self.scale(m, 100000);
    var discrepancy = self.round(_n - _m);
    return self.unscale(discrepancy, 100000);
  };

  this.sum = function sum (list) {
    return list.reduce(self.add, 0);
  };

});
