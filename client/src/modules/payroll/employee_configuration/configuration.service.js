angular.module('bhima.services')
  .service('ConfigurationEmployeeService', ConfigurationEmployeeService);

ConfigurationEmployeeService.$inject = ['PrototypeApiService'];

/**
 * @class ConfigurationEmployeeService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /employee_config/ URL.
 */
function ConfigurationEmployeeService(Api) {
  const service = new Api('/employee_config/');

  service.getEmployeeConfiguration = getEmployeeConfiguration;
  service.setEmployees = setEmployees;

  // loads the configuration's Employee
  function getEmployeeConfiguration(id) {
    return service.$http.get(`/employee_config/${id}/setting`)
      .then(service.util.unwrapHttpResponse);
  }

  // Sets Payroll Employees Configuration using the public API
  function setEmployees(id, data) {
    return service.$http.post(`/employee_config/${id}/setting`, { configuration : data })
      .then(service.util.unwrapHttpResponse);
  }

  return service;
}
