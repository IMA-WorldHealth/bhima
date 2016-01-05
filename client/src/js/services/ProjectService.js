angular.module('bhima.services')
.service('ProjectService', ProjectService);

ProjectService.$inject = [ '$http', 'util' ];

function ProjectService($http, util) {
  var service = this;

  service.create = create;
  service.read = read;
  service.update = update;
  service.delete = del;

  function create(project) {
    return $http.post('/projects', project)
    .then(util.unwrapHttpResponse);
  }

  function read(id) {
    var url = (id) ? '/projects/' + id : '/projects';

    return $http.get(url)
    .then(util.unwrapHttpResponse);
  }

  function update(id, project) {
    return $http.put('/projects/' + id, project)
    .then(util.unwrapHttpResponse);
  }

  function del(id) {
    return $http.delete('/projects/' + id)
    .then(util.unwrapHttpResponse);
  }
}
