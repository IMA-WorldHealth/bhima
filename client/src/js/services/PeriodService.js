angular.module('bhima.services')
.service('PeriodService', PeriodService);

PeriodService.$inject = ['PrototypeApiService'];

function PeriodService(PrototypeApiService) {
  var service = this;

  // inherit methods from the
  angular.extend(service, PrototypeApiService);


  return service;
}
