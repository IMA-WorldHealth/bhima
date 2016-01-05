// server/lib/store.js
// the data store, similar to Dojo's Memory Store.
module.exports = function Store(options) {
  'use strict';

  // globals
  options = options || {};
  this.index = {};
  this.data = [];

  // locals
  var identifier = options.identifier || 'id'; // id property

  // set an array of data
  this.setData = function (data) {
    var index = this.index = {};
    this.data = data;

    for (var i = 0, l = data.length; i < l; i += 1) {
      index[data[i][identifier]] = i;
    }
  };

  // constructor function
  var self = this;
  (function contructor () {
    for (var k in options) {
      self[k] = options[k];
    }
    // set data if it is defined
    if (options.data) { self.setData(options.data); }
  })();

  // get an item from the local store
  this.get = function (id) {
    return this.data[this.index[id]];
  };

  // put is for UPDATES
  this.put = function (object, opts) {
    var data = this.data,
        index = this.index,
        id = object[identifier] = (opts && 'id' in opts) ? opts.id : identifier in object ?  object[identifier] : false;

    // merge or overwrite
    if (opts && opts.overwrite) {
      data[index[id]] = object; // overwrite
    } else {
      var ref = data[index[id]] || {};
      for (var k in object) {
        ref[k] = object[k]; // merge
      }
    }
  };

  // post is for INSERTS
  this.post = function (object, opts) {

    var data = this.data,
        index = this.index,
        id = object[identifier] = (opts && 'id' in opts) ? opts.id : identifier in object ?  object[identifier] : Math.random();
    index[id] = data.push(object) - 1;
  };

  this.remove = function (id) {
    var data = this.data,
        index = this.index;

    if (id in index) {
      data.splice(index[id], 1);
      this.setData(data);
    }
  };

  this.contains = function (id) {
    // check to see if an object with
    // this id exists in the store.
    return !!this.get(id);
  };

  this.recalculateIndex = function () {
    var data = this.data, index = this.index;
    for (var i = 0, l = data.length; i < l; i += 1) {
      index[data[i][identifier]] = i;
    }
  };
};
