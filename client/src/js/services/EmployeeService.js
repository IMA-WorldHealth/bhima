angular.module('bhima.services')
  .factory('EmployeeService', EmployeeService);

EmployeeService.$inject = ['$http', 'util'];

function EmployeeService($http, util) {
  var service = {};
  var baseUrl = '/employees/';

  service.read = read;
  service.create = create;
  service.update = update;

  function read(id) {
    var url = baseUrl.concat(id || '');
    return $http.get(url)
      .then(util.unwrapHttpResponse);
  }

  function create(employee) {
    return $http.post(baseUrl, employee)
      .then(util.unwrapHttpResponse);
  }

  function update(id, employee) {
    delete employee.id;
    return $http.put(baseUrl.concat(id), employee)
      .then(util.unwrapHttpResponse);
  }

  return service;
}