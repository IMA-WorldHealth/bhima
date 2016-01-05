// liberror.js
//
// This service is responsible for namespacing and both capturing
// and throwing errors.
//
// Usage:
// var httpError = liberror.namespace('HTTP');
//
// // Throw error 302
// promise.then().catch(httpError.throw(302));
//
// // or capture and try to interpret error
// promise.then().catch(httpError.capture);

angular.module('bhima.services')
.factory('liberror', ['$http', '$log', 'messenger', function ($http, $log, messenger) {
  /* jshint unused : false */

  var errorCodes = {
    0 : {
      'title' : 'Unknown Error',
      'ref'   : '0',
      'tmpl'  : 'An unknown error occured.  Server returned {0}'
    }
  };

  /*
  (function loadErrorCodes() {
    $http.get('/errorcodes')
    .success(function (data) {
      angular.extend(errorCodes, data);
    })
    .error(function (err) {
      messenger.danger(JSON.stringify(err));
    });
  })();
  */

  function CustomError (code, namespace, message) {
    var args, err = Error.call(this, message);
    err.code = code;
    err.namesace = namespace;
    args = Array.prototype.slice.call(arguments);
    err.params = args.slice(3);
    return err;
  }

  function stringify (obj) {
    if (typeof obj === 'function') {
      return obj.toString().replace(/ \{[\s\S]*$/, '');
    } else if (typeof obj === 'undefined') {
      return 'undefined';
    } else if (typeof obj !== 'string') {
      return JSON.stringify(obj);
    }
    return obj;
  }

  function templateMessage() {
    var template = arguments[0],
      templateArgs = arguments,
      message;

    message = template.replace(/\{\d+\}/g, function (match) {
      var index = +match.slice(1, -1), arg;

      if (index + 1 < templateArgs.length) {
        arg = templateArgs[index + 1];
        if (typeof arg === 'function') {
          return arg.toString().replace(/ ?\{[\s\S]*$/, '');
        } else if (typeof arg === 'undefined') {
          return 'undefined';
        } else if (typeof arg !== 'string') {
          return stringify(arg);
        }
        return arg;
      }
      return match;
    });

    return message;
  }

  function urlParseHack(url) {
    var parser = document.createElement('a');
    parser.href = url;
    return parser;
  }

  function trimUndefinedParameters(obj) {
    for (var key in obj) {
      if (!obj[key]) { delete obj[key]; }
    }
    return obj;
  }

  function queryStringParseHack(url) {
    var re, qs = {};
    re = /([^?=&]+)(=([^&]*))?/g;
    url.replace(re, function($0, $1, $2, $3) {
      qs[$1] = $3;
    });
    return trimUndefinedParameters(qs);
  }


  function compose500Error(namespace, response) {
    var isSqlError = response.data.sqlState,
      uri, params, error, status, template;

    uri = urlParseHack(response.config.url);
    params = queryStringParseHack(response.config.url);

    error = isSqlError ? errorCodes.ERR_DATABASE : errorCodes.ERR_HTTP_INTERNAL;
    status = isSqlError ? response.data.code : response.status;
    template = templateMessage(error.tmpl, status, uri.pathname);

    angular.extend(error, {
      namespace   : namespace,
      status      : response.status,
      statusText  : response.statusText,
      description : template,
      params      : params
    });

    $log.debug('Composed Error : ', error);
    return error;
  }

  return {
    namespace : function (module) {
      // AngularJS style of formatting parameters
      return {
        throw : function () {
          var code = arguments[0],
            err = errorCodes[code] || errorCodes['0'],
            //prefix = (module ? module + ' : ' : '') + code,
            prefix = module,
            args, message;

          args = Array.prototype.slice.call(arguments);
          // $log.debug(args, code, err, errorCodes);
          args[0] = err.tmpl;

          message = templateMessage.apply(this, args);

          messenger.error({
            namespace : prefix,
            title : err.title,
            description : message,
          });

          // FIXME: this can be re-written as a custom error object
          return new CustomError(code, module, message);
        },
        capture : function (err) {
          $log.debug('Server Sent Error : ', err);

          // route 500 error
          if (err.status === 500) {
            messenger.error(compose500Error(module, err));
          }
        }
      };
    },
    handle : function (err) {
      messenger.danger(JSON.stringify(err), 7000);
    }
  };
}]);
