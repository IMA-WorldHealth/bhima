angular.module('bhima.services')
.service('messenger', [
  '$timeout',
  '$sce',
  function ($timeout, $sce) {

    // TODO : all fns should use enqueue() to add messages to
    // queue.  There also should be no way to set a time limit.
    // You can only NO LIMIT to allow messages to persist.

    var self = this,
      messages = self.messages = [],
      LIFESPAN_LIMIT = 5000,
      timers = {};

    function lifespan(message) {
      var id = Date.now();
      message.id = id;
      timers[id] = $timeout(function () {
        var i = messages.length;
        while (i--) {
          if (messages[i].id === id) { break; }
        }
        messages.splice(i, 1);
      },  LIFESPAN_LIMIT);
    }


    function trust(data) {
      return $sce.trustAsHtml(String(data));
    }

    function enqueue(message) {
      // trust text
      message.namespace =  trust(message.namespace);
      message.description = trust(message.description);
      message.status = trust(message.status);

      if (!message.closable) {
        lifespan(message);
      }

      messages.push(message);
    }

    function isObject(o) {
      return typeof o === 'object';
    }


    self.close = function close(idx) {
      // cancel timeout and splice out
      if (timers[idx]) { $timeout.cancel(timers[idx]); }
      messages.splice(idx, 1);
    };

    // Appropriate error formatting
    self.error = function error(err) {
      if (isObject(err)) {
        angular.extend(err, { type : 'error', closable : true, error : true });
      } else {
        err = {
          type : 'error',
          closable : true,
          namespace : 'MESSENGER',
          description : err
        };
      }
      enqueue(err);
    };

    self.primary  = function primary(data, closable) {
      angular.extend(data, { type : 'primary', closable : closable });
      enqueue(data);
    };

    self.warn = function warn(data, closable) {
      angular.extend(data, { type : 'warning', closable : closable });
      enqueue(data);
    };

    self.success = function success(data, closable) {
      if (isObject(data)) {
        angular.extend(data, { type : 'success', closable : true});
      } else {
        data = {
          type : 'success',
          closable : closable,
          namespace : 'MESSENGER',
          description : data
        };
      }

      enqueue(data);
    };

    self.info = function info(data, closable) {
      if (isObject(data)) {
        angular.extend(data, { type : 'info', closable : true});
      } else {
        data = {
          type : 'info',
          closable : closable,
          namespace : 'MESSENGER',
          description : data,
        };
      }

      enqueue(data);
    };

    // Deprecated
    self.danger = function danger(data, closable) {
      if (typeof data === 'object') {
        angular.extend(data, { type : 'error', closable : true});
      } else {
        data = {
          type : 'error',
          closable : closable,
          namespace : 'MESSENGER',
          description : '[DEPRECATED] ' + data
        };
      }

      enqueue(data);
    };
  }
]);
