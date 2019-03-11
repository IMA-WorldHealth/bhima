angular.module('bhima.routes')
  .config(['$stateProvider', ($stateProvider) => {
    $stateProvider
      .state('indicatorsFilesRegistry', {
        url         : '/dashboards/indicators_files_registry',
        controller  : 'IndicatorsFilesRegistryController as $ctrl',
        templateUrl : 'modules/dashboards/indicators_files_registry/indicators_files_registry.html',
      });
  }]);
