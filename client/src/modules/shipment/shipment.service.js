angular.module('bhima.services')
  .service('ShipmentService', ShipmentService);

ShipmentService.$inject = ['PrototypeApiService', '$httpParamSerializer', 'LanguageService'];

function ShipmentService(Api, $httpParamSerializer, Languages) {
  const service = new Api('/shipments/');

  service.statusLabel = {
    1 : 'ASSET.STATUS.EMPTY',
    2 : 'ASSET.STATUS.PARTIAL',
    3 : 'ASSET.STATUS.COMPLETE',
    4 : 'ASSET.STATUS.IN_TRANSIT',
    5 : 'ASSET.STATUS.AT_DEPOT',
    6 : 'ASSET.STATUS.DELIVERED',
    7 : 'ASSET.STATUS.LOST',
  };

  service.exportTo = (renderer, filter) => {
    const filterOpts = filter.formatHTTP();
    const defaultOpts = {
      renderer,
      lang : Languages.key,
    };
    const options = angular.merge(defaultOpts, filterOpts);
    return $httpParamSerializer(options);
  };

  service.downloadExcel = (filter, gridColumns) => {
    const filterOpts = filter.formatHTTP();
    const defaultOpts = {
      renderer : 'xlsx',
      lang : Languages.key,
      renameKeys : true,
      displayNames : gridColumns.getDisplayNames(),
    };
    const options = angular.merge(defaultOpts, filterOpts);
    return $httpParamSerializer(options);
  };

  return service;
}
