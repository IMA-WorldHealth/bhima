angular.module('bhima.services')
.factory('ErrorInterceptor', ErrorInterceptor);

ErrorInterceptor.$inject = ['$q'];
  
/** 
 * Client Side Error Interceptor 
 * 
 * This service is responsible for mapping client side status codes to translatable 
 * code and descriptions. The response object is then extended with these codes 
 * exposing them to the controller and finally the view. The formatted translatable 
 * codes and descriptions are formatted in the same way the server build Errors, 
 * this allows the client to handle all errors in a uniform way. 
 *
 * @module services/ErrorInterceptor
 */
function ErrorInterceptor($q) { 
  
  // list all handled statuses
  // status code : formatted response
  var statusMap = { 
    '-1' : { 
      code : 'ERRORS.ERR_INTERNET_DISCONNECTED', 
      description : 'The server could not respond because you are not connected to the internet.'
    }
  };

  var interceptor = { 
    responseError : function (response) { 
      var lookupError = statusMap[response.status];
  
      // if the error status has a matched code we can extend the response object
      // with the translatable codes/ description
      if (angular.isDefined(lookupError)) { 
        angular.extend(response, lookupError);
      }
      return $q.reject(response);
    }
  };
  return interceptor;
}
