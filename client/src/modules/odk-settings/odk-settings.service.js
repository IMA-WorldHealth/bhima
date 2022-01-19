angular.module('bhima.services')
  .service('ODKSettingsService', ODKSettingsService);

ODKSettingsService.$inject = ['PrototypeApiService'];

function ODKSettingsService(Api) {
  const baseUrl = '/admin/odk-settings/';
  const service = new Api(baseUrl);

  //
  service.syncEnterprise = () => {
    return service.$http.post(baseUrl.concat('sync-enterprise'))
      .then(service.util.unwrapHttpResponse);
  };

  //
  service.syncUsers = () => {
    return service.$http.post(baseUrl.concat('sync-users'))
      .then(service.util.unwrapHttpResponse);
  };

  //
  service.syncDepots = () => {
    return service.$http.post(baseUrl.concat('sync-depots')).then(service.util.unwrapHttpResponse);
  };

  //
  service.syncStockMovements = () => {
    return service.$http.post(baseUrl.concat('sync-stock-movements'))
      .then(service.util.unwrapHttpResponse);
  };

  service.getProjectSettings = () => {
    return service.$http.get(baseUrl.concat('project-settings'))
      .then(service.util.unwrapHttpResponse);
  };

  service.getUserSettings = () => {
    // todo
  };

  return service;
}
