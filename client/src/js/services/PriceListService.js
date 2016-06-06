angular.module('bhima.services')
  .service('PriceListService', PriceListService);

PriceListService.$inject = ['PrototypeApiService'];

function PriceListService(PrototypeApiService) {
  var service = this;

  // extend with the prototype methods
  angular.extend(service, PrototypeApiService, { url : '/prices/' });

  service.create = create;
  service.update = update;

  /**
   * @method create
   *
   * @description
   * This method creates a price list in the database.
   *
   * @param {object} price list, price list to create
   *
   * @example
   * service.create(priceList)
   * .then(function (res){
   *   your code here
   *  });
   */
  function create(list) {
    return PrototypeApiService.create.call(service, { list : list });
  }

  /**
   * @method update
   *
   * @param {Integer} id, price list id to update
   * @param {Object} price list, price list to update
   *
   * @example
   * service.update(id, price list)
   * .then(function (res){
   *   your code here
   *  });
   */
  function update(uuid, list) {
    delete list.created_at;
    return PrototypeApiService.update.call(service, uuid, { list : list });
  }

  return service;
}
