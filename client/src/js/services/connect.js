angular.module('bhima.services')
.factory('connect', ConnectFactory);

ConnectFactory.$inject = [
  '$http', '$q', 'Store',
];

function ConnectFactory($http, $q, Store) {
  // Summary:
  //  provides an interface between angular modules (controllers) and a HTTP server. Requests are fetched, packaged and returned
  //  as 'models', objects with indexed data, get, delete, update and create functions, and access to the services scope to
  //  update the server.

  //  TODO : set flag for automatically flushing model updates to server
  //  TODO : All calls to the server should be ?q={} rather than ?{} for easy parsing

  function req(defn, stringIdentifier) {
    //summary:
    //  Attempt at a more more managable API for modules requesting tables from the server, implementation finalized
    //
    //  defn should be an object like
    //  defn =  {
    //    identifier : 'id',
    //    tables : {
    //      'account' : {
    //        columns: [ 'enterprise_id', 'id', 'locked', 'account_text']
    //      },
    //      'account_type' : {
    //        columns: ['type']
    //      }
    //    },
    //    join: ['account.type_id=account_type.id'],
    //    where: ['account.enterprise_id=101']
    //  };
    //
    //  where conditions can also be specified:
    //    where: ['account.enterprise_id=101', 'AND', ['account.id<100', 'OR', 'account.id>110']]
    var query;

    query = angular.isString(defn) ? defn : '/data/?q=' + JSON.stringify(defn);

    return $http.get(query)
      .then(function (res) {
        var model = new Store({
          data        : res.data,
          identifier  : defn.identifier || stringIdentifier
        });
        return $q.when(model);
      });
  }

  function fetch(defn) {
    //summary:
    //  Exactly the same as req() but now returns only
    //  data.  Think of it as a `readonly` store.
    var query;

    query = angular.isString(defn) ? defn : '/data/?q=' + JSON.stringify(defn);

    return $http.get(query)
      .then(function (res) {
        return $q.when(res.data);
      });
  }

  function put(table, data, pk) {
    var formatObject = {
      table : table,
      data  : data,
      pk    : pk
    };
    return $http
      .put('/data/', formatObject);
  }

  function post(table, data) {
    return $http
      .post('/data/', {table : table, data : data});
  }

  function del(table, column, id) {
    return $http
      .delete(['/data', table, column, id].join('/'));
  }

  // utility function
  function clean(o) {
    // clean off the $$hashKey and other angular bits and delete undefined
    var cleaned = {};
    for (var k in o) {
      if (k !== '$$hashKey' && angular.isDefined(o[k]) && o[k] !== '' && o[k] !== null) {
        cleaned[k] = o[k];
      }
    }
    return cleaned;
  }

  return {
    req         : req,
    fetch       : fetch,
    clean       : clean,
    put         : put,
    post        : post,
    delete      : del,
  };
}
