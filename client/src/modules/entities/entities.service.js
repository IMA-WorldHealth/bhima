angular.module('bhima.services')
  .service('EntityService', EntityService);

EntityService.$inject = ['PrototypeApiService'];

/**
 * @class EntityService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /entities/ URL.
 */
function EntityService(Api) {
  const baseUrl = '/entities/';
  const service = new Api(baseUrl);
  service.types = new Api(baseUrl.concat('types/'));

  // clean entity
  service.clean = entity => {
    const valid = {};
    valid.uuid = entity.uuid;
    valid.display_name = entity.display_name;
    valid.gender = entity.gender;
    valid.email = entity.email;
    valid.phone = entity.phone;
    valid.address = entity.address;
    valid.entity_type_id = entity.entity_type_id;
    return valid;
  };

  return service;
}
