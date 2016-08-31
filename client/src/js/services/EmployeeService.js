angular.module('bhima.services')
  .service('EmployeeService', EmployeeService);

EmployeeService.$inject = ['$http', 'util'];

function EmployeeService($http, util) {
  var service = this;
  var baseUrl = '/employees/';

  service.read = read;
  service.create = create;
  service.update = update;
  service.search = search;

  /**
   * @desc Get an id (optional) and return back a list of employee or an employee
   * @param {Integer} id, the id of the employee (optional)
   * @return {object} a promise object, with the response.body inside.
   * @example
   * service.read()
   * .then(function (employees){
   *   your code here
   *  });
   */
  function read(id) {
    var url = baseUrl.concat(id || '');
    return $http.get(url)
      .then(util.unwrapHttpResponse);
  }

  /**
   * @desc It search for employee from the database
   * @param {String} key, can be code or display_name
   * @return {String} value a token taped by the user.
   * @example
   * service.search(code, value)
   * .then(function (employees){
   *   your code here
   *  });
   */
  function search (key, value){
    var url = baseUrl + key + '/' + value;
    return $http.get(url)
      .then(util.unwrapHttpResponse);
  }

  /**
   * @desc It create an employee
   * @param {object} employee, employee to create
   * @example
   * service.create(employee)
   * .then(function (res){
   *   your code here
   *  });
   */
  function create(employee) {
    return $http.post(baseUrl, employee)
      .then(util.unwrapHttpResponse);
  }

  /**
   * @desc It updates an employee
   * @param {Integer} id, employee id to update
   * @param {object} employee, employee to update
   * @example
   * service.update(id, employee)
   * .then(function (res){
   *   your code here
   *  });
   */
  function update(id, employee) {
    delete employee.id;
    return $http.put(baseUrl.concat(id), employee)
      .then(util.unwrapHttpResponse);
  }

  // define the maximum DATE_EMBAUCHE
  service.maxDateEmbauche = new Date();

  return service;
}
