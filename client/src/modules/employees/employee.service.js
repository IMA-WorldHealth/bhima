angular.module('bhima.services')
  .service('EmployeeService', EmployeeService);

EmployeeService.$inject = ['$http', 'util', 'DepricatedFilterService'];

function EmployeeService($http, util, Filters) {
  var service = this;
  var baseUrl = '/employees/';
  var filter = new Filters();

  service.read = read;
  service.create = create;
  service.update = update;
  service.search = search;

  service.formatFilterParameters = formatFilterParameters;

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
   * Uses query strings to generically search for employees.
   *
   * @method search
   *
   * @param {object} options - a JSON of options to be parsed by Angular's
   * paramSerializer
   */
    function search(options) {
      options = angular.copy(options || {});

      var target = baseUrl.concat('search');

      return $http.get(target, { params : options })
        .then(util.unwrapHttpResponse);
    }
  // function search (key, value){
  //   var url = baseUrl + key + '/' + value;
  //   return $http.get(url)
  //     .then(util.unwrapHttpResponse);
  // }

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

  /**
   * This function prepares the headers employee properties which were filtered,
   * Special treatment occurs when processing data related to the date
   * @todo - this might be better in it's own service
  */
  function formatFilterParameters(params) {
    var columns = [
      { field: 'display_name', displayName: 'FORM.LABELS.NAME' },
      { field: 'sexe', displayName: 'FORM.LABELS.GENDER' },
      { field: 'code', displayName: 'FORM.LABELS.CODE' },
      { field: 'dateBirthFrom', displayName: 'FORM.LABELS.DOB', comparitor: '>', ngFilter:'date' },
      { field: 'dateBirthTo', displayName: 'FORM.LABELS.DOB', comparitor: '<', ngFilter:'date' },
      { field: 'dateEmbaucheFrom', displayName: 'FORM.LABELS.DATE_EMBAUCHE', comparitor: '>', ngFilter:'date' },
      { field: 'dateEmbaucheTo', displayName: 'FORM.LABELS.DATE_EMBAUCHE', comparitor: '<', ngFilter:'date' },
      { field: 'user_id', displayName: 'FORM.LABELS.USER' },
      { field: 'defaultPeriod', displayName : 'TABLE.COLUMNS.PERIOD', ngFilter : 'translate' },
    ];


    // returns columns from filters
    return columns.filter(function (column) {
      var LIMIT_UUID_LENGTH = 6;
      var value = params[column.field];

      if (angular.isDefined(value)) {
        column.value = value;
        return true;
      } else {
        return false;
      }
    });
  }

  // define the maximum DATE_EMBAUCHE
  service.maxDateEmbauche = new Date();

  return service;
}
