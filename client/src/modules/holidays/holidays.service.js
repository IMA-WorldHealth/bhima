angular.module('bhima.services')
  .service('HolidayService', HolidayService);

HolidayService.$inject = ['PrototypeApiService', '$uibModal'];

/**
 * @class HolidayService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /holidays/ URL.
 */
function HolidayService(Api, Modal) {
  var service = new Api('/holidays/');

  return service;
}