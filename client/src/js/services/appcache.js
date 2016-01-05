angular.module('bhima.services')
.factory('appcache', ['$rootScope', '$q', '$localForage', function ($rootScope, $q, $localForage) {

  // default driver is indexedDB
  var defaultDriver = 'asyncStorage';

  function LFWrapper (name) {
    this.namespace = name;
    // TODO : This is acceptable, but not pretty. Is there a way to find
    // out if a namespace exists without actually throwing an error?
    try {
      this._storage = $localForage.instance(name);
    }
    catch(err) {
      this._storage = $localForage.createInstance({
        name : name,
        driver : defaultDriver
      });
    }
  }

  function convertToNumber(n) {
    var cn = Number(n);
    return Number.isNaN(cn) ? n : cn;
  }

  LFWrapper.prototype.fetchAll = function () {
    var storage = this._storage,
        namespace = this.namespace;

    return storage.keys()
      .then(function (keys) {
        return $q.all(keys.map(function (k) {
          return storage.getItem(k)
          .then(function (value) {
            return angular.extend(value, {
              key : convertToNumber(k),
              namespace : namespace
            });
          });
        }));
      })
      .then(function (values) {
        return values;
      });
  };

  LFWrapper.prototype.put = function (key, value) {
    return this._storage.setItem(key, value);
  };

  LFWrapper.prototype.fetch = function (key) {
    return this._storage.getItem(key);
  };

  LFWrapper.prototype.remove = function (key) {
    return this._storage.removeItem(key);
  };

  return LFWrapper;
}]);

