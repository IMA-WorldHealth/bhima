angular.module('bhima.services')
.service('PatientGroupService', PatientGroupService);

PatientGroupService.$inject = ['$http', 'util'];

/**
* Patient Group Service
*
* A service wrapper for the /patient_groups HTTP endpoint.
*/
function PatientGroupService($http, util) {
  var service = this;
  var baseUrl = '/patients/groups/';

  service.read = read;
  service.create = create;
  service.update = update;
  service.delete = remove;

  // return a list of patient group
  function read(uuid, options) {
    var url = baseUrl.concat(uuid || '');
    return $http.get(url, { params : options })
      .then(util.unwrapHttpResponse);
  }

  // create a patient group
  function create(patientGroup) {

    // make sure we are not submitting empty strings for price lists!
    if (patientGroup.price_list_uuid === '') {
      delete patientGroup.price_list_uuid;
    }

    return $http.post(baseUrl, patientGroup)
      .then(util.unwrapHttpResponse);
  }

  // update a patient group
  function update(uuid, patientGroup) {
    delete patientGroup.uuid;

    // make sure we are not submitting empty strings for price lists!
    if (patientGroup.price_list_uuid === '') {
      delete patientGroup.price_list_uuid;
    }

    return $http.put(baseUrl + uuid, patientGroup)
      .then(util.unwrapHttpResponse);
  }

  // delete a patient group
  function remove(uuid) {
    return $http.delete(baseUrl + uuid)
      .then(util.unwrapHttpResponse);
  }

  return service;
}
