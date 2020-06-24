angular.module('bhima.services')
  .service('ServiceService', ServiceService);

ServiceService.$inject = ['PrototypeApiService'];

function ServiceService(Api) {
  const service = new Api('/services/');
  const baseUrl = '/services/';

  service.count = count;
  service.update = update;

  function count() {
    const url = baseUrl.concat('count');
    return service.$http.get(url)
      .then(service.util.unwrapHttpResponse);
  }

  function update(uuid, data) {
    delete data.abbr;
    delete data.uuid;
    delete data.cost_center_name;
    delete data.enterprise_name;
    delete data.profit_center_name;
    delete data.project_name;
    delete data.enterprise_id;

    return Api.update.call(this, uuid, data);
  }

  return service;
}
