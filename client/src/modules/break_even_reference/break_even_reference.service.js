angular.module('bhima.services')
  .service('BreakEvenReferenceService', BreakEvenReferenceService);

BreakEvenReferenceService.$inject = ['PrototypeApiService'];

/**
 * @class BreakEvenReferenceService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /break_even_reference/ URL.
 */
function BreakEvenReferenceService(Api) {
  const service = new Api('/break_even_reference/');

  return service;
}
