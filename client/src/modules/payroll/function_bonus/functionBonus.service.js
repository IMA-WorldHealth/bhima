angular.module('bhima.services')
  .service('FunctionBonusService', FunctionBonusService);

FunctionBonusService.$inject = ['PrototypeApiService'];

/**
 * staffing indices Service
 *
 * A service wrapper for the /function bonus HTTP endpoint.
 *
 */
function FunctionBonusService(Api) {
  const service = new Api('/function_bonus/');
  return service;
}
