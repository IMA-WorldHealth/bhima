angular.module('bhima.services')
  .service('ReferenceService', ReferenceService);

ReferenceService.$inject = ['$http', 'util'];

function ReferenceService($http, util) {
  var service = this;
  var baseUrl = '/references/';

  service.read = read;
  service.create = create;
  service.update = update;
  service.delete = del;


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

  function read(id, params) {
    var url = baseUrl.concat(id || '');
    return $http.get(url, { params : params })
      .then(util.unwrapHttpResponse);
  }

  /**
  * @desc It create an Reference
  * @param {object} Reference, Reference to create 
  * @example
  * service.create(Reference)
  * .then(function (res){
  *   your code here
  *  });
  **/
  function create(Reference) {
    return $http.post(baseUrl, Reference)
      .then(util.unwrapHttpResponse);
  }

  /**
  * @desc It updates an Reference
  * @param {Integer} id, Reference id to update 
  * @param {object} Reference, Reference to update 
  * @example
  * service.update(id, Reference)
  * .then(function (res){
  *   your code here
  *  });
  **/
  function update(id, Reference) {
    var referenceClean = {
      is_report : Reference.is_report,
      ref : Reference.ref,
      text : Reference.text,
      position : Reference.position,
      reference_group_id : Reference.reference_group_id,
      section_resultat_id : Reference.section_resultat_id,
    };

    return $http.put(baseUrl.concat(id), referenceClean)
      .then(util.unwrapHttpResponse);
  }

  /**
  * @desc It Delete a Reference
  * @param {Integer} id, Reference id to delete 
  * @example
  * service.del(id)
  * .then(function (res){
  *   your code here
  *  });
  **/

  function del(id) {
    return $http.delete(baseUrl + id)
    .then(util.unwrapHttpResponse);
  }

  return service;
}