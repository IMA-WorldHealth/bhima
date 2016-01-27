angular.module('bhima.services')
  .factory('EnterpriseService', EnterpriseService);
  
EnterpriseService.$inject = ['$http', 'util'];

function EnterpriseService($http, util) {  
  var service = {};

  service.read = read;
  service.read_detailed = read_detailed;
  service.create = create;
  service.update = update;


  function read(id) {
    var url = (id) ? '/enterprises/' + id : '/enterprises/';
    return $http.get(url)
      .then(util.unwrapHttpResponse);
  }

  function read_detailed() {
    var url = '/enterprises?detailed=1';
    return $http.get(url)
      .then(util.unwrapHttpResponse);
  }

  function create(enterprise) {
    return $http.post('/enterprises', { enterprise: enterprise })
      .then(util.unwrapHttpResponse);
  }

  function update(id, enterprise) {
    delete enterprise.id;

    return $http.put('/enterprises/' + id, enterprise)
      .then(util.unwrapHttpResponse);
  }

  return service;
}
