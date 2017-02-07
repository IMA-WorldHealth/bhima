angular.module('bhima.services')
.service('util', UtilService);

UtilService.$inject = ['moment' ];

/**
 * @class util
 *
 * @description
 * Common utilities for the application
 *
 * @requires moment
 */
function UtilService(moment) {
  var service = this;

  service.unwrapHttpResponse = function unwrapHttpResponse(response) {
    return response.data;
  };

  /** @todo comments showing usage */
  service.filterFormElements = function filterFormElements(formDefinition, requireDirty) {
    var response = {};

    angular.forEach(formDefinition, function (value, key) {

      // Determine angular elements, these can be ignored
      var isAngularAttribute = key.substring(0, 1) === '$';

      if (!isAngularAttribute) {

        // Only format and assign dirty values that have changed
        if (requireDirty && !value.$dirty) {
          return;
        }

        // any standard ng-model element will provide an $modelValue, according
        // to the latest 2.x standards more complex bhima components or bhima
        // component wrappers will expose $bhValue

        // accounts for empty string values
        response[key] = angular.isDefined(value.$modelValue) ? value.$modelValue : value.$bhValue;
      }
    });
    return response;
  };

  // Define the minimum date for any patient data
  service.defaultBirthMonth = '06-01';

  // Define the maxLength By Value
  service.length250 = 250;
  service.length200 = 200;
  service.length150 = 150;
  service.length100 = 100;
  service.length70 = 70;
  service.length50 = 50;
  service.length40 = 40;
  service.length30 = 30;
  service.length20 = 20;
  service.length16 = 16;
  service.length12 = 12;

  // utility function
  service.clean = function clean(o) {
    // clean off the $$hashKey and other angular bits and delete undefined
    var cleaned = {};

    for (var k in o) {
      if (k !== '$$hashKey' && angular.isDefined(o[k]) && o[k] !== '' && o[k] !== null) {
        cleaned[k] = o[k];
      }
    }

    return cleaned;
  };

  // moment() provides the current date, similar to the new Date() API. This requests the difference between two dates
  service.getMomentAge = function (date, duration) {
    return duration ? moment().diff(date, duration) : moment().diff(date);
  };

  /**
   * @function once
   *
   * @description
   * Ensure that a function only executes once.  Allows the caller to pass in a
   * context to inject into `this`.
   *
   * @param {Function} fn - the function to only call once.
   * @param {Object} context - sets the `this` variable in the called function
   */
  service.once = function once(fn, context) {
    var result;

    return function () {

      if (!fn) { return; }

      // call the function only once
      result = fn.apply(context || this, arguments);
      fn = null;

      return result;
    };
  };


  /**
   * @function before
   *
   * @description
   * A function to intercept a method call on an object or class and call a
   * function with the intercepted parameters
   *
   * @param {Object|Function} target - the target class or object.
   * @param {String} methodName - the method name to intercept
   * @param {Function} fn - the function to call before the intercepted method
   *
   * @example
   * var o = { x : function (a, b, c) { console.log('I got:', a, b, c); };
   * before(o, 'x', function (a, b, c) { console.log('Before ', a,b,c); });
   * o(1,2,3)
   * // this will log 'Before 123)' and then 'I got:1,2,3'
   */
  service.before = function before(target, methodName, fn) {
    var callback = target[methodName] || angular.noop;

    // replace with the injected function
    target[methodName] = function intercept() {

      // call the function before the cached callback
      var result = fn.apply(this, arguments);

      // fire the callback
      callback.apply(this, arguments);

      return result;
    };
  };

  /**
   * @function after
   *
   * @description
   * A sister method to the `before()` function.  A function to intercept a
   * method call on an object or class and call a function with the intercepted
   * parameters after the original method call.
   *
   * @param {Object|Function} target - the target class or object.
   * @param {String} methodName - the method name to intercept
   * @param {Function} fn - the function to call after the intercepted method
   *
   * @example
   * var o = { x : function (a, b, c) { console.log('I got:', a, b, c); };
   * after(o, 'x', function (a, b, c) { console.log('after', a,b,c); });
   * o(1,2,3)
   * // this will log 'After 123' and then 'I got:1,2,3'
   */
  service.after = function after(target, methodName, fn) {
    var callback = target[methodName] || angular.noop;

    // replace with the injected function
    target[methodName] = function intercept() {

      // fire the callback
      callback.apply(this, arguments);

      // call the function after the cached callback
      return fn.apply(this, arguments);
    };
  };

  /**
   * @function uniquelize
   * @param {array} array An array in which we want to get only unique values
   * @description return an array which contain only unique values
   */
  service.uniquelize = function uniquelize (array) {
    return array.filter(function (value, idx, array) {
      return array.indexOf(value) === idx;
    });
  };

  service.isEmptyObject = function isEmptyObject(object) {
    return Object.keys(object).length === 0;
  };


  /**
   * @function xor
   *
   * @description
   * Returns the logical XOR of two booleans.
   *
   * @param {Boolean} a - a boolean value to XOR with b
   * @param {Boolean} b - a boolean value to XOR with a
   *
   * @returns {Boolean} - the result
   */
  service.xor = function xor(a, b) {
    /*jshint -W018 */
     return !a !== !b;
    /*jshint +W018 */
  };
}
