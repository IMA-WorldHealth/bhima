angular.module('bhima.services')
  .service('ShipmentService', ShipmentService);

ShipmentService.$inject = ['PrototypeApiService', '$httpParamSerializer', 'LanguageService'];

function ShipmentService(Api, $httpParamSerializer, Languages) {
  const service = new Api('/shipments/');

  service.statusLabel = {
    1 : 'SHIPMENT.STATUS.EMPTY',
    2 : 'SHIPMENT.STATUS.AT_DEPOT',
    3 : 'SHIPMENT.STATUS.READY_FOR_SHIPMENT',
    4 : 'SHIPMENT.STATUS.IN_TRANSIT',
    5 : 'SHIPMENT.STATUS.PARTIAL',
    6 : 'SHIPMENT.STATUS.COMPLETE',
    7 : 'SHIPMENT.STATUS.DELIVERED',
    8 : 'SHIPMENT.STATUS.LOST',
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

  service.readAll = (uuid, parameters) => {
    return service.$http.get(`/shipments/${uuid}/full`, { params : parameters })
      .then(service.util.unwrapHttpResponse);
  };

  service.getAffectedAssets = (parameters) => {
    return service.$http.get(`/shipments/affected-assets`, { params : parameters })
      .then(service.util.unwrapHttpResponse);
  };

  service.overview = (uuid) => {
    return service.$http.get(`/shipments/${uuid}/overview`)
      .then(service.util.unwrapHttpResponse);
  };

  service.updateLocation = (uuid, params) => {
    return service.$http.post(`/shipments/${uuid}/tracking-log`, { params })
      .then(service.util.unwrapHttpResponse);
  };

  service.setReadyForShipment = (uuid) => {
    return service.$http.put(`/shipments/${uuid}/ready-for-shipment`)
      .then(service.util.unwrapHttpResponse);
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

  service.readAll = (uuid, parameters) => {
    return service.$http.get(`/shipments/${uuid}/full`, { params : parameters })
      .then(service.util.unwrapHttpResponse);
  };

  service.updateLocation = (uuid, params) => {
    return service.$http.post(`/shipments/${uuid}/tracking-log`, { params })
      .then(service.util.unwrapHttpResponse);
  };

  service.setReadyForShipment = (uuid) => {
    return service.$http.put(`/shipments/${uuid}/ready-for-shipment`)
      .then(service.util.unwrapHttpResponse);
  };

  return service;
}
