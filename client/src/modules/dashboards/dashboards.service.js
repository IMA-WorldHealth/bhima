angular.module('bhima.services')
  .service('IndicatorsDashboardService', IndicatorsDashboardService);

IndicatorsDashboardService.$inject = [
  'PrototypeApiService', 'GridRegistryFilterer',
];

function IndicatorsDashboardService(Api, GridRegistryFilterer) {
  const service = this;
  const indicatorsFiles = new Api('/indicators_files');
  const grid = new GridRegistryFilterer('IndicatorsFilesRegistryFilterer');

  service.indicatorsFiles = indicatorsFiles;
  service.indicatorsFilesGridFilterer = grid;

  return service;
}
