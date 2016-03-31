angular.module('bhima.services')
  .service('ReferenceService', ReferenceService);

ReferenceService.$inject = ['$http', 'util'];

function ReferenceService($http, util) {
  var service = this;
  var baseUrl = '/references/';

  service.read = read;

  /**
  * @desc Get an id (optionnal) and return back a list of References or a Reference
  * @param {Integer} id, the id of the Reference (optionnal) 
  * @return {object} a promise object, with the response.body inside.
  * @example
  * service.read()
  * .then(function (Reference){
  *   your code here
  *  });
  **/

  function read(id) {
    var url = baseUrl.concat(id || '');
    return $http.get(url)
      .then(util.unwrapHttpResponse);
  }

  return service;
}