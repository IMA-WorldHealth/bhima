angular.module('bhima.services')
.factory('appstate', function () {
  //TODO Use promise structure over callbacks, used throughout the application and enables error handling
  var store = {},
      queue = {};

  function set(storeKey, value) {
    store[storeKey] = value;
    executeQueue(storeKey);
  }

  function get(storeKey) {
    return store[storeKey];
  }

  function register(storeKey, callback) {
    var requestedValue = store[storeKey];
    var queueReference = queue[storeKey] = queue[storeKey] || [];

    if(requestedValue) {
      callback(requestedValue);
      return;
    }
    queueReference.push({callback: callback});
  }

  function executeQueue(storeKey) {
    var queueReference = queue[storeKey];
    if(queueReference) {
      queueReference.forEach(function(pendingRequest) {
        pendingRequest.callback(store[storeKey]);
      });
    }
  }

  return {
    get : get,
    set : set,
    register : register
  };
});
