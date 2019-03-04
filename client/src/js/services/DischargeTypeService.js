angular.module('bhima.services')
  .service('DischargeTypeService', DischargeTypeService);

// dependencies injection
DischargeTypeService.$inject = ['PrototypeApiService'];

// service definition
function DischargeTypeService(Api) {
  const service = new Api('/discharge_types');

  return service;
}
