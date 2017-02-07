angular.module('bhima.services')
  .service('PriceListService', PriceListService);

PriceListService.$inject = ['PrototypeApiService'];

/**
 * @class PriceListService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /prices/ URL.
 */
function PriceListService(Api) {
  var service = new Api('/prices/');

  service.create = create;
  service.update = update;

  /**
   * @method create
   *
   * @description
   * This method creates a price list in the database.
   *
   * @param {Object} priceList - price list to create
   *
   * @example
   * service.create(priceList)
   * .then(function (res){
   *   your code here
   *  });
   */
  function create(list) {
    return Api.create.call(service, { list : list });
  }

  /**
   * @method update
   *
   * @param {String} uuid -  price list uuid to update
   * @param {Object} priceList -  price list to update
   *
   * @example
   * service.update(id, priceList)
   * .then(function (res){
   *   your code here
   *  });
   */
  function update(uuid, list) {
    delete list.created_at;

    return Api.update.call(service, uuid, { list : list });
  }

  return service;
}
