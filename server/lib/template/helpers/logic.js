const fs = require('fs');
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

// between
function between(a, b, c, options) {
  if (a >= b && a <= c) {
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

// test inequality
function inequal(a, b, options) {
  if (a !== b) {
    return options.fn(this);
  }
  return options.inverse(this);
}

// test File Exit
function fileExist(a, b, options) {
  try {
    fs.statSync(`${a}${b}`);
    return options.fn(this);

  } catch (err) {
    return options.inverse(this);
  }
}

exports.equal = equal;
exports.gt = gt;
exports.lt = lt;
exports.between = between;
exports.ignoreNan = ignoreNan;
exports.inequal = inequal;
exports.fileExist = fileExist;
