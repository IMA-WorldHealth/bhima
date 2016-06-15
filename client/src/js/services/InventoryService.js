angular.module('bhima.services')
.service('InventoryService', InventoryService);

InventoryService.$inject = [ '$http', 'util' ];

function InventoryService($http, util) {
  var service = this;

  // base url
  var baseUrl = '/inventory/metadata/';

  // bind service methods
  service.read   = read;
  service.create = create;
  service.update = update;

  // FIXME this getInventoryItems function need to be deleted
  service.getInventoryItems = read;

  /* ------------------------------------------------------------------------ */

  /** optionally takes in a UUID to specify a single item */
  function read(uuid) {
    return $http.get(baseUrl.concat(uuid || ''))
      .then(util.unwrapHttpResponse);
  }

  /** create inventory metadata */
  function create(record) {
    return $http.post(baseUrl, record)
      .then(util.unwrapHttpResponse);
  }

  /** update inventory metadata */
  function update(uuid, record) {
    return $http.put(baseUrl.concat(uuid), record)
      .then(util.unwrapHttpResponse);
  }

}
