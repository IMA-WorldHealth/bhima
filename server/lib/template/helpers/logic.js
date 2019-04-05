const util = require('../../util');
// test equality
function equal(a, b, options) {
  if (a === b) {
    return options.fn(this);
  }
  return options.inverse(this);
}

// great than
function gt(a, b, options) {
  if (a >= b) {
    return options.fn(this);
  }
  return options.inverse(this);
}

// less than
function lt(a, b, options) {
  if (a < b) {
    return options.fn(this);
  }
  return options.inverse(this);
}

function ignoreNan(val, symbol) {
  const isNumber = (val >= 0 || val < 0);
  return isNumber ? `${util.roundDecimal(val, 2)} ${symbol}` : '';
}

exports.equal = equal;
exports.gt = gt;
exports.lt = lt;
exports.ignoreNan = ignoreNan;
