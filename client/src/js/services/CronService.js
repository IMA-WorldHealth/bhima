angular.module('bhima.services')
  .service('CronService', CronService);

CronService.$inject = ['PrototypeApiService'];

function CronService(Api) {
  const service = new Api('/crons/');
  return service;
}
