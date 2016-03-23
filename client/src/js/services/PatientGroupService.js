angular.module('bhima.services')
.service('PatientGroupService', PatientGroupService);

PatientGroupService.$inject = ['$http', 'util'];

/**
* Account Service
*
* A service wrapper for the /accounts HTTP endpoint.  
*/
function PatientGroupService($http, util) {
  var service = this;

  service.read = read;
  service.create = create;
  service.update = update;
  service.remove = remove;


  // return a list of patient group
  function read(uuid, opt) {
    var url = (uuid) ? '/patient_groups/' + uuid : '/patient_groups';
    return $http.get(url, opt)
      .then(util.unwrapHttpResponse);
  }

  //create a patient group
  function create(patientGroup) {
    return $http.post('/patient_groups', patientGroup)
      .then(util.unwrapHttpResponse);
  }

  //update a patient group
  function update(uuid, patientGroup) {

    delete patientGroup.uuid;

    return $http.put('/patient_groups/' + uuid, patientGroup)
      .then(util.unwrapHttpResponse);
  }

  function remove(uuid) {
    return $http.delete('/patient_groups/' + uuid)
      .then(util.unwrapHttpResponse);
  }

  return service;
}
