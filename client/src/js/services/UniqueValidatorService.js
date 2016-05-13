angular.module('bhima.services')
.service('UniqueValidatorService', UniqueValidatorService);

UniqueValidatorService.$inject = ['$http', 'util'];

/**
 * Unique Validator Service
 *
 * This service is responsible for making requests to server endpoints that result
 * in a simple Boolean true/false value, both the URL and the value that should
 * be verified are required.
 *
 * The BHIMA `exists` API uses a very simply pattern that must be followed in order
 * for this service to be used. The server route that checks for the entities
 * existence should be defined as follows:
 *
 * GET /entity/attribute/:id /exists
 *
 * The service expects the validation server API to return a value of true or
 * false; if a value of false is returned this value is valid and can be used; if
 * the result is true the value is taken.
 *
 * @module services/UniqueValidorService
 */
function UniqueValidatorService($http, util) {
  var service = this;

  // expose service API
  service.check = check;

  /**
   * This method will make a request to a provided server end point to validate
   * if a value (also passed) results in true or false. This method is responsible
   * for unwrapping the respons.
   *
   * A URL is accepted to determine which server route should be requested to verify
   * the existence of the entity. This directive implements the `exists` API and
   * will append '/exists' to the end of the URL.
   * For example:
   * `url`            : '/entity/attribute/'
   * `value`          : '10230'
   *
   * `requested URL`  : '/entity/attribute/10230/exists'
   *
   * @param {String} url     Target server API URL
   * @param {String} value   Value to check against server API endpoint
   */
  function check(url, value) {
    var existsApiPhrase = '/exists';

    // sanitise the URL - append a '/' to the end if it does not exist
    var baseUrl = url.endsWith('/') ? url : url.concat('/');
    var target = baseUrl.concat(value, existsApiPhrase);

    return $http.get(target)
      .then(util.unwrapHttpResponse);
  }
}
