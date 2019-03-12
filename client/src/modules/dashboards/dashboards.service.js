angular.module('bhima.services')
  .service('IndicatorsDashboardService', IndicatorsDashboardService);

IndicatorsDashboardService.$inject = [
  'PrototypeApiService', 'GridRegistryFilterer', '$uibModal', '$translate',
];

function IndicatorsDashboardService(Api, GridRegistryFilterer, $uibModal, $translate) {
  const service = this;
  const indicatorsFiles = new Api('/indicators_files');
  const grid = new GridRegistryFilterer('IndicatorsFilesRegistryFilterer');

  service.indicatorsFiles = indicatorsFiles;
  service.indicatorsFilesGridFilterer = grid;
  service.openIndicatorsFilesSearchModal = openIndicatorsFilesSearchModal;

  service.statusOptions = [
    { key : 'incomplete', value : $translate.instant('DASHBOARD.INDICATORS_FILES.INCOMPLETE') },
    { key : 'complete', value : $translate.instant('DASHBOARD.INDICATORS_FILES.COMPLETE') },
    { key : 'validated', value : $translate.instant('DASHBOARD.INDICATORS_FILES.VALIDATED') },
  ];

  /**
   * @method openSearchModal
   *
   * @param {Object} params - an object of filter parameters to be passed to
   *   the modal.
   * @returns {Promise} modalInstance
   */
  function openIndicatorsFilesSearchModal(params) {
    return $uibModal.open({
      templateUrl : 'modules/dashboards/indicators_files_registry/modals/search.modal.html',
      size : 'md',
      keyboard : false,
      animation : false,
      backdrop : 'static',
      controller : 'SearchIndicatorsFilesModalController as $ctrl',
      resolve : {
        filters : function paramsProvider() { return params; },
      },
    }).result;
  }

  return service;
}
