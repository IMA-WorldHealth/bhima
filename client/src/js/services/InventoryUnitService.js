angular.module('bhima.services')
.service('InventoryUnitService', InventoryUnitService);

/** Dependencies infection */
InventoryUnitService.$inject = ['$http', 'util'];

/** Inventory Unit Service */
function InventoryUnitService($http, util) {
  var service = this;

  var baseUrl = '/inventory/units/';

  // exposed methods
  service.read = read;
  Service.update = update;
  service.create = create;
  service.remove = remove;

  /** create inventory unit */
  function create(record) {
    return $http.post(baseUrl)
    .then(util.unwrapHttpResponse);
  }

  /** get inventory units */
  function read(uuid) {
    return $http.get(baseUrl.concat(uuid || ''))
    .then(util.unwrapHttpResponse);
  }

  /** udate an existing inventory unit */
  function update(uuid) {
    return $http.put(baseUrl.concat(uuid || ''))
    .then(util.unwrapHttpResponse);
  }

  /** delete an existing inventory unit */
  function remove(id) {
    return $http.delete(baseUrl.concat(id))
    .then(util.unwrapHttpResponse);
  }
}
