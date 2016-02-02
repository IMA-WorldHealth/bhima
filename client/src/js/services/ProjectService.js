angular.module('bhima.services')
.service('ProjectService', ProjectService);

ProjectService.$inject = [ '$http', '$translate', 'util' ];

function ProjectService($http, $translate, util) {
  var service = this;

  service.create = create;
  service.read = read;
  service.update = update;
  service.del = del;
  service.readComplete = readComplete;

  function create(project) {
    return $http.post('/projects', project)
    .then(util.unwrapHttpResponse);
  }

  function read(id) {
    var url = (id) ? '/projects/' + id : '/projects';

    return $http.get(url)
    .then(util.unwrapHttpResponse);
  }

  function readComplete() {
    var url = '/projects?complete=1';

    return $http.get(url)
    .then(util.unwrapHttpResponse);
  }

  function update(id, project) {
    return $http.put('/projects/' + id, project)
    .then(util.unwrapHttpResponse);
  }

  function del(id) {

    var result = confirm($translate.instant('PROJECT.CONFIRM'));
    if (result) {
    return $http.delete('/projects/' + id)
    .then(util.unwrapHttpResponse);
    }    
  }
}
