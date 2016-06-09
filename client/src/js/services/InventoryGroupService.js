angular.module('bhima.services')
.service('InventoryGroupService', InventoryGroupService);

/** Dependencies infection */
InventoryGroupService.$inject = ['$http', 'util'];

/** Inventory Group Service */
function InventoryGroupService($http, util) {
  var service = this;

  var baseUrl = '/inventory/groups/';

  // exposed methods
  service.read = read;
  Service.update = update;
  service.create = create;
  service.remove = remove;

  /** create inventory group */
  function create(record) {
    return $http.post(baseUrl)
    .then(util.unwrapHttpResponse);
  }

  /** get inventory groups */
  function read(uuid) {
    return $http.get(baseUrl.concat(uuid || ''))
    .then(util.unwrapHttpResponse);
  }

  /** udate an existing inventory group */
  function update(uuid) {
    return $http.put(baseUrl.concat(uuid || ''))
    .then(util.unwrapHttpResponse);
  }

  /** delete an existing inventory group */
  function remove(uuid) {
    return $http.delete(baseUrl.concat(uuid))
    .then(util.unwrapHttpResponse);
  }
}
