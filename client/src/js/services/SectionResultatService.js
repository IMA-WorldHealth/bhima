angular.module('bhima.services')
  .service('SectionResultatService', SectionResultatService);

SectionResultatService.$inject = ['$http', 'util'];

function SectionResultatService($http, util) {
  var service = this;
  var baseUrl = '/section_resultats/';

  service.read = read;
  service.create = create;
  service.update = update;
  service.delete = del;

  /**
  * @desc Get an id (optionnal) and return back a list of Section Resultats or an Section Resultat
  * @param {Integer} id, the id of the Section Resultat (optionnal) 
  * @return {object} a promise object, with the response.body inside.
  * @example
  * service.read()
  * .then(function (SectionResultats){
  *   your code here
  *  });
  **/
  function read(id, params) {
    var url = baseUrl.concat(id || '');
    return $http.get(url, { params : params })
      .then(util.unwrapHttpResponse);
  }

  /**
  * @desc It create an Section Resultat
  * @param {object} Section Resultat, Section Resultat to create 
  * @example
  * service.create(SectionResultat)
  * .then(function (res){
  *   your code here
  *  });
  **/
  function create(SectionResultat) {
    return $http.post(baseUrl, SectionResultat)
      .then(util.unwrapHttpResponse);
  }

  /**
  * @desc It updates an SectionResultat
  * @param {Integer} id, SectionResultat id to update 
  * @param {object} SectionResultat, SectionResultat to update 
  * @example
  * service.update(id, SectionResultat)
  * .then(function (res){
  *   your code here
  *  });
  **/
  function update(id, SectionResultat) {
    return $http.put(baseUrl.concat(id), SectionResultat)
      .then(util.unwrapHttpResponse);
  }

  /**
  * @desc It Delete a SectionResultat
  * @param {Integer} id, SectionResultat id to delete 
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