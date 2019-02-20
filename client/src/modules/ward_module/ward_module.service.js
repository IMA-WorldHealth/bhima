angular.module('bhima.services')
  .service('WardModuleService', WardModuleService);

WardModuleService.$inject = [
  'PrototypeApiService', '$uibModal', 'FilterService', 'appcache',
  'LanguageService', '$httpParamSerializer', 'util', '$http',
];

function WardModuleService() {
  const service = this;
  return service;
}
