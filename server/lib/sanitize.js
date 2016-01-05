// lib/util/sanitize.js

// FIXME
//    These are mostly duplicates of util.js.  Remove them from here and
//    inject util.js into the application where it is needed.
module.exports = {

  // this is not incredibly secure
  escapeid : function (id) { return ['`', id, '`'].join(''); },
  
  escape: function (str) { return '"' + String(str).replace(/"/g, '\\"') + '"'; },

  isInt : function (n) { return (Math.floor(n) === Number(n)); },

  isIn : function (s) {  return String(s).indexOf('(') > -1; },

  isFloat : function (f) { return parseFloat(f) !== undefined && f.toString().indexOf('.') > -1; },

  // this also works for hexadecimal ('0x12')
  isNumber: function (n) { return !Number.isNaN(Number(n)); },

  isArray: function (arr) { return Object.prototype.toString.call(arr) === '[object Array]'; },

  isString: function (str) { return typeof str === 'string'; },

  isObject: function (obj) { return Object.prototype.toString.call(obj) === '[object Object]'; },

  // is there a better way to do this?
  isUndefined : function (u) { return u === undefined; },
  
  isDefined : function (u) { return !this.isUndefined(u); }

};
