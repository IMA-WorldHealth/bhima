angular.module('bhima.services')
.service('InventoryTypeService', InventoryTypeService);

/** Dependencies infection */
InventoryTypeService.$inject = ['$http', 'util'];

/** Inventory Type Service */
function InventoryTypeService($http, util) {
  var service = this;

  var baseUrl = '/inventory/types/';

  // exposed methods
  service.read = read;
  service.update = update;
  service.create = create;
  service.remove = remove;

  /** create inventory type */
  function create(record) {
    return $http.post(baseUrl, record)
    .then(util.unwrapHttpResponse);
  }

  /** get inventory types */
  function read(uuid) {
    return $http.get(baseUrl.concat(uuid || ''))
    .then(util.unwrapHttpResponse);
  }

  /** udate an existing inventory type */
  function update(uuid, record) {
    return $http.put(baseUrl.concat(uuid || ''), record)
    .then(util.unwrapHttpResponse);
  }

  /** delete an existing inventory type */
  function remove(id) {
    return $http.delete(baseUrl.concat(id))
    .then(util.unwrapHttpResponse);
  }
}
