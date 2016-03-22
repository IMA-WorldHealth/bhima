angular.module('bhima.services')
  .service('SectionBilanService', SectionBilanService);

SectionBilanService.$inject = ['$http', 'util'];

function SectionBilanService($http, util) {
  var service = this;
  var baseUrl = '/section_bilans/';

  service.read = read;
  service.create = create;
  service.update = update;
  service.delete = del;

  /**
  * @desc Get an id (optionnal) and return back a list of Section Bilans or an Section Bilan
  * @param {Integer} id, the id of the Section Bilan (optionnal) 
  * @return {object} a promise object, with the response.body inside.
  * @example
  * service.read()
  * .then(function (SectionBilans){
  *   your code here
  *  });
  **/
  function read(id, params) {
    var url = baseUrl.concat(id || '');
    return $http.get(url, { params : params })
      .then(util.unwrapHttpResponse);
  }

  /**
  * @desc It create an Section Bilan
  * @param {object} Section Bilan, Section Bilan to create 
  * @example
  * service.create(SectionBilan)
  * .then(function (res){
  *   your code here
  *  });
  **/
  function create(SectionBilan) {
    return $http.post(baseUrl, SectionBilan)
      .then(util.unwrapHttpResponse);
  }

  /**
  * @desc It updates an SectionBilan
  * @param {Integer} id, SectionBilan id to update 
  * @param {object} SectionBilan, SectionBilan to update 
  * @example
  * service.update(id, SectionBilan)
  * .then(function (res){
  *   your code here
  *  });
  **/
  function update(id, SectionBilan) {
    return $http.put(baseUrl.concat(id), SectionBilan)
      .then(util.unwrapHttpResponse);
  }

  /**
  * @desc It Delete a SectionBilan
  * @param {Integer} id, SectionBilan id to delete 
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