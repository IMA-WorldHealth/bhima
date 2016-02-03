angular.module('bhima.services')
.service('ProjectService', ProjectService);

ProjectService.$inject = [ '$http', '$translate', '$window', 'util' ];

function ProjectService($http, $translate, $window, util) {
  var service = this;

  service.create = create;
  service.read = read;
  service.update = update;
  service.delete = del;

  function create(project) {
    return $http.post('/projects', project)
    .then(util.unwrapHttpResponse);
  }

  function read(id, params) {
     var url = (id) ? '/projects/' + id : '/projects';
     return $http.get(url, { params : params });
  }

  function update(id, project) {
    return $http.put('/projects/' + id, project)
    .then(util.unwrapHttpResponse);
  }

  function del(id) {

    var result = $window.confirm($translate.instant('PROJECT.CONFIRM'));
    if (result) {
    return $http.delete('/projects/' + id)
    .then(util.unwrapHttpResponse);
    }    
  }
}
