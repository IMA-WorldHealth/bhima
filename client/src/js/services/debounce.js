angular.module('bhima.services')
  .factory('debounce', ['$timeout', '$q', ($timeout, $q) => {

    // The service is actually this function, which we call with the func
    // that should be debounced and how long to wait in between calls
    return function debounce(func, wait, immediate) {
      let timeout;
      // Create a deferred object that will be resolved when we need to
      // actually call the func
      let deferred = $q.defer();

      return function fn() {
        const context = this;

        // eslint-disable-next-line prefer-rest-params
        const args = arguments;

        const later = function () {
          timeout = null;
          if (!immediate) {
            deferred.resolve(func.apply(context, args));
            deferred = $q.defer();
          }
        };

        const callNow = immediate && !timeout;
        if (timeout) {
          $timeout.cancel(timeout);
        }

        timeout = $timeout(later, wait);

        if (callNow) {
          deferred.resolve(func.apply(context, args));
          deferred = $q.defer();
        }

        return deferred.promise;
      };
    };
  }]);
