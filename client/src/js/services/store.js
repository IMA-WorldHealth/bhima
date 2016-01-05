angular.module('bhima.services')
.factory('store', function () {

  return function (options, target) {

    // the data store, similar to Dojo's Memory Store.
    options = options || {};
    // globals
    this.index = {};
    this.data = {};

    // locals
    var queue = [];
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
      self.identifier = identifier;
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

      if (!id) { throw 'No id property in the object.  Expected property: ' + identifier; }

      // merge or overwrite
      if (opts && opts.overwrite) {
        data[index[id]] = object; // overwrite
      } else {
        var ref = data[index[id]];
        if (!ref) { ref = {}; }
        for (var k in object) {
          ref[k] = object[k]; // merge
        }
      }
      // enqueue item for sync
      queue.push({method: 'PUT', url: '/data/'+ target});
    };

    // post is for INSERTS
    this.post = function (object, opts) {

      var data = this.data,
          index = this.index,
          id = object[identifier] = (opts && 'id' in opts) ? opts.id : identifier in object ?  object[identifier] : Math.random();
      index[id] = data.push(object) - 1;
      // enqueue item for sync
      queue.push({method: 'POST', url: '/data/' + target, data: object});
    };

    this.remove = function (id) {
      var data = this.data,
          index = this.index;
      if (id in index) {
        data.splice(index[id], 1);
        this.setData(data);
        queue.push({method: 'DELETE', url: '/data/' + target + '/' + id});
      }
    };

    this.contains = function (id) {
      // check to see if an object with
      // this id exists in the store.
      return !!this.get(id);
    };

    /*
     *  TODO : Impliment sync when using websockets
    this.sync = function () {
      // sync the data from the client to the server
      var fail = [];
      queue.forEach(function (req) {
        $http(req)
        .success(function () {
        })
        .error(function (data, status, headers, config) {
          alert('An error in data transferred occured with status:', status);
          fail.push(req);
        });
      });
      queue = fail;
    };
    */

    this.recalculateIndex = function () {
      var data = this.data, index = this.index;
      for (var i = 0, l = data.length; i < l; i += 1) {
        index[data[i][identifier]] = i;
      }
    };

    return this;
  };
});
