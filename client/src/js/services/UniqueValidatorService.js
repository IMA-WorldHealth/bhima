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
   * @params {String} url     Target server API URL 
   * @params {String} value   Value to check against server API endpoint
   */
  function check(url, value) { 
    
    /** @todo ensure url ends with '/', potentially pass it through path */
    var target = url.concat(value);

    return $http.get(target)
      .then(util.unwrapHttpResponse);
  }
}
