angular.module('bhima.services')
  .service('DepartmentService', DepartmentService);

DepartmentService.$inject = ['PrototypeApiService'];

/**
 * @class DepartmentService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /department/ URL.
 */
function DepartmentService(Api) {
  const service = new Api('/departments/');

  service.detail = (uuid) => {
    const url = service.url.concat(uuid);
    return service.$http.get(url)
      .then(service.util.unwrapHttpResponse);
  };

  return service;
}
